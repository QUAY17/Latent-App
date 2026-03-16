import { useRef, useEffect } from "react";
import TrackItem from "./TrackItem";

export default function Setlist({
  tracks,
  activeIndex,
  searchQuery,
  onSearch,
  onSelectTrack,
}) {
  const listRef = useRef(null);

  // Filter tracks by search query
  const filtered = tracks
    .map((track, index) => ({ track, index }))
    .filter(({ track }) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        track.artist.toLowerCase().includes(q) ||
        track.cut.toLowerCase().includes(q) ||
        track.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

  // Auto-scroll to active track
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.querySelector(".track-item--active");
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <aside className="setlist">
      <div className="setlist__search">
        <input
          type="text"
          className="setlist__search-input"
          placeholder="Search artist, cut, tag..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="setlist__list" ref={listRef}>
        {filtered.map(({ track, index }) => (
          <TrackItem
            key={track.id}
            track={track}
            index={index}
            isActive={index === activeIndex}
            onClick={onSelectTrack}
          />
        ))}
      </div>
    </aside>
  );
}
