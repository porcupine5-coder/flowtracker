import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export type AnimationMode = "stars" | "alt";

interface BackgroundAnimationContextType {
  animationMode: AnimationMode;
  toggleAnimation: () => void;
  reducedMotion: boolean;
}

const BackgroundAnimationContext = createContext<BackgroundAnimationContextType | undefined>(undefined);

const STORAGE_KEY = "bgAnimationMode";
const REDUCED_MOTION_KEY = "bgReducedMotion";

export function BackgroundAnimationProvider({ children }: { children: React.ReactNode }) {
  const [animationMode, setAnimationMode] = useState<AnimationMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "alt" ? "alt" : "stars";
    } catch {
      return "stars";
    }
  });

  const [reducedMotion] = useState(() => {
    try {
      return localStorage.getItem(REDUCED_MOTION_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Apply a class gate for reduced-motion behavior.
  // We do not force-disable animations from browser-level preferences, because
  // some browsers may report "reduce" unexpectedly and freeze background motion.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  const toggleAnimation = useCallback(() => {
    setAnimationMode((prev) => {
      const next = prev === "stars" ? "alt" : "stars";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ animationMode, toggleAnimation, reducedMotion }),
    [animationMode, toggleAnimation, reducedMotion]
  );

  return (
    <BackgroundAnimationContext.Provider value={value}>
      {children}
    </BackgroundAnimationContext.Provider>
  );
}

export function useBackgroundAnimation(): BackgroundAnimationContextType {
  const ctx = useContext(BackgroundAnimationContext);
  if (!ctx) throw new Error("useBackgroundAnimation must be used within BackgroundAnimationProvider");
  return ctx;
}
