import React, { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { applyTheme } from "../lib/theme";
import { ThemeContext } from "./ThemeContext";
import { getCurrentPhase } from "../lib/cycle";

export function ThemeProvider({ children, darkMode }: { children: React.ReactNode; darkMode: boolean }) {
  const settings = useQuery(api.cycles.getUserSettings);
  const themeName = (settings as any)?.themeName;

  const currentPhase = useMemo(() => {
    if (!settings?.lastPeriodStart) return null;
    return getCurrentPhase({
      lastPeriodStart: settings.lastPeriodStart,
      averageCycleLength: settings.averageCycleLength,
      averagePeriodLength: settings.averagePeriodLength,
    });
  }, [settings]);

  useEffect(() => {
    applyTheme(darkMode, themeName);
  }, [darkMode, settings, themeName]);

  const value = useMemo(() => ({
    isDarkMode: darkMode,
    phase: currentPhase,
  }), [darkMode, currentPhase]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-provider-container`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
