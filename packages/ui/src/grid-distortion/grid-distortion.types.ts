import type { ReactNode } from "react";

export interface GridDistortionProps {
  /**
   * 位移数据网格的边长（格子数），默认 15。
   * 即把容器切成 grid×grid 的位移采样网格，鼠标在格子上"推"出涟漪。
   * 越大网格越细、涟漪越平滑，但 JS 每帧迭代量为 grid² 上升，建议 8–30。
   */
  grid?: number;

  /**
   * 鼠标影响半径因子，默认 0.1（相对网格尺寸的比例）。
   * 越大鼠标扰动覆盖越多格子（影响范围 = grid × mouse）。
   */
  mouse?: number;

  /**
   * 位移强度，默认 0.15。
   * 鼠标移动速度乘以该系数写入位移场，越大涟漪越剧烈。
   */
  strength?: number;

  /**
   * 弛豫系数（每帧衰减），默认 0.9。
   * 取值 0–1，越接近 1 涟漪余韵越长（衰减越慢），越小回弹越快。
   */
  relaxation?: number;

  /**
   * 被扭曲的图像地址（可选）。
   * 不传时瑚琏在 shader 内程序化生成一张 chart token 着色的网格底纹（零外部资源、明暗自适应），
   * 这是默认推荐用法；传入则扭曲该图（注意需同源或开启 CORS）。
   */
  imageSrc?: string;

  /**
   * 网格底纹主色（仅 imageSrc 未传时生效），CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 `--color-chart-1` 取主题色，实现明暗自适应。
   */
  color?: string;

  /**
   * 额外 className，透传到根容器（或 fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的网格底纹装饰 div（无扭曲、无动画）。
   */
  fallback?: ReactNode;
}
