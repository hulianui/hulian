import { cn } from "../lib/cn";
import { Dot } from "../dot";
import type { DotTone } from "../dot";
import type { ChannelStatus, StatusDotProps } from "./status-dot.types";

// StatusDot = 带语义 tone 的健康状态点：在 Dot 原语上封装「在线/降级/离线/维护」语义映射，
// 配一行可选的状态文字 + 尾部数值槽（延迟/成功率）。网关渠道健康墙、模型在线态刚需。
// 纯皮肤零依赖，仅消费语义 token 自动吃主题。
const statusTone: Record<ChannelStatus, DotTone> = {
  online: "success",
  degraded: "warning",
  offline: "danger",
  maintenance: "neutral",
};

const labelTone: Record<ChannelStatus, string> = {
  online: "text-success",
  degraded: "text-warning",
  offline: "text-danger",
  maintenance: "text-muted-foreground",
};

export function StatusDot({
  status,
  pulse,
  label,
  size = "md",
  extra,
  className,
  ...props
}: StatusDotProps) {
  // 默认仅在线脉冲；显式 pulse 覆盖。
  const shouldPulse = pulse ?? status === "online";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)} {...props}>
      <Dot
        tone={statusTone[status]}
        size={size}
        pulse={shouldPulse}
        label={typeof label === "string" ? label : undefined}
      />
      {label != null && <span className={cn("font-medium", labelTone[status])}>{label}</span>}
      {extra != null && <span className="text-muted-foreground tabular-nums">{extra}</span>}
    </span>
  );
}
