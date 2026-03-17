import { useRef, useEffect, useState, useCallback } from "react";
import TrackItem from "./TrackItem";

export default function Setlist({
  tracks,
  activeIndex,
  searchQuery,
  onSearch,
  onSelectTrack,
  onPlayGuest,
}) {
  const listRef = useRef(null);
  const [tab, setTab] = useState("setlist"); // "setlist" | "search"
  const [ytQuery, setYtQuery] = useState("");
  const [ytResults, setYtResults] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState("");

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

  const searchYouTube = useCallback(async (query) => {
    if (!query.trim()) return;
    setYtLoading(true);
    setYtError("");
    setYtResults([]);

    try {
      const res = await fetch("/yt-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();
      const contents =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
          ?.sectionListRenderer?.contents || [];
      const items =
        contents[0]?.itemSectionRenderer?.contents || [];
      const videos = items
        .filter((i) => i.videoRenderer)
        .slice(0, 12)
        .map((i) => {
          const v = i.videoRenderer;
          return {
            videoId: v.videoId,
            title: v.title?.runs?.[0]?.text || "",
            author: v.ownerText?.runs?.[0]?.text || "",
            duration: v.lengthText?.simpleText || "",
          };
        });
      setYtResults(videos);
    } catch (err) {
      console.error("YT search error:", err);
      setYtError("Search unavailable — try again");
    }
    setYtLoading(false);
  }, []);

  const handleYtSubmit = (e) => {
    e.preventDefault();
    searchYouTube(ytQuery);
  };

  const handlePlayResult = (result) => {
    onPlayGuest(result.videoId, `${result.author} — ${result.title}`);
  };

  // duration comes as "3:45" string from YouTube API now

  return (
    <aside className="setlist">
      <div className="setlist__tabs">
        <button
          className={`setlist__tab ${tab === "setlist" ? "setlist__tab--active" : ""}`}
          onClick={() => setTab("setlist")}
        >
          Setlist
        </button>
        <button
          className={`setlist__tab ${tab === "search" ? "setlist__tab--active" : ""}`}
          onClick={() => setTab("search")}
        >
          Search
        </button>
      </div>

      <div className="setlist__content">
        {tab === "setlist" ? (
          <>
            <div className="setlist__search">
              <input
                type="text"
                className="setlist__search-input"
                placeholder="Filter artist, cut, tag..."
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
          </>
        ) : (
          <>
            <form className="setlist__search" onSubmit={handleYtSubmit}>
              <input
                type="text"
                className="setlist__search-input"
                placeholder="Search artist or song..."
                value={ytQuery}
                onChange={(e) => setYtQuery(e.target.value)}
              />
              <button type="submit" className="setlist__search-btn">
                Go
              </button>
            </form>
            <div className="setlist__list">
              {ytLoading && (
                <div className="setlist__status">Searching...</div>
              )}
              {ytError && (
                <div className="setlist__status setlist__status--error">
                  {ytError}
                </div>
              )}
              {ytResults.map((r) => (
                <div
                  key={r.videoId}
                  className="track-item yt-result"
                  onClick={() => handlePlayResult(r)}
                >
                  <div className="track-item__artist">{r.author}</div>
                  <div className="track-item__cut">{r.title}</div>
                  <div className="track-item__tags">
                    <span className="track-item__tag">
                      {r.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
