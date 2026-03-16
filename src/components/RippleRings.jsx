import { useEffect, useState } from "react";

/**
 * Topographic ripple rings — concentric circles that pulse outward.
 * Neon cyan ambient + magenta burst on track change.
 */
export default function RippleRings({ trigger }) {
  const [rings, setRings] = useState([]);

  useEffect(() => {
    if (trigger < 0) return;
    const id = Date.now();
    setRings((prev) => [...prev, id]);
    const timeout = setTimeout(() => {
      setRings((prev) => prev.filter((r) => r !== id));
    }, 2400);
    return () => clearTimeout(timeout);
  }, [trigger]);

  const ringCount = 5;
  const baseRadius = 80;

  return (
    <div className="ripple-container">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Ambient cyan rings */}
        {Array.from({ length: ringCount }).map((_, i) => (
          <circle
            key={`static-${i}`}
            cx="500"
            cy="500"
            r={baseRadius + i * 80}
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="0.4"
            opacity={0.04 - i * 0.006}
          >
            <animate
              attributeName="r"
              values={`${baseRadius + i * 80};${baseRadius + i * 80 + 6};${baseRadius + i * 80}`}
              dur={`${5 + i}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Burst rings — magenta on track change */}
        {rings.map((id) =>
          Array.from({ length: 3 }).map((_, i) => (
            <circle
              key={`burst-${id}-${i}`}
              cx="500"
              cy="500"
              r="30"
              fill="none"
              stroke={i % 2 === 0 ? "var(--accent-magenta)" : "var(--accent-cyan)"}
              strokeWidth="0.8"
              opacity="0"
            >
              <animate
                attributeName="r" from="30" to="400"
                dur="2s" begin={`${i * 0.25}s`} fill="freeze"
              />
              <animate
                attributeName="opacity" values="0.25;0.05;0"
                dur="2s" begin={`${i * 0.25}s`} fill="freeze"
              />
              <animate
                attributeName="stroke-width" from="1.2" to="0.2"
                dur="2s" begin={`${i * 0.25}s`} fill="freeze"
              />
            </circle>
          ))
        )}
      </svg>
    </div>
  );
}
