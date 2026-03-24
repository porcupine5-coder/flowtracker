// Background animation configuration registry
// Each color scheme gets a unique alternative animation type with tailored parameters

export type AnimationType =
  | "beams"
  | "circles"
  | "constellation"
  | "meteors"
  | "rain"
  | "slate_sky"
  | "shooting_stars"
  | "snow"
  | "sparkles"
  | "starfield"
  | "underwater";

export interface AnimationConfig {
  type: AnimationType;
  colors: string[];
  speed: number; // 0.1 – 2.0  (multiplier)
  count: number; // number of elements / layers
  scale: number; // size multiplier
  opacity: number; // base opacity 0–1
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
    type: "starfield",
    colors: ["#6C8CFF", "#5A78E6", "#E35DA1"],
    speed: 0.4,
    count: 400,
    scale: 1.2,
    opacity: 0.35,
  },
  obsidian: {
    type: "meteors",
    colors: ["#14C9B8", "#10B3A4", "#F06292"],
    speed: 0.5,
    count: 20,
    scale: 1.0,
    opacity: 0.6,
  },
  slate: {
    type: "rain",
    colors: ["#38BDF8", "#2DA8E0", "#FB923C"],
    speed: 0.3,
    count: 100,
    scale: 1.5,
    opacity: 0.2,
  },
  carbon: {
    type: "beams",
    colors: ["#A78BFA", "#8F74E6", "#FB7185"],
    speed: 0.25,
    count: 3,
    scale: 1.8,
    opacity: 0.25,
  },
  ocean: {
    type: "underwater",
    colors: ["#4CC9F0", "#38B6DB", "#FFA62B"],
    speed: 0.35,
    count: 4,
    scale: 1.0,
    opacity: 0.3,
  },
  charcoal: {
    type: "circles",
    colors: ["#1E90FF", "#187FE0", "#FF3D5A"],
    speed: 0.3,
    count: 12,
    scale: 1.0,
    opacity: 0.15,
  },
  graphite: {
    type: "sparkles",
    colors: ["#9D4EDD", "#883CC9", "#2EC4B6"],
    speed: 0.4,
    count: 120,
    scale: 1.0,
    opacity: 0.4,
  },
  void: {
    type: "constellation",
    colors: ["#60A5FA", "#4C90E6", "#FB8C00"],
    speed: 0.6,
    count: 80,
    scale: 1.0,
    opacity: 0.25,
  },
  twilight: {
    type: "snow",
    colors: ["#8B7CF6", "#7768DE", "#F4A261"],
    speed: 0.2,
    count: 150,
    scale: 1.0,
    opacity: 0.4,
  },
  onyx: {
    type: "slate_sky",
    colors: ["#00E5A8", "#00CC95", "#FF006E", "#0E0E10"],
    speed: 0.45,
    count: 10,
    scale: 1.0,
    opacity: 0.35,
  },
};

// ─── Light themes ────────────────────────────────────────────
const lightAnimations: Record<string, AnimationConfig> = {
  warmLinen: {
    type: "snow",
    colors: ["#E07B3A", "#CC6A2F", "#2563A8"],
    speed: 0.2,
    count: 150,
    scale: 1.0,
    opacity: 0.12,
  },
  rosePetal: {
    type: "circles",
    colors: ["#C8294A", "#B0213F", "#7B5EA7"],
    speed: 0.35,
    count: 12,
    scale: 1.0,
    opacity: 0.18,
  },
  springMeadow: {
    type: "sparkles",
    colors: ["#4CAF72", "#3F9B62", "#A0632A"],
    speed: 0.4,
    count: 120,
    scale: 1.0,
    opacity: 0.3,
  },
  lavenderMist: {
    type: "starfield",
    colors: ["#9B6FBF", "#8A5DAF", "#2D6A4F"],
    speed: 0.3,
    count: 200,
    scale: 1.0,
    opacity: 0.15,
  },
  arcticBreeze: {
    type: "underwater",
    colors: ["#38A4D0", "#2F92BC", "#B8294A"],
    speed: 0.3,
    count: 4,
    scale: 1.0,
    opacity: 0.15,
  },
  sunsetGlow: {
    type: "meteors",
    colors: ["#E86A3A", "#D65A2B", "#2C5FA8"],
    speed: 0.25,
    count: 20,
    scale: 1.0,
    opacity: 0.12,
  },
  goldenSand: {
    type: "constellation",
    colors: ["#E0A830", "#CC9527", "#5B3FA8"],
    speed: 0.4,
    count: 60,
    scale: 0.8,
    opacity: 0.25,
  },
  latteBrown: {
    type: "beams",
    colors: ["#C8A472", "#A67C52", "#C97D72"],
    speed: 0.2,
    count: 3,
    scale: 1.2,
    opacity: 0.12,
  },
  slateClean: {
    type: "slate_sky",
    colors: ["#7EC8C8", "#6BB6B6", "#5B8FA8", "#F4F7F9"],
    speed: 0.3,
    count: 12,
    scale: 1.0,
    opacity: 0.2,
  },
  mintFresh: {
    type: "rain",
    colors: ["#0f766e", "#0d9488", "#b91c1c"],
    speed: 0.5,
    count: 100,
    scale: 0.8,
    opacity: 0.15,
  },
};

export function getAnimationConfig(
  themeName: string,
  isDark: boolean,
): AnimationConfig {
  const map = isDark ? darkAnimations : lightAnimations;
  // fallback if theme name not found
  const fallbackKey = isDark ? "twilight" : "warmLinen";
  return map[themeName] || map[fallbackKey];
}
