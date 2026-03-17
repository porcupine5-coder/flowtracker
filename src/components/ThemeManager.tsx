import React, { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { applyTheme } from "../lib/theme";
import { ThemeContext } from "./ThemeContext";

export function ThemeProvider({ children, darkMode }: { children: React.ReactNode; darkMode: boolean }) {
  const settings = useQuery(api.cycles.getUserSettings);
  const themeName = (settings as any)?.themeName;

  useEffect(() => {
    applyTheme(darkMode, themeName);
  }, [darkMode, settings, themeName]);

  const value = useMemo(() => ({
    isDarkMode: darkMode,
  }), [darkMode]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-provider-container`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
