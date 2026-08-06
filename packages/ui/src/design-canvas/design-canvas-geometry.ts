import type {
  DesignCanvasBounds,
  DesignCanvasPoint,
  DesignCanvasRect,
  DesignCanvasResizeDirection,
  DesignCanvasViewport,
} from "./design-canvas.types";

// DesignCanvas 几何 —— 纯函数（无 DOM / React），便于单测。
//
// 视口数学（screenToCanvas / zoomAtPoint / clampZoom）刻意**不重写**：Flow 已经有一份带单测的实现，
// 坐标约定（屏幕点 = 世界点 * zoom + pan）也完全相同。两个画布若各自维护一份指针锚定缩放，
// 迟早漂移成「Flow 滚轮跟手、DesignCanvas 差半像素」这种没道理可讲的差异。
// 这里从 `../flow/flow-geometry` 直接取那个模块（不是从 `../flow` 的 index 取），
// 避免为了三个纯函数把整个 Flow 组件拖进模块图。
//
// 本文件只写 DesignCanvas 独有的部分：反向变换、吸附、矩形归一、八向 resize（含负宽高翻转）、多元素包围盒。
// 这些名字与 Flow 的导出零重叠 —— 主 barrel 是 `export *`，重名会在那里撞车。

/** 世界坐标 → 屏幕坐标（相对容器左上角）。Flow 只提供了反方向，这里补齐。 */
export function canvasToScreen(point: DesignCanvasPoint, vp: DesignCanvasViewport): DesignCanvasPoint {
  return {
    x: point.x * vp.zoom + vp.x,
    y: point.y * vp.zoom + vp.y,
  };
}

/** 按步长吸附到网格。step <= 0（或非有限）时原样返回，调用方无需先判空。 */
export function snapTo(value: number, step: number): number {
  if (!Number.isFinite(step) || step <= 0) return value;
  return Math.round(value / step) * step;
}

/** 把可能为负宽高的矩形归一成「左上角 + 非负宽高」。resize 翻转的收尾都走它。 */
export function normalizeRect(rect: DesignCanvasRect): DesignCanvasRect {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;
  return { x, y, width: Math.abs(rect.width), height: Math.abs(rect.height) };
}

/** 平移矩形（世界单位增量）。snap > 0 时吸附**左上角**，尺寸不变——避免拖动中途尺寸被吸附偷改。 */
export function moveRect(
  rect: DesignCanvasRect,
  dx: number,
  dy: number,
  snap = 0,
): DesignCanvasRect {
  return {
    x: snapTo(rect.x + dx, snap),
    y: snapTo(rect.y + dy, snap),
    width: rect.width,
    height: rect.height,
  };
}

export interface ResizeRectOptions {
  /** 最小宽 / 高（世界单位）。默认 1。 */
  minWidth?: number;
  minHeight?: number;
  /** 吸附步长（只吸附**被拖动的那条边**，锚定边纹丝不动）。默认 0。 */
  snap?: number;
}

/**
 * 八向 resize：只移动 direction 指定的边，对边作为锚点不动。
 *
 * 越过锚定边时**允许翻转**（与 Figma / Sketch 一致）：矩形不是卡死在最小尺寸，而是翻到另一侧继续长大。
 * 实现上先算出可能为负的宽高，再按符号施加最小尺寸，最后 normalizeRect 归一 ——
 * 若先归一再限最小尺寸，翻转的瞬间矩形会「粘」在锚定边上抖动。
 *
 * dx/dy 是**世界单位**增量（屏幕像素请先除以 zoom）。
 */
export function resizeRect(
  rect: DesignCanvasRect,
  direction: DesignCanvasResizeDirection,
  dx: number,
  dy: number,
  options: ResizeRectOptions = {},
): DesignCanvasRect {
  const minWidth = options.minWidth ?? 1;
  const minHeight = options.minHeight ?? 1;
  const snap = options.snap ?? 0;

  let left = rect.x;
  let right = rect.x + rect.width;
  let top = rect.y;
  let bottom = rect.y + rect.height;

  const movesWest = direction.includes("w");
  const movesEast = direction.includes("e");
  const movesNorth = direction.includes("n");
  const movesSouth = direction.includes("s");

  if (movesWest) left = snapTo(left + dx, snap);
  if (movesEast) right = snapTo(right + dx, snap);
  if (movesNorth) top = snapTo(top + dy, snap);
  if (movesSouth) bottom = snapTo(bottom + dy, snap);

  // 最小尺寸沿「远离锚定边」的方向施加，翻转后同样成立（signed 宽高保号）。
  if (movesWest || movesEast) {
    const signed = right - left;
    if (Math.abs(signed) < minWidth) {
      const sign = signed < 0 ? -1 : 1;
      if (movesWest) left = right - minWidth * sign;
      else right = left + minWidth * sign;
    }
  }
  if (movesNorth || movesSouth) {
    const signed = bottom - top;
    if (Math.abs(signed) < minHeight) {
      const sign = signed < 0 ? -1 : 1;
      if (movesNorth) top = bottom - minHeight * sign;
      else bottom = top + minHeight * sign;
    }
  }

  return normalizeRect({ x: left, y: top, width: right - left, height: bottom - top });
}

/** 多元素包围盒（世界坐标）。空数组返回 null。结果可直接喂 Flow 的 fitViewport。 */
export function itemsBounds(rects: DesignCanvasRect[]): DesignCanvasBounds | null {
  if (rects.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    const n = normalizeRect(r);
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  }
  return { minX, minY, maxX, maxY };
}
