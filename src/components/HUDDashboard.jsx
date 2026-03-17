import { useRef, useEffect, useCallback } from "react";

/**
 * Central HUD dashboard — the cockpit display.
 *
 * Canvas-rendered concentric rings filling the panel.
 * Radial frequency bars, dual scanner sweeps, rotating ring layers,
 * data readouts, pulsing nodes, arc progress segments, activity sensors.
 */

const TAU = Math.PI * 2;

const CYAN = { r: 0, g: 212, b: 255 };
const MAGENTA = { r: 255, g: 0, b: 110 };
const PURPLE = { r: 139, g: 92, b: 246 };
const GOLD = { r: 255, g: 211, b: 42 };
const RED = { r: 255, g: 45, b: 85 };
const WHITE = { r: 224, g: 224, b: 236 };

function rgba(c, a) {
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

const FREQ_BARS = 96;

export default function HUDDashboard({ track, trackIndex, totalTracks, mode, isPlaying }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const smoothedFreq = useRef(new Float32Array(FREQ_BARS).fill(0));
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    canvas.addEventListener("mousemove", handleMove);
    return () => canvas.removeEventListener("mousemove", handleMove);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // High-DPI canvas — sharp on retina displays
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const time = performance.now() * 0.001;

    // Fill the panel — this IS the dashboard
    const baseR = Math.min(w, h) * 0.72;

    ctx.clearRect(0, 0, w, h);

    // ─── Procedural frequency data ───
    const freq = smoothedFreq.current;
    for (let i = 0; i < FREQ_BARS; i++) {
      const x = i / FREQ_BARS;
      const target = isPlaying
        ? Math.abs(Math.sin(time * 2.5 + x * 10) * 0.35 +
          Math.sin(time * 4.1 + x * 18 + 1.2) * 0.25 +
          Math.sin(time * 1.3 + x * 6 + 3.0) * 0.15 +
          Math.sin(time * 6.0 + x * 25) * 0.1) + 0.05
        : 0.02 + Math.sin(time * 0.3 + i * 0.15) * 0.015;
      freq[i] += (target - freq[i]) * 0.12;
    }

    let avgEnergy = 0;
    for (let i = 0; i < FREQ_BARS; i++) avgEnergy += freq[i];
    avgEnergy /= FREQ_BARS;

    // ─── LAYER 0: Outer glow ring ───
    const outerGlowR = baseR * 1.12;
    const glowGrad = ctx.createRadialGradient(cx, cy, baseR * 0.95, cx, cy, outerGlowR);
    glowGrad.addColorStop(0, rgba(CYAN, 0));
    glowGrad.addColorStop(0.5, rgba(CYAN, 0.02 + avgEnergy * 0.03));
    glowGrad.addColorStop(1, rgba(CYAN, 0));
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // ─── LAYER 1: Outer tick ring (slow CW rotation) ───
    const outerR = baseR * 1.05;
    const tickCount = 180;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.015);
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * TAU;
      const isMajor = i % 15 === 0;
      const isMid = i % 5 === 0;
      const len = isMajor ? 14 : isMid ? 8 : 3;
      const r1 = outerR;
      const r2 = outerR + len;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = isMajor ? rgba(CYAN, 0.35) : isMid ? rgba(CYAN, 0.15) : rgba(CYAN, 0.06);
      ctx.lineWidth = isMajor ? 1.5 : isMid ? 1 : 0.5;
      ctx.stroke();
    }
    ctx.restore();

    // ─── LAYER 1b: Second outer ring (slow CCW, red/gold) ───
    const outer2R = baseR * 1.02;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-time * 0.01);
    for (let i = 0; i < 90; i++) {
      const angle = (i / 90) * TAU;
      const on = i % 2 === 0;
      if (!on) continue;
      const r1 = outer2R - 1;
      const r2 = outer2R + 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = rgba(RED, 0.1);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.restore();

    // ─── LAYER 2: Radial frequency bars ───
    const freqInnerR = baseR * 0.7;
    const freqMaxLen = baseR * 0.32;
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < FREQ_BARS; i++) {
      const angle = (i / FREQ_BARS) * TAU - Math.PI / 2;
      const value = freq[i];
      const barLen = value * freqMaxLen * 2;
      const r1 = freqInnerR;
      const r2 = freqInnerR + barLen;

      const t = i / FREQ_BARS;
      let color;
      if (t < 0.25) color = CYAN;
      else if (t < 0.5) color = PURPLE;
      else if (t < 0.75) color = MAGENTA;
      else color = GOLD;

      const alpha = 0.25 + value * 0.75;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Peak glow dot
      if (value > 0.3) {
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * r2, Math.sin(angle) * r2, 2.5 + value * 2, 0, TAU);
        ctx.fillStyle = rgba(color, alpha * 0.3);
        ctx.fill();
      }
    }
    ctx.restore();

    // ─── LAYER 2b: Inner frequency mirror (dimmer, smaller) ───
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < FREQ_BARS; i++) {
      const angle = (i / FREQ_BARS) * TAU - Math.PI / 2;
      const value = freq[i];
      const barLen = value * freqMaxLen * 0.5;
      const r1 = freqInnerR;
      const r2 = freqInnerR - barLen;

      const t = i / FREQ_BARS;
      let color = t < 0.5 ? CYAN : RED;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = rgba(color, 0.08 + value * 0.12);
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    ctx.restore();

    // ─── LAYER 3: Arc progress ring ───
    const setProgress = totalTracks > 0 ? (trackIndex + 1) / totalTracks : 0;
    const arcR = baseR * 0.65;

    ctx.beginPath();
    ctx.arc(cx, cy, arcR, 0, TAU);
    ctx.strokeStyle = rgba(WHITE, 0.03);
    ctx.lineWidth = 4;
    ctx.stroke();

    if (setProgress > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, arcR, -Math.PI / 2, -Math.PI / 2 + TAU * setProgress);
      ctx.strokeStyle = rgba(GOLD, 0.5);
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      // Glow tip
      const tipAngle = -Math.PI / 2 + TAU * setProgress;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(tipAngle) * arcR, cy + Math.sin(tipAngle) * arcR, 6, 0, TAU);
      ctx.fillStyle = rgba(GOLD, 0.5);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + Math.cos(tipAngle) * arcR, cy + Math.sin(tipAngle) * arcR, 12, 0, TAU);
      ctx.fillStyle = rgba(GOLD, 0.1);
      ctx.fill();
    }

    // ─── LAYER 4: Inner rotating ring (CCW, magenta) ───
    const innerRingR = baseR * 0.58;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-time * 0.035);
    const innerTicks = 80;
    for (let i = 0; i < innerTicks; i++) {
      const angle = (i / innerTicks) * TAU;
      if (i % 3 === 0) continue;
      const len = i % 6 === 0 ? 4 : 2;
      const r1 = innerRingR - len;
      const r2 = innerRingR + len;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = rgba(MAGENTA, 0.1);
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
    ctx.restore();

    // ─── LAYER 4b: Another ring (CW, red, different speed) ───
    const ring3R = baseR * 0.52;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.06);
    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * TAU;
      if (i % 2 !== 0) continue;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (ring3R - 2), Math.sin(angle) * (ring3R - 2));
      ctx.lineTo(Math.cos(angle) * (ring3R + 2), Math.sin(angle) * (ring3R + 2));
      ctx.strokeStyle = rgba(RED, 0.08);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.restore();

    // ─── LAYER 5: Primary scanner sweep (cyan, CW) ───
    const sweepAngle = (time * 0.7) % TAU;
    const sweepR = baseR * 0.6;
    const sweepGrad = ctx.createConicGradient(sweepAngle - 0.8, cx, cy);
    sweepGrad.addColorStop(0, rgba(CYAN, 0));
    sweepGrad.addColorStop(0.8, rgba(CYAN, 0));
    sweepGrad.addColorStop(1, rgba(CYAN, 0.1 + avgEnergy * 0.15));

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, sweepR, sweepAngle - 0.8, sweepAngle);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * sweepR, cy + Math.sin(sweepAngle) * sweepR);
    ctx.strokeStyle = rgba(CYAN, 0.2 + avgEnergy * 0.25);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ─── LAYER 6: Secondary scanner (red, CCW, slower) ───
    const sweep2Angle = (-time * 0.25) % TAU;
    const sweep2R = baseR * 0.48;
    const sweep2Grad = ctx.createConicGradient(sweep2Angle - 0.5, cx, cy);
    sweep2Grad.addColorStop(0, rgba(RED, 0));
    sweep2Grad.addColorStop(0.85, rgba(RED, 0));
    sweep2Grad.addColorStop(1, rgba(RED, 0.06 + avgEnergy * 0.08));

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, sweep2R, sweep2Angle - 0.5, sweep2Angle);
    ctx.closePath();
    ctx.fillStyle = sweep2Grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweep2Angle) * sweep2R, cy + Math.sin(sweep2Angle) * sweep2R);
    ctx.strokeStyle = rgba(RED, 0.12);
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // ─── LAYER 7: Concentric guide rings ───
    [0.48, 0.38, 0.28, 0.18].forEach((scale, idx) => {
      const r = baseR * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = rgba(CYAN, 0.03 + idx * 0.005);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // ─── LAYER 8: 12 indicator nodes (clock positions) ───
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * TAU - Math.PI / 2;
      const r = baseR * 1.1;
      const nx = cx + Math.cos(angle) * r;
      const ny = cy + Math.sin(angle) * r;

      const isCardinal = i % 3 === 0;
      const nodeColor = isCardinal ? GOLD : i % 2 === 0 ? CYAN : RED;
      const pulseSize = isCardinal ? 3 + Math.sin(time * 2 + i) * 1.5 : 2 + Math.sin(time * 2.5 + i) * 0.8;
      const glow = isPlaying ? 0.5 + Math.sin(time * 3 + i * 0.7) * 0.25 : 0.15;

      // Outer glow
      ctx.beginPath();
      ctx.arc(nx, ny, pulseSize * 4, 0, TAU);
      ctx.fillStyle = rgba(nodeColor, glow * 0.12);
      ctx.fill();

      // Mid glow
      ctx.beginPath();
      ctx.arc(nx, ny, pulseSize * 2, 0, TAU);
      ctx.fillStyle = rgba(nodeColor, glow * 0.25);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(nx, ny, pulseSize, 0, TAU);
      ctx.fillStyle = rgba(nodeColor, glow);
      ctx.fill();

      // Connecting line to ring edge
      const edgeX = cx + Math.cos(angle) * (baseR * 1.05);
      const edgeY = cy + Math.sin(angle) * (baseR * 1.05);
      ctx.beginPath();
      ctx.moveTo(edgeX, edgeY);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = rgba(nodeColor, glow * 0.15);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ─── LAYER 9: Center data readouts ───
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (track) {
      // ── Active track display ──
      // Track number — large center
      ctx.font = `${Math.max(48, baseR * 0.22)}px 'Bebas Neue', sans-serif`;
      ctx.fillStyle = rgba(WHITE, 0.85);
      ctx.fillText(String(trackIndex + 1).padStart(2, "0"), cx, cy - baseR * 0.06);

      // "TRACK" label above
      ctx.font = `${Math.max(10, baseR * 0.04)}px 'DM Mono', monospace`;
      ctx.fillStyle = rgba(CYAN, 0.45);
      ctx.fillText("TRACK", cx, cy - baseR * 0.06 - Math.max(30, baseR * 0.14));

      // Artist name below number
      ctx.font = `${Math.max(12, baseR * 0.05)}px 'DM Mono', monospace`;
      ctx.fillStyle = rgba(GOLD, 0.7);
      const artistText = track.artist.length > 20
        ? track.artist.substring(0, 20) + "…"
        : track.artist;
      ctx.fillText(artistText.toUpperCase(), cx, cy + baseR * 0.08);

      // Mode indicator
      ctx.font = `${Math.max(9, baseR * 0.035)}px 'DM Mono', monospace`;
      ctx.fillStyle = rgba(mode === "dj" ? RED : CYAN, 0.5);
      ctx.fillText(mode === "dj" ? "MANUAL" : "AUTO-ADVANCE", cx, cy + baseR * 0.16);
    } else {
      // ── Idle branding — LATENT with glow ──
      const brandSize = Math.max(56, baseR * 0.26);

      // Outer glow layers
      ctx.font = `${brandSize}px 'Bebas Neue', sans-serif`;
      ctx.letterSpacing = "8px";
      ctx.shadowColor = rgba(GOLD, 0.4);
      ctx.shadowBlur = 30;
      ctx.fillStyle = rgba(GOLD, 0.08);
      ctx.fillText("LATENT", cx, cy - baseR * 0.04);
      ctx.fillText("LATENT", cx, cy - baseR * 0.04);

      // Mid glow
      ctx.shadowBlur = 15;
      ctx.fillStyle = rgba(GOLD, 0.2);
      ctx.fillText("LATENT", cx, cy - baseR * 0.04);

      // Core text
      ctx.shadowColor = rgba(GOLD, 0.6);
      ctx.shadowBlur = 8;
      ctx.fillStyle = rgba(GOLD, 0.9);
      ctx.fillText("LATENT", cx, cy - baseR * 0.04);
      ctx.shadowBlur = 0;

      // Tagline
      ctx.font = `${Math.max(9, baseR * 0.038)}px 'DM Mono', monospace`;
      ctx.letterSpacing = "3px";
      ctx.fillStyle = rgba(WHITE, 0.25);
      ctx.fillText("SAMPLE THE SPACE", cx, cy + baseR * 0.08);
      ctx.letterSpacing = "0px";

      // Mode label
      ctx.font = `${Math.max(8, baseR * 0.03)}px 'DM Mono', monospace`;
      ctx.fillStyle = rgba(mode === "dj" ? RED : CYAN, 0.4);
      ctx.fillText(mode === "dj" ? "DJ MODE" : "PLAYLIST", cx, cy + baseR * 0.16);
    }

    // Compass readouts — outside the ring
    const readoutR = baseR * 1.22;
    const readoutFont = `${Math.max(9, baseR * 0.038)}px 'DM Mono', monospace`;
    ctx.font = readoutFont;

    // Top
    ctx.fillStyle = rgba(GOLD, 0.6);
    ctx.fillText(`SET ${totalTracks > 0 ? Math.round(((trackIndex + 1) / totalTracks) * 100) : 0}%`, cx, cy - readoutR);

    // Right
    ctx.fillStyle = rgba(isPlaying ? CYAN : RED, 0.5);
    ctx.fillText(isPlaying ? "▸ ACTIVE" : "◼ IDLE", cx + readoutR, cy);

    // Bottom
    ctx.fillStyle = rgba(PURPLE, 0.5);
    ctx.fillText(`${totalTracks} TRACKS`, cx, cy + readoutR);

    // Left
    ctx.fillStyle = rgba(RED, 0.5);
    ctx.fillText(mode === "dj" ? "DJ MODE" : "PLAYLIST", cx - readoutR, cy);

    ctx.restore();

    // ─── LAYER 10: Mouse proximity effects ───
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const mDist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);

    if (mDist < baseR * 1.3 && mx > 0) {
      // Glow
      const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 100);
      grad.addColorStop(0, rgba(CYAN, 0.05));
      grad.addColorStop(1, rgba(CYAN, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(mx - 100, my - 100, 200, 200);

      // Crosshair
      ctx.beginPath();
      ctx.moveTo(mx - 12, my); ctx.lineTo(mx - 4, my);
      ctx.moveTo(mx + 4, my); ctx.lineTo(mx + 12, my);
      ctx.moveTo(mx, my - 12); ctx.lineTo(mx, my - 4);
      ctx.moveTo(mx, my + 4); ctx.lineTo(mx, my + 12);
      ctx.strokeStyle = rgba(CYAN, 0.25);
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Small target circle
      ctx.beginPath();
      ctx.arc(mx, my, 16, 0, TAU);
      ctx.strokeStyle = rgba(CYAN, 0.08);
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ─── LAYER 11: Activity sensor pulses ───
    if (isPlaying) {
      const pulseCount = 8;
      for (let i = 0; i < pulseCount; i++) {
        const seed = Math.floor(time * 1.5 + i * 7.3);
        const angle = ((seed * 137.508) % 360) * (Math.PI / 180);
        const dist = baseR * (0.2 + ((seed * 0.618) % 1) * 0.4);
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const flash = Math.sin(time * 4 + i * 2.1);

        if (flash > 0.6) {
          const pulseColor = [GOLD, RED, MAGENTA, CYAN][i % 4];
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, TAU);
          ctx.fillStyle = rgba(pulseColor, flash * 0.5);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, 8, 0, TAU);
          ctx.fillStyle = rgba(pulseColor, flash * 0.08);
          ctx.fill();
        }
      }
    }

    // ─── LAYER 12: Corner data panels (HUD rectangles) ───
    ctx.save();
    ctx.font = `${Math.max(8, baseR * 0.03)}px 'DM Mono', monospace`;

    // Top-left panel
    const plX = 16, plY = 12;
    ctx.strokeStyle = rgba(CYAN, 0.08);
    ctx.lineWidth = 0.5;
    ctx.strokeRect(plX, plY, 120, 52);
    ctx.fillStyle = rgba(CYAN, 0.35);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("SYS STATUS", plX + 6, plY + 6);
    ctx.fillStyle = rgba(isPlaying ? CYAN : RED, 0.5);
    ctx.fillText(isPlaying ? "STREAMING" : "STANDBY", plX + 6, plY + 20);
    ctx.fillStyle = rgba(GOLD, 0.4);
    ctx.fillText(`LATENCY 0.${Math.floor(time * 100 % 99).toString().padStart(2, "0")}ms`, plX + 6, plY + 34);

    // Top-right panel
    const prX = w - 136, prY = 12;
    ctx.strokeStyle = rgba(RED, 0.08);
    ctx.strokeRect(prX, prY, 120, 52);
    ctx.fillStyle = rgba(RED, 0.35);
    ctx.textAlign = "left";
    ctx.fillText("SIGNAL", prX + 6, prY + 6);
    ctx.fillStyle = rgba(WHITE, 0.4);
    ctx.fillText(`FREQ ${(avgEnergy * 440 + 220).toFixed(0)} Hz`, prX + 6, prY + 20);
    ctx.fillStyle = rgba(GOLD, 0.4);
    ctx.fillText(`AMP ${(avgEnergy * 100).toFixed(1)}%`, prX + 6, prY + 34);

    // Bottom-left mini readout
    const blX = 16, blY = h - 64;
    ctx.strokeStyle = rgba(PURPLE, 0.06);
    ctx.strokeRect(blX, blY, 100, 40);
    ctx.fillStyle = rgba(PURPLE, 0.35);
    ctx.fillText("ENGINE", blX + 6, blY + 6);
    ctx.fillStyle = rgba(WHITE, 0.3);
    ctx.fillText(`R3F • GLSL`, blX + 6, blY + 20);

    ctx.restore();

    animRef.current = requestAnimationFrame(draw);
  }, [track, trackIndex, totalTracks, mode, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
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
    <canvas
      ref={canvasRef}
      className="hud-dashboard"
    />
  );
}
