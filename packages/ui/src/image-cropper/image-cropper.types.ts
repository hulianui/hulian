import type { ReactNode } from "react";

/** 裁剪框像素区域（相对原图自然尺寸），与 react-easy-crop 的 Area 同构。 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropOutputOptions {
  /** 输出位图宽（px）。 */
  width: number;
  /** 输出位图高（px）。 */
  height: number;
  /** 输出 mime。@default "image/jpeg" */
  type?: string;
  /** 编码质量 0–1（仅有损格式生效）。@default 0.9 */
  quality?: number;
  /** 字节上限：首次编码超限则降质（quality×0.72，下限 0.5）重试一次，尽力而为。 */
  maxBytes?: number;
}

export interface ImageCropperProps {
  /** 图片源：object URL / data URL / 同源地址。 */
  image: string;
  /** 裁剪框宽高比。@default 5/7（证件照 1 寸 25×35mm 与 2 寸 35×49mm 同比例） */
  aspect?: number;
  /** 输出位图宽（px），高按 aspect 推导取整。@default 413（2 寸 @300DPI） */
  outputWidth?: number;
  /** 输出 mime。@default "image/jpeg" */
  outputType?: string;
  /** 编码质量 0–1。@default 0.9 */
  quality?: number;
  /** 输出字节上限（如 200*1024）：超限降质重试一次。 */
  maxBytes?: number;
  /** 最大缩放倍数。@default 3 */
  maxZoom?: number;
  /** 确认裁剪：产出目标尺寸 Blob。 */
  onCropped: (blob: Blob) => void;
  /** 取消按钮点击（不传则不渲染取消按钮）。 */
  onCancel?: () => void;
  /** 画布导出失败（极旧浏览器 / canvas 受限）。 */
  onError?: (error: unknown) => void;
  /** 确认按钮文案。@default "确认" */
  confirmLabel?: ReactNode;
  /** 取消按钮文案。@default "取消" */
  cancelLabel?: ReactNode;
  /** 裁剪画布区高度 class（默认 h-64 sm:h-80）。 */
  cropAreaClassName?: string;
  className?: string;
}
