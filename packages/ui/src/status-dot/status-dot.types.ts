import type { HTMLAttributes, ReactNode } from "react";

/** 渠道/模型健康语义态。 */
export type ChannelStatus = "online" | "degraded" | "offline" | "maintenance";

export interface StatusDotProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** 健康态：online 在线 / degraded 降级 / offline 离线 / maintenance 维护。 */
  status: ChannelStatus;
  /** 呼吸脉冲；默认仅 online 自动脉冲，可显式覆盖。 */
  pulse?: boolean;
  /** 状态文字（如「在线」）；提供则随圆点一起播报。 */
  label?: ReactNode;
  /** 尺寸。 */
  size?: "sm" | "md" | "lg";
  /** 尾部数值槽（如延迟「128ms」）。 */
  extra?: ReactNode;
}
