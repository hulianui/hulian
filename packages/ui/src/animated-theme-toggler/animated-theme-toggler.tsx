"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "../_icons";
import { cn } from "../lib/cn";
import { isDev } from "../lib/is-dev";
import { useComponentLocale } from "../config/locale";
import { THEME_STORAGE_KEY, useThemeOptional, type Theme } from "../theme/use-theme";
import type { AnimatedThemeTogglerProps } from "./animated-theme-toggler.types";

// 吸取自 magicui.design Animated Theme Toggler：切主题时用 View Transitions 从按钮处做圆形揭示。
// 瑚琏化：复用瑚琏 ThemeProvider 的 toggle()（单一真源）；不支持 View Transitions 的环境直接 toggle 降级；
// flushSync 让 toggle 在 startViewTransition 回调内同步生效（见 [[view-transitions-api-abort-skipped-not-react-transition]]）。
type DocVT = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

/**
 * 无 ThemeProvider 时的自持降级：直接读写 `<html data-theme>` 与 ThemeProvider 同一个
 * localStorage 键，行为与挂了 Provider 时一致，只是不与其余消费 useTheme 的组件联动。
 * 此前这里用会 throw 的 useTheme，缺 Provider 即整页白屏 —— 一个装饰性开关不该有这种杀伤力。
 */
function useStandaloneTheme(enabled: boolean) {
  // 首渲必须确定性（SSR 与 hydration 一致），真实值由下方 effect 立即校正。
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (!enabled) return;
    const attr = document.documentElement.getAttribute("data-theme");
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initial: Theme =
      attr === "dark" || attr === "light"
        ? attr
        : stored === "dark" || stored === "light"
          ? stored
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    setTheme(initial);
    if (isDev) {
      console.warn(
        "[hulian] AnimatedThemeToggler 未找到 ThemeProvider，已降级为自持主题态（直接读写 <html data-theme>）。若要与其他组件联动，请在上层挂 ThemeProvider。",
      );
    }
  }, [enabled]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}

export function AnimatedThemeToggler({
  duration = 500,
  className,
  "aria-label": ariaLabel,
}: AnimatedThemeTogglerProps) {
  const ctx = useThemeOptional();
  const standalone = useStandaloneTheme(ctx == null);
  const theme = ctx?.theme ?? standalone.theme;
  const toggle = ctx?.toggle ?? standalone.toggle;
  const ref = useRef<HTMLButtonElement>(null);
  const locale = useComponentLocale().animatedThemeToggler;

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
      aria-label={ariaLabel ?? (theme === "dark" ? locale?.switchToLight ?? "切换到亮色" : locale?.switchToDark ?? "切换到暗色")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[min(var(--radius),0.5rem)] border border-border bg-surface text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
