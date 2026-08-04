// 占位图 —— 程序化生成的 data-URI SVG，零网络请求。
//
// 为什么不用 picsum.photos / unsplash：断网、内网、被墙即碎图，演示当场失效；而且随机图
// 与文案语义不符。demos 那边早有铁律「资源全本地化，零外链」并由 demos:coverage 门禁强制，
// 但那条门禁管不到 packages/ui —— 于是同一个反模式在组件里留了 11 处，其中
// `DecayCard` 的还是**默认 prop**：消费方 `<DecayCard />` 什么都不传就会打一次外网。
//
// data-URI 里解析不了 `var(--color-chart-*)`，所以这里用与 chart token 同色系的固定值。
// 占位图只是演示素材，不参与主题联动；真要跟随主题的背景请用 CSS 渐变而不是 <img>。
const PALETTE: readonly (readonly [string, string])[] = [
  ["#6366f1", "#a855f7"],
  ["#0ea5e9", "#22d3ee"],
  ["#10b981", "#84cc16"],
  ["#f59e0b", "#f97316"],
  ["#ec4899", "#f43f5e"],
  ["#8b5cf6", "#6366f1"],
];

/** 稳定哈希：同一 seed 在任何环境都取到同一组配色（SSR 与 hydration 必须一致）。 */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * 生成一张确定性的渐变占位图（data-URI SVG）。
 *
 * @param seed 决定配色与图案，同 seed 必得同图
 * @param width 像素宽
 * @param height 像素高
 * @param options.grayscale 去色，用于需要中性底的场景（如 DecayCard 的位移滤镜）
 */
export function demoImage(
  seed: string,
  width: number,
  height: number,
  options: { grayscale?: boolean } = {},
): string {
  const n = hash(seed);
  const [from, to] = options.grayscale
    ? (["#9ca3af", "#4b5563"] as const)
    : PALETTE[n % PALETTE.length];
  const angle = n % 180;
  // 两个错位的柔光圆斑，让占位图有明暗层次而不是一块死渐变（DecayCard 的位移滤镜需要纹理）
  const cx = 20 + (n % 60);
  const cy = 25 + ((n >> 3) % 50);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none">` +
    `<defs><linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)">` +
    `<stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>` +
    `</linearGradient>` +
    `<radialGradient id="s"><stop offset="0%" stop-color="#fff" stop-opacity=".45"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
    `</defs>` +
    `<rect width="100" height="100" fill="url(#g)"/>` +
    `<circle cx="${cx}" cy="${cy}" r="38" fill="url(#s)"/>` +
    `<circle cx="${100 - cx}" cy="${100 - cy}" r="26" fill="url(#s)" opacity=".7"/>` +
    `</svg>`;
  // encodeURIComponent 而不是 base64：体积更小，且 diff 里看得懂
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
