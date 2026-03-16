import { useRef, useEffect, useCallback } from "react";

/**
 * Flowing waveform visualizer — smooth, aqueous curves
 * instead of chunky frequency bars. Mirrored top/bottom
 * with bezier interpolation for organic movement.
 *
 * Tries mic capture for real audio; falls back to procedural.
 */

const POINTS = 128;

// Neon palette for gradient
const GRADIENT_STOPS = [
  { pos: 0, color: "rgba(0, 212, 255, 0.6)" },     // cyan
  { pos: 0.3, color: "rgba(139, 92, 246, 0.5)" },   // purple
  { pos: 0.6, color: "rgba(255, 0, 110, 0.4)" },    // magenta
  { pos: 1, color: "rgba(255, 210, 50, 0.3)" },      // gold
];

export default function AudioAnalyzer({ isPlaying }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animRef = useRef(null);
  const hasAudioRef = useRef(false);
  const smoothedRef = useRef(new Float32Array(POINTS).fill(0));

  // Try mic capture
  useEffect(() => {
    let stream = null;
    let ctx = null;

    async function initAudio() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = POINTS * 2;
        analyser.smoothingTimeConstant = 0.85;
        source.connect(analyser);
        analyserRef.current = analyser;
        hasAudioRef.current = true;
      } catch {
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
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const mid = h / 2;
    ctx.clearRect(0, 0, w, h);

    const smoothed = smoothedRef.current;
    const time = performance.now() * 0.001;

    if (hasAudioRef.current && analyserRef.current) {
      const raw = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(raw);
      for (let i = 0; i < POINTS; i++) {
        const target = raw[i] / 255;
        smoothed[i] += (target - smoothed[i]) * 0.12;
      }
    } else {
      // Procedural — organic flowing waves
      for (let i = 0; i < POINTS; i++) {
        const x = i / POINTS;
        const base = isPlaying
          ? Math.sin(time * 1.5 + x * 8) * 0.2 +
            Math.sin(time * 2.3 + x * 12 + 1.5) * 0.15 +
            Math.sin(time * 0.8 + x * 4 + 3.0) * 0.1 +
            Math.sin(time * 3.1 + x * 20) * 0.05 +
            0.12
          : Math.sin(time * 0.4 + x * 3) * 0.02 + 0.02;

        smoothed[i] += (Math.max(0, base) - smoothed[i]) * 0.08;
      }
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    GRADIENT_STOPS.forEach((s) => gradient.addColorStop(s.pos, s.color));

    // Draw flowing curves — top half
    ctx.beginPath();
    ctx.moveTo(0, mid);

    for (let i = 0; i < POINTS; i++) {
      const x = (i / (POINTS - 1)) * w;
      const amplitude = smoothed[i] * mid * 0.85;
      const y = mid - amplitude;

      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = ((i - 1) / (POINTS - 1)) * w;
        const cpx = (prevX + x) / 2;
        const prevAmp = smoothed[i - 1] * mid * 0.85;
        const prevY = mid - prevAmp;
        ctx.quadraticCurveTo(prevX + (x - prevX) * 0.5, prevY, cpx + (x - cpx) * 0.5, (prevY + y) / 2);
        ctx.lineTo(x, y);
      }
    }

    ctx.lineTo(w, mid);
    ctx.closePath();

    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.4;
    ctx.fill();

    // Stroke the top edge
    ctx.beginPath();
    ctx.moveTo(0, mid);
    for (let i = 0; i < POINTS; i++) {
      const x = (i / (POINTS - 1)) * w;
      const amplitude = smoothed[i] * mid * 0.85;
      const y = mid - amplitude;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = ((i - 1) / (POINTS - 1)) * w;
        const prevAmp = smoothed[i - 1] * mid * 0.85;
        const prevY = mid - prevAmp;
        const cpx = (prevX + x) / 2;
        ctx.quadraticCurveTo(cpx, prevY, x, y);
      }
    }
    ctx.strokeStyle = "rgba(0, 212, 255, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.8;
    ctx.stroke();

    // Mirror — bottom half (reflected, dimmer)
    ctx.beginPath();
    ctx.moveTo(0, mid);

    for (let i = 0; i < POINTS; i++) {
      const x = (i / (POINTS - 1)) * w;
      const amplitude = smoothed[i] * mid * 0.5; // shorter mirror
      const y = mid + amplitude;

      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = ((i - 1) / (POINTS - 1)) * w;
        const prevAmp = smoothed[i - 1] * mid * 0.5;
        const prevY = mid + prevAmp;
        const cpx = (prevX + x) / 2;
        ctx.quadraticCurveTo(cpx, prevY, x, y);
      }
    }

    ctx.lineTo(w, mid);
    ctx.closePath();

    const mirrorGradient = ctx.createLinearGradient(0, 0, w, 0);
    mirrorGradient.addColorStop(0, "rgba(139, 92, 246, 0.3)");
    mirrorGradient.addColorStop(0.5, "rgba(255, 0, 110, 0.2)");
    mirrorGradient.addColorStop(1, "rgba(255, 210, 50, 0.15)");

    ctx.fillStyle = mirrorGradient;
    ctx.globalAlpha = 0.25;
    ctx.fill();

    // Thin center line
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 1;
    ctx.stroke();

    animRef.current = requestAnimationFrame(draw);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    animRef.current = requestAnimationFrame(draw);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <div className="audio-analyzer">
      <span className="audio-analyzer__label">Frequency</span>
      <canvas ref={canvasRef} />
    </div>
  );
}
