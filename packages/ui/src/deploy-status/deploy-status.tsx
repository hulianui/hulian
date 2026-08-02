"use client";

import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale";
import { Clock, Loader2, CircleCheck, CircleX, Ban, Minus, type IconComponent } from "../_icons";
import type { DeployState, DeployStatusProps } from "./deploy-status.types";

// DeployStatus = 部署/构建生命周期状态件。健康态 StatusDot 答「服务在不在」，
// 部署态答「这次发布走到哪一步」——排队/构建中(转圈)/已上线/失败/取消/跳过，
// 语义集合不同，故独立成件。CI/CD、Pages、发布列表、流水线刚需。纯皮肤吃主题。

interface Meta {
  Icon: IconComponent;
  label: string;
  /** soft 填充类（badge） */
  soft: string;
  /** 纯文字/图标色（dot·icon） */
  fg: string;
  /** 圆点底色（dot） */
  dot: string;
  spin?: boolean;
}

const META: Record<DeployState, Meta> = {
  queued: { Icon: Clock, label: "排队中", soft: "bg-surface-hover text-muted", fg: "text-muted", dot: "bg-muted" },
  building: { Icon: Loader2, label: "构建中", soft: "bg-primary/12 text-primary", fg: "text-primary", dot: "bg-primary", spin: true },
  ready: { Icon: CircleCheck, label: "已上线", soft: "bg-success/12 text-success", fg: "text-success", dot: "bg-success" },
  error: { Icon: CircleX, label: "失败", soft: "bg-danger/12 text-danger", fg: "text-danger", dot: "bg-danger" },
  canceled: { Icon: Ban, label: "已取消", soft: "bg-surface-hover text-muted", fg: "text-muted", dot: "bg-muted" },
  skipped: { Icon: Minus, label: "已跳过", soft: "bg-surface-hover text-muted", fg: "text-muted", dot: "bg-muted" },
};

export function DeployStatus({
  status,
  variant = "badge",
  label,
  size = "md",
  spin = true,
  className,
}: DeployStatusProps) {
  const m = META[status];
  const localizedLabel = useComponentLocale().deployStatus?.[status] ?? m.label;
  const text = label ?? localizedLabel;
  const iconCls = cn(size === "sm" ? "size-3.5" : "size-4", "shrink-0", m.spin && spin && "animate-spin");
  const Icon = m.Icon;

  // 仅图标：保留语义可读性（屏幕阅读器播报状态文案）。
  if (variant === "icon") {
    return (
      <span
        role="img"
        aria-label={typeof text === "string" ? text : localizedLabel}
        title={typeof text === "string" ? text : localizedLabel}
        className={cn("inline-flex", m.fg, className)}
      >
        <Icon className={iconCls} />
      </span>
    );
  }

  if (variant === "dot") {
    return (
      <span className={cn("inline-flex items-center gap-1.5", size === "sm" ? "text-xs" : "text-sm", className)}>
        <span className={cn("relative inline-flex shrink-0 rounded-full", size === "sm" ? "size-1.5" : "size-2", m.dot)}>
          {status === "building" && (
            <span className={cn("absolute inset-0 animate-ping rounded-full opacity-75", m.dot)} />
          )}
        </span>
        <span className={cn("font-medium", m.fg)}>{text}</span>
      </span>
    );
  }

  // badge（默认）
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-[calc(var(--radius)-0.25rem)] font-medium",
        size === "sm" ? "h-5 px-1.5 text-[11px]" : "h-6 px-2 text-xs",
        m.soft,
        className,
      )}
    >
      <Icon className={iconCls} />
      {text}
    </span>
  );
}
