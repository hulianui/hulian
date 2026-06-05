import type { CSSProperties, ReactNode } from "react";

export interface FlyingPostersProps {
  /**
   * 海报图片地址数组（按顺序首尾相接、无限循环滚动）。
   * 建议同尺寸/同比例图，shader 内部会按平面比例做 cover 裁切，不变形。
   * 为空时只渲染空画布（不抛错）。
   * @default []
   */
  items?: string[];
  /**
   * 单张海报平面宽度（世界单位 ≈ 像素映射基准），默认 320。
   * 与 planeHeight 共同决定海报比例与画面密度。
   * @default 320
   */
  planeWidth?: number;
  /**
   * 单张海报平面高度（世界单位），默认 320。
   * @default 320
   */
  planeHeight?: number;
  /**
   * 卷动时的弯折扭曲强度，越大海报"飞起"翻折越夸张。
   * 建议 1–6；0 近似平移无翻折。
   * @default 3
   */
  distortion?: number;
  /**
   * 卷动缓动系数（0–1），越小越"重"、惯性越长。
   * @default 0.01
   */
  scrollEase?: number;
  /**
   * 透视相机视场角（度），越大透视越强、海报飞入飞出弧度越明显。
   * @default 45
   */
  cameraFov?: number;
  /**
   * 透视相机 Z 轴距离，越大画面越远、可见海报越多。
   * @default 20
   */
  cameraZ?: number;
  /**
   * 无交互时是否自动缓慢卷动（让效果在静态/截图场景下仍有生命力）。
   * reduced-motion 下强制关闭。
   * @default true
   */
  autoScroll?: boolean;
  /**
   * 自动卷动速度（世界单位/秒），autoScroll 为真时生效。
   * @default 0.6
   */
  autoScrollSpeed?: number;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
  /**
   * reduced-motion 或无 WebGL 时，静态备用层中央展示的内容（如标题/占位）。
   */
  fallback?: ReactNode;
}
