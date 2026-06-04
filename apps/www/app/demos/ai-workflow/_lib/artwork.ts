// 程序化"AI 产物"生成 —— 由 seed 确定性派生网格渐变（mesh gradient），离线零素材、暗色无关（产物本就鲜艳）。
// demo 不接真实生图服务，用它把"生成结果"具象成一张张好看且稳定的图，刷新不变。

/** 确定性伪随机（mulberry32），同 seed 同序列 → SSR/CSR 一致。 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 由 seed 生成一张和谐的网格渐变"画作"的 CSS background 值。
 * 用**邻近色系**（base 及 ±28/±55°，绝不互补，避免中心混成脏灰）+ 4 个柔和大色斑 + 同系中明度底色，
 * 出片像高级渐变壁纸/专辑封面，而非彩虹噪点。
 */
export function meshGradient(seed: number): string {
  const rnd = mulberry32(seed * 2654435761);
  const base = Math.floor(rnd() * 360);
  const hues = [base, (base + 28) % 360, (base + 332) % 360, (base + 55) % 360];
  const positions: [number, number][] = [
    [18 + rnd() * 14, 18 + rnd() * 14],
    [70 + rnd() * 16, 16 + rnd() * 16],
    [76 + rnd() * 16, 72 + rnd() * 16],
    [18 + rnd() * 16, 74 + rnd() * 14],
  ];
  const stops = positions.map(([x, y], i) => {
    const s = 70 + Math.floor(rnd() * 12); // 70-82：鲜亮不刺眼
    const l = 58 + Math.floor(rnd() * 10); // 58-68：通透明亮
    return `radial-gradient(58% 58% at ${x.toFixed(1)}% ${y.toFixed(1)}%, hsl(${hues[i]} ${s}% ${l}%) 0%, transparent 72%)`;
  });
  const baseColor = `hsl(${base} 58% ${48 + Math.floor(rnd() * 8)}%)`; // 同系中明度，中心不发灰
  return `${stops.join(", ")}, ${baseColor}`;
}

/** 由 seed 派生一个稳定的 6 位"种子号"展示串。 */
export function seedLabel(seed: number): string {
  return String(Math.abs(Math.floor(seed)) % 1_000_000).padStart(6, "0");
}

/** 客户端新建节点时生成一个随机 seed（仅在交互中调用，避免 SSR/CSR 不一致）。 */
export function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}
