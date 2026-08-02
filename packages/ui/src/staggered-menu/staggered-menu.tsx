"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { useComponentLocale, zhCN } from "../config/locale";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { StaggeredMenuProps } from "./staggered-menu.types";

// 吸取自 React Bits StaggeredMenu：触发按钮（Menu↔Close 文字滚动 + 加号旋转 225°）唤起侧滑面板，
// 多层「色层」错峰滑入做叠纸质感，主条目自下而上带旋转地依次入场，序号/社交链接尾随淡入。
// 瑚琏化：gsap 全套时间线 → motion（m + AnimatePresence + staggerChildren，必 "use client"）；
// 去依赖、去 logo 图片（改 brand 槽）；颜色全走 token（强调色默认 var(--color-primary)，色层默认 chart token）；
// reduced-motion → 去位移/旋转/错峰但保留出现/消失（DOM 两态一致，避 reveal 不可见坑）。

const SPRING = { type: "spring" as const, stiffness: 260, damping: 30 };

export function StaggeredMenu({
  position = "right",
  colors,
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  brand,
  accentColor = "var(--color-primary)",
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
  className,
  style,
  ...props
}: StaggeredMenuProps) {
  const locale = useComponentLocale().staggeredMenu ?? zhCN.components!.staggeredMenu!;
  const resolvedBrand = brand ?? locale.brand;
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // 色层取前 4 个，>=3 时丢中间一层（对齐原库的视觉密度），默认走 chart token。
  const rawLayers =
    colors && colors.length ? colors.slice(0, 4) : ["var(--color-chart-4)", "var(--color-chart-1)"];
  const layers = [...rawLayers];
  if (layers.length >= 3) layers.splice(Math.floor(layers.length / 2), 1);

  const off = position === "left" ? "-100%" : "100%";

  const close = useCallback(() => {
    setOpen((prev) => {
      if (prev) onMenuClose?.();
      return false;
    });
  }, [onMenuClose]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) onMenuOpen?.();
      else onMenuClose?.();
      return next;
    });
  }, [onMenuOpen, onMenuClose]);

  // 点击面板外关闭
  useEffect(() => {
    if (!closeOnClickAway || !open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(t) &&
        toggleRef.current &&
        !toggleRef.current.contains(t)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [closeOnClickAway, open, close]);

  const listVariants = {
    hidden: {},
    visible: { transition: reduce ? {} : { staggerChildren: 0.08, delayChildren: 0.18 } },
  };
  const itemVariants = reduce
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: "60%", rotate: 6 },
        visible: {
          opacity: 1,
          y: "0%",
          rotate: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
        },
      };

  return (
    <div
      {...props}
      data-position={position}
      data-open={open || undefined}
      style={{ "--sm-accent": accentColor, ...style } as CSSProperties}
      className={cn(
        "relative z-40 h-full w-full",
        isFixed && "fixed inset-0 h-dvh w-screen overflow-hidden",
        className,
      )}
    >
      <LazyMotionProvider>
        {/* 色层：错峰滑入（在面板背后） */}
        <AnimatePresence>
          {open &&
            layers.map((c, i) => (
              <m.div
                key={`layer-${i}`}
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-0 bottom-0 z-[5] w-[clamp(15rem,38vw,26rem)]",
                  position === "left" ? "left-0" : "right-0",
                )}
                style={{ background: c }}
                initial={reduce ? { opacity: 0 } : { x: off }}
                animate={
                  reduce ? { opacity: 1 } : { x: "0%", transition: { ...SPRING, delay: i * 0.07 } }
                }
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { x: off, transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] as const } }
                }
              />
            ))}
        </AnimatePresence>

        {/* 顶部 header：品牌 + 触发按钮 */}
        <header className="pointer-events-none absolute top-0 left-0 z-20 flex w-full items-center justify-between p-8">
          <div className="pointer-events-auto flex select-none items-center text-base font-semibold text-foreground">
            {resolvedBrand}
          </div>
          <button
            ref={toggleRef}
            type="button"
            onClick={toggle}
            aria-label={open ? locale.closeMenu : locale.openMenu}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            className={cn(
              "pointer-events-auto relative inline-flex cursor-pointer items-center gap-2 bg-transparent text-sm font-medium leading-none text-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-ring)]",
            )}
          >
            <span
              className="relative inline-block h-[1em] overflow-hidden whitespace-nowrap"
              aria-hidden
            >
              <span
                className={cn(
                  "flex flex-col leading-none transition-transform duration-300 ease-out",
                  "motion-reduce:transition-none",
                )}
                style={{ transform: open ? "translateY(-1em)" : "translateY(0)" }}
              >
                <span className="block h-[1em]">{locale.menu}</span>
                <span className="block h-[1em]">{locale.close}</span>
              </span>
            </span>
            <span
              className={cn(
                "relative inline-flex h-3.5 w-3.5 flex-none items-center justify-center transition-transform duration-500 ease-out",
                "motion-reduce:transition-none",
              )}
              style={{ transform: open ? "rotate(225deg)" : "rotate(0deg)" }}
              aria-hidden
            >
              <span className="absolute top-1/2 left-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 rounded-sm bg-current" />
              <span
                className="absolute top-1/2 left-1/2 h-0.5 w-full -translate-x-1/2 -translate-y-1/2 rounded-sm bg-current"
                style={{ transform: "translate(-50%, -50%) rotate(90deg)" }}
              />
            </span>
          </button>
        </header>

        {/* 面板本体 */}
        <AnimatePresence>
          {open && (
            <m.aside
              id="staggered-menu-panel"
              ref={panelRef}
              aria-hidden={!open}
              className={cn(
                "absolute top-0 z-10 flex h-full w-[clamp(15rem,38vw,26rem)] flex-col gap-5 overflow-y-auto bg-surface px-8 pt-24 pb-8 backdrop-blur-md",
                "border-border",
                position === "left" ? "left-0 border-r" : "right-0 border-l",
              )}
              initial={reduce ? { opacity: 0 } : { x: off }}
              animate={
                reduce
                  ? { opacity: 1 }
                  : { x: "0%", transition: { ...SPRING, delay: layers.length * 0.07 } }
              }
              exit={
                reduce
                  ? { opacity: 0 }
                  : { x: off, transition: { duration: 0.32, ease: [0.7, 0, 0.84, 0] as const } }
              }
            >
              <m.ul
                role="list"
                className="m-0 flex list-none flex-col gap-2 p-0"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {items.length ? (
                  items.map((it, idx) => {
                    const inner = (
                      <m.span
                        variants={itemVariants}
                        className="inline-block origin-bottom will-change-transform"
                      >
                        {it.label}
                      </m.span>
                    );
                    return (
                      <li key={it.label + idx} className="relative overflow-hidden leading-none">
                        {it.link ? (
                          <a
                            href={it.link}
                            aria-label={it.ariaLabel}
                            data-index={idx + 1}
                            className="group relative inline-block pr-[1.4em] text-5xl font-semibold uppercase leading-none tracking-tight text-foreground no-underline transition-colors hover:text-[var(--sm-accent)]"
                          >
                            {displayItemNumbering && (
                              <span
                                aria-hidden
                                className="absolute top-1 right-[2.8em] text-lg font-normal tracking-normal text-[var(--sm-accent)]"
                              >
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                            )}
                            {inner}
                          </a>
                        ) : (
                          <span className="relative inline-block pr-[1.4em] text-5xl font-semibold uppercase leading-none tracking-tight text-foreground">
                            {displayItemNumbering && (
                              <span
                                aria-hidden
                                className="absolute top-1 right-[2.8em] text-lg font-normal tracking-normal text-[var(--sm-accent)]"
                              >
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                            )}
                            {inner}
                          </span>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li aria-hidden className="relative overflow-hidden leading-none">
                    <span className="inline-block text-5xl font-semibold uppercase leading-none tracking-tight text-muted">
                      No items
                    </span>
                  </li>
                )}
              </m.ul>

              {displaySocials && socialItems.length > 0 && (
                <m.div
                  className="mt-auto flex flex-col gap-3 pt-8"
                  initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.4, duration: 0.5 } }}
                >
                  <h3 className="m-0 text-base font-medium text-[var(--sm-accent)]">
                    {locale.social}
                  </h3>
                  <ul className="m-0 flex list-none flex-row flex-wrap items-center gap-4 p-0">
                    {socialItems.map((s, i) => (
                      <li key={s.label + i}>
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block py-0.5 text-lg font-medium text-foreground no-underline transition-colors hover:text-[var(--sm-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ring)]"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </m.div>
              )}
            </m.aside>
          )}
        </AnimatePresence>
      </LazyMotionProvider>
    </div>
  );
}
