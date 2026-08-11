"use client";
import { cva } from "class-variance-authority";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { Marquee } from "../marquee/marquee";
import type { BannerProps } from "./banner.types";

// Banner = 横贯容器顶部的全宽公告条（站点维护/促销/版本更新）。
// 与 Alert 的区别：Alert 是页内局部块级提示（圆角卡片）；Banner 是通栏 bar，
// 默认居中、单行、可承载滚动跑马灯。与 Notification 的区别：后者是命令式四角浮层。
// 纯皮肤：照 alert.tsx 用 compoundVariants 填 tone×variant 底色/文字色。
// info 与 brand 同 Alert：0.8.0 起不再同色，info 走独立的 `--color-info`（#173）。
const bannerVariants = cva("flex w-full items-center gap-3 px-4 py-2.5 text-sm", {
  variants: {
    variant: { soft: "", solid: "" },
    tone: { neutral: "", info: "", brand: "", success: "", warning: "", danger: "" },
  },
  compoundVariants: [
    { variant: "soft", tone: "neutral", class: "bg-surface-hover text-foreground" },
    { variant: "soft", tone: "info", class: "bg-info/12 text-info" },
    { variant: "soft", tone: "brand", class: "bg-primary/12 text-primary" },
    { variant: "soft", tone: "success", class: "bg-success/12 text-success" },
    { variant: "soft", tone: "warning", class: "bg-warning/12 text-warning" },
    { variant: "soft", tone: "danger", class: "bg-danger/12 text-danger" },
    { variant: "solid", tone: "neutral", class: "bg-foreground text-bg" },
    { variant: "solid", tone: "info", class: "bg-info text-info-foreground" },
    { variant: "solid", tone: "brand", class: "bg-primary text-primary-foreground" },
    { variant: "solid", tone: "success", class: "bg-success text-success-foreground" },
    { variant: "solid", tone: "warning", class: "bg-warning text-warning-foreground" },
    { variant: "solid", tone: "danger", class: "bg-danger text-danger-foreground" },
  ],
  defaultVariants: { variant: "soft", tone: "info" },
});

export function Banner({
  tone,
  variant,
  icon,
  children,
  action,
  align = "center",
  scrollable = false,
  onClose,
  closeLabel,
  className,
}: BannerProps) {
  const copy = useComponentLocale().banner ?? { close: "关闭" };
  return (
    <div role="status" className={cn(bannerVariants({ variant, tone }), className)}>
      {icon != null && <span className="shrink-0 [&>svg]:size-4">{icon}</span>}

      {/* 文案区：scrollable 走 Marquee 单行无缝滚动；否则按 align 排布(可截断)。
          截断那档的 span 必须是 block —— truncate 里的 overflow:hidden 与
          text-overflow:ellipsis 对 inline 元素不生效，只剩 white-space:nowrap，
          文字于是既不换行又不被裁剪，长文案会把 flex 容器撑破、把 action 挤出屏幕
          （窄屏尤其明显）。 */}
      <div className={cn("min-w-0 flex-1", align === "center" && !scrollable && "text-center")}>
        {scrollable ? (
          <Marquee pauseOnHover repeat={3} duration={24}>
            <span className="px-4">{children}</span>
          </Marquee>
        ) : (
          <span className="block truncate">{children}</span>
        )}
      </div>

      {(action != null || onClose) && (
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel ?? copy.close}
              className="grid size-6 shrink-0 place-items-center rounded-full opacity-70 transition-opacity hover:bg-black/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:hover:bg-white/15"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="size-3.5"
                aria-hidden
              >
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
