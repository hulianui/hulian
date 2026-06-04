import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { dotVariants } from "./dot";

export type DotTone = "neutral" | "brand" | "success" | "warning" | "danger";

export interface DotProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof dotVariants> {
  /** 语气色：neutral 默认 / brand 处理中 / success 在线/成功 / warning 警告 / danger 离线/错误。 */
  tone?: DotTone;
  /** 呼吸扩散动画（在线 / 进行中 等活跃态语义）。 */
  pulse?: boolean;
  /** 无障碍标签：提供则 role=status + aria-label（表意圆点，如「在线」）；不提供则 aria-hidden（纯装饰）。 */
  label?: string;
}
