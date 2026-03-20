import { createContext } from "react";
import { CyclePhase } from "../lib/cycle";

export interface ThemeContextType {
  isDarkMode: boolean;
  phase: CyclePhase | null;
  themeName: string;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
