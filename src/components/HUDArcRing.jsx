/**
 * Decorative HUD arc ring overlay — neon cyan and magenta strokes
 * with data ticks, node dots, and slow rotation.
 */
export default function HUDArcRing() {
  const cx = 500;
  const cy = 500;

  function arc(startAngle, endAngle, radius) {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  function ticks(count, radius, length, color, opacity) {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * 360;
      const rad = (angle * Math.PI) / 180;
      const x1 = cx + radius * Math.cos(rad);
      const y1 = cy + radius * Math.sin(rad);
      const x2 = cx + (radius + length) * Math.cos(rad);
      const y2 = cy + (radius + length) * Math.sin(rad);
      return (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color}
          strokeWidth="0.4"
          opacity={opacity}
        />
      );
    });
  }

  return (
    <svg
      className="hud-arc"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Outer cyan arcs */}
      <path d={arc(5, 85, 430)} fill="none" stroke="var(--accent-cyan)" strokeWidth="0.5" opacity="0.12" />
      <path d={arc(95, 175, 430)} fill="none" stroke="var(--accent-cyan)" strokeWidth="0.5" opacity="0.06" />
      <path d={arc(185, 265, 430)} fill="none" stroke="var(--accent-cyan)" strokeWidth="0.5" opacity="0.12" />
      <path d={arc(275, 355, 430)} fill="none" stroke="var(--accent-cyan)" strokeWidth="0.5" opacity="0.06" />

      {/* Mid magenta arcs */}
      <path d={arc(20, 70, 400)} fill="none" stroke="var(--accent-magenta)" strokeWidth="0.4" opacity="0.08" />
      <path d={arc(200, 250, 400)} fill="none" stroke="var(--accent-magenta)" strokeWidth="0.4" opacity="0.08" />

      {/* Inner purple arcs */}
      <path d={arc(40, 140, 370)} fill="none" stroke="var(--accent-purple)" strokeWidth="0.3" opacity="0.06" />
      <path d={arc(220, 320, 370)} fill="none" stroke="var(--accent-purple)" strokeWidth="0.3" opacity="0.06" />

      {/* Tick marks — cyan outer, magenta inner */}
      {ticks(90, 430, 5, "var(--accent-cyan)", 0.1)}
      {ticks(60, 395, 3, "var(--accent-magenta)", 0.06)}

      {/* Node dots at compass points */}
      {[0, 90, 180, 270].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={`cyan-${angle}`}
            cx={cx + 445 * Math.cos(rad)}
            cy={cy + 445 * Math.sin(rad)}
            r="2"
            fill="var(--accent-cyan)"
            opacity="0.25"
          />
        );
      })}

      {/* Corner nodes — magenta */}
      {[45, 135, 225, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={`mag-${angle}`}
            cx={cx + 445 * Math.cos(rad)}
            cy={cy + 445 * Math.sin(rad)}
            r="1.5"
            fill="var(--accent-magenta)"
            opacity="0.2"
          />
        );
      })}

      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 500 500"
        to="360 500 500"
        dur="90s"
        repeatCount="indefinite"
      />
    </svg>
  );
}
