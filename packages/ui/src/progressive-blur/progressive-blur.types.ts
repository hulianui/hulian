export interface ProgressiveBlurProps {
  /** 模糊增强的方向（该侧最糊）。 */
  side?: "top" | "bottom" | "left" | "right";
  /** 分层数（越多越平滑）。 */
  layers?: number;
  /** 基础模糊量(px)，逐层翻倍。 */
  blur?: number;
  className?: string;
}
