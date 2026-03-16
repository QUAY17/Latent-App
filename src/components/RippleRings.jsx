import { useEffect, useState } from "react";

/**
 * Topographic ripple rings — concentric circles that pulse outward
 * from center on track load. Continuous subtle animation otherwise.
 */
export default function RippleRings({ trigger }) {
  const [rings, setRings] = useState([]);

  // Spawn a burst of rings on track change
  useEffect(() => {
    if (trigger < 0) return;
    const id = Date.now();
    setRings((prev) => [...prev, id]);
    // Clean up after animation completes
    const timeout = setTimeout(() => {
      setRings((prev) => prev.filter((r) => r !== id));
    }, 2400);
    return () => clearTimeout(timeout);
  }, [trigger]);

  const ringCount = 6;
  const baseRadius = 60;

  return (
    <div className="ripple-container">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Static ambient rings */}
        {Array.from({ length: ringCount }).map((_, i) => (
          <circle
            key={`static-${i}`}
            cx="500"
            cy="500"
            r={baseRadius + i * 70}
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="0.5"
            opacity={0.06 - i * 0.008}
          >
            <animate
              attributeName="r"
              values={`${baseRadius + i * 70};${baseRadius + i * 70 + 8};${baseRadius + i * 70}`}
              dur={`${4 + i * 0.8}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Burst rings on track change */}
        {rings.map((id) =>
          Array.from({ length: 4 }).map((_, i) => (
            <circle
              key={`burst-${id}-${i}`}
              cx="500"
              cy="500"
              r="20"
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="1"
              opacity="0"
            >
              <animate
                attributeName="r"
                from="20"
                to="450"
                dur="2.4s"
                begin={`${i * 0.3}s`}
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                values="0.3;0.08;0"
                dur="2.4s"
                begin={`${i * 0.3}s`}
                fill="freeze"
              />
              <animate
                attributeName="stroke-width"
                from="1.5"
                to="0.3"
                dur="2.4s"
                begin={`${i * 0.3}s`}
                fill="freeze"
              />
            </circle>
          ))
        )}
      </svg>
    </div>
  );
}
