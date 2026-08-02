"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { useComponentLocale, zhCN } from "../config/locale";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { BubbleMenuItem, BubbleMenuProps } from "./bubble-menu.types";

// 吸取自 React Bits BubbleMenu：logo 气泡 + 汉堡切换钮，点开后整屏铺一组错落旋转的胶囊导航，
// 每个胶囊带 back.out 弹性 scale 入场 + 标签上滑淡入，按序错峰。
// 瑚琏化：去 gsap 改 motion（m + LazyMotionProvider 减包）；gsap.timeline stagger → transition.delay；
// back.out(1.5) 弹性 → spring 近似；颜色全走 token（bg-surface/text-foreground/border-border，悬停反色默认 chart token）；
// reduced-motion 下保留全部 DOM、仅去入场动画（避免 reveal 不可见坑）。
export function BubbleMenu({
  logo,
  onMenuClick,
  className,
  style,
  menuAriaLabel,
  useFixedPosition = false,
  items,
  animationDuration = 0.5,
  staggerDelay = 0.12,
}: BubbleMenuProps) {
  const locale = useComponentLocale().bubbleMenu ?? zhCN.components!.bubbleMenu!;
  const [isOpen, setIsOpen] = useState(false);
  const reduce = useReducedMotion();

  const defaultItems: BubbleMenuItem[] = [
    { label: locale.home, href: "#", ariaLabel: locale.home, rotation: -8, hoverStyles: { bgColor: "var(--color-chart-1)", textColor: "var(--color-primary-foreground)" } },
    { label: locale.about, href: "#", ariaLabel: locale.about, rotation: 8, hoverStyles: { bgColor: "var(--color-chart-2)", textColor: "var(--color-primary-foreground)" } },
    { label: locale.work, href: "#", ariaLabel: locale.work, rotation: 8, hoverStyles: { bgColor: "var(--color-chart-3)", textColor: "var(--color-primary-foreground)" } },
    { label: locale.blog, href: "#", ariaLabel: locale.blog, rotation: 8, hoverStyles: { bgColor: "var(--color-chart-4)", textColor: "var(--color-primary-foreground)" } },
    { label: locale.contact, href: "#", ariaLabel: locale.contact, rotation: -8, hoverStyles: { bgColor: "var(--color-chart-5)", textColor: "var(--color-primary-foreground)" } },
  ];
  const menuItems = items?.length ? items : defaultItems;
  const position = useFixedPosition ? "fixed" : "absolute";

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    onMenuClick?.(next);
  };

  const bubbleClass =
    "inline-flex items-center justify-center rounded-full bg-surface text-foreground shadow-lg pointer-events-auto";

  return (
    <LazyMotionProvider>
      <nav
        className={cn(
          position,
          "inset-x-0 top-8 z-[99] flex items-center justify-between gap-4 px-8",
          "pointer-events-none",
          className,
        )}
        style={style}
        aria-label={locale.navigation}
      >
        {/* logo 气泡 */}
        <div
          className={cn(bubbleClass, "h-12 w-auto min-h-12 gap-2 rounded-full px-4 md:h-14")}
          aria-label="Logo"
        >
          <span className="inline-flex h-full w-[120px] items-center justify-center">
            {typeof logo === "string" ? (
              <img src={logo} alt="Logo" className="block max-h-[60%] max-w-full object-contain" />
            ) : (
              logo
            )}
          </span>
        </div>

        {/* 汉堡切换钮 */}
        <button
          type="button"
          className={cn(bubbleClass, "h-12 w-12 cursor-pointer flex-col p-0 md:h-14 md:w-14")}
          onClick={handleToggle}
          aria-label={menuAriaLabel ?? locale.toggle}
          aria-pressed={isOpen}
          aria-expanded={isOpen}
        >
          <span
            className={cn(
              "block h-0.5 w-[26px] rounded-full bg-foreground transition-transform duration-300 ease-out",
              isOpen && "translate-y-[5px] rotate-45",
            )}
          />
          <span
            className={cn(
              "mt-1.5 block h-0.5 w-[26px] rounded-full bg-foreground transition-transform duration-300 ease-out",
              isOpen && "-translate-y-[5px] -rotate-45",
            )}
          />
        </button>
      </nav>

      {/* 全屏胶囊导航层 */}
      <AnimatePresence>
        {isOpen && (
          <div
            className={cn(
              position,
              "inset-0 z-[98] flex items-center justify-center pointer-events-none",
              "max-[899px]:items-start max-[899px]:pt-32",
            )}
            role="presentation"
          >
            <ul
              className="m-0 flex w-full max-w-[1600px] list-none flex-wrap justify-stretch gap-y-1 px-6 pointer-events-auto max-[899px]:gap-y-4"
              role="menu"
              aria-label={locale.menuLink}
            >
              {menuItems.map((item, idx) => {
                const rotation = item.rotation ?? 0;
                const enter = reduce
                  ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
                  : {
                      initial: { scale: 0, opacity: 0 },
                      animate: { scale: 1, opacity: 1 },
                      exit: { scale: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" as const } },
                      transition: {
                        type: "spring" as const,
                        stiffness: 320,
                        damping: 18,
                        duration: animationDuration,
                        delay: idx * staggerDelay,
                      },
                    };
                return (
                  <li
                    key={idx}
                    role="none"
                    className="flex basis-1/3 items-stretch justify-center box-border max-[899px]:basis-full"
                  >
                    <m.a
                      role="menuitem"
                      href={item.href}
                      aria-label={item.ariaLabel || item.label}
                      className={cn(
                        "group/pill relative flex w-full items-center justify-center overflow-hidden",
                        "rounded-full bg-surface text-foreground shadow-md",
                        "min-h-[80px] md:min-h-[120px]",
                        "text-2xl md:text-5xl font-normal whitespace-nowrap no-underline",
                        "transition-colors duration-300 ease-out",
                        "hover:[background:var(--hover-bg)] hover:[color:var(--hover-color)]",
                      )}
                      style={
                        {
                          rotate: `${rotation}deg`,
                          "--hover-bg": item.hoverStyles?.bgColor || "var(--color-muted)",
                          "--hover-color": item.hoverStyles?.textColor || "var(--color-foreground)",
                        } as CSSProperties
                      }
                      {...enter}
                    >
                      <m.span
                        className="inline-block leading-tight"
                        initial={reduce ? false : { y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { duration: animationDuration, ease: "easeOut", delay: idx * staggerDelay + 0.05 }
                        }
                      >
                        {item.label}
                      </m.span>
                    </m.a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </AnimatePresence>
    </LazyMotionProvider>
  );
}
