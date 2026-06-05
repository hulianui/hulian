import type { HTMLAttributes } from "react";

/** 贴纸初始落点：居中，或相对父容器左上角的像素偏移 */
export type StickerPeelPosition = "center" | { x: number; y: number };

export interface StickerPeelProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 贴纸图片地址（必填）。会渲染两层：正面贴纸 + 翻起的背面卷边 */
  imageSrc: string;
  /** 图片可访问性描述（透传到 img alt），默认空串（装饰性贴纸） */
  alt?: string;
  /** 贴纸宽度（px），高度按图片原比例自适应。默认 200 */
  width?: number;
  /** 贴纸内部图案的旋转角度（deg），制造随手贴的歪斜感。默认 30 */
  rotate?: number;
  /** hover 时卷边翻起的百分比（顶部揭开高度占比）。默认 30 */
  peelBackHoverPct?: number;
  /** active（按住）时卷边翻起的百分比，通常比 hover 更大。默认 40 */
  peelBackActivePct?: number;
  /** 卷边方向角度（deg），整张贴纸连同卷边一起旋转。默认 0 */
  peelDirection?: number;
  /** 落地投影强度 0~1，写入 --hulian-sticker-shadow（drop-shadow 透明度）。默认 0.6 */
  shadowIntensity?: number;
  /**
   * 鼠标跟随高光强度 0~1，写入 --hulian-sticker-light（高光层透明度）。
   * 0 完全关闭高光。默认 0.4
   */
  lightingIntensity?: number;
  /** 贴纸初始落点。默认 "center" */
  initialPosition?: StickerPeelPosition;
  /** 是否允许在父容器内拖拽（指针拖动，越界自动夹回）。默认 true */
  draggable?: boolean;
}
