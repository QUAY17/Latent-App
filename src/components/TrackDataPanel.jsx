/**
 * Right-side data panel — HUD-style readouts for the active track.
 * Progress ring, metadata readouts, genre tags, DJ notes.
 */

const TAG_COLORS = ["cyan", "magenta", "purple"];

export default function TrackDataPanel({ track, trackIndex, totalTracks, mode }) {
  if (!track) {
    return (
      <aside className="data-panel">
        <div className="data-panel__section">
          <div className="data-panel__section-label">System Status</div>
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
        </div>

        <div className="data-panel__section">
          <div className="data-panel__section-label">Signal</div>
          <div className="data-panel__waveform" />
        </div>
      </aside>
    );
  }

  const position = trackIndex + 1;
  const progress = ((position / totalTracks) * 100).toFixed(0);

  // Progress ring SVG
  const ringSize = 100;
  const strokeWidth = 3;
  const radius = (ringSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (position / totalTracks) * circumference;

  return (
    <aside className="data-panel">
      {/* Progress ring */}
      <div className="data-panel__section">
        <div className="data-panel__section-label">Position</div>
        <div className="progress-ring">
          <svg width={ringSize} height={ringSize}>
            {/* Background ring */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="#ffffff08"
              strokeWidth={strokeWidth}
            />
            {/* Progress arc */}
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
            {/* Center label */}
            <text
              className="progress-ring__label"
              x={ringSize / 2}
              y={ringSize / 2 - 4}
            >
              {String(position).padStart(2, "0")}
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

      {/* Track readouts */}
      <div className="data-panel__section">
        <div className="data-panel__section-label">Track Data</div>
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
          <span className="data-panel__readout-value--purple">
            {progress}%
          </span>
        </div>
        <div className="data-panel__readout">
          MODE{" "}
          <span className="data-panel__readout-value--magenta">
            {mode === "dj" ? "MANUAL" : "AUTO"}
          </span>
        </div>
      </div>

      {/* Genre tags */}
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

      {/* Signal waveform */}
      <div className="data-panel__section">
        <div className="data-panel__section-label">Signal</div>
        <div className="data-panel__waveform" />
      </div>

      {/* DJ Notes */}
      {track.notes && (
        <div className="data-panel__section">
          <div className="data-panel__section-label">Notes</div>
          <div className="data-panel__notes">{track.notes}</div>
        </div>
      )}
    </aside>
  );
}
