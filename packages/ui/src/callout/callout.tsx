import { cn } from "../lib/cn";
import type { CalloutProps, CalloutTone } from "./callout.types";

// 左 accent 竖边 + 极浅 tone 底；标题/图标着 tone 色，正文保持 foreground。
const toneClass: Record<CalloutTone, { wrap: string; label: string }> = {
  tip: { wrap: "border-primary bg-primary/[0.07]", label: "text-primary" },
  info: { wrap: "border-primary bg-primary/[0.07]", label: "text-primary" },
  warning: { wrap: "border-warning bg-warning/[0.07]", label: "text-warning" },
  success: { wrap: "border-success bg-success/[0.07]", label: "text-success" },
  danger: { wrap: "border-danger bg-danger/[0.07]", label: "text-danger" },
};

/**
 * 文章 / 文档用提示框（admonition）。
 * 区别于 Alert（通知横幅，整块染 tone 色）：Callout 只让标题/图标着 tone 色、正文保持 foreground
 * 可读，专为长文内联提示「坑 / 正解 / Tip」。纯皮肤，只消费语义 token（含 success/warning/danger）。
 */
export function Callout({ tone = "tip", icon, title, children, className }: CalloutProps) {
  const t = toneClass[tone];
  return (
    <div className={cn("my-5 rounded-r-lg border-l-[3px] py-3 pl-4 pr-4", t.wrap, className)}>
      {(icon != null || title != null) && (
        <div className={cn("mb-1 flex items-center gap-2 text-sm font-semibold", t.label)}>
          {icon != null && <span aria-hidden>{icon}</span>}
          {title}
        </div>
      )}
      <div className="text-[0.95em] leading-relaxed text-foreground/90 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}
