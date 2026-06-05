import type { ReactNode } from "react";

/** 部署/构建生命周期状态（区别于健康态 StatusDot 的在线/降级语义）。 */
export type DeployState = "queued" | "building" | "ready" | "error" | "canceled" | "skipped";

/** 形态：badge 软填充徽标 / dot 圆点+文字 / icon 仅图标（紧凑表格单元格）。 */
export type DeployStatusVariant = "badge" | "dot" | "icon";

export interface DeployStatusProps {
  /** 生命周期状态。 */
  status: DeployState;
  /** @default "badge" */
  variant?: DeployStatusVariant;
  /** 覆盖默认中文文案。 */
  label?: ReactNode;
  /** @default "md" */
  size?: "sm" | "md";
  /** building 态图标是否旋转。@default true */
  spin?: boolean;
  className?: string;
}
