/**
 * Decorative HUD arc ring overlay — thin cyan strokes
 * inspired by the Iron Man HUD aesthetic.
 * Floats around the player area.
 */
export default function HUDArcRing() {
  const r = 420;
  const cx = 500;
  const cy = 500;

  // Arc helper: creates an SVG arc path
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

  // Tick marks around the outer ring
  function ticks(count, radius, length) {
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
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="var(--accent-cyan)"
          strokeWidth="0.4"
          opacity="0.15"
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
      {/* Outer arc segments with gaps */}
      <path
        d={arc(10, 80, r)}
        fill="none"
        stroke="var(--accent-cyan)"
        strokeWidth="0.6"
        opacity="0.12"
      />
      <path
        d={arc(100, 170, r)}
        fill="none"
        stroke="var(--accent-cyan)"
        strokeWidth="0.6"
        opacity="0.08"
      />
      <path
        d={arc(190, 260, r)}
        fill="none"
        stroke="var(--accent-cyan)"
        strokeWidth="0.6"
        opacity="0.12"
      />
      <path
        d={arc(280, 350, r)}
        fill="none"
        stroke="var(--accent-cyan)"
        strokeWidth="0.6"
        opacity="0.08"
      />

      {/* Inner ring — thinner, more subtle */}
      <path
        d={arc(30, 150, r - 30)}
        fill="none"
        stroke="var(--accent-cyan)"
        strokeWidth="0.4"
        opacity="0.06"
      />
      <path
        d={arc(210, 330, r - 30)}
        fill="none"
        stroke="var(--accent-cyan)"
        strokeWidth="0.4"
        opacity="0.06"
      />

      {/* Tick marks */}
      {ticks(72, r, 6)}

      {/* Corner node dots */}
      {[45, 135, 225, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <circle
            key={angle}
            cx={cx + (r + 15) * Math.cos(rad)}
            cy={cy + (r + 15) * Math.sin(rad)}
            r="2"
            fill="var(--accent-cyan)"
            opacity="0.2"
          />
        );
      })}

      {/* Slow rotation animation on the outer ring group */}
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 500 500"
        to="360 500 500"
        dur="120s"
        repeatCount="indefinite"
      />
    </svg>
  );
}
