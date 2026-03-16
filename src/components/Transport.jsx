import { useState } from "react";

export default function Transport({
  track,
  mode,
  isPlaying,
  onPrev,
  onNext,
  onTogglePlay,
  onUpdateYtId,
}) {
  const [ytInput, setYtInput] = useState("");

  const handleSubmitYtId = (e) => {
    e.preventDefault();
    const id = ytInput.trim();
    if (!id) return;
    // Extract video ID from full URL or raw ID
    const match = id.match(
      /(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/
    );
    onUpdateYtId(match ? match[1] : id);
    setYtInput("");
  };

  return (
    <footer className="transport">
      <div className="transport__now-playing">
        {track ? (
          <>
            <div className="transport__artist">{track.artist}</div>
            <div className="transport__cut">{track.cut}</div>
          </>
        ) : (
          <div className="transport__artist" style={{ opacity: 0.3 }}>
            No track selected
          </div>
        )}
      </div>

      <div className="transport__controls">
        <button className="transport__btn" onClick={onPrev} title="Previous">
          &#9664;&#9664;
        </button>
        <button
          className="transport__btn transport__btn--play"
          onClick={onTogglePlay}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "\u2759\u2759" : "\u25B6"}
        </button>
        <button className="transport__btn" onClick={onNext} title="Next">
          &#9654;&#9654;
        </button>
      </div>

      <div className="transport__right">
        <span className="transport__mode-hint">
          {mode === "dj" ? "Manual" : "Auto-advance"}
        </span>
        <form onSubmit={handleSubmitYtId} style={{ display: "contents" }}>
          <input
            type="text"
            className="transport__yt-input"
            placeholder="Paste YouTube ID / URL"
            value={ytInput}
            onChange={(e) => setYtInput(e.target.value)}
          />
        </form>
        {track?.ytId && (
          <a
            className="transport__yt-link"
            href={`https://www.youtube.com/watch?v=${track.ytId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in YT
          </a>
        )}
      </div>
    </footer>
  );
}
