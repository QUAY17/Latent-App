import { useRef, useEffect, useCallback } from "react";

/**
 * Audio spectrum analyzer — canvas-based frequency bars.
 *
 * Uses Web Audio API to capture microphone input (picks up music
 * playing through speakers). Falls back to procedural animation
 * when mic access is denied or unavailable.
 */

const BAR_COUNT = 64;
const COLORS = {
  cyan: [0, 212, 255],
  magenta: [255, 0, 110],
  purple: [139, 92, 246],
};

export default function AudioAnalyzer({ isPlaying }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(new Uint8Array(BAR_COUNT));
  const animRef = useRef(null);
  const proceduralRef = useRef(new Float32Array(BAR_COUNT).fill(0));
  const hasAudioRef = useRef(false);

  // Try to capture mic audio
  useEffect(() => {
    let stream = null;
    let ctx = null;

    async function initAudio() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = BAR_COUNT * 2;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;
        hasAudioRef.current = true;
      } catch {
        // Mic not available — procedural fallback
        hasAudioRef.current = false;
      }
    }

    initAudio();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ctx) ctx.close();
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    let data;

    if (hasAudioRef.current && analyserRef.current) {
      // Real audio data
      const raw = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(raw);
      data = raw;
    } else {
      // Procedural — simulate audio-reactive bars
      const proc = proceduralRef.current;
      const time = performance.now() * 0.001;
      for (let i = 0; i < BAR_COUNT; i++) {
        const freq = i / BAR_COUNT;
        const base = isPlaying
          ? Math.sin(time * (2 + freq * 3) + i * 0.4) * 0.3 +
            Math.sin(time * (1.2 + freq * 5) + i * 0.7) * 0.2 +
            Math.sin(time * 0.5 + i * 0.2) * 0.15 +
            0.15
          : 0.02 + Math.sin(time * 0.3 + i * 0.1) * 0.02;

        // Smoothing
        proc[i] += (base - proc[i]) * 0.15;
      }
      // Convert to 0-255 range
      data = new Uint8Array(BAR_COUNT);
      for (let i = 0; i < BAR_COUNT; i++) {
        data[i] = Math.max(0, Math.min(255, proc[i] * 255));
      }
    }

    const barWidth = width / BAR_COUNT;
    const gap = 1;

    for (let i = 0; i < BAR_COUNT; i++) {
      const value = data[i] / 255;
      const barHeight = value * height * 0.9;

      // Color gradient: cyan → purple → magenta based on frequency
      const t = i / BAR_COUNT;
      let r, g, b;
      if (t < 0.5) {
        const s = t * 2;
        r = COLORS.cyan[0] + (COLORS.purple[0] - COLORS.cyan[0]) * s;
        g = COLORS.cyan[1] + (COLORS.purple[1] - COLORS.cyan[1]) * s;
        b = COLORS.cyan[2] + (COLORS.purple[2] - COLORS.cyan[2]) * s;
      } else {
        const s = (t - 0.5) * 2;
        r = COLORS.purple[0] + (COLORS.magenta[0] - COLORS.purple[0]) * s;
        g = COLORS.purple[1] + (COLORS.magenta[1] - COLORS.purple[1]) * s;
        b = COLORS.purple[2] + (COLORS.magenta[2] - COLORS.purple[2]) * s;
      }

      const alpha = 0.4 + value * 0.6;
      ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`;

      const x = i * barWidth + gap;
      const w = barWidth - gap * 2;
      ctx.fillRect(x, height - barHeight, w, barHeight);

      // Glow on peaks
      if (value > 0.6) {
        ctx.shadowColor = `rgba(${r | 0}, ${g | 0}, ${b | 0}, 0.5)`;
        ctx.shadowBlur = 6;
        ctx.fillRect(x, height - barHeight, w, 2);
        ctx.shadowBlur = 0;
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <div className="audio-analyzer">
      <span className="audio-analyzer__label">Frequency Analysis</span>
      <canvas ref={canvasRef} />
    </div>
  );
}
