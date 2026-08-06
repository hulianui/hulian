import type { ComponentPickerItem } from "./component-picker.types";

/**
 * 组件名场景专用的模糊匹配打分器（**零依赖，不引 fuse.js**）。
 *
 * 为什么自己写：通用模糊库把「组件 slug」和「一段中文描述」同等看待，结果是
 * 搜 `btn` 时某条描述里恰好散落着 b/t/n 的组件排到 Button 前面。这里的判据是
 * 「身份字段（slug / name）命中远重于辅助字段（description / tags）命中」，
 * 外加连续命中、词首命中、覆盖率三项加权——几十行就能调得比通用库准。
 */

/** 词首：串首、非字母数字之后、或 camelCase 的大写拐点。 */
function isBoundary(text: string, index: number): boolean {
  if (index === 0) return true;
  const prev = text[index - 1]!;
  const cur = text[index]!;
  if (!/[a-zA-Z0-9]/.test(prev)) return true;
  return /[a-z0-9]/.test(prev) && /[A-Z]/.test(cur);
}

export interface FuzzyMatch {
  /** 越大越相关；同一 query 下可跨文本比较。 */
  score: number;
  /** 命中字符在 text 中的下标（升序），供高亮用。 */
  indices: number[];
}

const BASE = 60;
const BOUNDARY_BONUS = 18;
const CONTIGUOUS_BONUS = 16;
const LEAD_PENALTY = 2;
const GAP_PENALTY = 3;
const COVERAGE_WEIGHT = 40;
const PREFIX_BONUS = 90;
const EXACT_BONUS = 400;

/**
 * 优先在词首落子的贪心子序列扫描。
 * 词首优先可能把后续字符逼进死路（`ab` 对 `xay b a`：`a` 落到词首那个就找不到 `b` 了），
 * 所以调用方在它返回 null 时必须再跑一次 `scanPlain`——那条路径不会漏判。
 */
function scanPreferBoundary(q: string, lower: string, text: string): number[] | null {
  const indices: number[] = [];
  let from = 0;
  for (const ch of q) {
    let found = -1;
    let firstAny = -1;
    for (let j = from; j < lower.length; j++) {
      if (lower[j] !== ch) continue;
      if (firstAny < 0) firstAny = j;
      if (isBoundary(text, j)) {
        found = j;
        break;
      }
      if (indices.length > 0 && j === indices[indices.length - 1]! + 1) {
        found = j;
        break;
      }
    }
    if (found < 0) found = firstAny;
    if (found < 0) return null;
    indices.push(found);
    from = found + 1;
  }
  return indices;
}

/** 最左贪心：只要是子序列就一定能匹配上，不会漏判。 */
function scanPlain(q: string, lower: string): number[] | null {
  const indices: number[] = [];
  let from = 0;
  for (const ch of q) {
    const at = lower.indexOf(ch, from);
    if (at < 0) return null;
    indices.push(at);
    from = at + 1;
  }
  return indices;
}

function scoreIndices(q: string, lower: string, text: string, indices: number[]): number {
  let score = BASE - Math.min(indices[0]!, 10) * LEAD_PENALTY;
  for (let k = 0; k < indices.length; k++) {
    if (isBoundary(text, indices[k]!)) score += BOUNDARY_BONUS;
    if (k > 0) {
      const gap = indices[k]! - indices[k - 1]! - 1;
      if (gap === 0) score += CONTIGUOUS_BONUS;
      else score -= Math.min(gap, 6) * GAP_PENALTY;
    }
  }
  // 覆盖率：同样命中，短文本比长文本更相关（`btn` 在 `button` 里比在整段描述里重要）
  score += Math.round((q.length / lower.length) * COVERAGE_WEIGHT);
  if (lower === q) score += EXACT_BONUS;
  else if (lower.startsWith(q)) score += PREFIX_BONUS;
  return Math.max(score, 1);
}

/**
 * 单段文本的模糊匹配。大小写无关；不匹配返回 `null`（区别于分数 0）。
 * 空 query 视为「无条件命中」，返回 `{ score: 0, indices: [] }`。
 */
export function fuzzyMatch(query: string, text: string): FuzzyMatch | null {
  const q = query.toLowerCase();
  if (q.length === 0) return { score: 0, indices: [] };
  if (text.length === 0) return null;
  const lower = text.toLowerCase();
  const indices = scanPreferBoundary(q, lower, text) ?? scanPlain(q, lower);
  if (indices === null) return null;
  return { score: scoreIndices(q, lower, text, indices), indices };
}

function best(query: string, texts: (string | undefined)[]): number {
  let top = 0;
  for (const t of texts) {
    if (!t) continue;
    const m = fuzzyMatch(query, t);
    if (m && m.score > top) top = m.score;
  }
  return top;
}

/** 辅助字段（描述 / 标签 / 分类）的折价系数——身份字段没命中时只剩这点分。 */
const AUX_WEIGHT = 0.25;
/** 身份字段已命中时，辅助字段只作微弱加权，用来在同分里排个先后。 */
const AUX_TIEBREAK = 0.1;
/** slug 全等 / 名字全等的硬置顶，保证「精确 slug 一定排第一」。 */
const EXACT_SLUG = 10_000;
const EXACT_NAME = 5_000;

/**
 * 单条目打分。多词 query 按空格切分，**AND 语义**：任一词全字段不命中即淘汰（返回 0）。
 * 空 query 返回 0（由 `rankComponents` 走「保持原序、不过滤」的分支）。
 */
export function scoreComponent(item: ComponentPickerItem, query: string): number {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return 0;

  let total = 0;
  for (const term of q.split(/\s+/)) {
    const identity = best(term, [item.slug, item.name]);
    const aux = best(term, [item.description, item.category, item.group, ...(item.tags ?? [])]);
    const termScore = identity > 0 ? identity + aux * AUX_TIEBREAK : aux * AUX_WEIGHT;
    if (termScore <= 0) return 0;
    total += termScore;
  }

  if (item.slug.toLowerCase() === q) total += EXACT_SLUG;
  else if (item.name.toLowerCase() === q) total += EXACT_NAME;
  return total;
}

export interface RankedComponent {
  item: ComponentPickerItem;
  /** 空 query 时恒为 0。 */
  score: number;
}

export interface RankOptions {
  /** 截断长度（不传不截）。 */
  limit?: number;
}

/**
 * 排序 + 过滤。空 query 时**保持 `items` 原序**（浏览目录时顺序应当是稳定的，
 * 不该被打分器重排）；有 query 时按分降序，同分按原序（稳定排序）。
 */
export function rankComponents(
  items: ComponentPickerItem[],
  query: string,
  options: RankOptions = {},
): RankedComponent[] {
  const { limit } = options;
  const q = query.trim();
  if (q.length === 0) {
    const all = items.map((item) => ({ item, score: 0 }));
    return limit == null ? all : all.slice(0, limit);
  }
  const hits: { item: ComponentPickerItem; score: number; index: number }[] = [];
  for (let i = 0; i < items.length; i++) {
    const score = scoreComponent(items[i]!, q);
    if (score > 0) hits.push({ item: items[i]!, score, index: i });
  }
  hits.sort((a, b) => b.score - a.score || a.index - b.index);
  const ranked = hits.map(({ item, score }) => ({ item, score }));
  return limit == null ? ranked : ranked.slice(0, limit);
}
