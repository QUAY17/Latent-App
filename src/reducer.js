/**
 * Central state reducer for Latent.
 *
 * State shape:
 *   tracks        — full track list (mutable ytId per track)
 *   activeIndex   — index of currently loaded track (-1 = none)
 *   mode          — "dj" | "playlist"
 *   isPlaying     — whether YouTube player is currently playing
 *   searchQuery   — current search filter text
 */

export const initialState = {
  tracks: [],
  activeIndex: -1,
  mode: "dj",
  isPlaying: false,
  searchQuery: "",
};

export function reducer(state, action) {
  switch (action.type) {
    case "INIT_TRACKS":
      return { ...state, tracks: action.tracks };

    case "SELECT_TRACK":
      return { ...state, activeIndex: action.index, isPlaying: true };

    case "NEXT_TRACK": {
      const next = state.activeIndex + 1;
      if (next >= state.tracks.length) return { ...state, isPlaying: false };
      return { ...state, activeIndex: next, isPlaying: true };
    }

    case "PREV_TRACK": {
      const prev = state.activeIndex - 1;
      if (prev < 0) return state;
      return { ...state, activeIndex: prev, isPlaying: true };
    }

    case "TOGGLE_PLAY":
      return { ...state, isPlaying: !state.isPlaying };

    case "SET_PLAYING":
      return { ...state, isPlaying: action.value };

    case "TOGGLE_MODE":
      return { ...state, mode: state.mode === "dj" ? "playlist" : "dj" };

    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };

    case "UPDATE_YT_ID": {
      const tracks = state.tracks.map((t, i) =>
        i === action.index ? { ...t, ytId: action.ytId } : t
      );
      return { ...state, tracks };
    }

    case "PLAY_GUEST": {
      const guest = {
        id: `guest-${Date.now()}`,
        artist: action.title || "Guest Track",
        cut: "",
        ytId: action.ytId,
        tags: ["GUEST"],
        notes: "",
      };
      const tracks = [...state.tracks, guest];
      return {
        ...state,
        tracks,
        activeIndex: tracks.length - 1,
        isPlaying: true,
      };
    }

    case "VIDEO_ENDED":
      if (state.mode === "playlist") {
        const next = state.activeIndex + 1;
        if (next >= state.tracks.length)
          return { ...state, isPlaying: false, activeIndex: 0 };
        return { ...state, activeIndex: next, isPlaying: true };
      }
      return { ...state, isPlaying: false };

    default:
      return state;
  }
}
