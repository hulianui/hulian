import type { CSSProperties, ReactNode } from "react";

export interface HyperspeedProps {
  /**
   * 整体推进速度倍率，默认 1。
   * 越大光带向观察者冲来越快（"踩油门"加速感），越小越舒缓。
   * 建议范围 0.2–4。
   */
  speed?: number;
  /**
   * 道路两侧光带的密度（每侧灯带条数近似值），默认 40。
   * 越大星轨/灯带越密集，越小越稀疏空旷。
   * 建议范围 10–120。
   */
  density?: number;
  /**
   * 视野扭曲强度（湍流摆动幅度），默认 1。
   * 模拟原版 turbulentDistortion 的道路弯曲：0 = 笔直隧道，越大左右摇摆越剧烈。
   * 建议范围 0–2。
   */
  distortion?: number;
  /**
   * 雾化淡出强度，默认 0.4。
   * 越大远处光带越快被黑暗吞没（纵深感更强），越小光带从远处就清晰可见。
   * 建议范围 0–1。
   */
  fade?: number;
  /**
   * 左侧（驶离方向）车灯色，可传任意 CSS 颜色字符串。
   * 默认取瑚琏 chart token：紫红色系 `var(--color-chart-4)`，自动明暗适配。
   */
  leftColor?: string;
  /**
   * 右侧（驶近方向）车灯色，可传任意 CSS 颜色字符串。
   * 默认取瑚琏 chart token：青蓝色系 `var(--color-chart-2)`，自动明暗适配。
   */
  rightColor?: string;
  /**
   * 透传到根容器的额外 className（组件本身 block h-full w-full，由容器控制尺寸）。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 降级时渲染在静态兜底层内的内容（如标题）。
   */
  fallback?: ReactNode;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
