import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// showcase 里可点击的链接不许把读者踢出文档站。
//
// 起因（#134）：全库 showcase 有 74 处 `href="https://example.com/#anchor"` 这样的**绝对**占位
// URL。它们看着只是占位，实际是活链接 —— 在文档站点一下浏览器就跳到 example.com，读者得按返回
// 键才能回来。同一个文件里往往还并存着写对的相对锚点（`href="#home"`），说明这不是有意的取舍，
// 是复制粘贴时漏了。
//
// 为什么值得设门禁：showcase 是消费方**照抄**的地方，这类占位一路复制出去就很难收回来了。
//
// 判据：showcase 文件里凡是能被点的目的地（href / link / activeHref / to），一律不许出现绝对
// http(s) URL。真要演示「外链」语义（Citation 引用真实文档、Link external、ShieldBadge 指向仓库）
// 是合法的，条件是那条链接必须在新标签打开 —— 不会顶掉当前页。三种豁免方式：
//   1. 同一行（或紧邻上下行）出现 target="_blank" / external；
//   2. 写一行 `// offsite-ok: <理由>`，用于「组件内部恒 _blank，调用处看不出来」的情形。
//      它豁免的是**从该行起到下一个空行为止**的整段 —— 外链通常是一整个数组，逐条贴注释没人会写；
//      而「到空行为止」这条边界既好描述也不会悄悄漫延到无关代码；
//   3. 组件源码里 target="_blank" 是写死的 → 记进 ALWAYS_NEW_TAB，省得整份 showcase 都要贴注释。
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "packages/ui/src");

/** 可点击目的地的属性名 / 对象字段名。 */
const LINK_ATTR = /\b(?:href|link|activeHref|to)\s*[:=]\s*[`"']\s*(https?:\/\/[^`"'\s]+)/g;

/**
 * 组件自身恒以新标签打开链接，因此它的 showcase 里出现绝对外链不会顶掉当前页。
 * 加条目前请先在组件源码里确认 target="_blank" 是**写死的**而不是可选 prop。
 */
const ALWAYS_NEW_TAB = new Set([
  "citation", // citation.tsx:27 target="_blank" rel="noopener noreferrer" 写死
]);

/** 同行里显式声明了新标签 / 外链语义。 */
const OPTS_OUT = /target\s*=\s*[{"']_blank|(?<![\w-])external(?![\w-])/;

/** 显式豁免注释：从该行起到下一个空行为止的整段都不检查。 */
const OFFSITE_OK = /\/\/\s*offsite-ok:/;

function* showcaseFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* showcaseFiles(path);
      continue;
    }
    if (entry.name.endsWith(".showcase.tsx")) yield path;
  }
}

test("showcase 里可点击的链接不指向站外", () => {
  const offenders = [];
  for (const file of showcaseFiles(SRC)) {
    const slug = relative(SRC, file).split("/")[0];
    if (ALWAYS_NEW_TAB.has(slug)) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    let exempt = false;
    lines.forEach((line, index) => {
      if (line.trim() === "") exempt = false;
      if (OFFSITE_OK.test(line)) exempt = true;
      // 注释里可以写完整 URL（解释为什么），只管真正写进代码的
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      if (exempt || OPTS_OUT.test(line)) return;
      // 属性与取值被 prettier 拆到两行时，回看上一行的 target/external 声明
      if (index > 0 && OPTS_OUT.test(lines[index - 1])) return;
      if (index + 1 < lines.length && OPTS_OUT.test(lines[index + 1])) return;
      LINK_ATTR.lastIndex = 0;
      for (const match of line.matchAll(LINK_ATTR)) {
        offenders.push(`${relative(ROOT, file)}:${index + 1} → ${match[1]}`);
      }
    });
  }
  assert.deepEqual(
    offenders,
    [],
    `showcase 里的可点击链接指向了站外（点一下就离开文档站）：\n${offenders.join(
      "\n",
    )}\n\n占位一律用相对锚点（#home / #docs）。真要演示外链就加 target="_blank"，或把组件加进 ALWAYS_NEW_TAB 并注明理由。`,
  );
});
