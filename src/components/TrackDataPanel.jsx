import NodeField from "./NodeField";

/**
 * Right-side data panel — HUD-style readouts with interactive
 * node field as living background.
 */

const TAG_COLORS = ["cyan", "magenta", "purple", "gold"];

export default function TrackDataPanel({ track, trackIndex, totalTracks, mode, isPlaying }) {
  const position = track ? trackIndex + 1 : 0;
  const progress = totalTracks > 0 ? ((position / totalTracks) * 100).toFixed(0) : 0;

  // Progress ring SVG
  const ringSize = 90;
  const strokeWidth = 2.5;
  const radius = (ringSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = track ? circumference - (position / totalTracks) * circumference : circumference;

  return (
    <aside className="data-panel">
      {/* Node field as living background */}
      <div className="data-panel__nodes">
        <NodeField isPlaying={isPlaying} />
      </div>

      {/* Progress ring — always visible */}
      <div className="data-panel__section">
        <div className="data-panel__section-label">Position</div>
        <div className="progress-ring">
          <svg width={ringSize} height={ringSize}>
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="#ffffff08"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              style={{ transition: "stroke-dashoffset 0.4s ease" }}
            />
            <text
              className="progress-ring__label"
              x={ringSize / 2}
              y={ringSize / 2 - 4}
            >
              {track ? String(position).padStart(2, "0") : "--"}
            </text>
            <text
              className="progress-ring__sublabel"
              x={ringSize / 2}
              y={ringSize / 2 + 12}
            >
              of {totalTracks}
            </text>
          </svg>
        </div>
      </div>

      {/* System / Track readouts */}
      <div className="data-panel__section">
        <div className="data-panel__section-label">
          {track ? "Track Data" : "System Status"}
        </div>
        {track ? (
          <>
            <div className="data-panel__readout">
              ARTIST{" "}
              <span className="data-panel__readout-value">{track.artist}</span>
            </div>
            <div className="data-panel__readout">
              ID{" "}
              <span className="data-panel__readout-value--cyan">
                {track.ytId || "—"}
              </span>
            </div>
            <div className="data-panel__readout">
              SET{" "}
              <span className="data-panel__readout-value--gold">
                {progress}%
              </span>
            </div>
            <div className="data-panel__readout">
              MODE{" "}
              <span className="data-panel__readout-value--magenta">
                {mode === "dj" ? "MANUAL" : "AUTO"}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="data-panel__readout">
              MODE{" "}
              <span className="data-panel__readout-value--cyan">
                {mode === "dj" ? "MANUAL" : "AUTO"}
              </span>
            </div>
            <div className="data-panel__readout">
              TRACKS{" "}
              <span className="data-panel__readout-value--cyan">
                {totalTracks}
              </span>
            </div>
            <div className="data-panel__readout">
              STATUS{" "}
              <span className="data-panel__readout-value--purple">STANDBY</span>
            </div>
          </>
        )}
      </div>

      {/* Genre tags */}
      {track && (
        <div className="data-panel__section">
          <div className="data-panel__section-label">Classification</div>
          <div className="data-panel__tags">
            {track.tags.map((tag, i) => (
              <span
                key={tag}
                className={`data-panel__tag data-panel__tag--${TAG_COLORS[i % TAG_COLORS.length]}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* DJ Notes */}
      {track?.notes && (
        <div className="data-panel__section">
          <div className="data-panel__section-label">Notes</div>
          <div className="data-panel__notes">{track.notes}</div>
        </div>
      )}
    </aside>
  );
}
