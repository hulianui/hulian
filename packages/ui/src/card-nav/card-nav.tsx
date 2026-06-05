"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { CardNavProps } from "./card-nav.types";

// 吸取自 React Bits CardNav：顶栏汉堡按钮点击后，整条胶囊导航高度展开，内部卡片逐张错峰 y 位移淡入浮现。
// 瑚琏化：去 gsap → motion(m + LazyMotionProvider) 重写高度展开 + stagger 时间线；汉堡线/卡片改吃瑚琏 token（bg-surface/text-foreground/bg-primary，替原 hex），
// 卡片色可选覆盖；"use client" + reduced-motion 下走无动效直显（DOM 两态一致，避 reveal 不可见坑）；受控/非受控开合。
export function CardNav({
  brand,
  items,
  ctaLabel = "Get Started",
  onCtaClick,
  duration = 0.4,
  open: openProp,
  onOpenChange,
  className,
  style,
  ...props
}: CardNavProps & React.HTMLAttributes<HTMLDivElement>) {
  const reduce = useReducedMotion();
  const [openState, setOpenState] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openState;

  const cards = (items ?? []).slice(0, 3);
  const dur = reduce ? 0 : duration;

  const toggle = () => {
    const next = !open;
    if (!isControlled) setOpenState(next);
    onOpenChange?.(next);
  };

  return (
    <div
      {...props}
      style={style}
      className={cn("relative mx-auto w-full max-w-3xl", className)}
    >
      <LazyMotionProvider>
        <m.nav
          data-state={open ? "open" : "closed"}
          className={cn(
            "relative block overflow-hidden rounded-xl border border-border bg-surface shadow-md",
          )}
          initial={false}
          animate={{ height: open ? "auto" : 60 }}
          transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
          style={{ minHeight: 60 }}
        >
          {/* 顶栏：汉堡 / 品牌 / CTA */}
          <div className="absolute inset-x-0 top-0 z-[2] flex h-[60px] items-center justify-between pl-4 pr-2">
            <div
              role="button"
              tabIndex={0}
              aria-label={open ? "收起菜单" : "展开菜单"}
              aria-expanded={open}
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }}
              className="group flex h-full cursor-pointer flex-col items-center justify-center gap-[6px] outline-none"
            >
              <span
                className={cn(
                  "h-[2px] w-[30px] origin-center bg-foreground transition-transform duration-300 group-hover:opacity-75",
                  open && "translate-y-[4px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-[2px] w-[30px] origin-center bg-foreground transition-transform duration-300 group-hover:opacity-75",
                  open && "-translate-y-[4px] -rotate-45",
                )}
              />
            </div>

            <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center text-sm font-semibold text-foreground">
              {brand}
            </div>

            {ctaLabel ? (
              <button
                type="button"
                onClick={onCtaClick}
                className="hidden h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 sm:inline-flex"
              >
                {ctaLabel}
              </button>
            ) : null}
          </div>

          {/* 展开内容：卡片排 */}
          <div
            aria-hidden={!open}
            className={cn(
              "absolute inset-x-0 bottom-0 top-[60px] z-[1] flex flex-col items-stretch gap-2 p-2 sm:flex-row sm:items-end",
              open ? "pointer-events-auto" : "pointer-events-none",
            )}
          >
            <AnimatePresence>
              {open &&
                cards.map((card, idx) => (
                  <m.div
                    key={`${card.label}-${idx}`}
                    initial={reduce ? false : { y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduce ? undefined : { y: 50, opacity: 0 }}
                    transition={{
                      duration: dur,
                      ease: [0.16, 1, 0.3, 1],
                      delay: reduce ? 0 : 0.08 * idx,
                    }}
                    className="flex min-h-[60px] min-w-0 flex-1 select-none flex-col gap-2 rounded-lg bg-muted/30 p-4 text-foreground"
                    style={
                      {
                        ...(card.bgColor ? { backgroundColor: card.bgColor } : {}),
                        ...(card.textColor ? { color: card.textColor } : {}),
                      } as CSSProperties
                    }
                  >
                    <div className="text-xl font-medium tracking-tight">
                      {card.label}
                    </div>
                    <div className="mt-auto flex flex-col gap-0.5">
                      {card.links?.map((lnk, i) => (
                        <a
                          key={`${lnk.label}-${i}`}
                          href={lnk.href ?? "#"}
                          aria-label={lnk.ariaLabel ?? lnk.label}
                          className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-75"
                        >
                          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                          {lnk.label}
                        </a>
                      ))}
                    </div>
                  </m.div>
                ))}
            </AnimatePresence>
          </div>
        </m.nav>
      </LazyMotionProvider>
    </div>
  );
}
