export default function Topbar({ mode, trackCount, onToggleMode }) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__logo">Latent</span>
        <span className="topbar__tagline">sample the space</span>
      </div>
      <div className="topbar__controls">
        <span className="topbar__track-count">
          {trackCount} TRK
        </span>
        <button className="mode-toggle" onClick={onToggleMode}>
          <span
            className={`mode-toggle__indicator mode-toggle__indicator--${mode}`}
          />
          <span className="mode-toggle__label">
            {mode === "dj" ? "DJ" : "Auto"}
          </span>
        </button>
      </div>
    </header>
  );
}
