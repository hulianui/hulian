import type { ReactNode } from "react";

/** 棱镜爆发的运动方式。 */
export type PrismaticBurstAnimationType = "rotate" | "rotate3d" | "hover";

/** 中心偏移（CSS 像素）。 */
export interface PrismaticBurstOffset {
  /** 水平偏移，正值向右。 */
  x?: number;
  /** 垂直偏移，正值向下。 */
  y?: number;
}

export interface PrismaticBurstProps {
  /**
   * 整体亮度增益，默认 2。
   * 直接乘到最终颜色上：越大越亮，0 = 全黑。
   */
  intensity?: number;

  /**
   * 体积步进动画速度因子，默认 1。
   * 映射到 GLSL uniform uSpeed，越大爆发翻涌越快。
   */
  speed?: number;

  /**
   * 运动方式，默认 "rotate"：
   * - rotate：单轴平面旋转（最克制）
   * - rotate3d：三维欧拉旋转（立体翻滚）
   * - hover：跟随指针倾斜（uMouse 驱动）
   */
  animationType?: PrismaticBurstAnimationType;

  /**
   * 色带，CSS 颜色字符串数组（hex / oklch / rgb / var(--…) 均可）。
   * 烘焙成一维渐变纹理供 shader 按 march 进度采样。
   * 默认从 `--color-chart-1..5` 取主题色，实现明暗自适应的光谱棱镜。
   */
  colors?: string[];

  /**
   * 光线弯曲扭曲量，默认 0，范围 0–50（shader 内夹紧）。
   * 越大射线越像被引力透镜扭弯，0 = 笔直放射。
   */
  distort?: number;

  /**
   * 颗粒抖动噪声量，默认 0，范围 0–1。
   * 给体积步进加入随机扰动，弱化条带感。
   */
  noiseAmount?: number;

  /**
   * 放射光束的瓣数，默认 0（关闭，连续光晕）。
   * >0 时按角度梳理出 N 条对称射线（如 6 = 六芒星爆发）。
   */
  rayCount?: number;

  /**
   * 爆发中心相对画面中心的偏移（CSS 像素），默认 { x: 0, y: 0 }。
   */
  offset?: PrismaticBurstOffset;

  /**
   * 混合模式，透传到 canvas 的 `mix-blend-mode`，默认 "none"。
   * 常用 "lighten" / "screen" 让爆发叠加在底图上更通透。
   */
  mixBlendMode?: string;

  /**
   * 额外 className，合并到 root 容器（或 reduced 降级 div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的径向光爆 linear/radial-gradient 装饰。
   */
  fallback?: ReactNode;
}
