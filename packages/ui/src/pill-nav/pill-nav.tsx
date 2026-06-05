import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { PillNavProps } from "./pill-nav.types";

// 吸取自 React Bits PillNav：胶囊导航，悬停时一枚圆从胶囊底部涨满、文案上滑翻转为反相色，激活项底部点亮指示圆点。
// 瑚琏化：去 gsap / react-router 依赖——圆涨满与文案翻转改纯 CSS group-hover 过渡（无需 JS 测量 getBoundingClientRect，RSC 安全）；
// 配色全走 token（bg-surface / bg-primary / text-primary-foreground），首次入场用 hulian-pill-nav-* 关键帧并 motion-reduce 停；DOM 两态一致。
export function PillNav({
  items,
  activeHref,
  logo,
  logoHref,
  logoAriaLabel = "Home",
  initialLoadAnimation = true,
  className,
  style,
  ...props
}: PillNavProps) {
  const resolvedLogoHref = logoHref ?? items[0]?.href ?? "#";
  // 入场动画仅在开启时挂关键帧；reduced-motion 由内联 motion-reduce 工具类兜底（DOM 不变）。
  const enterLogo = initialLoadAnimation
    ? "[animation:hulian-pill-nav-pop_0.6s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:[animation:none]"
    : "";
  const enterItems = initialLoadAnimation
    ? "origin-left [animation:hulian-pill-nav-grow_0.6s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:[animation:none]"
    : "";

  return (
    <nav
      {...props}
      aria-label="Primary"
      style={style as CSSProperties}
      className={cn("flex w-max items-center gap-1.5", className)}
    >
      {logo != null && (
        <a
          href={resolvedLogoHref}
          aria-label={logoAriaLabel}
          className={cn(
            "group/logo grid size-[42px] place-items-center overflow-hidden rounded-full",
            "bg-surface text-foreground shadow-sm ring-1 ring-border",
            enterLogo,
          )}
        >
          <span className="inline-flex size-full items-center justify-center p-2 transition-transform duration-300 ease-out group-hover/logo:rotate-[360deg] motion-reduce:transition-none motion-reduce:group-hover/logo:rotate-0 [&_img]:size-full [&_img]:object-cover [&_svg]:size-full">
            {logo}
          </span>
        </a>
      )}

      <ul
        role="menubar"
        className={cn(
          "flex h-[42px] items-stretch gap-[3px] rounded-full bg-surface p-[3px] shadow-sm ring-1 ring-border",
          enterItems,
        )}
      >
        {items.map((item, i) => {
          const isActive = activeHref != null && activeHref === item.href;
          return (
            <li key={item.href || `pill-${i}`} role="none" className="flex">
              <a
                role="menuitem"
                href={item.href}
                aria-label={item.ariaLabel || item.label}
                data-active={isActive ? "" : undefined}
                className={cn(
                  "group/pill relative isolate inline-flex items-center justify-center overflow-hidden rounded-full px-[18px]",
                  "text-sm font-semibold uppercase tracking-[0.2px] whitespace-nowrap",
                  "transition-colors duration-200 ease-out",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-foreground hover:text-primary-foreground",
                )}
              >
                {/* 悬停涨满的圆：锚在胶囊底部中线，scale 0→1（纯 CSS 过渡，替代 gsap 圆几何） */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute left-1/2 bottom-0 z-0 aspect-square w-[140%] -translate-x-1/2 translate-y-1/4 rounded-full bg-primary",
                    "origin-bottom scale-0 transition-transform duration-300 ease-out group-hover/pill:scale-100",
                    "motion-reduce:transition-none",
                    isActive && "scale-100",
                  )}
                />
                {/* 文案双层堆叠：底层常态、上层反相，悬停时整体上滑互换（CSS transform） */}
                <span className="relative z-10 grid leading-none">
                  <span
                    className={cn(
                      "col-start-1 row-start-1 transition-transform duration-300 ease-out group-hover/pill:-translate-y-[200%] motion-reduce:transition-none",
                      isActive && "-translate-y-[200%]",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "col-start-1 row-start-1 translate-y-[200%] text-primary-foreground transition-transform duration-300 ease-out group-hover/pill:translate-y-0 motion-reduce:transition-none",
                      isActive && "translate-y-0",
                    )}
                  >
                    {item.label}
                  </span>
                </span>
                {/* 激活指示圆点 */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-[6px] left-1/2 size-[6px] -translate-x-1/2 rounded-full bg-primary"
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
