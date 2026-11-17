#!/usr/bin/env node
// check-doc-link-targets.mjs — 文档站里能点的站内链接，目标必须真实存在。
//
// 为什么需要它（PR #406，首页 dogfood）：
//
// CI 的 `docs:i18n:links` 要先 `next build` 整站静态导出，再扫 16 万条链接，十分钟后才以
// 12 条 finding 拦下两类错误。两类都是源码里**静态可判**的：
//
//   1. 组件 md 链到了**不进画廊**的组件：AccentScope 的「相关」写了 `../theme/theme.md`，
//      而 ThemeProvider 按基础设施件惯例不进画廊（manifest 里没有 theme）→ 站点渲染成
//      `/components/theme`，没有这个页面。
//   2. showcase 渲染出来的占位锚点没有落点：`<a href="#card" />` / `#zh` / `#en` / `#changelog`
//      —— 同一页里没有对应 id。旧写法 `href="#home"` 能过，是因为 Brand 的 showcase 里
//      真有一个 `<div id="home">`；照着写占位时只抄了 href、没抄 id。
//
// 判据：
//   · md：`](../<slug>/…md)` 形式的相对链接，<slug> 必须是 apps/www/lib/manifest.ts 里的组件。
//   · showcase：JSX 属性 `href="#x"`（字符串字面量）必须在**同一文件**的 JSX 里有 `id="x"`。
//     只看 JSX，不看 `code:` 模板字符串（那是给人看的源码，不渲染成链接）。
//     `href="#"` 不检查（不跳转的占位）。id 由组件运行时生成的情形看不出来 → 放过，交给运行时门禁。
//
// Run: node scripts/check-doc-link-targets.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-api";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UI_SRC = join(ROOT, "packages/ui/src");
const MANIFEST = join(ROOT, "apps/www/lib/manifest.ts");

/** manifest 里登记的组件 slug（= 文档站有页面的组件）。 */
export function gallerySlugs(manifestSource) {
  return new Set([...manifestSource.matchAll(/\bslug:\s*"([^"]+)"/g)].map((m) => m[1]));
}

/** md 里指向其它组件文档的相对链接，返回 [{ slug, line }]。 */
export function mdComponentLinks(markdown) {
  const out = [];
  markdown.split("\n").forEach((line, i) => {
    for (const m of line.matchAll(/\]\(\.\.\/([a-z0-9-]+)\/[^)\s]*\.md(?:#[^)\s]*)?\)/g)) {
      out.push({ slug: m[1], line: i + 1 });
    }
  });
  return out;
}

/** showcase 源码里 JSX 的 `href="#x"` 与 `id="x"`。 */
export function jsxFragments(source, fileName = "x.tsx") {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const hrefs = [];
  const ids = new Set();
  const visit = (node) => {
    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const name = node.name.getText(sf);
      const value = node.initializer.text;
      if (name === "id") ids.add(value);
      if (name === "href" && value.startsWith("#") && value.length > 1) {
        hrefs.push({ fragment: value.slice(1), line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1 });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { hrefs, ids };
}

function* walk(dir, test) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path, test);
    else if (test(entry.name)) yield path;
  }
}

export function findIssues() {
  const slugs = gallerySlugs(readFileSync(MANIFEST, "utf8"));
  const issues = [];
  for (const file of walk(UI_SRC, (n) => n.endsWith(".md"))) {
    for (const { slug, line } of mdComponentLinks(readFileSync(file, "utf8"))) {
      if (!slugs.has(slug)) {
        issues.push(
          `${relative(ROOT, file)}:${line} 链到 ../${slug}/ —— 「${slug}」不在文档站画廊里（apps/www/lib/manifest.ts 没有它），站点上是死链；改成不带链接的文字`,
        );
      }
    }
  }
  for (const file of walk(UI_SRC, (n) => n.endsWith(".showcase.tsx"))) {
    const { hrefs, ids } = jsxFragments(readFileSync(file, "utf8"), file);
    for (const { fragment, line } of hrefs) {
      if (!ids.has(fragment)) {
        issues.push(
          `${relative(ROOT, file)}:${line} href="#${fragment}" 在本文件里没有 id="${fragment}" 的落点；占位链接要么给示例包一层带这个 id 的元素，要么用 href="#"`,
        );
      }
    }
  }
  return issues;
}

const invoked = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invoked) {
  const issues = findIssues();
  if (issues.length) {
    console.error(issues.join("\n"));
    console.error(`\n[doc-link-targets] ${issues.length} issue(s)`);
    process.exit(1);
  }
  console.log("[doc-link-targets] ok");
}
