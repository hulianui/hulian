import type { ImgHTMLAttributes } from "react";

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "width" | "height"> {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  /** 圆角刻度。 */
  radius?: "none" | "sm" | "md" | "lg" | "full";
  /** hover 放大（外壳裁切溢出）。 */
  isZoomed?: boolean;
  /** 加载失败时回退图；缺省则显示占位底。 */
  fallbackSrc?: string;
  /** 外壳 className（控制尺寸/圆角区域）。 */
  className?: string;
  /** <img> 自身 className。 */
  imgClassName?: string;
}
