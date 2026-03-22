export const themes = {
  light: {
    cloudMinimal: {
      bg: "#ffffff",
      surface: "#f1f5f9",
      primary: "#1d4ed8",
      secondary: "#2563eb",
      accent: "#a21caf",
      text: "#0f172a",
    },
    slateClean: {
      bg: "#f8fafc",
      surface: "#f1f5f9",
      primary: "#334155",
      secondary: "#475569",
      accent: "#0e7490",
      text: "#0f172a",
    },
    lavenderMist: {
      bg: "#f5f3ff",
      surface: "#ede9fe",
      primary: "#6d28d9",
      secondary: "#7c3aed",
      accent: "#047857",
      text: "#2e1065",
    },
    warmLinen: {
      bg: "#fff7ed",
      surface: "#ffedd5",
      primary: "#c2410c",
      secondary: "#ea580c",
      accent: "#0369a1",
      text: "#431407",
    },
    rosePetal: {
      bg: "#fff1f2",
      surface: "#ffe4e6",
      primary: "#be123c",
      secondary: "#e11d48",
      accent: "#6d28d9",
      text: "#4c0519",
    },
    springMeadow: {
      bg: "#f0fdf4",
      surface: "#dcfce7",
      primary: "#15803d",
      secondary: "#16a34a",
      accent: "#b45309",
      text: "#052e16",
    },
    arcticBreeze: {
      bg: "#f0f9ff",
      surface: "#e0f2fe",
      primary: "#0369a1",
      secondary: "#0284c7",
      accent: "#be123c",
      text: "#082f49",
    },
    sunsetGlow: {
      bg: "#fff5f5",
      surface: "#fee2e2",
      primary: "#b91c1c",
      secondary: "#dc2626",
      accent: "#1d4ed8",
      text: "#450a0a",
    },
    goldenSand: {
      bg: "#fffbeb",
      surface: "#fef3c7",
      primary: "#b45309",
      secondary: "#d97706",
      accent: "#4338ca",
      text: "#451a03",
    },
    Sagegreen: {
      bg: "#F8F9F7",
      background: "#F8F9F7",
      surface: "#EAEDE7",
      primary: "#9CAF88",
      secondary: "#7A9167",
      accent: "#5E7350",
      text: "#3A3F37",
      "primary-hover": "#7A9167",
      "primary-active": "#5E7350",
      "primary-light": "#D9E4D3",
      "primary-subtle": "#F2F5EF",
      "primary-text": "#3D4F34",
      border: "#CDD4C7",
      "text-body": "#3A3F37",
      "text-muted": "#8C9985",
      "text-heading": "#1C2019",
    },
  },
  dark: {
    midnight: {
      bg: "#0a0e27",
      surface: "#151b3d",
      primary: "#6c8eff",
      secondary: "#a78bfa",
      accent: "#f472b6",
      text: "#e2e8f0",
    },
    obsidian: {
      bg: "#0f0f0f",
      surface: "#1a1a1a",
      primary: "#00d4aa",
      secondary: "#00a3cc",
      accent: "#ff6b9d",
      text: "#f5f5f5",
    },
    slate: {
      bg: "#0f172a",
      surface: "#1e293b",
      primary: "#38bdf8",
      secondary: "#818cf8",
      accent: "#fb923c",
      text: "#f1f5f9",
    },
    carbon: {
      bg: "#121212",
      surface: "#1e1e1e",
      primary: "#bb86fc",
      secondary: "#03dac6",
      accent: "#cf6679",
      text: "#e1e1e1",
    },
    ocean: {
      bg: "#001e3c",
      surface: "#0a2744",
      primary: "#4fc3f7",
      secondary: "#29b6f6",
      accent: "#ffa726",
      text: "#eceff1",
    },
    charcoal: {
      bg: "#1c1c1e",
      surface: "#2c2c2e",
      primary: "#0a84ff",
      secondary: "#5e5ce6",
      accent: "#ff375f",
      text: "#f2f2f7",
    },
    graphite: {
      bg: "#18181b",
      surface: "#27272a",
      primary: "#a855f7",
      secondary: "#ec4899",
      accent: "#14b8a6",
      text: "#fafafa",
    },
    void: {
      bg: "#0d1117",
      surface: "#161b22",
      primary: "#58a6ff",
      secondary: "#79c0ff",
      accent: "#f78117",
      text: "#c9d1d9",
    },
    twilight: {
      bg: "#1a1625",
      surface: "#2d2438",
      primary: "#9d7cd8",
      secondary: "#7aa2f7",
      accent: "#ff9e64",
      text: "#dcd7e8",
    },
    onyx: {
      bg: "#0e0e10",
      surface: "#1c1c21",
      primary: "#00ff9f",
      secondary: "#00e0ff",
      accent: "#ff0080",
      text: "#f0f0f0",
    },
  },
};

export function applyTheme(darkMode: boolean, themeName?: string) {
  const root = document.documentElement;
  let theme;

  // Validate themeName exists in the current mode
  const modeThemes = darkMode ? themes.dark : themes.light;
  if (themeName && themeName in modeThemes) {
    theme = modeThemes[themeName as keyof typeof modeThemes];
  } else {
    // Fallback to default themes if name is invalid or not provided
    theme = darkMode ? themes.dark.twilight : themes.light.warmLinen;
  }

  if (theme) {
    const hasThemeVar = (key: string) =>
      Object.prototype.hasOwnProperty.call(theme, key);

    // Set core CSS variables used by index.css and components
    for (const [key, value] of Object.entries(theme)) {
      root.style.setProperty(`--${key}`, value);
    }

    // Generate derived colors for consistency
    // We can use the primary color with different opacities for muted/hover states if not provided
    if (!hasThemeVar("primary-hover")) {
      root.style.setProperty("--primary-hover", `${theme.primary}dd`);
    }
    if (!hasThemeVar("text-muted")) {
      root.style.setProperty("--text-muted", darkMode ? "#9d97b0" : "#a8a29e");
    }
    if (!hasThemeVar("border")) {
      root.style.setProperty("--border", darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)");
    }
    root.style.setProperty("--border-strong", darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)");
  }

  // Add/remove dark class for Tailwind and global styles
  if (darkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
