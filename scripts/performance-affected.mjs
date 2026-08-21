#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const core = new Set(["button", "dialog", "form", "input", "select"]);
const heavy = new Set(["chart", "markdown-editor", "pro-table", "table", "tree", "virtual-list"]);

// 进不了浏览器的文件不该扩大扫描面。把文档算成「改动波及」的代价是实测过的：0.55.0 那个
// PR 改了 758 个组件 md，**383 个 slug 被判波及，真正碰到代码的只有 12 个**，两个
// Runtime Performance job 从常态 2m30s 各涨到 1h26m。
//
// 刻意用**黑名单**而不是白名单：多扫只是多花时间，漏扫会让回归溜过去 —— 遇到没见过的
// 文件类型时，默认扫比默认不扫安全。组件目录下的 .json 之类数据文件会被 import 进运行时，
// 正因如此不列进来。
const NON_RUNTIME = /(?:\.mdx?|\.(?:test|spec|bench|stories)\.[jt]sx?|\.snap)$/;

export function affectedScenarioIds(inventory, changedPaths) {
  const changedSlugs = new Set(
    changedPaths.flatMap((path) => {
      if (NON_RUNTIME.test(path)) return [];
      const match = path.match(/^packages\/ui\/src\/([^/]+)\//);
      return match?.[1] ? [match[1]] : [];
    }),
  );
  // 共享改动（scanner / tokens / lockfile / ui 的 lib·config·motion）刻意**不**扩散到全库：
  // 这一支的设计前提就是「只扫改动波及的场景，不拖慢 PR」，全库覆盖由 schedule 支的
  // Weekly structural sweep 负责（见 ci.yml 里 runtime-performance 那段注释）。写死的
  // core/heavy 无条件入选，就是共享改动的兜底。
  //
  // 这里原先有一段 `sharedChange` 判定，条件写成 `sharedChange && (core || heavy)` ——
  // 被前面的 `core || heavy` 完全吸收，算了等于没算。删掉是为了不让它看起来像一道还在
  // 生效的防线；真要给共享改动扩面，得先解决全量扫描被单个场景超时炸掉的脆性。
  return inventory
    .filter(
      (entry) =>
        entry.kind === "renderable" &&
        typeof entry.scenarioId === "string" &&
        (core.has(entry.id) || heavy.has(entry.id) || changedSlugs.has(entry.id)),
    )
    .map((entry) => entry.scenarioId)
    .sort((left, right) => left.localeCompare(right));
}

function valueAfter(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main(args) {
  const inventoryPath = valueAfter(args, "--inventory");
  if (!inventoryPath) throw new Error("--inventory requires a generated inventory JSON file");
  const base = valueAfter(args, "--base") ?? "HEAD^";
  const inventory = JSON.parse(await readFile(resolve(inventoryPath), "utf8"));
  const changed = execFileSync("git", ["diff", "--name-only", base, "HEAD"], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);
  const scenarios = affectedScenarioIds(inventory, changed);
  if (scenarios.length === 0) throw new Error("affected performance scan selected no scenarios");
  process.stdout.write(`${scenarios.join(",")}\n`);
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : undefined;
if (entry === import.meta.url) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
