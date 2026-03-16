import { useState } from "react";
import FluidBackground from "./FluidBackground";
import RippleRings from "./RippleRings";
import HUDDashboard from "./HUDDashboard";
import YouTubePlayer from "./YouTubePlayer";
import AudioAnalyzer from "./AudioAnalyzer";

export default function PlayerPanel({
  track,
  isPlaying,
  activeIndex,
  totalTracks,
  mode,
  onEnded,
  onPlayStateChange,
}) {
  const [videoExpanded, setVideoExpanded] = useState(false);
  const hasVideo = track && track.ytId;
  const hasTrack = !!track;

  return (
    <section className="player-panel">
      <FluidBackground seed={activeIndex >= 0 ? activeIndex : 0} />
      <RippleRings trigger={activeIndex} />

      {/* HUD Dashboard — the cockpit display, always visible */}
      <HUDDashboard
        track={track}
        trackIndex={activeIndex}
        totalTracks={totalTracks}
        mode={mode}
        isPlaying={isPlaying}
      />

      {/* YouTube player — PIP style, expandable */}
      {hasVideo && (
        <div
          className={`player-pip ${videoExpanded ? "player-pip--expanded" : ""}`}
          onClick={() => setVideoExpanded(!videoExpanded)}
        >
          <div className="player-pip__header">
            <span className="player-pip__label">
              {videoExpanded ? "Click to minimize" : "Click to expand"}
            </span>
          </div>
          <div className="player-pip__frame">
            <YouTubePlayer
              videoId={track.ytId}
              isPlaying={isPlaying}
              onEnded={onEnded}
              onPlayStateChange={onPlayStateChange}
            />
          </div>
        </div>
      )}

      {/* Empty state — track selected but no ytId */}
      {hasTrack && !hasVideo && (
        <div className="player-panel__empty-pip">
          <span className="player-panel__empty-label">{track.artist}</span>
          <a
            className="player-panel__search-link"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.ytSearch)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Search YT
          </a>
        </div>
      )}

      {/* Frequency analyzer — bottom edge */}
      <div className="player-panel__analyzer">
        <AudioAnalyzer isPlaying={isPlaying} />
      </div>

      {/* Compact now-playing tag */}
      {hasTrack && (
        <div className="now-playing-overlay">
          <span className="now-playing-overlay__artist">{track.artist}</span>
          <span className="now-playing-overlay__cut">{track.cut}</span>
        </div>
      )}
    </section>
  );
}
