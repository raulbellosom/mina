import { createContext, useContext, useState, useEffect } from "react";
import PALETTES from "../config/palettes";

const ThemeContext = createContext(null);

/**
 * Applies a palette's color shades as CSS custom properties on <html>.
 * These map to the Tailwind `primary-{shade}` utilities via @theme in index.css.
 */
function applyPalette(palette) {
  const root = document.documentElement;
  Object.entries(palette.colors).forEach(([shade, value]) => {
    root.style.setProperty(`--th-${shade}`, value);
  });
}

function pickRandom() {
  return PALETTES[Math.floor(Math.random() * PALETTES.length)].id;
}

export function ThemeProvider({ children }) {
  // ── Dark / light ──────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return false;
  });

  // ── Palette ───────────────────────────────────────
  const [paletteId, setPaletteIdState] = useState(() => {
    return localStorage.getItem("palette") || null;
  });

  // If nothing is stored, pick a random palette once per session
  const [randomId] = useState(() => {
    if (localStorage.getItem("palette")) return null;
    return pickRandom();
  });

  const effectiveId = paletteId || randomId || "blue";
  const palette = PALETTES.find((p) => p.id === effectiveId) || PALETTES[0];

  // Apply dark class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Apply palette CSS variables
  useEffect(() => {
    applyPalette(palette);
  }, [palette]);

  const setPaletteId = (id) => {
    setPaletteIdState(id);
    localStorage.setItem("palette", id);
  };

  return (
    <ThemeContext.Provider
      value={{ isDark, setIsDark, paletteId: effectiveId, setPaletteId }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
