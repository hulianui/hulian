// 视差倾斜的纯几何 —— 指针在元素内的归一化位置 (0..1) → 旋转角 / 反光角与强度。
// 组件只管接事件与写 style，算术在这里且可单测（角度算错是这类效果最难肉眼判的 bug）。

export interface TiltAngleOptions {
  /** x 轴最大角（度）。 */
  maxAngleX: number;
  /** y 轴最大角（度）。 */
  maxAngleY: number;
  /** 反向倾斜。 */
  reverse?: boolean;
  /** 只绕单轴倾斜。 */
  axis?: "x" | "y";
}

export interface TiltAngles {
  rotateX: number;
  rotateY: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * 归一化指针位置 → 旋转角。
 * 约定：指针在**上**半区时 rotateX 为正（顶边朝观察者压来），指针在**右**半区时 rotateY 为正，
 * 与 CSS `rotateX/rotateY` 的手感一致；`reverse` 整体取反。
 */
export function tiltAngles(
  px: number,
  py: number,
  { maxAngleX, maxAngleY, reverse = false, axis }: TiltAngleOptions,
): TiltAngles {
  const x = clamp01(px);
  const y = clamp01(py);
  const sign = reverse ? -1 : 1;
  const rotateX = axis === "y" ? 0 : (0.5 - y) * 2 * maxAngleX * sign;
  const rotateY = axis === "x" ? 0 : (x - 0.5) * 2 * maxAngleY * sign;
  return { rotateX, rotateY };
}

export interface GlareOptions {
  /** 反光最大不透明度。 */
  maxOpacity: number;
  /** 反光方向取反。 */
  reverse?: boolean;
}

export interface GlareState {
  /** 反光渐变的角度（度），可直接喂 linear-gradient。 */
  angle: number;
  /** 当前不透明度。 */
  opacity: number;
}

/**
 * 归一化指针位置 → 反光渐变角与强度。
 * 角度指向「指针的反方向」（光从指针那侧照过来），强度随离中心的距离线性增长——
 * 指针停在正中时反光最弱，最符合真实高光的直觉。
 */
export function glareState(
  px: number,
  py: number,
  { maxOpacity, reverse = false }: GlareOptions,
): GlareState {
  const x = clamp01(px) - 0.5;
  const y = clamp01(py) - 0.5;
  const deg = (Math.atan2(y, x) * 180) / Math.PI - 90;
  const angle = ((reverse ? deg + 180 : deg) % 360 + 360) % 360;
  // 半径按中心到角落（0.707）归一，指针到角上时才吃满强度。
  const dist = Math.min(1, Math.hypot(x, y) / Math.SQRT1_2);
  return { angle, opacity: dist * maxOpacity };
}

/** 元素内指针位置 → 归一化 (0..1)；尺寸为 0（未布局）时回落到中心，不产出 NaN。 */
export function normalizePointer(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): [number, number] {
  const x = rect.width > 0 ? (clientX - rect.left) / rect.width : 0.5;
  const y = rect.height > 0 ? (clientY - rect.top) / rect.height : 0.5;
  return [clamp01(x), clamp01(y)];
}
