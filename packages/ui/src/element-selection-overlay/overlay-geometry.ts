// 叠加层几何（无 React / 无 DOM 依赖 / 纯数学）。
//
// 这里只吃数字、只吐数字：真实 rect 由组件在浏览器里量（jsdom 恒 0，量不出东西），
// 但「iframe 坐标怎么叠加」「标签贴顶怎么翻」这两条判断逻辑必须能被单测锁住 ——
// 它们正是最容易写错、又最难靠截图发现的部分。

export interface OverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface OverlayOffset {
  left: number;
  top: number;
}

export interface OverlaySize {
  width: number;
  height: number;
}

/** 标签相对高亮框的位置：框外上方（默认） / 框内上方（贴视口顶时翻进来）。 */
export type LabelPlacement = "above" | "inside";

export interface LabelPosition {
  top: number;
  left: number;
  placement: LabelPlacement;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), Math.max(min, max));
}

/**
 * 目标元素在**自身文档视口**里的 rect → 宿主视口坐标。
 *
 * 同文档时 frameOffset 为 null，原样返回；iframe 内的元素必须叠加 iframe 自身
 * 在宿主里的 boundingRect 偏移（还要含 iframe 的 border 宽度，内容坐标从边框内侧起算）。
 * 漏掉这一步的症状是「框画得出来但整体偏移一段」，很容易被误当成滚动没跟上。
 */
export function toHostRect(rect: OverlayRect, frameOffset?: OverlayOffset | null): OverlayRect {
  if (!frameOffset) return { ...rect };
  return {
    top: rect.top + frameOffset.top,
    left: rect.left + frameOffset.left,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * 框是否值得画：与视口有交集，且有实际面积。
 * 零面积（display:contents / 尺寸为 0 / jsdom 环境）一律判不可见，避免画出 0×0 的鬼框。
 */
export function isRectVisible(rect: OverlayRect, viewport: OverlaySize): boolean {
  if (rect.width <= 0 || rect.height <= 0) return false;
  return (
    rect.left < viewport.width &&
    rect.top < viewport.height &&
    rect.left + rect.width > 0 &&
    rect.top + rect.height > 0
  );
}

/**
 * 标签定位：默认贴在框外上沿，左对齐框的左边。
 * 上方放不下（框贴着视口顶）→ 翻到框内上沿，避免标签被裁掉；
 * 左右溢出视口 → 夹回视口内（宁可与框左沿错开，也不要看不见）。
 */
export function computeLabelPosition(
  rect: OverlayRect,
  label: OverlaySize,
  viewport: OverlaySize,
  gap = 4,
): LabelPosition {
  const above = rect.top - label.height - gap;
  const placement: LabelPlacement = above >= 0 ? "above" : "inside";
  const rawTop = placement === "above" ? above : rect.top + gap;
  return {
    placement,
    top: clamp(rawTop, 0, viewport.height - label.height),
    left: clamp(rect.left, 0, viewport.width - label.width),
  };
}
