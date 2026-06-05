import type { CSSProperties } from "react";

export interface PixelTrailProps {
  /**
   * 网格密度：横向像素格子数（纵向按容器比例自动推算，保持方格）。
   * 越大格子越细、像素感越精致；越小颗粒越粗、复古味越浓。默认 40。
   * 建议范围 16–120。
   */
  gridSize?: number;
  /**
   * 鼠标拖尾的影响半径（占容器短边的比例，0–1）。
   * 越大点亮的格子范围越广，拖尾越粗。默认 0.1。
   */
  trailSize?: number;
  /**
   * 单个格子被点亮后的存活时长（毫秒），到点淡灭。
   * 越大拖尾越长、余晖越久。默认 320。
   */
  maxAge?: number;
  /**
   * 像素点颜色，默认取瑚琏 chart token（自动吃明暗主题）。
   * 可传任意 CSS 颜色（hex / oklch / var(--color-…)）。
   * 注意：喂给 shader 的 var 必须带 --color- 前缀方能解析。
   * 默认：var(--color-chart-1)
   */
  color?: string;
  /**
   * 是否启用「黏液（gooey）」滤镜：相邻像素点会融合成有机的液态团块，
   * 而非硬边方格。默认 false（保留硬边像素感）。
   */
  gooey?: boolean;
  /**
   * gooey 滤镜的融合强度（高斯模糊半径，px），仅在 gooey=true 时生效。默认 8。
   * 越大相邻点融合得越厉害、越圆润。
   */
  gooeyStrength?: number;
  /**
   * 透传到根容器的额外 className（容器默认 block h-full w-full，由外层控制尺寸）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
