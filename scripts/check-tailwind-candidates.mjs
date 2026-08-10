#!/usr/bin/env node
// check-tailwind-candidates.mjs — 挡住「库源码里的字符串被 Tailwind 扫成非法类名」这一类事故。
//
// 为什么需要它：@hulianui/ui 是**源码分发**，消费方按文档加
//   @source "../../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";
// 让 Tailwind v4 直接扫我们的源码。而 v4 的扫描器只做**文本候选提取** —— 它不解析 TS，
// 不区分代码、字符串还是注释。任何长得像任意值类名的文本都会被当成候选生成规则。
//
// 于是 button-base.ts 的一句 JSDoc 举例 `[border-radius:var(--hulian-*)]` 被扫成了真类名，
// 生成 `border-radius: var(--hulian-*)`；`*` 不是合法的自定义属性名，整份 globals.css
// 解析失败 → layout.tsx 导入失败 → **消费方全站 500**（hulianui/hulian#141）。
//
// 这类事故的三个性质决定了它必须由独立门禁来挡：
//   · 库内自测完全看不见 —— 我们自己不走 @source 扫 src 的路径
//   · typecheck / 单测 / guard 全都看不见 —— 那就是一段合法的注释
//   · 命中面是 100% —— 凡是按文档正确接入的消费方都会挂
//
// 判据：方括号任意值候选里，var(--…) 的自定义属性名含非法字符。合法 ident 是
// [A-Za-z0-9_-] 加非 ASCII；`*` `?` `…` 这类通配/省略记号一律拦下。
// 真实类名里的 `*`（calc()、conic-gradient() 里的乘号）不在 var() 名字内部，不受影响。
//
// Run: node scripts/check-tailwind-candidates.mjs [dir...]

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_TARGETS = [join(ROOT, "packages", "ui", "src")];
const SKIP_DIR = new Set(["node_modules", ".next", "dist", "out", "coverage"]);
const SCAN_EXT = /\.(ts|tsx)$/;

/** 方括号任意值候选：`[prop:value]`，value 不含 `]`（Tailwind 的候选也是这么切的）。 */
const ARBITRARY = /\[[a-zA-Z-]+:[^\]\s]*\]/g;
/** var(--名字…) —— 只取名字部分，后面的 fallback 不管。 */
const VAR_NAME = /var\(\s*(--[^,)\s]*)/g;
/** 合法自定义属性名：`--` 之后是 ident 字符（含非 ASCII 与转义之外的常见集）。 */
const VALID_CUSTOM_PROPERTY = /^--[A-Za-z0-9_ -￿-]*$/;

export function findInvalidCandidates(source) {
  const found = [];
  for (const candidate of source.matchAll(ARBITRARY)) {
    for (const variable of candidate[0].matchAll(VAR_NAME)) {
      const name = variable[1];
      if (VALID_CUSTOM_PROPERTY.test(name)) continue;
      const line = source.slice(0, candidate.index).split("\n").length;
      found.push({ line, candidate: candidate[0], name });
    }
  }
  return found;
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIR.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (SCAN_EXT.test(entry)) files.push(full);
  }
  return files;
}

function main() {
  const targets = process.argv.slice(2);
  const roots = targets.length ? targets : DEFAULT_TARGETS;
  const problems = [];
  let scanned = 0;

  for (const root of roots) {
    for (const file of walk(root)) {
      scanned += 1;
      for (const hit of findInvalidCandidates(readFileSync(file, "utf8"))) {
        problems.push({ file: relative(ROOT, file), ...hit });
      }
    }
  }

  if (problems.length === 0) {
    console.log(`[tailwind-candidates] PASS · ${scanned} files`);
    return;
  }

  for (const problem of problems) {
    console.error(
      `${problem.file}:${problem.line} 候选 ${problem.candidate} 里的 ${problem.name} 不是合法的自定义属性名`,
    );
  }
  console.error(
    `\n[tailwind-candidates] FAIL · ${problems.length} 处 / ${scanned} files\n` +
      `Tailwind v4 会把它当成真类名生成 CSS，消费方按 @source 接入后整份样式表解析失败（全站 500）。\n` +
      `注释里举例请写成非类名形态（去掉方括号），真类名请用具体的属性名而不是通配。`,
  );
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) main();
