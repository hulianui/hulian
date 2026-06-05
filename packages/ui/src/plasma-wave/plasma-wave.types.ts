import type { ReactNode } from "react";

export interface PlasmaWaveProps {
  /**
   * 等离子波双色，默认取瑚琏 chart token（自动吃明暗主题）。
   * 接受任意 CSS 颜色字符串（hex / rgb / oklch / `var(--color-…)` 均可）——
   * 运行时经离屏 canvas 统一解析为 0–1 RGB 喂给 shader uniform。
   * 只取前两色（uColor1 / uColor2），多传忽略。
   * @default ["var(--color-chart-1)", "var(--color-chart-2)"]
   */
  colors?: string[];
  /**
   * 等离子丝带在画布上的水平偏移（设备像素），用于让波纹焦点离开正中。
   * @default 0
   */
  xOffset?: number;
  /**
   * 等离子丝带在画布上的垂直偏移（设备像素）。
   * @default 0
   */
  yOffset?: number;
  /**
   * 整体旋转角度（度）。把横向流动的波带整体旋转，斜向铺排更有张力。
   * @default 0
   */
  rotationDeg?: number;
  /**
   * 焦距（视线收束程度）。越大波纹越聚拢、纵深越强；越小越铺展。
   * 建议范围 0.4–1.6。
   * @default 0.8
   */
  focalLength?: number;
  /**
   * 第一条等离子丝带的流速。越大流动越快。
   * @default 0.05
   */
  speed1?: number;
  /**
   * 第二条等离子丝带的流速。
   * @default 0.05
   */
  speed2?: number;
  /**
   * 第二条丝带的流向（+1 同向 / -1 反向），与第一条对冲产生交织感。
   * @default 1
   */
  dir2?: number;
  /**
   * 第一条丝带的弯曲幅度。越大波纹起伏越夸张。
   * @default 1
   */
  bend1?: number;
  /**
   * 第二条丝带的弯曲幅度。
   * @default 0.5
   */
  bend2?: number;
  /**
   * 透传到 canvas 容器（正常渲染）或 fallback div（reduced-motion / 无 WebGL）的 className。
   * 通常用于尺寸 / 圆角 / opacity（如 `absolute inset-0 opacity-80`）。
   */
  className?: string;
  /**
   * reduced-motion 或无 WebGL 时的自定义静态备用内容（覆盖在静态渐变之上）。
   */
  fallback?: ReactNode;
}
