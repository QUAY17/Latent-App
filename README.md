# Latent

**The music beneath the surface.**

A cinematic music dashboard designed to be displayed on a TV or large screen. Latent connects to YouTube and plays curated setlists of live recordings, deep cuts, and instrument-forward tracks — with visuals worth watching even when a track is playing.

## What It Does

Latent is a full-screen music player built around the idea that how music looks matters as much as how it sounds. The interface draws from tactical HUD displays and live stage lighting — dark backgrounds, iridescent fluid shaders, topographic ripple rings, and monospace data readouts. It's not a playlist app. It's an environment.

## Modes

- **DJ Mode** — Click any track to load it. Manual control. You run the flow.
- **Playlist Mode** — Tracks auto-advance when a video ends. Set it and walk away.

## Visuals

- Iridescent fluid WebGL shader — layered simplex noise shifting between blues, purples, and golds. Runs continuously, shifts on track changes.
- Topographic ripple rings — concentric SVG pulses that burst outward on track load.
- HUD arc overlay — rotating cyan arc segments, tick marks, and node dots.
- Bebas Neue (display), DM Mono (data), Lora (body). No system fonts.

## Adding Tracks

Paste any YouTube URL or 11-character video ID into the transport bar. It saves to localStorage and persists across sessions. Tracks without an ID show the artist name over the shader with a direct YouTube search link.

## Stack

React + Vite · Three.js (custom GLSL via @react-three/fiber) · YouTube IFrame API · Framer Motion · CSS custom properties · localStorage

## Run

```
npm install
npm run dev
```

## Deploy

Push to GitHub, import into Vercel. Zero config — Vercel auto-detects Vite. Every push to main auto-deploys.

For display: open the URL in Chrome full-screen (F11) on a TV via HDMI, Chromecast, or AirPlay.

## License

MIT
