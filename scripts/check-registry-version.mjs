#!/usr/bin/env node
// check-registry-version.mjs —— AI 分发产物的版本戳必须与 packages/ui 的版本一致，否则阻断。
//
// 存在的理由（hulianui/hulian#246）：
// registry.json / llms-props.json / llms*.txt 都是**提交进仓库**的生成物，版本号来自生成那一刻的
// packages/ui/package.json。而发版只动 package.json + CHANGELOG —— 两者靠 `version-packages`
// 里那句 `pnpm llms-registry` 手工串在一起。这条链断过：0.37.0 那次的产物就落后于包版本，
// 于是 MCP 拿着旧产物回答问题，消费方（和消费方的 AI）以为查到的是最新 props。
//
// 这类漂移的坏处在于它**只会越走越远**：没人会因为「产物旧了」而编译失败，typecheck、单测、
// guard、build 全是绿的，唯一的症状是 MCP 里那行小小的版本戳 —— 而那正是最没人盯的地方。
// 所以判据必须是机械的：版本号对不上就红，红了跑 `pnpm llms-registry` 就好。
//
// 判据刻意只比**版本号**，不比内容：内容是否最新由 gen-llms-registry 自己的产物校验负责，
// 这里要拦的是「发了新版但没重新生成」这一件事，它靠版本号就能证明，且零误报。
//
// 用法：node scripts/check-registry-version.mjs

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** 被检查的产物：JSON 取 `.version`，纯文本取头部那句 `· v<版本>`。 */
export const ARTIFACTS = [
  { file: "apps/www/public/registry.json", kind: "json" },
  { file: "apps/www/public/llms-props.json", kind: "json" },
  { file: "apps/www/public/llms.txt", kind: "text" },
  { file: "apps/www/public/llms-full.txt", kind: "text" },
];

/**
 * 从产物内容里取版本戳。
 *
 * 文本那两份的头部形如 `> <tagline> · 390 个组件 · v0.39.0`（llms.txt）与
 * `> <tagline> · v0.39.0 · N 个组件文档…`（llms-full.txt）—— 版本段的位置不同，
 * 所以按「第一个 `v<数字>.<数字>.<数字>` 段」取，不按第几段取。
 * 只扫开头几行：正文里的组件文档随便一句都可能出现 v1.2.3 之类的字样。
 */
export function readStamp(content, kind) {
  if (kind === "json") {
    try {
      return JSON.parse(content).version ?? null;
    } catch {
      return null;
    }
  }
  const head = content.split("\n").slice(0, 5).join("\n");
  return head.match(/(?:^|·)\s*v(\d+\.\d+\.\d+[\w.+-]*)/m)?.[1] ?? null;
}

/**
 * 纯判据：包版本 vs 各产物版本戳。
 * @param packageVersion packages/ui/package.json 的 version
 * @param stamps `[{ file, version }]`，version 为 null 表示读不出来（产物缺失/格式变了）
 */
export function auditRegistryVersions(packageVersion, stamps) {
  const problems = [];
  if (!packageVersion) return ["读不到 packages/ui/package.json 的 version"];
  for (const { file, version } of stamps) {
    if (version === null) {
      problems.push(`${file}：读不出版本戳（产物缺失，或头部格式变了 —— 两种都得看一眼）`);
      continue;
    }
    if (version !== packageVersion) {
      problems.push(`${file}：产物 v${version}，而 packages/ui 已是 v${packageVersion}`);
    }
  }
  return problems;
}

function main() {
  const packageVersion = JSON.parse(
    readFileSync(join(ROOT, "packages", "ui", "package.json"), "utf8"),
  ).version;

  const stamps = ARTIFACTS.map(({ file, kind }) => {
    const path = join(ROOT, file);
    return {
      file,
      version: existsSync(path) ? readStamp(readFileSync(path, "utf8"), kind) : null,
    };
  });

  const problems = auditRegistryVersions(packageVersion, stamps);
  if (!problems.length) {
    console.log(`[registry-version] OK · ${ARTIFACTS.length} 份产物均为 v${packageVersion}`);
    return;
  }

  console.error(`[registry-version] FAIL · ${problems.length} 份产物的版本戳与 packages/ui 不一致\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error(
    "\n产物是提交进仓库的生成物，发版只动 package.json 不会带上它们。" +
      "\n在仓库根跑 `pnpm llms-registry`（或 `pnpm docs:all`）重新生成并提交。" +
      "\n不修的后果：MCP 会拿旧产物回答 props，而消费方看不出它旧（hulianui/hulian#246）。",
  );
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
