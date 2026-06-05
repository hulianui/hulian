// 弹幕几何 —— 纯函数（无 DOM/React），便于单测。
// 等速模型：所有滚动弹幕同速 → 只要第二条在第一条「完全入场」后才发车，二者永不追尾。

/** 滚动一整段（容器宽 + 弹幕自身宽）所需时长（秒）。speed 单位 px/s。 */
export function scrollDuration(containerWidth: number, itemWidth: number, speed: number): number {
  if (speed <= 0) return 0;
  return (containerWidth + itemWidth) / speed;
}

/**
 * 估算弹幕文本宽度（px）。CJK/全角字符≈fontSize，其余≈0.6×fontSize，再加左右内边距。
 * 用估算而非 DOM 测量 → SSR 安全、可单测、避免布局抖动。
 */
export function estimateWidth(text: string, fontSize: number, padding = 24): number {
  let w = 0;
  for (const ch of text) {
    w += /[　-鿿＀-￯⺀-㏿]/.test(ch) ? fontSize : fontSize * 0.6;
  }
  return Math.ceil(w) + padding;
}

/**
 * 选一条可用轨道。freeAt[i] = 第 i 轨「可再次发车」的时间戳(ms)；now 为当前时间戳。
 * 优先返回首个已空闲(now>=freeAt)的轨道；都忙时返回 -1（由 density 决定丢弃或强挤）。
 */
export function allocateTrack(freeAt: number[], now: number): number {
  for (let i = 0; i < freeAt.length; i++) {
    if (now >= freeAt[i]) return i;
  }
  return -1;
}

/** 都忙时强挤：返回最早空闲（freeAt 最小）的轨道索引。空数组返回 0。 */
export function leastBusyTrack(freeAt: number[]): number {
  if (freeAt.length === 0) return 0;
  let best = 0;
  for (let i = 1; i < freeAt.length; i++) {
    if (freeAt[i] < freeAt[best]) best = i;
  }
  return best;
}

/**
 * 一条弹幕发车后，本轨道「可再次发车」的时间戳(ms)。
 * = 该弹幕完全驶入容器（尾部越过右边界）所需时间 + 安全间隙。
 */
export function trackFreeTime(startAt: number, itemWidth: number, speed: number, gapPx: number): number {
  if (speed <= 0) return startAt;
  return startAt + ((itemWidth + gapPx) / speed) * 1000;
}

/** density → 每轨安全间隙(px)。越大越稀疏。 */
export function densityGap(density: "low" | "normal" | "high"): number {
  switch (density) {
    case "low":
      return 160;
    case "high":
      return 32;
    default:
      return 80;
  }
}
