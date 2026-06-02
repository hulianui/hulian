"use client";
import { useTheme } from "@hulian/ui";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="切换明暗主题"
      className="inline-flex size-9 items-center justify-center rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
