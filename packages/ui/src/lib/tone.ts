// 颜色色调归一器：组件的 color/tone 属性统一过这里，吃语义 token 单一真源。
//
// 三种入参形态：
//  1) 语义色名 —— "primary" / "success" / "warning" / "danger" / "chart-1".."chart-6" 等
//     → 解析为 var(--color-<name>)。这是推荐写法，免去调用方手写 CSS 变量名。
//  2) 漏写 --color- 前缀的变量 —— var(--primary) / var(--chart-2)（Tailwind v4 @theme 真名带
//     --color- 前缀，裸 var(--primary) 在 SVG fill/stroke 里解析不到 → 回退黑色）。这是反复踩的坑，
//     这里对已知 token 做容错补全 var(--primary) → var(--color-primary)。
//  3) 其余任意 CSS 颜色 —— #hex / rgb() / oklch() / currentColor / 已带前缀的 var(--color-*)
//     → 原样透传（逃生舱）。

const NAMED = new Set([
  "primary",
  "primary-foreground",
  "success",
  "warning",
  "danger",
  "info",
  "brand",
  "muted",
  "foreground",
  "border",
  "ring",
  "surface",
  "surface-hover",
  "background",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
]);

/**
 * 把语义色名 / 漏前缀变量解析为可直接喂给 SVG fill·stroke·CSS color 的颜色值。
 * 入参为空返回 undefined（让组件套用自身默认色）。
 */
export function resolveTone(tone?: string): string | undefined {
  if (!tone) return undefined;
  const t = tone.trim();
  // 语义名
  if (NAMED.has(t)) return `var(--color-${t})`;
  // 漏前缀的 var(--xxx) 容错（仅限已知 token，且未带 color- 前缀）
  const bare = t.match(/^var\(\s*--([a-z0-9-]+)\s*\)$/i);
  if (bare && NAMED.has(bare[1])) return `var(--color-${bare[1]})`;
  // 其余原样透传
  return t;
}
