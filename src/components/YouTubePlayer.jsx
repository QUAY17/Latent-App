import { useEffect, useRef, useCallback } from "react";

/**
 * YouTube iframe API wrapper.
 *
 * Loads the IFrame API once, creates a player instance,
 * and exposes onEnded / onStateChange for playlist mode.
 */

let apiLoaded = false;
let apiReady = false;
const readyCallbacks = [];

function loadYouTubeAPI() {
  if (apiLoaded) return;
  apiLoaded = true;

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    readyCallbacks.forEach((cb) => cb());
    readyCallbacks.length = 0;
  };
}

function onAPIReady(cb) {
  if (apiReady) {
    cb();
  } else {
    readyCallbacks.push(cb);
  }
}

export default function YouTubePlayer({
  videoId,
  isPlaying,
  onEnded,
  onPlayStateChange,
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const videoIdRef = useRef(videoId);

  const handleStateChange = useCallback(
    (event) => {
      const state = event.data;
      if (state === window.YT?.PlayerState?.ENDED) {
        onEnded?.();
      } else if (state === window.YT?.PlayerState?.PLAYING) {
        onPlayStateChange?.(true);
      } else if (state === window.YT?.PlayerState?.PAUSED) {
        onPlayStateChange?.(false);
      }
    },
    [onEnded, onPlayStateChange]
  );

  // Load API on mount
  useEffect(() => {
    loadYouTubeAPI();
  }, []);

  // Create / update player
  useEffect(() => {
    if (!videoId) {
      // Destroy player if no video
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      return;
    }

    videoIdRef.current = videoId;

    onAPIReady(() => {
      if (playerRef.current) {
        // Player exists — just load new video
        playerRef.current.loadVideoById(videoId);
      } else {
        // Create new player
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onStateChange: handleStateChange,
          },
        });
      }
    });
  }, [videoId, handleStateChange]);

  // Play / pause control
  useEffect(() => {
    if (!playerRef.current || !videoId) return;
    // Small delay to ensure player is ready
    const timer = setTimeout(() => {
      try {
        if (isPlaying) {
          playerRef.current.playVideo?.();
        } else {
          playerRef.current.pauseVideo?.();
        }
      } catch {
        // Player not ready yet
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isPlaying, videoId]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
