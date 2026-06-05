import type { CSSProperties } from "react";

export interface CubesProps {
  /**
   * 网格边长（行=列），生成 gridSize × gridSize 个 3D 立方体，默认 8。
   * 越大越密集（注意 DOM 数量为平方级，建议 ≤ 12）。
   */
  gridSize?: number;
  /**
   * 单个立方体边长（px）。传入时容器为固定尺寸 gridSize × cubeSize；
   * 不传则容器自适应（width 100% · 1:1 宽高比），由父级约束尺寸。
   */
  cubeSize?: number;
  /**
   * 指针所在处立方体的最大倾斜角（度），默认 45。
   * 距离越近角度越大，越远越接近 0。
   */
  maxAngle?: number;
  /**
   * 倾斜影响半径（以「格」为单位），默认 3。
   * 距指针中心 ≤ radius 的立方体参与倾斜，之外的回正。
   */
  radius?: number;
  /**
   * 单元间距。数字按 px；对象可分别指定行列间距（百分比字符串如 "5%"）。
   * 默认 "5%"（百分比随容器缩放）。
   */
  cellGap?: number | { row?: number | string; col?: number | string };
  /**
   * 立方体面背景色，吃瑚琏 token。默认 var(--color-surface)。
   * 喂给 style 必须带 --color- 前缀。
   */
  faceColor?: string;
  /**
   * 立方体面边框色，吃瑚琏 token。默认 var(--color-border)。
   */
  edgeColor?: string;
  /**
   * 点击时从命中点向外扩散的涟漪高亮色，默认 var(--color-primary)。
   */
  rippleColor?: string;
  /**
   * 涟漪扩散速度倍率，默认 2（越大越快）。
   */
  rippleSpeed?: number;
  /**
   * 是否在空闲时自动游走倾斜（无指针交互时模拟一个漫游焦点），默认 true。
   * reduced-motion 下自动禁用，立方体保持静止。
   */
  autoAnimate?: boolean;
  /**
   * 是否启用点击涟漪，默认 true。
   */
  rippleOnClick?: boolean;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
