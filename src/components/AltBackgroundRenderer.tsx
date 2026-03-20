import React, { useRef, useEffect, useCallback, useState } from "react";
import { AnimationConfig, hexToRgba } from "../lib/backgroundAnimations";

interface AltBackgroundRendererProps {
  config: AnimationConfig;
  reducedMotion: boolean;
}

// ─── Particle / element state interfaces ──────────────────────
interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; alpha: number; life: number;
}

interface Bubble {
  x: number; y: number; vy: number; size: number;
  color: string; alpha: number; wobblePhase: number;
}

interface RainDrop {
  x: number; y: number; speed: number; length: number;
  color: string; alpha: number;
}

interface GeoShape {
  x: number; y: number; size: number; rotation: number;
  rotSpeed: number; sides: number; color: string; alpha: number;
  vx: number; vy: number;
}

interface Ripple {
  x: number; y: number; radius: number; maxRadius: number;
  color: string; alpha: number; speed: number;
}

interface Firefly {
  x: number; y: number; targetX: number; targetY: number;
  size: number; color: string; alpha: number;
  pulsePhase: number; speed: number;
}

// ─── Main Component ──────────────────────────────────────────
export const AltBackgroundRenderer = React.memo(function AltBackgroundRenderer({
  config,
  reducedMotion,
}: AltBackgroundRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Resize handler
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
    });
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  // Initialize element state when config or dimensions change
  const initState = useCallback(
    (w: number, h: number) => {
      const { type, colors, count, scale } = config;
      switch (type) {
        case "particles":
          return initParticles(w, h, count, colors, scale);
        case "bubbles":
          return initBubbles(w, h, count, colors, scale);
        case "fireflies":
          return initFireflies(w, h, count, colors, scale);
        case "rain":
          return initRain(w, h, count, colors, scale);
        case "geometric":
          return initGeometric(w, h, count, colors, scale);
        case "ripples":
          return initRipples(w, h, count, colors, scale);
        default:
          return null; // aurora, waves, gradient, nebula drawn procedurally
      }
    },
    [config]
  );

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { w, h } = dimensions;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    stateRef.current = initState(w, h);
    let t = 0;

    const draw = () => {
      if (reducedMotion) {
        // Draw one static frame for reduced-motion users
        ctx.clearRect(0, 0, w, h);
        drawStaticFrame(ctx, config, w, h, stateRef.current);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      t += config.speed * 0.016; // ~60fps step

      switch (config.type) {
        case "aurora":
          drawAurora(ctx, config, w, h, t);
          break;
        case "waves":
          drawWaves(ctx, config, w, h, t);
          break;
        case "gradient":
          drawGradient(ctx, config, w, h, t);
          break;
        case "nebula":
          drawNebula(ctx, config, w, h, t);
          break;
        case "particles":
          drawParticles(ctx, config, w, h, stateRef.current);
          break;
        case "bubbles":
          drawBubbles(ctx, config, w, h, stateRef.current);
          break;
        case "fireflies":
          drawFireflies(ctx, config, w, h, stateRef.current);
          break;
        case "rain":
          drawRainEffect(ctx, config, w, h, stateRef.current);
          break;
        case "geometric":
          drawGeometric(ctx, config, w, h, stateRef.current);
          break;
        case "ripples":
          drawRippleEffect(ctx, config, w, h, stateRef.current);
          break;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [config, dimensions, reducedMotion, initState]);

  return (
    <canvas
      ref={canvasRef}
      className="bg-animation-canvas"
      aria-hidden="true"
    />
  );
});

// ─── Initializers ────────────────────────────────────────────

function initParticles(w: number, h: number, count: number, colors: string[], scale: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: (Math.random() * 3 + 1) * scale,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: Math.random() * 0.5 + 0.3,
    life: Math.random() * Math.PI * 2,
  }));
}

function initBubbles(w: number, h: number, count: number, colors: string[], scale: number): Bubble[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: h + Math.random() * 200,
    vy: -(Math.random() * 0.8 + 0.2),
    size: (Math.random() * 20 + 5) * scale,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: Math.random() * 0.3 + 0.1,
    wobblePhase: Math.random() * Math.PI * 2,
  }));
}

function initFireflies(w: number, h: number, count: number, colors: string[], scale: number): Firefly[] {
  return Array.from({ length: count }, () => {
    const x = Math.random() * w;
    const y = Math.random() * h;
    return {
      x, y,
      targetX: x + (Math.random() - 0.5) * 100,
      targetY: y + (Math.random() - 0.5) * 100,
      size: (Math.random() * 3 + 1.5) * scale,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random(),
      pulsePhase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.2,
    };
  });
}

function initRain(w: number, h: number, count: number, colors: string[], scale: number): RainDrop[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    speed: (Math.random() * 3 + 2) * scale,
    length: (Math.random() * 15 + 8) * scale,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: Math.random() * 0.3 + 0.1,
  }));
}

function initGeometric(w: number, h: number, count: number, colors: string[], scale: number): GeoShape[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: (Math.random() * 30 + 15) * scale,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.01,
    sides: Math.floor(Math.random() * 4) + 3, // 3-6 sides
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: Math.random() * 0.15 + 0.05,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
  }));
}

function initRipples(w: number, h: number, count: number, colors: string[], scale: number): Ripple[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    radius: Math.random() * 30 * scale,
    maxRadius: (Math.random() * 150 + 80) * scale,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: Math.random() * 0.2 + 0.1,
    speed: Math.random() * 0.6 + 0.3,
  }));
}

// ─── Draw functions ──────────────────────────────────────────

function drawAurora(ctx: CanvasRenderingContext2D, config: AnimationConfig, w: number, h: number, t: number) {
  const { colors, opacity, count } = config;
  for (let i = 0; i < count; i++) {
    const phase = t * 0.3 + (i * Math.PI * 2) / count;
    const y = h * 0.3 + Math.sin(phase) * h * 0.15 + i * 30;
    const gradient = ctx.createLinearGradient(0, y - 80, 0, y + 80);
    const c = colors[i % colors.length];
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.3, hexToRgba(c, opacity * 0.6));
    gradient.addColorStop(0.5, hexToRgba(c, opacity));
    gradient.addColorStop(0.7, hexToRgba(c, opacity * 0.6));
    gradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 4) {
      const waveY = y + Math.sin(x * 0.003 + phase) * 40 + Math.sin(x * 0.007 + phase * 1.3) * 20;
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

function drawWaves(ctx: CanvasRenderingContext2D, config: AnimationConfig, w: number, h: number, t: number) {
  const { colors, opacity, count } = config;
  for (let i = 0; i < count; i++) {
    const baseY = h * 0.55 + i * (h * 0.1);
    const c = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 3) {
      const y =
        baseY +
        Math.sin(x * 0.004 + t * (0.8 + i * 0.2)) * 25 +
        Math.sin(x * 0.008 + t * (1.2 + i * 0.15)) * 15;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = hexToRgba(c, opacity * (0.6 - i * 0.1));
    ctx.fill();
  }
}

function drawGradient(ctx: CanvasRenderingContext2D, config: AnimationConfig, w: number, h: number, t: number) {
  const { colors, opacity } = config;
  // Slowly shifting multi-stop radial gradients
  for (let i = 0; i < colors.length; i++) {
    const phase = t * 0.5 + (i * Math.PI * 2) / colors.length;
    const cx = w * 0.5 + Math.sin(phase) * w * 0.3;
    const cy = h * 0.5 + Math.cos(phase * 0.7) * h * 0.25;
    const r = Math.max(w, h) * 0.5;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, hexToRgba(colors[i], opacity));
    grad.addColorStop(0.5, hexToRgba(colors[i], opacity * 0.3));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawNebula(ctx: CanvasRenderingContext2D, config: AnimationConfig, w: number, h: number, t: number) {
  const { colors, opacity, count } = config;
  for (let i = 0; i < count; i++) {
    const phase = t * 0.2 + (i * Math.PI * 2) / count;
    const cx = w * (0.3 + 0.4 * Math.sin(phase * 0.3 + i));
    const cy = h * (0.3 + 0.4 * Math.cos(phase * 0.4 + i * 1.5));
    const r = Math.max(w, h) * (0.3 + 0.1 * Math.sin(phase));
    const c = colors[i % colors.length];

    const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    grad.addColorStop(0, hexToRgba(c, opacity * 0.8));
    grad.addColorStop(0.4, hexToRgba(c, opacity * 0.3));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, config: AnimationConfig, w: number, h: number, particles: Particle[]) {
  if (!particles) return;
  const { opacity, speed } = config;
  for (const p of particles) {
    p.life += 0.02 * speed;
    p.x += p.vx * speed;
    p.y += p.vy * speed;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;

    const pulse = Math.sin(p.life) * 0.3 + 0.7;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(p.color, p.alpha * opacity * pulse);
    ctx.fill();

    // Glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(p.color, p.alpha * opacity * pulse * 0.15);
    ctx.fill();
  }
}

function drawBubbles(ctx: CanvasRenderingContext2D, config: AnimationConfig, w: number, h: number, bubbles: Bubble[]) {
  if (!bubbles) return;
  const { opacity, speed } = config;
  for (const b of bubbles) {
    b.y += b.vy * speed;
    b.wobblePhase += 0.02;
    b.x += Math.sin(b.wobblePhase) * 0.5;

    if (b.y + b.size < 0) {
      b.y = h + b.size;
      b.x = Math.random() * w;
    }

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(b.color, b.alpha * opacity * 0.5);
    ctx.fill();

    // Rim highlight
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(b.color, b.alpha * opacity);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawFireflies(ctx: CanvasRenderingContext2D, config: AnimationConfig, w: number, h: number, fireflies: Firefly[]) {
  if (!fireflies) return;
  const { opacity, speed } = config;
  for (const f of fireflies) {
    f.pulsePhase += 0.03 * speed;
    const pulse = (Math.sin(f.pulsePhase) + 1) * 0.5;
    f.alpha = pulse;

    // Wander toward target
    f.x += (f.targetX - f.x) * 0.005 * f.speed * speed;
    f.y += (f.targetY - f.y) * 0.005 * f.speed * speed;

    if (Math.abs(f.x - f.targetX) < 5 && Math.abs(f.y - f.targetY) < 5) {
      f.targetX = Math.random() * w;
      f.targetY = Math.random() * h;
    }

    const glowAlpha = f.alpha * opacity;

    // Outer glow
    const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 6);
    grad.addColorStop(0, hexToRgba(f.color, glowAlpha * 0.6));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(f.x - f.size * 6, f.y - f.size * 6, f.size * 12, f.size * 12);

    // Core
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(f.color, glowAlpha);
    ctx.fill();
  }
}

function drawRainEffect(ctx: CanvasRenderingContext2D, config: AnimationConfig, w: number, h: number, drops: RainDrop[]) {
  if (!drops) return;
  const { opacity, speed } = config;
  for (const d of drops) {
    d.y += d.speed * speed;
    if (d.y > h) {
      d.y = -d.length;
      d.x = Math.random() * w;
    }
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x, d.y + d.length);
    ctx.strokeStyle = hexToRgba(d.color, d.alpha * opacity);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawGeometric(ctx: CanvasRenderingContext2D, config: AnimationConfig, w: number, h: number, shapes: GeoShape[]) {
  if (!shapes) return;
  const { opacity, speed } = config;
  for (const s of shapes) {
    s.rotation += s.rotSpeed * speed;
    s.x += s.vx * speed;
    s.y += s.vy * speed;
    if (s.x < -50) s.x = w + 50;
    if (s.x > w + 50) s.x = -50;
    if (s.y < -50) s.y = h + 50;
    if (s.y > h + 50) s.y = -50;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.beginPath();
    for (let i = 0; i < s.sides; i++) {
      const angle = (i * Math.PI * 2) / s.sides - Math.PI / 2;
      const px = Math.cos(angle) * s.size;
      const py = Math.sin(angle) * s.size;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = hexToRgba(s.color, s.alpha * opacity);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

function drawRippleEffect(ctx: CanvasRenderingContext2D, config: AnimationConfig, w: number, h: number, ripples: Ripple[]) {
  if (!ripples) return;
  const { opacity, speed } = config;
  for (const r of ripples) {
    r.radius += r.speed * speed;
    if (r.radius > r.maxRadius) {
      r.radius = 0;
      r.x = Math.random() * w;
      r.y = Math.random() * h;
    }
    const progress = r.radius / r.maxRadius;
    const alpha = (1 - progress) * r.alpha * opacity;

    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(r.color, alpha);
    ctx.lineWidth = 2 * (1 - progress);
    ctx.stroke();
  }
}

// ─── Reduced-motion static frame ─────────────────────────────
function drawStaticFrame(
  ctx: CanvasRenderingContext2D,
  config: AnimationConfig,
  w: number,
  h: number,
  state: any
) {
  const { colors, opacity } = config;
  // Just draw soft gradient blobs as a static representation
  for (let i = 0; i < colors.length; i++) {
    const cx = w * (0.25 + 0.25 * i);
    const cy = h * 0.5;
    const r = Math.max(w, h) * 0.35;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, hexToRgba(colors[i], opacity * 0.5));
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

export default AltBackgroundRenderer;
