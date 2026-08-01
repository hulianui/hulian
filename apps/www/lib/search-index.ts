// 全站搜索索引 —— 跨 页面 / 区块 / 组件 / 模版 / 指南 的统一检索真源。
//
// 为什么要有这层：站内此前只有 ComponentTree 里那个输入框，它 (a) 只搜 component，
// (b) 只过滤侧栏树、不动正文的 363 张卡片。于是「用户 管理 列表」这种**业务任务**查询
// 会得到「无匹配组件」，而站里其实躺着 /pages/admin-list、/blocks/data-table 和 ProTable。
//
// 本模块零 @hulianui/ui import、零 fs、零 server-only API —— 全部从既有的纯数据 SSOT
// 组装（manifest / blocks _meta / pages _meta / demos / theme-manifest），
// 所以 server 组件与 client 面板可以共读同一份，不会漂。

import { manifest, CATEGORIES } from "./manifest";
import { THEME_NAV } from "./theme-manifest";
import { blocks, CATEGORY_LABEL as BLOCK_CATEGORY_LABEL } from "../app/blocks/_meta";
import { pages, CATEGORY_LABEL as PAGE_CATEGORY_LABEL } from "../app/pages/_meta";
import { demos } from "../app/demos/lib/demos";

export type DocType = "page" | "block" | "component" | "demo" | "guide";

export interface SearchDoc {
  /** 全局唯一（type 前缀避免 slug 跨类型撞车）。 */
  id: string;
  type: DocType;
  /** 展示名，中文优先。 */
  title: string;
  /** 英文名 / 主导出名（组件有，其余可空）。 */
  en?: string;
  href: string;
  description: string;
  /** 分类 key，用于筛选。 */
  category?: string;
  /** 分类中文名，同时并入检索词。 */
  categoryLabel?: string;
  /** 附加检索词（tags、小类名等）。 */
  keywords: string[];
}

export const TYPE_LABEL: Record<DocType, string> = {
  page: "页面",
  block: "区块",
  component: "组件",
  demo: "模版",
  guide: "指南",
};

/**
 * 结果分组顺序。业务任务查询（「用户管理列表」）要的是**可直接复用的高层积木**，
 * 拿到整页/区块就少写一天；先甩 363 个低层组件等于没答。故 页面 → 区块 → 组件 → 模版 → 指南。
 */
export const TYPE_ORDER: DocType[] = ["page", "block", "component", "demo", "guide"];

/** 同分时的层级加权，理由同 TYPE_ORDER。 */
const TYPE_WEIGHT: Record<DocType, number> = {
  page: 3,
  block: 2.4,
  demo: 1.6,
  component: 1,
  guide: 0.9,
};

// 组件中文名藏在 description 的首段（"整页布局 · 复合 Header/..."），与 ComponentTree 同款取法。
const nameCn = (description: string) => description.split(" · ")[0].trim();

const groupLabel = (categoryKey: string, groupKey: string) =>
  CATEGORIES.find((c) => c.key === categoryKey)?.groups.find((g) => g.key === groupKey)?.label ?? "";

const categoryLabelOf = (key: string) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

function componentDocs(): SearchDoc[] {
  return manifest.map((m) => ({
    id: `component:${m.slug}`,
    type: "component" as const,
    title: nameCn(m.description),
    en: m.name,
    href: `/components/${m.slug}`,
    description: m.description,
    category: m.category,
    categoryLabel: categoryLabelOf(m.category),
    keywords: [m.slug, groupLabel(m.category, m.group), ...(m.tags ?? [])].filter(Boolean),
  }));
}

function blockDocs(): SearchDoc[] {
  return blocks.map((b) => ({
    id: `block:${b.slug}`,
    type: "block" as const,
    title: b.name,
    href: `/blocks/${b.slug}`,
    description: b.description,
    category: b.category,
    categoryLabel: BLOCK_CATEGORY_LABEL[b.category],
    keywords: [b.slug, ...b.tags, ...b.installation.slots],
  }));
}

function pageDocs(): SearchDoc[] {
  return pages.map((p) => ({
    id: `page:${p.slug}`,
    type: "page" as const,
    title: p.name,
    href: `/pages/${p.slug}`,
    description: p.description,
    category: p.category,
    categoryLabel: PAGE_CATEGORY_LABEL[p.category],
    // slots 就是这页递归依赖的区块名，把它并进检索词 → 搜「data-table」也能命中整页。
    keywords: [p.slug, ...p.tags, ...p.installation.slots],
  }));
}

function demoDocs(): SearchDoc[] {
  return demos.map((d) => ({
    id: `demo:${d.slug}`,
    type: "demo" as const,
    title: d.title,
    href: d.href,
    description: d.description,
    category: d.category,
    categoryLabel: d.category,
    keywords: [d.slug, ...d.tags],
  }));
}

function guideDocs(): SearchDoc[] {
  const themed: SearchDoc[] = THEME_NAV.map((t) => ({
    id: `guide:theme-${t.slug || "overview"}`,
    type: "guide" as const,
    title: `${t.label}`,
    en: t.en,
    href: t.slug ? `/theme/${t.slug}` : "/theme",
    description: t.blurb,
    category: "theme",
    categoryLabel: "主题",
    keywords: ["theme", "token", "设计令牌", t.slug].filter(Boolean),
  }));
  return [
    {
      id: "guide:start",
      type: "guide",
      title: "开始使用",
      en: "Start",
      href: "/start",
      description: "安装、按需引入、registry 安装单件、MCP 接入、llms.txt 与 guard 门禁。",
      category: "start",
      categoryLabel: "上手",
      keywords: ["install", "安装", "mcp", "registry", "llms", "guard", "shadcn", "getting started"],
    },
    {
      id: "guide:changelog",
      type: "guide",
      title: "更新日志",
      en: "Changelog",
      href: "/changelog",
      description: "各版本新增组件、修复与破坏性变更。",
      category: "changelog",
      categoryLabel: "版本",
      keywords: ["changelog", "release", "版本", "升级"],
    },
    ...themed,
  ];
}

/** 全站索引。模块级常量：构建期定型，不在渲染里重算。 */
export const searchDocs: SearchDoc[] = [
  ...pageDocs(),
  ...blockDocs(),
  ...componentDocs(),
  ...demoDocs(),
  ...guideDocs(),
];

/**
 * 分词。中文不分词、按空白切即可 —— 用户输的「用户 管理 列表」本来就是空格分隔的任务描述；
 * 不切的话整串当子串匹配，任何文档都命不中，这正是旧搜索框的失败方式。
 */
export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,、，/]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** 字段权重：命中标题最值钱，命中描述最便宜。 */
const FIELD_WEIGHT = { title: 6, en: 5, keywords: 3, category: 2, description: 1 } as const;

/**
 * 单个 token 对一篇文档的得分。0 = 未命中。
 *
 * 除子串匹配外还有一条**导出名/hook 名**的路子：复合导出名按前/后缀命中其组件
 * （`LayoutSider` → Layout，`useToast` → Toast）。
 * 这里刻意不用「token 里含 en 即命中」——那样 `Tag` 会被 `advantage` 吸走；
 * 而真实的复合导出名总是把组件名放在词首或词尾，前后缀判据既够用又不误伤。
 */
export function scoreToken(doc: SearchDoc, token: string): number {
  const title = doc.title.toLowerCase();
  const en = (doc.en ?? "").toLowerCase();
  if (title.includes(token)) return FIELD_WEIGHT.title;
  if (en) {
    const compound =
      en.length >= 3 && token.length > en.length && (token.startsWith(en) || token.endsWith(en));
    if (en.includes(token) || compound) return FIELD_WEIGHT.en;
  }
  if (doc.keywords.some((k) => k.toLowerCase().includes(token))) return FIELD_WEIGHT.keywords;
  if ((doc.categoryLabel ?? "").toLowerCase().includes(token)) return FIELD_WEIGHT.category;
  if (doc.description.toLowerCase().includes(token)) return FIELD_WEIGHT.description;
  return 0;
}

/**
 * 文档总分。命中的 token **越多越靠前**（覆盖率优先于单点强度）：
 * 「用户 管理 列表」里命中两词的整页，要压过只命中「列表」一词的某个小组件。
 * 返回 0 表示一个 token 都没命中 —— 调用方据此剔除。
 */
export function scoreDoc(doc: SearchDoc, tokens: string[]): number {
  if (tokens.length === 0) return TYPE_WEIGHT[doc.type];
  let sum = 0;
  let hits = 0;
  for (const token of tokens) {
    const s = scoreToken(doc, token);
    if (s > 0) {
      hits += 1;
      sum += s;
    }
  }
  if (hits === 0) return 0;
  const coverage = hits / tokens.length;
  return (sum + coverage * 24) * TYPE_WEIGHT[doc.type];
}

export interface SearchFilters {
  /** 限定类型；空 = 全部。 */
  type?: DocType | null;
  /** 限定分类 key；空 = 全部。仅在 type 确定时有意义（各类型 category 空间不同）。 */
  category?: string | null;
  /** 截断条数。 */
  limit?: number;
}

export interface SearchHit extends SearchDoc {
  score: number;
  /** 全文里 token 的出现次数，用作同分时的次级排序键。 */
  tf: number;
}

/**
 * 词频：token 在标题 / 英文名 / 关键词 / 描述里一共出现多少次。
 *
 * 只作**同分时的次级排序键**，不并进主分数 —— 并进去会打乱「命中标题 > 命中描述」
 * 这条主序，而它是对的。
 *
 * 为什么需要它：CJK 里两三个字的通用词（"列表""管理"）撞名极其频繁，于是一大批组件
 * 会拿到完全一样的分数，此时原本是按标题拼音排 —— 纯噪音。搜「用户 管理 列表」时
 * ProTable（描述里"列表页"出现两次、且写明是中后台列表页旗舰）就这样被
 * DiffStat / SecretField 这些只蹭到一次的挤到后面去了。
 */
export function termFrequency(doc: SearchDoc, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const hay = [doc.title, doc.en ?? "", doc.keywords.join(" "), doc.description]
    .join(" ")
    .toLowerCase();
  return tokens.reduce((n, token) => n + (hay.split(token).length - 1), 0);
}

/** 排序：分高优先 → 词频高优先 → 类型层级序 → 标题，保证结果稳定（不随数组顺序漂）。 */
export function searchAll(query: string, filters: SearchFilters = {}): SearchHit[] {
  const tokens = tokenize(query);
  const hits: SearchHit[] = [];
  for (const doc of searchDocs) {
    if (filters.type && doc.type !== filters.type) continue;
    if (filters.category && doc.category !== filters.category) continue;
    const score = scoreDoc(doc, tokens);
    if (score <= 0) continue;
    hits.push({ ...doc, score, tf: termFrequency(doc, tokens) });
  }
  hits.sort(
    (a, b) =>
      b.score - a.score ||
      b.tf - a.tf ||
      TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) ||
      a.title.localeCompare(b.title, "zh-Hans-CN"),
  );
  return filters.limit ? hits.slice(0, filters.limit) : hits;
}

/**
 * 一个 token 都没命中时的近似候选：逐步截短各 token 做前缀放宽（尾字打错/多打是最常见的输入错误）。
 * 返回可用的放宽查询串，没有就返回 null —— 调用方据此决定是展示「近似结果」还是纯空态。
 */
export function relaxQuery(query: string): string | null {
  const tokens = tokenize(query);
  if (tokens.length === 0) return null;
  const original = tokens.join(" ");
  for (let cut = 1; cut <= 2; cut += 1) {
    const relaxed = tokens.map((t) => (t.length > cut + 1 ? t.slice(0, t.length - cut) : t)).join(" ");
    if (relaxed !== original && searchAll(relaxed, { limit: 1 }).length > 0) return relaxed;
  }
  return null;
}

/** 按 TYPE_ORDER 分组（组内保持 searchAll 的相关度序），供面板与搜索页共用。 */
export function groupByType(hits: SearchHit[]): Array<{ type: DocType; hits: SearchHit[] }> {
  return TYPE_ORDER.map((type) => ({ type, hits: hits.filter((h) => h.type === type) })).filter(
    (g) => g.hits.length > 0,
  );
}

/**
 * ⌘K 面板每组最多显示几条。
 *
 * 面板刻意**按类型配额**，不按全局取前 N 条。全局截断会让分组这件事变成谎言：
 * 「用户 管理 列表」的前 24 条里页面/区块/模版占了 15 条，组件只剩 9 个名额，
 * 于是 ProTable 这种正是答案的组件被整条尾巴一起切掉，面板上看不到，
 * 而用户根本不知道自己被截断了。配额保证每一类都有自己的位置。
 */
export const PANEL_PER_TYPE = 10;

export interface PanelGroup {
  type: DocType;
  /** 本组要显示的条目（已按配额截断）。 */
  hits: SearchHit[];
  /** 本组命中总数。 */
  total: number;
  /** 是否被配额截断 —— 截断必须在 UI 上说出来，不能默默吞掉。 */
  truncated: boolean;
}

/**
 * 面板要显示的分组结果。面板与其回归测试**共用这一个函数**，
 * 否则测试按自己的 limit 取数就永远测不到面板真实的截断行为（#40 验收翻车正是这样）。
 */
export function searchPanelGroups(
  query: string,
  perType: number = PANEL_PER_TYPE,
  filters: Omit<SearchFilters, "limit"> = {},
): PanelGroup[] {
  return groupByType(searchAll(query, filters)).map(({ type, hits }) => ({
    type,
    hits: hits.slice(0, perType),
    total: hits.length,
    truncated: hits.length > perType,
  }));
}

/** 某类型下出现过的分类（用于搜索页筛选芯片），保持首次出现顺序。 */
export function categoriesOf(type: DocType): Array<{ key: string; label: string }> {
  const seen = new Map<string, string>();
  for (const doc of searchDocs) {
    if (doc.type !== type || !doc.category) continue;
    if (!seen.has(doc.category)) seen.set(doc.category, doc.categoryLabel ?? doc.category);
  }
  return [...seen].map(([key, label]) => ({ key, label }));
}
