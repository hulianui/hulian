import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { AlertProps } from "./alert.types";

// 纯皮肤（照 badge.tsx）：base 设布局；tone/variant 留空由 compound 填「底色/边框 + accent 文字色」。
// accent 作用于 icon + title；description 显式 text-muted 覆盖（正文恒中性可读，不被 tone 染色）。
export const alertVariants = cva("flex w-full items-start gap-3 rounded-[var(--radius)] p-4", {
  variants: {
    variant: { soft: "", outline: "border" },
    tone: { info: "", danger: "", neutral: "" },
  },
  compoundVariants: [
    { variant: "soft", tone: "info", class: "bg-primary/12 text-primary" },
    { variant: "soft", tone: "danger", class: "bg-danger/12 text-danger" },
    { variant: "soft", tone: "neutral", class: "bg-surface-hover text-foreground" },
    { variant: "outline", tone: "info", class: "border-primary text-primary" },
    { variant: "outline", tone: "danger", class: "border-danger text-danger" },
    { variant: "outline", tone: "neutral", class: "border-border text-foreground" },
  ],
  defaultVariants: { variant: "soft", tone: "info" },
});

export function Alert({
  className,
  variant,
  tone,
  icon,
  title,
  role,
  children,
  ...props
}: AlertProps) {
  // role 由 tone 派生：danger=需打断的错误→assertive(alert)；其余→polite(status)。props.role 可覆盖。
  const resolvedRole = role ?? (tone === "danger" ? "alert" : "status");

  return (
    <div role={resolvedRole} className={cn(alertVariants({ variant, tone }), className)} {...props}>
      {icon != null && <span className="mt-0.5 shrink-0 [&>svg]:size-5">{icon}</span>}
      <div className="flex min-w-0 flex-col gap-1">
        {title != null && <div className="text-sm font-medium">{title}</div>}
        {children != null && <div className="text-sm text-muted">{children}</div>}
      </div>
    </div>
  );
}
