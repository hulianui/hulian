// 标题锚点：把标题文本转成稳定 id。渲染（Markdown 的 headingIds）与「渲染之外抽 TOC」
// （extractHeadings）共用这一份规则 —— 两侧各写一套的下场是 href 与 DOM 里的 id 悄悄错位，
// 页面看着正常，点目录不动。纯函数无副作用，可单测。

import { parseBlocks, type MdBlock } from "./parse";

/** 抽出的标题项：level/text 与 parseBlocks 一致，id 即开启 headingIds 后挂在 <h*> 上的锚点。 */
export interface MarkdownHeading {
  /** 标题级别，与 Markdown 的 # 数一致（本解析器只到 3 级）。 */
  level: 1 | 2 | 3;
  /** 标题原文（保留行内标记，供调用方自行渲染）。 */
  text: string;
  /**
   * 剥掉行内标记后的纯文本，目录标签用这个 —— 目录项是纯字符串，直接摆 text 会把
   * 反引号、星号原样显示出来（`tone="current"` 这种标题在库内 md 里并不少见）。
   */
  plainText: string;
  /** 锚点 id，形如 "安装"、"mcp-server-配置"。 */
  id: string;
}

// 行内标记只影响渲染形态、不改变标题身份：取 slug 与做目录标签之前都先剥掉。
function stripInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

// 全部字符都被剔掉时的兜底（空标题 `##` 或纯符号标题 `## ???`）——
// id 为空串等于没有锚点，宁可给个可跳的通用名，再由去重补 -1 / -2 区分。
const FALLBACK = "section";

/**
 * 单个标题文本 → slug。规则：
 *  1. 剥掉行内标记（`代码` / **粗** / *斜* / [文字](链接)），只留可见文字 ——
 *     id 记的是标题身份，不该随作者给某个词加粗而改变；
 *  2. 转小写（只影响 ASCII，中日韩不受影响）、空白折成连字符；
 *  3. 只保留 Unicode 字母/数字与 - _ ：用 \p{L} 而非 [a-z] 才收得住中文标题，
 *     本库文档的 h2 绝大多数是中文；
 *  4. 连字符去重、去首尾。
 *
 * 同名标题的去重不在这里做（无状态纯函数），由 extractHeadings / 渲染侧按文档顺序统一追加后缀。
 */
export function slugifyHeading(text: string): string {
  const slug = stripInline(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-_]/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || FALLBACK;
}

// 带去重状态的取 slug 函数：同一 slug 第二次出现起追加 -1 / -2。
// 渲染与抽取各自新建一个，按同一文档顺序喂同一批标题，得到的就是同一组 id。
// prefix 用于把这批 id 关进自己的命名空间，避免与宿主页面上已有的 id 撞（见 MarkdownProps.headingIds）。
export function createHeadingSlugger(prefix = ""): (text: string) => string {
  const used = new Map<string, number>();
  return (text) => {
    const base = prefix + slugifyHeading(text);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    if (seen === 0) return base;
    // 加了序号仍可能撞上文档里字面就叫 "foo-1" 的标题，往后找到空位为止。
    let n = seen;
    while (used.has(`${base}-${n}`)) n++;
    const id = `${base}-${n}`;
    used.set(id, 1);
    return id;
  };
}

const isHeading = (b: MdBlock): b is Extract<MdBlock, { type: "heading" }> => b.type === "heading";

/**
 * 从 Markdown 源里按文档顺序抽出全部标题及其锚点 id，供调用方拼目录（如 Anchor 的 items）。
 *
 * 与 `<Markdown headingIds>` 渲染出的 id 逐字相同 —— 前提是两边喂的是**同一份源文本**、
 * 且 prefix 与 `headingIds` 传的那个前缀一致：页面若只渲染剥掉页头之后的正文，抽 TOC 也要用
 * 那一份，拿完整原文抽会多出并不存在的锚点。
 */
export function extractHeadings(src: string, prefix = ""): MarkdownHeading[] {
  const slug = createHeadingSlugger(prefix);
  return parseBlocks(src)
    .filter(isHeading)
    .map((b) => ({
      level: b.level,
      text: b.text,
      plainText: stripInline(b.text).trim(),
      id: slug(b.text),
    }));
}
