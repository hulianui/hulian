import type { ReactNode } from "react";

/** 粒子形状：圆点 / 方块 / 短棒（朝向光标的胶囊感）。 */
export type AntigravityShape = "dot" | "square" | "bar";

export interface AntigravityProps {
  /**
   * 粒子数量。越多越密、越费性能；移动端建议 ≤ 200。
   * @default 240
   */
  count?: number;
  /**
   * 磁吸半径（CSS 像素）。光标进入此范围的粒子会被吸入环绕轨道。
   * @default 130
   */
  magnetRadius?: number;
  /**
   * 环绕轨道基础半径（CSS 像素）。被吸住的粒子围绕光标排布的圈半径。
   * @default 56
   */
  ringRadius?: number;
  /**
   * 环上波动速度（轨道半径随角度/时间起伏的快慢）。
   * @default 0.4
   */
  waveSpeed?: number;
  /**
   * 环上波动幅度（px）。越大轨道越"毛糙"有机。
   * @default 10
   */
  waveAmplitude?: number;
  /**
   * 粒子基础尺寸（px）。dot=直径 / square=边长 / bar=长度。
   * @default 4
   */
  particleSize?: number;
  /**
   * 粒子追踪目标位置的缓动系数（0–1）。越大越"紧跟"，越小越"漂浮迟滞"。
   * @default 0.12
   */
  lerpSpeed?: number;
  /**
   * 粒子颜色。默认取瑚琏 chart token（自动明暗适配）。
   * 可传任意 CSS 颜色（hex / oklch / var(--color-…)）。
   * @default "var(--color-chart-1)"
   */
  color?: string;
  /**
   * 光标静止 2s 后是否自动巡游（无人操作时仍有动态），适合演示 / 大屏。
   * @default false
   */
  autoAnimate?: boolean;
  /**
   * 整环随时间的旋转角速度（rad/s）。0 = 不自转。
   * @default 0
   */
  rotationSpeed?: number;
  /**
   * 粒子脉冲缩放速度（被吸住时大小呼吸的快慢）。
   * @default 3
   */
  pulseSpeed?: number;
  /**
   * 粒子形状。
   * @default "bar"
   */
  shape?: AntigravityShape;
  /**
   * 透传到根容器（canvas 包裹层 / reduced-motion fallback）的 className。
   */
  className?: string;
  /**
   * reduced-motion 或无 canvas2d 时的自定义静态备用内容（覆盖在静态点阵之上）。
   */
  fallback?: ReactNode;
}
