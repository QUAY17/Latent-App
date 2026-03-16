import { memo } from "react";

const TrackItem = memo(function TrackItem({ track, index, isActive, onClick }) {
  return (
    <div
      className={`track-item ${isActive ? "track-item--active" : ""}`}
      onClick={() => onClick(index)}
    >
      <div className="track-item__number">
        {isActive && <span className="track-item__pulse" />}
        <span>{String(track.id).padStart(2, "0")}</span>
      </div>
      <div className="track-item__info">
        <div className="track-item__artist">{track.artist}</div>
        <div className="track-item__cut">{track.cut}</div>
        <div className="track-item__tags">
          {track.tags.map((tag) => (
            <span key={tag} className="track-item__tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default TrackItem;
