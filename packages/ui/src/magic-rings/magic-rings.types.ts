export interface MagicRingsProps {
  /**
   * 内圈起始色（CSS 颜色字符串，hex / rgb / oklch / var(--…) 均可）。
   * 默认取瑚琏 chart token，自动吃明暗主题。
   * @default "var(--color-chart-1)"
   */
  color?: string;
  /**
   * 外圈终止色，光环颜色在 color → colorTwo 间按层数线性插值。
   * @default "var(--color-chart-4)"
   */
  colorTwo?: string;
  /**
   * 动画速度倍率。1 = 原速，越大波纹扩散越快。
   * @default 1
   */
  speed?: number;
  /**
   * 同时存在的光环层数（1–10，超出按 10 截断）。
   * @default 6
   */
  ringCount?: number;
  /**
   * 光晕衰减系数，越大环线越锐利越短促，越小越弥散。
   * @default 10
   */
  attenuation?: number;
  /**
   * 环线粗细倍率。
   * @default 2
   */
  lineThickness?: number;
  /**
   * 最内圈起始半径（归一化，约 0–1）。
   * @default 0.35
   */
  baseRadius?: number;
  /**
   * 相邻两圈起始半径的递增步长。
   * @default 0.1
   */
  radiusStep?: number;
  /**
   * 单个生命周期内环半径的扩张幅度（波纹向外推开的距离）。
   * @default 0.1
   */
  scaleRate?: number;
  /**
   * 整体不透明度（0–1），叠加在按亮度派生的 alpha 之上。
   * @default 1
   */
  opacity?: number;
  /**
   * CSS 模糊半径（px），>0 时给整个画布加 filter: blur 柔化。
   * @default 0
   */
  blur?: number;
  /**
   * 颗粒噪点强度，制造类胶片质感，0 = 干净。
   * @default 0.1
   */
  noiseAmount?: number;
  /**
   * 整体旋转角度（度）。
   * @default 0
   */
  rotation?: number;
  /**
   * 各环的角向裂口幅度（越大缺口越深，呈花瓣状）。
   * @default 1.5
   */
  ringGap?: number;
  /**
   * 单环淡入比例（生命周期前段）。
   * @default 0.7
   */
  fadeIn?: number;
  /**
   * 单环淡出起点比例（生命周期后段）。
   * @default 0.5
   */
  fadeOut?: number;
  /**
   * 是否让光环跟随鼠标位移产生视差。
   * @default false
   */
  followMouse?: boolean;
  /**
   * followMouse 时鼠标对整体的位移影响系数。
   * @default 0.2
   */
  mouseInfluence?: number;
  /**
   * 悬停时整体缩放目标值。
   * @default 1.2
   */
  hoverScale?: number;
  /**
   * 各层随鼠标的视差错位系数，制造层次纵深。
   * @default 0.05
   */
  parallax?: number;
  /**
   * 是否启用点击爆发（点击时短暂放大 + 提亮）。
   * @default false
   */
  clickBurst?: boolean;
  /**
   * 透传到根容器（正常渲染）或 fallback div（reduced-motion / 无 WebGL）的 className。
   */
  className?: string;
}
