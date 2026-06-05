import type { ReactNode } from "react";

/** per-stage 语气色（吃 token），同 Tag 的 tone 语义。 */
export type FunnelTone = "neutral" | "brand" | "success" | "warning" | "danger";

export interface FunnelStage {
  id: string;
  label: ReactNode;
  /** 该阶段的数量；漏斗宽度/高度按 value 比例缩放。 */
  value: number;
  /** 条的语气色，缺省 brand。 */
  tone?: FunnelTone;
}

export interface FunnelRenderCtx {
  /** 宽度（vertical）/ 高度（horizontal）比例 = value / max。 */
  widthRatio: number;
  /** 级间转化率（首级为 null）。 */
  conversion: number | null;
  /** 阶段序号（0 起）。 */
  index: number;
}

export interface FunnelProps<S extends FunnelStage = FunnelStage> {
  stages: S[];
  /** 方向：vertical 每级一行按宽度比 / horizontal 每列按高度比。默认 vertical。 */
  orientation?: "vertical" | "horizontal";
  /** 是否显示级间转化率徽标，默认 true。 */
  showConversion?: boolean;
  /** 自定义阶段内容（替换默认 label + value）。 */
  renderStage?: (stage: S, ctx: FunnelRenderCtx) => ReactNode;
  /** 点击某一级回调。 */
  onStageClick?: (stage: S) => void;
  className?: string;
}
