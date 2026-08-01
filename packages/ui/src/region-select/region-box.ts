// 框选的纯几何 —— 指针坐标 → 原图像素框。组件只管画与接事件，算术在这里且可单测。
//
// 坐标系只有一个：**原图像素**。存进库的框要能直接喂给服务端裁图，所以既不是容器像素
// 也不是百分比。渲染侧用 <svg viewBox="0 0 naturalW naturalH"> 打底，画框零换算；
// 只有「指针 → 图像素」这一个方向要按 getBoundingClientRect() 折算。

/** [x1, y1, x2, y2]，原图像素，左上闭右下开；恒满足 x1<x2 且 y1<y2。 */
export type RegionBox = [number, number, number, number];

export interface RegionRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * 屏幕坐标 → 原图像素坐标（含钳位到图内）。
 * rect 是画布（<svg>）的 getBoundingClientRect()；naturalW/H 是图的自然尺寸。
 * 画布可能被 CSS 缩放到任意大小，故按两轴各自的缩放比折算。
 */
export function toImagePoint(
  clientX: number,
  clientY: number,
  rect: RegionRect,
  naturalW: number,
  naturalH: number,
): [number, number] {
  // 画布尺寸为 0（未布局完）时不做除法，直接落原点，避免 Infinity/NaN 渗进框里。
  const sx = rect.width > 0 ? naturalW / rect.width : 0;
  const sy = rect.height > 0 ? naturalH / rect.height : 0;
  return [
    clamp((clientX - rect.left) * sx, 0, naturalW),
    clamp((clientY - rect.top) * sy, 0, naturalH),
  ];
}

/** 两点 → 规范化框：反向拖（从右下往左上）也成立。 */
export function normalizeBox(
  [ax, ay]: [number, number],
  [bx, by]: [number, number],
): RegionBox {
  return [Math.min(ax, bx), Math.min(ay, by), Math.max(ax, bx), Math.max(ay, by)];
}

/**
 * 按固定宽高比修正框：以起点为锚，取「当前拖出的宽高中较大的一边」定尺寸，
 * 另一边按比例推出，方向跟随拖拽方向；再整体钳回图内。
 * aspect = 宽/高。
 */
export function applyAspect(
  anchor: [number, number],
  point: [number, number],
  aspect: number,
  naturalW: number,
  naturalH: number,
): RegionBox {
  const dx = point[0] - anchor[0];
  const dy = point[1] - anchor[1];
  const signX = dx < 0 ? -1 : 1;
  const signY = dy < 0 ? -1 : 1;
  let w = Math.abs(dx);
  let h = Math.abs(dy);
  if (w / aspect >= h) h = w / aspect;
  else w = h * aspect;
  // 钳位：先按边界能容纳的最大尺寸缩，再定点，保证比例不被单轴钳位破坏。
  const maxW = signX > 0 ? naturalW - anchor[0] : anchor[0];
  const maxH = signY > 0 ? naturalH - anchor[1] : anchor[1];
  const scale = Math.min(1, maxW > 0 ? maxW / w : 0, maxH > 0 ? maxH / h : 0);
  w *= scale;
  h *= scale;
  const x2 = anchor[0] + signX * w;
  const y2 = anchor[1] + signY * h;
  return normalizeBox(anchor, [x2, y2]);
}

/** 框的短边（像素）——用来判「误点」。 */
export function boxMinSide(box: RegionBox): number {
  return Math.min(box[2] - box[0], box[3] - box[1]);
}

/**
 * 描边宽度按图宽给：3000px 宽的扫描页上 2px 的线细到看不见。
 * 返回的是**图像素**宽度（画在 viewBox 坐标系里）。
 */
export function strokeWidthFor(naturalW: number): number {
  return Math.max(2, naturalW / 400);
}
