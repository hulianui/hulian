#!/usr/bin/env node
// check-rsc-claims —— 「带 `"use client"` 的组件，文档不许自称 RSC」门禁。
//
// 命题：组件 md 随 npm 包一起发布（packages/ui 的 files 里有 src），MCP 的 get_component_doc
// 本地模式直读 node_modules 里那一份。所以**文档缺陷对 agent 消费方就是运行时缺陷** ——
// 读到「纯 RSC」「RSC 安全」，agent 会据此判断「这个组件不进 client bundle」「可以在 server
// component 里当无边界的静态件用」，两条都不成立。
//
// issue #307 抓到 9 个组件 14 处这样的断言。根因两类，都不是代码错：
//   a) 术语被当两个意思用 —— glass-surface.tsx / splash-cursor.tsx 的源码注释里把话说全了
//      「RSC 安全：`"use client"` + 所有 DOM 测量写在 effect 内」，意思是**SSR 期不炸**；
//      到了 md 摘要行被压缩成「RSC 安全」三个字，读者只会理解成「它是 server component」。
//   b) 接了 Locale SSOT 之后没回头改文档 —— BeianFooter / TypingDots 自身零 hooks 零事件，
//      但都调了 useComponentLocale()（Context hook），`"use client"` 因此是必要的。
//
// 用法：
//   node scripts/check-rsc-claims.mjs           # 命中即 exit 1
//
// ── 判定口径 ────────────────────────────────────────────────────────────────
// 只对**主文件带 `"use client"`** 的组件生效；真正的 server 组件（ReflectiveCard、Citation
// 等）说自己 RSC 安全是准确的，不该被这道门禁碰。
//
// 命中（违规）：md 里出现「断言它是 RSC」的固定短语 —— `RSC 安全` / `纯 RSC` / `RSC-safe` /
// `RSC safety` / `RSC security` / `RSC client`，以及摘要行里 `·RSC)` `·RSC·` 这种把 RSC 当
// 特性标签列出来的分隔符形式。
//
// 放行：
//   1) 短语前 24 字符内有否定/限定词（不能 / 不是 / 并非 / not / never …）—— 「客户端组件，
//      不能在纯 RSC 边界直接当 server 组件用」是**准确**表述，正是我们希望的写法；
//   2) 同行写了 `<!-- rsc-claim-ok: 理由 -->` 的逃生口，理由必填。
//
// 刻意**不**匹配「RSC 页面」「RSC 树」这类中性提法：「放进 RSC 页时确保挂在 client 子树」
// 说的是使用位置，没有断言组件自身是什么，本来就对。

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));

export const COMPONENT_ROOT = "packages/ui/src";

/**
 * 断言「本组件是 RSC」的固定短语。
 *
 * 第一条刻意允许 RSC 与「安全」之间隔几个字 —— 真出现过的写法是「RSC/jsdom 环境安全」，
 * 卡死紧邻就漏了。英文更长（`RSC/jsdom environment is safe` 中间隔 21 个字符），窗口取 24；
 * 真正兜住误判的是字符类里排掉的句读点 —— 匹配永远不会跨过句号/分号把两件事连起来。
 */
const CLAIM_RE = new RegExp(
  [
    "RSC[^。；.;\\n]{0,24}?(?:安全|safe|safety|security)", // RSC 安全 / RSC-safe / RSC/jsdom 环境安全
    "纯\\s*RSC",
    "pure\\s+RSC",
    "RSC[\\s-]*client", // 「RSC client」这种两可写法，读者只会各取所需
    "(?:is|are)\\s+an?\\s+RSC\\b", // The component is an RSC
    "是\\s*(?:一?个)?\\s*RSC\\b",
    "[·、,，]\\s*RSC\\s*(?=[)）·])", // 摘要行里把 RSC 当特性标签列出来
  ].join("|"),
  "gi",
);

/** 否定/限定词：短语前这么近的地方出现，说明整句在讲「它不是 RSC」。 */
const NEGATION_RE = /(?:不能|不是|不可|并非|别|没有|not|isn['’]t|never|no longer)/i;
const NEGATION_WINDOW = 24;

/** 同行逃生口，理由必填。 */
const ESCAPE_RE = /<!--\s*rsc-claim-ok:\s*(\S[^>]*?)\s*-->/;

/** 主文件带 `"use client"` 才算客户端组件；顶部 200 字符足够覆盖指令行。 */
function hasUseClient(file) {
  return /^\s*["']use client["']/m.test(readFileSync(file, "utf8").slice(0, 200));
}

/**
 * 判断一个组件目录是不是客户端组件。
 * 优先看同名主文件；没有同名主文件时退回「目录下任一非测试/非 showcase 的 tsx 带指令」——
 * 宁可多判成 client（多要求文档说清楚），也不要因为文件命名不规范而静默放过。
 */
export function isClientComponent(dir, slug) {
  const main = join(dir, `${slug}.tsx`);
  if (existsSync(main)) return hasUseClient(main);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsx") && !/\.(test|spec|showcase|stories)\./.test(f))
    .some((f) => hasUseClient(join(dir, f)));
}

/** 在一份 md 文本里找出违规断言。纯函数，便于测试。 */
export function findClaims(text) {
  const findings = [];
  text.split("\n").forEach((line, index) => {
    if (ESCAPE_RE.test(line)) return;
    CLAIM_RE.lastIndex = 0;
    for (const match of line.matchAll(CLAIM_RE)) {
      const before = line.slice(Math.max(0, match.index - NEGATION_WINDOW), match.index);
      if (NEGATION_RE.test(before)) continue;
      findings.push({ line: index + 1, claim: match[0].trim(), text: line.trim().slice(0, 120) });
    }
  });
  return findings;
}

export function checkRscClaims({ repoRoot = REPO_ROOT } = {}) {
  const root = join(repoRoot, COMPONENT_ROOT);
  const findings = [];
  let scanned = 0;

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(root, entry.name);
    const docs = readdirSync(dir).filter((f) => f.endsWith(".md"));
    if (docs.length === 0) continue;
    if (!isClientComponent(dir, entry.name)) continue;
    scanned += 1;
    for (const doc of docs) {
      for (const found of findClaims(readFileSync(join(dir, doc), "utf8"))) {
        findings.push({ file: `${COMPONENT_ROOT}/${entry.name}/${doc}`, ...found });
      }
    }
  }

  return { findings, scanned };
}

const invoked = resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (invoked) {
  const { findings, scanned } = checkRscClaims();
  if (findings.length > 0) {
    for (const f of findings) {
      console.error(`  ✗ ${f.file}:${f.line}  「${f.claim}」\n      ${f.text}`);
    }
    console.error(
      `\n[rsc-claims] ${findings.length} 处「自称 RSC」的断言出现在带 \`"use client"\` 的组件文档里。\n` +
        `改成库里既有的写法：正文用「客户端组件（\`"use client"\`）」，摘要行的特性列表里写「客户端组件」。\n` +
        `要说的如果是「SSR 期不报错」，就直说 SSR —— 那和「是不是 server component」是两件事。`,
    );
    process.exitCode = 1;
  } else {
    console.log(`[rsc-claims] PASS · ${scanned} 个客户端组件的文档里没有「自称 RSC」的断言`);
  }
}
