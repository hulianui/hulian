// component-links.ts —— 正文里提到的组件名 → 站内组件文档页。
//
// 更新日志是「先看到组件名、再去文档查」的典型场景，而正文来自 changeset 的纯文本，
// 组件名只是裸词。这里按 manifest 的组件名做词级链接化，省掉「拷贝 → 去组件页搜」。
//
// 三条硬约束：
// 1. 只改代码之外（围栏块 / 行内代码里的是标识符，不是对组件的引用）；
// 2. 不碰已有的 Markdown 链接（label 里再嵌一个链接会把结构拆坏）；
// 3. 大小写敏感 + 词边界 —— `Button` 是组件，`button` 是普通词，`ButtonGroup` 不该被
//    切成 `Button` + `Group`。

import { DOCS_LOCALE, withDocsBasePath, type DocsLocale } from "./docs-locale";
import { manifest } from "./manifest";
import { rewriteOutsideCode } from "./markdown-outside-code";

/**
 * 与组件同形、但正文里几乎总是指别的东西的名字。
 *
 * `Lightning` —— 正文里的「Lightning CSS」是构建期的 CSS 降级工具，不是本库的闪电特效
 * 组件。这条误链的误导性最强（点到完全无关的页面），其余同形词（`Layout`/`Text`/`Markdown`
 * 偶尔指概念）跳过去仍是相关组件，按「宁可多链」保留。
 */
const NOT_A_COMPONENT = new Set(["Lightning"]);

/**
 * mockups 分类整个不参与链接：那七件（Safari / Chrome / Terminal / iPhone / Android /
 * Tablet / Watch）的名字与真实浏览器、终端、设备同形。更新日志里出现这些词时几乎总是在说
 * 那个真实产品 ——「补上 Safari 的 keyCode 兜底」「在 Chrome 151 实测」—— 链到本库的
 * 外壳组件页纯属误导；真提到外壳组件的场合少得多，漏链的代价远小于误链。
 */
const LINKABLE = (m: { name: string; category: string }) =>
  m.category !== "mockups" && !NOT_A_COMPONENT.has(m.name);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildNamePattern(): RegExp | null {
  // 长名优先：将来若出现含空格/连字符的名字，短名会先被交替分支吃掉。
  const names = manifest
    .filter(LINKABLE)
    .map((m) => m.name)
    .sort((a, b) => b.length - a.length);
  if (names.length === 0) return null;
  return new RegExp(
    `(?<![A-Za-z0-9_])(?:${names.map(escapeRegExp).join("|")})(?![A-Za-z0-9_])`,
    "g",
  );
}

let pattern: RegExp | null | undefined;
const hrefCache = new Map<DocsLocale, Map<string, string>>();

function hrefsFor(locale: DocsLocale): Map<string, string> {
  let hrefs = hrefCache.get(locale);
  if (!hrefs) {
    hrefs = new Map(
      manifest
        .filter(LINKABLE)
        .map((m) => [m.name, withDocsBasePath(`/components/${m.slug}`, locale)]),
    );
    hrefCache.set(locale, hrefs);
  }
  return hrefs;
}

/** 已有 Markdown 链接整段原样保留，只在其外部做替换。 */
const MD_LINK = /\[[^\]]*\]\([^)]*\)/g;

function replaceMentions(
  text: string,
  pattern: RegExp,
  hrefs: Map<string, string>,
): string {
  return text.replace(pattern, (name) => `[${name}](${hrefs.get(name)})`);
}

/**
 * 把正文中的组件名改写成指向 `/components/<slug>` 的 Markdown 链接。
 * 除 manifest 里的组件名外，其余文本逐字保留。
 */
export function linkifyComponentMentions(
  markdown: string,
  locale: DocsLocale = DOCS_LOCALE,
): string {
  if (pattern === undefined) pattern = buildNamePattern();
  const compiled = pattern;
  return compiled ? apply(markdown, compiled, hrefsFor(locale)) : markdown;
}

function apply(markdown: string, pattern: RegExp, hrefs: Map<string, string>): string {
  return rewriteOutsideCode(markdown, (text) => {
    let output = "";
    let last = 0;
    for (const link of text.matchAll(MD_LINK)) {
      output += replaceMentions(text.slice(last, link.index), pattern, hrefs);
      output += link[0];
      last = link.index + link[0].length;
    }
    return output + replaceMentions(text.slice(last), pattern, hrefs);
  });
}
