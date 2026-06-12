"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  variant?: "footer" | "floating" | "fixed";
}

export function ThemeToggle({ variant = "fixed" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleOnly = (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full p-1 transition hover:opacity-90"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb" />
      </div>
    </button>
  );

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="theme-floating-btn fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition hover:scale-105"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          color: "var(--text)",
        }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Light mode" : "Dark mode"}
      >
        <span className="text-lg leading-none">{isDark ? "☀️" : "🌙"}</span>
      </button>
    );
  }

  if (variant === "footer") {
    return (
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] text-white/40">Appearance</span>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-2 py-1 transition hover:bg-white/12"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className={`text-xs transition-opacity ${!isDark ? "opacity-100" : "opacity-40"}`}>
            ☀️
          </span>
          <div className="theme-toggle-track">
            <div className="theme-toggle-thumb" />
          </div>
          <span className={`text-xs transition-opacity ${isDark ? "opacity-100" : "opacity-40"}`}>
            🌙
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="theme-fixed-toggle fixed left-4 z-40 sm:left-6">
      {toggleOnly}
    </div>
  );
}
