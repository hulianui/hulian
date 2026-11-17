// component-links.ts —— 正文里提到的组件名 → 站内组件文档页。
//
// 更新日志是「先看到组件名、再去文档查」的典型场景，而正文来自 changeset 的纯文本，
// 组件名只是裸词。这里按 manifest 的组件名做词级链接化，省掉「拷贝 → 去组件页搜」。
//
// 硬约束：
// 1. 围栏块不动；行内代码只在**整段恰好是一个组件导出名**时链接化（`Paper`、
//    `<PaperPresenter>`、`<Paper />`），`deltaPlacement` / `font-medium` 这类标识符不动。
//    此前行内代码一律跳过，而 changeset 的规范写法恰恰是给组件名加反引号 —— 写得越规范
//    越链不上（0.74.0 / 0.74.1 整版零链接）。子组件经 llms-props.json 的 exportIndex
//    链到所属组件页（`PaperPresenter` → paper）。
// 2. 不碰已有的 Markdown 链接（label 里再嵌一个链接会把结构拆坏）；
// 3. 大小写敏感 + 词边界 —— `Button` 是组件，`button` 是普通词，`ButtonGroup` 不该被
//    切成 `Button` + `Group`。

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

/**
 * 导出名 → 组件 slug（含子组件，如 `PaperPresenter` → `paper`）。真源是 llms-props.json 的
 * exportIndex（由 barrel 生成、随仓库提交）；只收 PascalCase 且落在 manifest 里有文档页的。
 * 用 fs 读而不 import：那份 JSON 1.4MB，没必要进模块图。
 */
let exportSlugs: Map<string, string> | undefined;

function exportSlugMap(): Map<string, string> {
  if (exportSlugs) return exportSlugs;
  const pages = new Set(manifest.map((m) => m.slug));
  const map = new Map<string, string>(manifest.map((m) => [m.name, m.slug]));
  const file = [
    join(process.cwd(), "public", "llms-props.json"),
    join(process.cwd(), "apps", "www", "public", "llms-props.json"),
  ].find((p) => existsSync(p));
  if (file) {
    const { exportIndex = {} } = JSON.parse(readFileSync(file, "utf8")) as {
      exportIndex?: Record<string, string>;
    };
    for (const [name, slug] of Object.entries(exportIndex)) {
      if (/^[A-Z][A-Za-z0-9]*$/.test(name) && pages.has(slug) && !map.has(name)) {
        map.set(name, slug);
      }
    }
  }
  exportSlugs = map;
  return map;
}

/** `Paper` / `<Paper>` / `<Paper />` / `</Paper>` / `<Paper size="sm">` → `Paper`；其余 null。 */
export function componentNameInCode(span: string): string | null {
  const inner = span.replace(/^`+|`+$/g, "").trim();
  const match =
    inner.match(/^([A-Z][A-Za-z0-9]*)$/) ?? inner.match(/^<\/?([A-Z][A-Za-z0-9]*)(?:\s[^>]*)?\/?>$/);
  return match ? match[1] : null;
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
  return compiled ? apply(markdown, compiled, hrefsFor(locale), locale) : markdown;
}

/** 行内代码是否落在本行某个已有 Markdown 链接里（如 `[\`Paper\`](…)`）。 */
function insideLink(line: string, start: number): boolean {
  for (const link of line.matchAll(MD_LINK)) {
    if (start >= link.index && start < link.index + link[0].length) return true;
  }
  return false;
}

function apply(
  markdown: string,
  pattern: RegExp,
  hrefs: Map<string, string>,
  locale: DocsLocale,
): string {
  const slugs = exportSlugMap();
  return rewriteOutsideCode(
    markdown,
    (text) => {
      let output = "";
      let last = 0;
      for (const link of text.matchAll(MD_LINK)) {
        output += replaceMentions(text.slice(last, link.index), pattern, hrefs);
        output += link[0];
        last = link.index + link[0].length;
      }
      return output + replaceMentions(text.slice(last), pattern, hrefs);
    },
    (span, line, start) => {
      const name = componentNameInCode(span);
      const slug = name ? slugs.get(name) : undefined;
      if (!slug || insideLink(line, start)) return span;
      return `[${span}](${withDocsBasePath(`/components/${slug}`, locale)})`;
    },
  );
}
