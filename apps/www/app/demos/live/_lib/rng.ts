// 确定性伪随机（mulberry32）：同 seed 同序列 → 模拟内容可复现（截图/测试稳定）。
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 由 seed 在数组里确定性取一项。 */
export function pickSeeded<T>(arr: T[], seed: number): T {
  const r = mulberry32(seed * 2654435761);
  return arr[Math.floor(r() * arr.length)];
}
