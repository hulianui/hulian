import type { CSSProperties } from "react";

/** 单张图片项：可为纯 src 字符串，或带 alt 的对象。 */
export type DomeGalleryImage = string | { src: string; alt?: string };

export interface DomeGalleryProps {
  /**
   * 贴在球面上的图片集合。可传字符串数组或 `{ src, alt }` 对象数组。
   * 数量不足时会循环铺满所有瓦片，超出可用瓦片数则尾部图片不显示。
   * @default 内置占位渐变瓦片
   */
  images?: DomeGalleryImage[];

  /**
   * 球面经向分段数（横向列数密度）。越大瓦片越密、单格越小。
   * @default 24
   */
  segments?: number;

  /**
   * 球半径相对容器尺寸的比例，越小球面曲率越大、越「贴脸」。
   * 实际半径 = 容器基准尺寸 × fit，并受 minRadius/maxRadius 钳制。
   * @default 0.5
   */
  fit?: number;

  /**
   * 半径下限（px），防止小容器里球面塌缩。
   * @default 380
   */
  minRadius?: number;

  /**
   * 半径上限（px），防止大屏球面过平。
   * @default 1600
   */
  maxRadius?: number;

  /**
   * 纵向（rotateX）最大摆动角度，限制上下翻转幅度避免看到球的两极。
   * @default 6
   */
  maxVerticalRotationDeg?: number;

  /**
   * 拖拽灵敏度：像素位移 ÷ 该值 = 旋转角度。越大越「迟钝」。
   * @default 18
   */
  dragSensitivity?: number;

  /**
   * 松手后惯性阻尼系数（0~1）。越大滑行越久。
   * @default 0.55
   */
  dragDampening?: number;

  /**
   * 是否对瓦片图片应用灰度滤镜（点开放大后恢复彩色）。
   * @default true
   */
  grayscale?: boolean;

  /**
   * 瓦片圆角（CSS 长度）。
   * @default "16px"
   */
  imageBorderRadius?: string;

  /**
   * 放大查看时图片圆角（CSS 长度）。
   * @default "24px"
   */
  openedImageBorderRadius?: string;

  /**
   * 边缘渐隐 / 中心遮罩使用的底色，吃当前主题表面色 token。
   * 传原始色值（如 `var(--color-background)`）以匹配容器背景。
   * @default "var(--color-background)"
   */
  overlayColor?: string;

  /**
   * 放大查看 / 容器自动旋转的过渡时长（ms）。
   * @default 320
   */
  enlargeTransitionMs?: number;

  /** 自动缓慢自转（无拖拽时），用于展示/壁纸场景。 */
  autoRotate?: boolean;

  /** 合并到根元素的额外类名。 */
  className?: string;

  /** 合并到根元素的内联样式。 */
  style?: CSSProperties;
}
