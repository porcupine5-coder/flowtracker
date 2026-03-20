// Background animation configuration registry
// Each color scheme gets a unique alternative animation type with tailored parameters

export type AnimationType =
  | "aurora"
  | "waves"
  | "particles"
  | "bubbles"
  | "fireflies"
  | "gradient"
  | "ripples"
  | "geometric"
  | "rain"
  | "nebula";

export interface AnimationConfig {
  type: AnimationType;
  colors: string[];
  speed: number;       // 0.1 – 2.0  (multiplier)
  count: number;       // number of elements / layers
  scale: number;       // size multiplier
  opacity: number;     // base opacity 0–1
}

// Helper to hex→rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export { hexToRgba };

// ─── Dark themes ─────────────────────────────────────────────
const darkAnimations: Record<string, AnimationConfig> = {
  midnight: {
    type: "aurora",
    colors: ["#6c8eff", "#a78bfa", "#f472b6"],
    speed: 0.4,
    count: 4,
    scale: 1.2,
    opacity: 0.35,
  },
  obsidian: {
    type: "particles",
    colors: ["#00d4aa", "#00a3cc", "#ff6b9d"],
    speed: 0.5,
    count: 60,
    scale: 1.0,
    opacity: 0.6,
  },
  slate: {
    type: "ripples",
    colors: ["#38bdf8", "#818cf8", "#fb923c"],
    speed: 0.3,
    count: 5,
    scale: 1.5,
    opacity: 0.2,
  },
  carbon: {
    type: "nebula",
    colors: ["#bb86fc", "#03dac6", "#cf6679"],
    speed: 0.25,
    count: 3,
    scale: 1.8,
    opacity: 0.25,
  },
  ocean: {
    type: "waves",
    colors: ["#4fc3f7", "#29b6f6", "#ffa726"],
    speed: 0.35,
    count: 4,
    scale: 1.0,
    opacity: 0.3,
  },
  charcoal: {
    type: "geometric",
    colors: ["#0a84ff", "#5e5ce6", "#ff375f"],
    speed: 0.3,
    count: 12,
    scale: 1.0,
    opacity: 0.15,
  },
  graphite: {
    type: "bubbles",
    colors: ["#a855f7", "#ec4899", "#14b8a6"],
    speed: 0.4,
    count: 25,
    scale: 1.0,
    opacity: 0.4,
  },
  void: {
    type: "rain",
    colors: ["#58a6ff", "#79c0ff", "#f78166"],
    speed: 0.6,
    count: 80,
    scale: 1.0,
    opacity: 0.25,
  },
  twilight: {
    type: "gradient",
    colors: ["#9d7cd8", "#7aa2f7", "#ff9e64"],
    speed: 0.2,
    count: 3,
    scale: 1.0,
    opacity: 0.4,
  },
  onyx: {
    type: "fireflies",
    colors: ["#00ff9f", "#00e0ff", "#ff0080"],
    speed: 0.5,
    count: 40,
    scale: 1.0,
    opacity: 0.7,
  },
};

// ─── Light themes ────────────────────────────────────────────
const lightAnimations: Record<string, AnimationConfig> = {
  warmLinen: {
    type: "gradient",
    colors: ["#c2410c", "#ea580c", "#0369a1"],
    speed: 0.2,
    count: 3,
    scale: 1.0,
    opacity: 0.12,
  },
  rosePetal: {
    type: "bubbles",
    colors: ["#be123c", "#e11d48", "#6d28d9"],
    speed: 0.35,
    count: 20,
    scale: 1.0,
    opacity: 0.18,
  },
  springMeadow: {
    type: "fireflies",
    colors: ["#15803d", "#16a34a", "#b45309"],
    speed: 0.4,
    count: 30,
    scale: 1.0,
    opacity: 0.3,
  },
  lavenderMist: {
    type: "aurora",
    colors: ["#6d28d9", "#7c3aed", "#047857"],
    speed: 0.3,
    count: 3,
    scale: 1.0,
    opacity: 0.15,
  },
  arcticBreeze: {
    type: "waves",
    colors: ["#0369a1", "#0284c7", "#be123c"],
    speed: 0.3,
    count: 4,
    scale: 1.0,
    opacity: 0.15,
  },
  sunsetGlow: {
    type: "gradient",
    colors: ["#b91c1c", "#dc2626", "#1d4ed8"],
    speed: 0.25,
    count: 3,
    scale: 1.0,
    opacity: 0.12,
  },
  goldenSand: {
    type: "particles",
    colors: ["#b45309", "#d97706", "#4338ca"],
    speed: 0.4,
    count: 40,
    scale: 0.8,
    opacity: 0.25,
  },
  cloudMinimal: {
    type: "geometric",
    colors: ["#1d4ed8", "#2563eb", "#a21caf"],
    speed: 0.2,
    count: 8,
    scale: 1.2,
    opacity: 0.08,
  },
  slateClean: {
    type: "ripples",
    colors: ["#334155", "#475569", "#0e7490"],
    speed: 0.25,
    count: 4,
    scale: 1.2,
    opacity: 0.08,
  },
  mintFresh: {
    type: "rain",
    colors: ["#0f766e", "#0d9488", "#b91c1c"],
    speed: 0.5,
    count: 50,
    scale: 0.8,
    opacity: 0.15,
  },
};

export function getAnimationConfig(
  themeName: string,
  isDark: boolean
): AnimationConfig {
  const map = isDark ? darkAnimations : lightAnimations;
  // fallback if theme name not found
  const fallbackKey = isDark ? "twilight" : "warmLinen";
  return map[themeName] || map[fallbackKey];
}
