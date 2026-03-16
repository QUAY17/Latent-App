import FluidBackground from "./FluidBackground";
import RippleRings from "./RippleRings";
import HUDArcRing from "./HUDArcRing";
import YouTubePlayer from "./YouTubePlayer";
import AudioAnalyzer from "./AudioAnalyzer";

export default function PlayerPanel({
  track,
  isPlaying,
  activeIndex,
  onEnded,
  onPlayStateChange,
}) {
  const hasVideo = track && track.ytId;
  const hasTrack = !!track;

  return (
    <section className="player-panel">
      <FluidBackground seed={activeIndex >= 0 ? activeIndex : 0} />
      <RippleRings trigger={activeIndex} />
      <HUDArcRing />

      <div className="player-panel__content">
        {hasVideo ? (
          <>
            <div className="player-panel__youtube">
              <YouTubePlayer
                videoId={track.ytId}
                isPlaying={isPlaying}
                onEnded={onEnded}
                onPlayStateChange={onPlayStateChange}
              />
            </div>
            <AudioAnalyzer isPlaying={isPlaying} />
          </>
        ) : hasTrack ? (
          <>
            <div className="player-panel__empty">
              <div className="player-panel__empty-artist">{track.artist}</div>
              <div className="player-panel__empty-cut">{track.cut}</div>
              <a
                className="player-panel__search-link"
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.ytSearch)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Search on YouTube
              </a>
            </div>
            <AudioAnalyzer isPlaying={false} />
          </>
        ) : (
          <div className="player-panel__idle">
            <div className="player-panel__idle-title">Latent</div>
            <div className="player-panel__idle-tagline">
              the music beneath the surface
            </div>
          </div>
        )}
      </div>

      {hasTrack && (
        <div className="now-playing-overlay">
          <span className="now-playing-overlay__artist">{track.artist}</span>
          <span className="now-playing-overlay__cut">{track.cut}</span>
        </div>
      )}
    </section>
  );
}
