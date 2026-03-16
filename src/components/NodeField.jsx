import { useRef, useEffect, useCallback } from "react";

/**
 * Interactive particle node field.
 *
 * Floating neon nodes that:
 * - Pulse/breathe with procedural "audio" energy
 * - React to mouse position (magnetic attraction)
 * - Connect with thin lines when proximate
 * - Use cyan, magenta, purple, gold palette
 */

const NODE_COUNT = 40;
const CONNECT_DIST = 120;
const MOUSE_RADIUS = 180;
const MOUSE_FORCE = 0.03;

const NEON_COLORS = [
  { r: 0, g: 212, b: 255 },     // cyan
  { r: 255, g: 0, b: 110 },     // magenta
  { r: 139, g: 92, b: 246 },    // purple
  { r: 255, g: 210, b: 50 },    // gold
  { r: 0, g: 212, b: 255 },     // cyan
  { r: 139, g: 92, b: 246 },    // purple
];

function createNode(w, h) {
  const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    baseRadius: 1.5 + Math.random() * 2.5,
    radius: 2,
    color,
    phase: Math.random() * Math.PI * 2,
    freq: 0.5 + Math.random() * 1.5,
    energy: 0,
  };
}

export default function NodeField({ isPlaying }) {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  // Mouse tracking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    return () => {
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
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

    const time = performance.now() * 0.001;
    const mouse = mouseRef.current;
    const nodes = nodesRef.current;

    ctx.clearRect(0, 0, w, h);

    // Initialize nodes if needed
    if (nodes.length === 0 || sizeRef.current.w !== w) {
      sizeRef.current = { w, h };
      nodesRef.current = Array.from({ length: NODE_COUNT }, () => createNode(w, h));
    }

    // Update nodes
    for (const node of nodesRef.current) {
      // Procedural energy from "music"
      const musicEnergy = isPlaying
        ? Math.sin(time * node.freq * 2 + node.phase) * 0.4 +
          Math.sin(time * node.freq * 3.7 + node.phase * 2) * 0.3 +
          0.5
        : 0.1 + Math.sin(time * 0.3 + node.phase) * 0.05;

      node.energy += (musicEnergy - node.energy) * 0.08;
      node.radius = node.baseRadius * (1 + node.energy * 0.8);

      // Mouse attraction
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
        node.vx += dx / dist * force;
        node.vy += dy / dist * force;
      }

      // Drift
      node.x += node.vx;
      node.y += node.vy;

      // Damping
      node.vx *= 0.98;
      node.vy *= 0.98;

      // Gentle drift force
      node.vx += Math.sin(time * 0.2 + node.phase) * 0.003;
      node.vy += Math.cos(time * 0.15 + node.phase * 1.3) * 0.003;

      // Wrap edges
      if (node.x < -20) node.x = w + 20;
      if (node.x > w + 20) node.x = -20;
      if (node.y < -20) node.y = h + 20;
      if (node.y > h + 20) node.y = -20;
    }

    const allNodes = nodesRef.current;

    // Draw connections
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const a = allNodes[i];
        const b = allNodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.15 * ((a.energy + b.energy) / 2 + 0.3);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${a.color.r}, ${a.color.g}, ${a.color.b}, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const node of allNodes) {
      const { x, y, radius, color, energy } = node;

      // Glow
      const glowAlpha = 0.1 + energy * 0.2;
      const glowRadius = radius * (3 + energy * 4);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      glow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${glowAlpha})`);
      glow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);

      // Core dot
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.5 + energy * 0.5})`;
      ctx.fill();

      // Mouse proximity — extra brightness
      const mx = mouse.x - x;
      const my = mouse.y - y;
      const mDist = Math.sqrt(mx * mx + my * my);
      if (mDist < MOUSE_RADIUS) {
        const proximity = 1 - mDist / MOUSE_RADIUS;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${proximity * 0.4})`;
        ctx.fill();
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      nodesRef.current = Array.from({ length: NODE_COUNT }, () =>
        createNode(canvas.offsetWidth, canvas.offsetHeight)
      );
      sizeRef.current = { w: 0, h: 0 };
    };

    onResize();
    window.addEventListener("resize", onResize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="node-field"
    />
  );
}
