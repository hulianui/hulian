"use client";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { cn } from "../lib/cn";
import { useTheme } from "../theme/use-theme";
import type { AnimatedThemeTogglerProps } from "./animated-theme-toggler.types";

// 吸取自 magicui.design Animated Theme Toggler：切主题时用 View Transitions 从按钮处做圆形揭示。
// 瑚琏化：复用瑚琏 ThemeProvider 的 toggle()（单一真源）；不支持 View Transitions 的环境直接 toggle 降级；
// flushSync 让 toggle 在 startViewTransition 回调内同步生效（见 [[view-transitions-api-abort-skipped-not-react-transition]]）。
type DocVT = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

export function AnimatedThemeToggler({
  duration = 500,
  className,
  "aria-label": ariaLabel,
}: AnimatedThemeTogglerProps) {
  const { theme, toggle } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);

  const onClick = async () => {
    const doc = document as DocVT;
    if (!ref.current || typeof doc.startViewTransition !== "function") {
      toggle();
      return;
    }
    await doc
      .startViewTransition(() => {
        flushSync(() => toggle());
      })
      .ready;

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxR = Math.hypot(Math.max(left, window.innerWidth - left), Math.max(top, window.innerHeight - top));
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxR}px at ${x}px ${y}px)`] },
      { duration, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
    );
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? (theme === "dark" ? "切换到亮色" : "切换到暗色")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[min(var(--radius),0.5rem)] border border-border bg-surface text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
