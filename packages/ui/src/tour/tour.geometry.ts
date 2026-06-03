// Tour 几何纯函数（无 React / 无副作用 / SSR 安全）—— 抽出便于 jsdom 单测，
// 几何视觉走截图（同 progressPercent / applyResize / getPaginationRange 范式）。
import type { TourPlacement } from "./tour.types";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * 解析 step.target → Element|null。
 * 支持：返回元素的函数 / CSS 选择器字符串 / null（无目标 → 居中卡片）。
 * 函数抛错、选择器非法、无 document 均安全降级为 null。
 */
export function resolveTarget(
  target?: (() => Element | null) | string | null,
): Element | null {
  if (target == null) return null;
  if (typeof target === "function") {
    try {
      return target() ?? null;
    } catch {
      return null;
    }
  }
  if (typeof document === "undefined") return null;
  try {
    return document.querySelector(target);
  } catch {
    return null;
  }
}

/** 目标 rect 外扩 padding 得到镂空高亮框（宽高不为负）。 */
export function computeSpotlight(rect: Rect, padding: number): Rect {
  return {
    left: rect.left - padding,
    top: rect.top - padding,
    width: Math.max(0, rect.width + padding * 2),
    height: Math.max(0, rect.height + padding * 2),
  };
}

const OPPOSITE: Record<TourPlacement, TourPlacement> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

const MARGIN = 8;

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), Math.max(min, max));
}

function place(
  spot: Rect,
  placement: TourPlacement,
  card: { width: number; height: number },
  gap: number,
): { top: number; left: number } {
  const cx = spot.left + spot.width / 2 - card.width / 2; // 水平居中对齐目标
  const cy = spot.top + spot.height / 2 - card.height / 2; // 垂直居中对齐目标
  switch (placement) {
    case "top":
      return { top: spot.top - card.height - gap, left: cx };
    case "bottom":
      return { top: spot.top + spot.height + gap, left: cx };
    case "left":
      return { top: cy, left: spot.left - card.width - gap };
    case "right":
      return { top: cy, left: spot.left + spot.width + gap };
  }
}

function fits(
  pos: { top: number; left: number },
  card: { width: number; height: number },
  vp: { width: number; height: number },
): boolean {
  return (
    pos.top >= MARGIN &&
    pos.left >= MARGIN &&
    pos.top + card.height <= vp.height - MARGIN &&
    pos.left + card.width <= vp.width - MARGIN
  );
}

/**
 * 由镂空框 + 期望方位 + 卡片尺寸 + 视口算气泡卡定位。
 * 期望方位放不下且对侧放得下 → 翻转到对侧；最后把坐标夹进视口（目标过大时兜底）。
 * 返回实际采用的方位（供箭头/调试）。
 */
export function computeCardPosition(
  spot: Rect,
  placement: TourPlacement,
  card: { width: number; height: number },
  vp: { width: number; height: number },
  gap: number,
): { top: number; left: number; placement: TourPlacement } {
  let actual = placement;
  let pos = place(spot, placement, card, gap);
  if (!fits(pos, card, vp)) {
    const altPlacement = OPPOSITE[placement];
    const alt = place(spot, altPlacement, card, gap);
    if (fits(alt, card, vp)) {
      actual = altPlacement;
      pos = alt;
    }
  }
  return {
    placement: actual,
    left: clamp(pos.left, MARGIN, vp.width - card.width - MARGIN),
    top: clamp(pos.top, MARGIN, vp.height - card.height - MARGIN),
  };
}
