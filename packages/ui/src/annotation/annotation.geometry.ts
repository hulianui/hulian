import type { AnnotationSide } from "./annotation.types";

/**
 * 箭头画框尺寸（SVG viewBox）。所有 path 都画在这个框里，
 * 定位公式靠 head/tail 两个特征点把框摆到目标周围 —— 不是散落的魔数。
 */
export const ARROW_W = 46;
export const ARROW_H = 38;

/**
 * 一条手绘箭头：主体曲线 + 箭头头（分两段画，线帽 round 才有毛笔起收笔的手感）。
 * head 是「指向目标」那一端在画框内的坐标，tail 是「连向标签」那一端。
 *
 * 曲线取自 syabro/neat-annotations（MIT）—— 手绘曲率是那个库的精华，照搬曲线、
 * 重写定位与渲染方式（真 SVG 元素而非 mask 伪元素，见 annotation.tsx 注释）。
 */
export interface ArrowSpec {
  /** 主体曲线 d */
  stem: string;
  /** 箭头头 d */
  head: string;
  /** 指向目标那端在画框内的坐标 */
  headPoint: readonly [number, number];
  /** 连向标签那端在画框内的坐标 */
  tailPoint: readonly [number, number];
}

/**
 * 八向箭头。键是 **标签所在方位**（与 Tooltip/Popover 的 side 语义一致：
 * side="s" = 注解在目标下方），箭头则从标签指回目标 —— 所以 side="s" 的箭头朝上。
 */
export const ARROWS: Record<AnnotationSide, ArrowSpec> = {
  s: {
    stem: "M23 35 C22 26 22 15 23 4",
    head: "M17 10 L23 3 L29 10",
    headPoint: [23, 3],
    tailPoint: [23, 35],
  },
  n: {
    stem: "M23 4 C22 13 22 24 23 35",
    head: "M17 29 L23 36 L29 29",
    headPoint: [23, 36],
    tailPoint: [23, 4],
  },
  e: {
    stem: "M43 19 C32 18 15 18 3 19",
    head: "M10 13 L3 19 L10 25",
    headPoint: [3, 19],
    tailPoint: [43, 19],
  },
  w: {
    stem: "M4 19 C15 18 31 18 43 19",
    head: "M36 13 L43 19 L36 25",
    headPoint: [43, 19],
    tailPoint: [4, 19],
  },
  se: {
    stem: "M40 32 C30 30 18 18 6 6",
    head: "M16 10 L6 6 L10 16",
    headPoint: [6, 6],
    tailPoint: [40, 32],
  },
  sw: {
    stem: "M6 32 C16 30 28 18 40 6",
    head: "M30 10 L40 6 L36 16",
    headPoint: [40, 6],
    tailPoint: [6, 32],
  },
  ne: {
    stem: "M40 6 C30 8 18 20 6 32",
    head: "M10 22 L6 32 L16 28",
    headPoint: [6, 32],
    tailPoint: [40, 6],
  },
  nw: {
    stem: "M6 6 C16 8 28 20 40 32",
    head: "M36 22 L40 32 L30 28",
    headPoint: [40, 32],
    tailPoint: [6, 6],
  },
};

/** 方位的水平/垂直分量：-1 左/上、0 居中、1 右/下。 */
export function sideVector(side: AnnotationSide): readonly [number, number] {
  const x = side.includes("e") ? 1 : side.includes("w") ? -1 : 0;
  const y = side.startsWith("s") ? 1 : side.startsWith("n") ? -1 : 0;
  return [x, y];
}

/** 对角方位（两个分量都非 0）—— 定位与对齐规则和正方位不同。 */
export function isDiagonal(side: AnnotationSide): boolean {
  const [x, y] = sideVector(side);
  return x !== 0 && y !== 0;
}

export interface GeometryInput {
  side: AnnotationSide;
  /** 目标与箭头头之间的留白（px） */
  gap: number;
  /** 箭头尾与标签之间的留白（px） */
  labelGap: number;
  /** 整体微调（px），沿 side 方向为正 */
  offsetX: number;
  offsetY: number;
}

/** CSS 定位声明：只会出现 left/right 之一与 top/bottom 之一。 */
export interface BoxOffsets {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
}

export interface AnnotationGeometry {
  arrow: BoxOffsets;
  label: BoxOffsets & { transform?: string; textAlign?: "left" | "right" | "center" };
}

/** 把 `calc()` 拼得可读些：0 值不出现在表达式里。 */
function calc(...terms: string[]): string {
  const kept = terms.filter((t) => t !== "");
  return kept.length === 1 ? kept[0] : `calc(${kept.join(" + ")})`;
}

function px(n: number): string {
  return n === 0 ? "" : `${n}px`;
}

/**
 * 算出箭头画框与标签相对目标（position: relative 的 inline-block）的绝对定位。
 *
 * 规则只有两条，八个方位共用：
 * 1. 箭头的 **headPoint 落在目标边界外 gap 处** —— 所以箭头总是恰好指着目标，
 *    换 side 不需要各自调偏移量。
 * 2. 标签接在箭头的 **tailPoint 外侧 labelGap 处**，沿 side 方向继续往外。
 *
 * 用 left/right、top/bottom 的哪一边由 side 分量决定：往右伸的方位用 left 锚定，
 * 往左伸的用 right —— 这样标签变长时只会朝远离目标的方向生长，不会压住目标。
 */
export function annotationGeometry({
  side,
  gap,
  labelGap,
  offsetX,
  offsetY,
}: GeometryInput): AnnotationGeometry {
  const spec = ARROWS[side];
  const [hx, hy] = spec.headPoint;
  const [tx, ty] = spec.tailPoint;
  const [vx, vy] = sideVector(side);
  const diagonal = isDiagonal(side);

  // 箭头首尾在画框内的跨度 —— 标签要越过这段距离才不会压在箭头上。
  const spanX = Math.abs(tx - hx);
  const spanY = Math.abs(ty - hy);

  const arrow: BoxOffsets = {};
  const label: AnnotationGeometry["label"] = {};

  // ---- 水平轴 ----
  if (vx === 0) {
    // 正上/正下：箭头与标签都水平居中于目标
    arrow.left = calc("50%", px(-hx), px(offsetX));
    label.left = calc("50%", px(offsetX));
    label.transform = "translateX(-50%)";
    label.textAlign = "center";
  } else {
    const near = vx > 0 ? "left" : "right";
    // 正左/正右贴的是目标的边，对角贴的是目标的角 —— 都从 100% 起算，
    // 差别只在对角方向上箭头首尾还要跨过 spanX。
    const edge = vx > 0 ? hx : ARROW_W - hx;
    // offset 不乘方向分量：left 与 right 都是「值越大越远离目标」，
    // 再乘一次 -1 会让西侧的 offset 反过来压向目标。
    arrow[near] = calc("100%", px(gap - edge), px(offsetX));
    label[near] = calc(
      "100%",
      px(gap + spanX + (diagonal ? Math.round(labelGap / 2) : labelGap)),
      px(offsetX),
    );
    label.textAlign = vx > 0 ? "left" : "right";
  }

  // ---- 垂直轴 ----
  if (vy === 0) {
    // 正左/正右：箭头与标签都垂直居中于目标
    arrow.top = calc("50%", px(-hy), px(offsetY));
    label.top = calc("50%", px(offsetY));
    label.transform = "translateY(-50%)";
  } else {
    const near = vy > 0 ? "top" : "bottom";
    const edge = vy > 0 ? hy : ARROW_H - hy;
    arrow[near] = calc("100%", px(gap - edge), px(offsetY));
    label[near] = diagonal
      ? calc("100%", px(gap + spanY), px(offsetY))
      : calc("100%", px(gap + spanY + labelGap), px(offsetY));
  }

  return { arrow, label };
}
