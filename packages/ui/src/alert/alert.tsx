"use client";
import { memo } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { AlertProps } from "./alert.types";
import { useComponentLocale } from "../config/locale-context";

// 纯皮肤（照 badge.tsx）：base 设布局；tone/variant 留空由 compound 填「底色/边框 + accent 文字色」。
// accent 作用于 icon + title；description 显式 text-muted 覆盖（正文恒中性可读，不被 tone 染色）。
// 语气：neutral/brand/success/warning/danger，各自 soft(浅底) 与 outline(描边) 两变体。
// `info` 是 `brand` 的历史别名（本组件早于全库 tone 取值统一，先有 info 后有 brand），
// 两者同配方、可互换；新代码请用 brand，与 Tag / Button / Badge 保持同一套取值。
export const alertVariants = cva("flex w-full items-start gap-3 rounded-[var(--radius)] p-4", {
  variants: {
    variant: { soft: "", outline: "border" },
    tone: { neutral: "", brand: "", info: "", success: "", warning: "", danger: "" },
  },
  compoundVariants: [
    { variant: "soft", tone: "neutral", class: "bg-surface-hover text-foreground" },
    { variant: "soft", tone: "brand", class: "bg-primary/12 text-primary" },
    { variant: "soft", tone: "info", class: "bg-primary/12 text-primary" },
    { variant: "soft", tone: "success", class: "bg-success/12 text-success" },
    { variant: "soft", tone: "warning", class: "bg-warning/12 text-warning" },
    { variant: "soft", tone: "danger", class: "bg-danger/12 text-danger" },
    { variant: "outline", tone: "neutral", class: "border-border text-foreground" },
    { variant: "outline", tone: "brand", class: "border-primary text-primary" },
    { variant: "outline", tone: "info", class: "border-primary text-primary" },
    { variant: "outline", tone: "success", class: "border-success text-success" },
    { variant: "outline", tone: "warning", class: "border-warning text-warning" },
    { variant: "outline", tone: "danger", class: "border-danger text-danger" },
  ],
  defaultVariants: { variant: "soft", tone: "info" },
});

// 内联极简 X（关闭是组件结构性能力，非装饰图标 → 不绑图标库；与 showcase 内联 svg 同源）。
const CloseIcon = (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

function AlertImpl({
  className,
  variant,
  tone,
  icon,
  title,
  role,
  action,
  onClose,
  closeLabel,
  children,
  ...props
}: AlertProps) {
  const alertLocale = useComponentLocale().alert ?? { close: "关闭" };
  const resolvedCloseLabel = closeLabel ?? alertLocale.close;
  // role 由 tone 派生：danger=需打断的错误→assertive(alert)；其余→polite(status)。props.role 可覆盖。
  const resolvedRole = role ?? (tone === "danger" ? "alert" : "status");

  return (
    <div role={resolvedRole} className={cn(alertVariants({ variant, tone }), className)} {...props}>
      {icon != null && <span className="mt-0.5 shrink-0 [&>svg]:size-5">{icon}</span>}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title != null && <div className="text-sm font-medium">{title}</div>}
        {children != null && <div className="text-sm text-muted">{children}</div>}
      </div>
      {(action != null || onClose) && (
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={resolvedCloseLabel}
              className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ring)] [&>svg]:size-4"
            >
              {CloseIcon}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
AlertImpl.displayName = "Alert";

// 通知/校验提示常年挂在高频更新的表单页与看板里，props 却是稳定原语（tone/variant/title/文案）。
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
// 注：memo 不拦 context，所以切换语言时 useComponentLocale 仍会正常触发重渲染。
export const Alert = memo(AlertImpl);
Alert.displayName = "Alert";
