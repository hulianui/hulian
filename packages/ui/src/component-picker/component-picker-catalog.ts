import type {
  ComponentPickerCategoryNode,
  ComponentPickerExample,
  ComponentPickerItem,
  ComponentPickerProp,
} from "./component-picker.types";

/**
 * 目录解析 + 分类树构建（纯函数，无 React 依赖）。
 *
 * 边界：**解析在消费方那层跑，不在组件里跑**。组件库不该假设运行环境有
 * `llms-full.txt`，更不该在渲染里发网络请求；所以这里只提供 `text -> items`，
 * 取文件是消费方的事（构建期读盘 / 服务端 fetch / 打进 bundle 都行）。
 */

/** 「全部」节点的 key。 */
export const ALL_CATEGORY_KEY = "*";

/**
 * 文档的一级分区标题（`# ━━━ 布局 ━━━`）到 manifest 分类名的映射。
 * 只在摘要行没写 `category/group` 时兜底（全库约 5 条）。
 */
const SECTION_CATEGORY: Record<string, string> = {
  布局: "layout",
  排版: "typography",
  表单: "forms",
  数据展示: "data-display",
  导航: "navigation",
  反馈: "feedback",
  "AI 智能体": "ai",
  装饰: "decoration",
  设备外壳: "mockups",
  移动端: "mobile",
  uncatalogued: "uncatalogued",
};

/**
 * kebab 化推不出的少数 slug。
 * 库里 `ASCIIText -> ascii-text` 但 `QRCode -> qrcode`，全大写缩写没有统一规则，
 * 任何纯算法都会在其中一边翻车，只能列出来。消费方可用 `slugOverrides` 增补。
 */
const DEFAULT_SLUG_OVERRIDES: Record<string, string> = { QRCode: "qrcode" };

export interface ParseCatalogOptions {
  /** 名字 -> slug 的强制映射，优先级最高。 */
  slugOverrides?: Record<string, string>;
}

function kebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
    .toLowerCase();
}

/**
 * 从全文的交叉引用链接里收 `名字 -> slug`。
 * 文档站链接 `[Layout](…/components/layout)` 和仓库链接 `[Tree](…/src/tree/tree.md)`
 * 两种都认，所以 `llms.txt`（索引版）也能喂进来当映射源。
 * 这条路径覆盖了 kebab 化推不出的 `Formula -> math`、`iPhone -> iphone` 等。
 */
function collectSlugLinks(text: string): Map<string, string> {
  const map = new Map<string, string>();
  const put = (name: string, slug: string) => {
    const key = name.trim();
    if (key && !map.has(key)) map.set(key, slug);
  };
  for (const m of text.matchAll(/\[([^\]\n]+)\]\([^)\s]*\/components\/([a-z0-9-]+)\)/g)) {
    put(m[1]!, m[2]!);
  }
  for (const m of text.matchAll(/\[([^\]\n]+)\]\([^)\s]*\/src\/([a-z0-9-]+)\/[a-z0-9-]+\.md\)/g)) {
    put(m[1]!, m[2]!);
  }
  return map;
}

const SEPARATOR_LINE = /^<!--[\s\S]{0,4}?[═=]{4,}[\s\S]{0,4}?-->$/;
const FENCE = /^\s*```/;

/**
 * 切块。首选文档里的分隔注释（`<!-- ═══ -->`）；没有分隔注释时退到「按顶层 `# ` 标题切」，
 * 并跳过围栏代码块内的 `#`（shell 注释会假装成标题）。
 */
function splitBlocks(text: string): string[] {
  const lines = text.split("\n");
  const hasSeparator = lines.some((l) => SEPARATOR_LINE.test(l.trim()));
  const blocks: string[] = [];
  let current: string[] = [];
  let inFence = false;
  for (const line of lines) {
    if (FENCE.test(line)) inFence = !inFence;
    const cut = hasSeparator
      ? !inFence && SEPARATOR_LINE.test(line.trim())
      : !inFence && /^# (?!━)/.test(line) && current.length > 0;
    if (cut) {
      blocks.push(current.join("\n"));
      current = hasSeparator ? [] : [line];
      continue;
    }
    current.push(line);
  }
  blocks.push(current.join("\n"));
  return blocks;
}

/** 按 `\|` 转义与反引号保护逐字符切表格行（裸 split("|") 会把代码里的管道劈成列）。 */
function splitRow(row: string): string[] {
  const trimmed = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let buf = "";
  let inCode = false;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i]!;
    if (ch === "\\" && trimmed[i + 1] === "|") {
      buf += "|";
      i++;
      continue;
    }
    if (ch === "`") inCode = !inCode;
    if (ch === "|" && !inCode) {
      cells.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  cells.push(buf.trim());
  return cells;
}

function stripCode(value: string): string {
  return value.replace(/^`+|`+$/g, "").trim();
}

/** 取某个 `## 标题` 小节的正文（到下一个 `## ` 或结尾）。 */
function sectionBody(block: string, titles: RegExp): string | null {
  const lines = block.split("\n");
  let start = -1;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (FENCE.test(lines[i]!)) inFence = !inFence;
    if (inFence) continue;
    const heading = /^## (.+)$/.exec(lines[i]!);
    if (!heading) continue;
    if (start < 0 && titles.test(heading[1]!.trim())) start = i + 1;
    else if (start >= 0) return lines.slice(start, i).join("\n");
  }
  return start < 0 ? null : lines.slice(start).join("\n");
}

const PROP_COLUMN_ALIASES: [keyof ComponentPickerProp, RegExp][] = [
  ["name", /^(名称|名字|属性|参数|name|prop)$/i],
  ["type", /^(类型|type)$/i],
  ["default", /^(默认|默认值|default)$/i],
  ["description", /^(说明|描述|desc|description)$/i],
];

function parsePropsTable(block: string): ComponentPickerProp[] {
  const body = sectionBody(block, /^Props$/i);
  if (body === null) return [];
  const rows = body.split("\n").filter((l) => l.trim().startsWith("|"));
  const props: ComponentPickerProp[] = [];
  let columns: (keyof ComponentPickerProp | null)[] | null = null;
  for (const row of rows) {
    const cells = splitRow(row);
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue; // 分隔行
    if (columns === null) {
      columns = cells.map((c) => PROP_COLUMN_ALIASES.find(([, re]) => re.test(c))?.[0] ?? null);
      // 首行不像表头就整表跳过——宁可少给 props，也不要把说明文字当成属性名
      if (!columns.includes("name")) return [];
      continue;
    }
    const raw: Partial<Record<keyof ComponentPickerProp, string>> = {};
    cells.forEach((cell, i) => {
      const key = columns![i];
      if (key) raw[key] = cell;
    });
    const rawName = stripCode(raw.name ?? "");
    if (!rawName) continue;
    const required = /\*$/.test(rawName);
    const name = rawName.replace(/\s*\*$/, "").trim();
    if (!name) continue;
    const prop: ComponentPickerProp = { name };
    if (required) prop.required = true;
    if (raw.type) prop.type = stripCode(raw.type);
    if (raw.default) prop.default = stripCode(raw.default);
    if (raw.description) prop.description = raw.description;
    props.push(prop);
  }
  return props;
}

const EXAMPLE_SECTION = /^(示例|用法|例子|Examples?|Usage)$/i;

function parseExamples(block: string): ComponentPickerExample[] {
  const lines = block.split("\n");
  const examples: ComponentPickerExample[] = [];
  let title: string | undefined;
  let collecting = false;
  let fenceLang: string | undefined;
  let buf: string[] | null = null;
  for (const line of lines) {
    const fence = /^\s*```(\w+)?\s*$/.exec(line);
    if (fence) {
      if (buf === null) {
        if (collecting) {
          buf = [];
          fenceLang = fence[1];
        }
      } else {
        examples.push({ title, lang: fenceLang, code: buf.join("\n") });
        buf = null;
        fenceLang = undefined;
      }
      continue;
    }
    if (buf !== null) {
      buf.push(line);
      continue;
    }
    const heading = /^#{2,3} (.+)$/.exec(line);
    if (heading) {
      const text = heading[1]!.trim();
      if (/^## /.test(line)) collecting = EXAMPLE_SECTION.test(text);
      if (collecting) title = text;
    }
  }
  return examples;
}

const CATEGORY_GROUP = /^([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*)$/;

interface Classification {
  category: string;
  group: string;
  tags: string[];
  description: string;
}

/**
 * 摘要行形如 `> 中后台骨架 · 侧栏… · layout/container · #animated`。
 * 从尾部剥：先剥 `#tag`，再剥 `category/group`；只认 ASCII 小写的 `a/b`，
 * 免得把描述里的「明/暗双主题」当成分类。剥不出就退到分区标题。
 */
function classify(summary: string, section: string | null): Classification {
  const segments = summary
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  const tags: string[] = [];
  while (segments.length > 0 && segments[segments.length - 1]!.startsWith("#")) {
    tags.unshift(segments.pop()!.slice(1).trim());
  }
  let category = "";
  let group = "";
  const last = segments[segments.length - 1];
  const matched = last ? CATEGORY_GROUP.exec(last) : null;
  if (matched) {
    category = matched[1]!;
    group = matched[2]!;
    segments.pop();
  } else if (last === "uncatalogued") {
    category = "uncatalogued";
    segments.pop();
  } else {
    category = (section && (SECTION_CATEGORY[section] ?? section)) || "uncatalogued";
  }
  return { category, group, tags, description: segments.join(" · ") };
}

/**
 * 把 `llms-full.txt`（或同结构的 `llms.txt`）解析成条目数组。
 *
 * 认的结构：`<!-- ═══ -->` 分隔 → `# 组件名` → `> 摘要 · category/group · #tag`
 * → `## Props` 表 → `## 示例` / `## 用法` 里的围栏代码块。
 * 缺哪节就少哪个字段，不抛异常——文档格式演进时宁可降级也不要整页崩。
 */
export function parseComponentCatalog(
  text: string,
  options: ParseCatalogOptions = {},
): ComponentPickerItem[] {
  const overrides = { ...DEFAULT_SLUG_OVERRIDES, ...options.slugOverrides };
  const links = collectSlugLinks(text);
  const items: ComponentPickerItem[] = [];
  const seen = new Set<string>();
  let section: string | null = null;

  for (const block of splitBlocks(text)) {
    const heading = /^# (?!━)(.+)$/m.exec(block);
    // 分区标题写在**上一块的末尾**，所以先记下来给下一块用
    const nextSection = [...block.matchAll(/^# ━+\s*(.+?)\s*━+$/gm)].pop()?.[1] ?? null;
    const consumed = section;
    if (nextSection) section = nextSection;
    if (!heading || !/^## /m.test(block)) continue; // 前言块没有 `## ` 小节，跳过

    const rawName = heading[1]!.trim();
    const name = rawName.split(/[\s/]/)[0]!;
    if (!name) continue;
    const slug = overrides[name] ?? links.get(rawName) ?? links.get(name) ?? kebabCase(name);
    if (seen.has(slug)) continue;
    seen.add(slug);

    const summary = /^> (.+)$/m.exec(block)?.[1]?.trim() ?? "";
    const { category, group, tags, description } = classify(summary, consumed);
    const item: ComponentPickerItem = { slug, name, description, category, group };
    if (tags.length > 0) item.tags = tags;
    const props = parsePropsTable(block);
    if (props.length > 0) item.props = props;
    const examples = parseExamples(block);
    if (examples.length > 0) item.examples = examples;
    items.push(item);
  }
  return items;
}

export interface BuildCategoryTreeOptions {
  /** 根节点文案。@default "全部" */
  allLabel?: string;
  /** category / group 名到展示名的映射（不给则原样显示英文名）。 */
  categoryLabels?: Record<string, string>;
}

/**
 * 由条目派生「全部 → category → group」两级分类树（纯数据）。
 * 顺序按 `items` 里首次出现的先后，不做字母排序——manifest 的排列本身是有意义的。
 */
export function buildCategoryTree(
  items: ComponentPickerItem[],
  options: BuildCategoryTreeOptions = {},
): ComponentPickerCategoryNode[] {
  const { allLabel = "全部", categoryLabels = {} } = options;
  const label = (key: string) => categoryLabels[key] ?? key;
  const categories = new Map<string, Map<string, number>>();
  for (const item of items) {
    let groups = categories.get(item.category);
    if (!groups) {
      groups = new Map<string, number>();
      categories.set(item.category, groups);
    }
    groups.set(item.group, (groups.get(item.group) ?? 0) + 1);
  }

  const children: ComponentPickerCategoryNode[] = [];
  for (const [category, groups] of categories) {
    let count = 0;
    const groupNodes: ComponentPickerCategoryNode[] = [];
    for (const [group, n] of groups) {
      count += n;
      if (group) {
        groupNodes.push({ key: `cat:${category}/group:${group}`, label: label(group), count: n });
      }
    }
    const node: ComponentPickerCategoryNode = { key: `cat:${category}`, label: label(category), count };
    if (groupNodes.length > 0) node.children = groupNodes;
    children.push(node);
  }
  return [{ key: ALL_CATEGORY_KEY, label: allLabel, count: items.length, children }];
}

/** 条目是否落在某个分类 key 下。key 为空 / `"*"` 时恒 true；也接受裸 category 名。 */
export function matchesCategory(item: ComponentPickerItem, key?: string | null): boolean {
  if (!key || key === ALL_CATEGORY_KEY) return true;
  const matched = /^cat:([^/]+)(?:\/group:(.+))?$/.exec(key);
  if (!matched) return item.category === key;
  if (item.category !== matched[1]) return false;
  return matched[2] === undefined || item.group === matched[2];
}

/** 只认字面量默认值；函数 / 对象 / 表达式一律返回 undefined（猜错比不猜更糟）。 */
function parseLiteral(raw?: string): unknown {
  if (!raw) return undefined;
  const s = stripCode(raw);
  if (!s || s === "—" || s === "-" || s === "–") return undefined;
  if (s === "true") return true;
  if (s === "false") return false;
  if (s === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  const quoted = /^["'](.*)["']$/.exec(s);
  return quoted ? quoted[1] : undefined;
}

/**
 * 由文档里写明的字面量默认值派生一份初始 props，作 `onSelect` 的第二个入参。
 * 没有可解析默认值的条目返回 `{}`——这是诚实的空，不是失败。
 */
export function defaultPropsOf(item: ComponentPickerItem): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const prop of item.props ?? []) {
    const value = parseLiteral(prop.default);
    if (value !== undefined) out[prop.name] = value;
  }
  return out;
}
