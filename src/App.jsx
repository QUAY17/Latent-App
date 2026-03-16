import { useReducer, useEffect, useCallback } from "react";
import { reducer, initialState } from "./reducer";
import TRACKS from "./data/tracks";
import Topbar from "./components/Topbar";
import Setlist from "./components/Setlist";
import PlayerPanel from "./components/PlayerPanel";
import TrackDataPanel from "./components/TrackDataPanel";
import Transport from "./components/Transport";

const STORAGE_KEY = "latent-track-ids";

function loadSavedIds() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveIds(tracks) {
  const ids = {};
  tracks.forEach((t) => {
    if (t.ytId) ids[t.id] = t.ytId;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { tracks, activeIndex, mode, isPlaying, searchQuery } = state;
  const activeTrack = activeIndex >= 0 ? tracks[activeIndex] : null;

  // Initialize tracks with saved YouTube IDs from localStorage
  useEffect(() => {
    const savedIds = loadSavedIds();
    const merged = TRACKS.map((t) => ({
      ...t,
      ytId: savedIds[t.id] || t.ytId,
    }));
    dispatch({ type: "INIT_TRACKS", tracks: merged });
  }, []);

  // Persist YouTube IDs when tracks change
  useEffect(() => {
    if (tracks.length > 0) saveIds(tracks);
  }, [tracks]);

  const handleSelectTrack = useCallback((index) => {
    dispatch({ type: "SELECT_TRACK", index });
  }, []);

  const handleSearch = useCallback((query) => {
    dispatch({ type: "SET_SEARCH", query });
  }, []);

  const handleToggleMode = useCallback(() => {
    dispatch({ type: "TOGGLE_MODE" });
  }, []);

  const handleTogglePlay = useCallback(() => {
    dispatch({ type: "TOGGLE_PLAY" });
  }, []);

  const handlePrev = useCallback(() => {
    dispatch({ type: "PREV_TRACK" });
  }, []);

  const handleNext = useCallback(() => {
    dispatch({ type: "NEXT_TRACK" });
  }, []);

  const handleVideoEnded = useCallback(() => {
    dispatch({ type: "VIDEO_ENDED" });
  }, []);

  const handlePlayStateChange = useCallback((playing) => {
    dispatch({ type: "SET_PLAYING", value: playing });
  }, []);

  const handleUpdateYtId = useCallback(
    (ytId) => {
      if (activeIndex < 0) return;
      dispatch({ type: "UPDATE_YT_ID", index: activeIndex, ytId });
    },
    [activeIndex]
  );

  return (
    <div className="app">
      <Topbar
        mode={mode}
        trackCount={tracks.length}
        onToggleMode={handleToggleMode}
      />
      <Setlist
        tracks={tracks}
        activeIndex={activeIndex}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onSelectTrack={handleSelectTrack}
      />
      <PlayerPanel
        track={activeTrack}
        isPlaying={isPlaying}
        activeIndex={activeIndex}
        totalTracks={tracks.length}
        mode={mode}
        onEnded={handleVideoEnded}
        onPlayStateChange={handlePlayStateChange}
      />
      <TrackDataPanel
        track={activeTrack}
        trackIndex={activeIndex}
        totalTracks={tracks.length}
        mode={mode}
        isPlaying={isPlaying}
      />
      <Transport
        track={activeTrack}
        mode={mode}
        isPlaying={isPlaying}
        onPrev={handlePrev}
        onNext={handleNext}
        onTogglePlay={handleTogglePlay}
        onUpdateYtId={handleUpdateYtId}
      />
    </div>
  );
}
