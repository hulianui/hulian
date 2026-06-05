import type { CSSProperties } from "react";

export interface GhostCursorProps {
  /**
   * 拖尾长度（保留多少帧历史位置参与渲染），默认 32。
   * 越大尾迹越长越绵延，但片元循环开销线性增长；建议 16–64。
   */
  trailLength?: number;
  /**
   * 惯性系数（0–1）。指针停下后烟雾继续滑行的衰减率，默认 0.5。
   * 越接近 1 越"飘"（拖得越远），越接近 0 越"跟手"（立即停）。
   */
  inertia?: number;
  /**
   * 胶片颗粒强度（0–0.3），默认 0.05。
   * 在烟雾上叠加细微噪点，模拟原版 FilmGrain 后处理；0 = 关闭。
   */
  grainIntensity?: number;
  /**
   * 整体亮度增益，默认 1.2（瑚琏化补偿原版 UnrealBloom 辉光被去除后的亮度损失）。
   * 越大烟雾越亮越发光，建议 0.8–2.0。
   */
  brightness?: number;
  /**
   * 烟雾主色。默认取瑚琏 --color-chart-1（蓝紫·自动明暗适配）。
   * 可传任意 CSS 颜色字符串（hex / rgb / oklch / var(--color-…) 均可）。
   */
  color?: string;
  /**
   * 噪声活动半径系数（>0），默认 1。
   * 越大烟雾团越大越弥散，越小越聚拢成点。
   */
  scale?: number;
  /**
   * canvas 的 CSS mix-blend-mode（混合模式），默认 "screen"（叠加发光，深色底最佳）。
   * 浅色底可改 "multiply" 或 "normal"。
   */
  mixBlendMode?: CSSProperties["mixBlendMode"];
  /**
   * 透传到根容器的额外 className（根为 absolute inset-0 覆盖父元素）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式（如 zIndex）。
   */
  style?: CSSProperties;
}
