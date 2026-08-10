#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { checkFiles } from "./check.mjs";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// --help / --version 不是装饰：CI 里常用 `npx @hulianui/guard --help` 探测「工具装没装」，
// 而此前任何未知 flag 一律退出码 2，于是**已安装**的 guard 被判成未安装，检查静默跳过 →
// 门禁假绿（#143）。探测类命令必须是 0 退出码的成功路径。
const USAGE = `hulian-check —— 检查代码是否符合 @hulianui/ui 的使用约定

用法
  hulian-check [选项] [路径...]        路径缺省为当前目录

选项
  --format <text|json>   输出格式，默认 text。json 给 CI 做棘轮用，
                         结构为 { filesChecked, diagnostics[] }，
                         每条含 file/line/column/severity/ruleId/message/instead
  --config <文件>        追加自定义 conventions（只能新增规则，不能覆盖内置规则）
  -h, --help             显示本帮助并退出（退出码 0）
  -v, --version          显示版本并退出（退出码 0）

退出码
  0  没有 error（可能有 warning）
  1  存在 error
  2  参数错误，或被检查的文件有语法错误`;

function parseArgs(argv) {
  const options = { format: "text", paths: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") {
      continue;
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "-v" || arg === "--version") {
      options.version = true;
    } else if (arg === "--format" || arg === "--config") {
      const value = argv[++index];
      if (!value) throw new Error(`${arg} 缺少取值`);
      if (arg === "--format") options.format = value;
      else options.configPath = value;
    } else if (arg.startsWith("-")) {
      throw new Error(`未知参数: ${arg}`);
    } else {
      options.paths.push(arg);
    }
  }
  if (!new Set(["text", "json"]).has(options.format))
    throw new Error(`未知输出格式: ${options.format}`);
  if (options.paths.length === 0) options.paths.push(".");
  return options;
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(USAGE);
    process.exit(0);
  }
  if (options.version) {
    console.log(JSON.parse(readFileSync(join(PACKAGE_ROOT, "package.json"), "utf8")).version);
    process.exit(0);
  }
  const result = checkFiles(options.paths, options);
  if (options.format === "json") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.diagnostics.length === 0) {
    console.log(`[hulian-check] PASS · ${result.filesChecked} files`);
  } else {
    for (const diagnostic of result.diagnostics) {
      console.log(
        `${diagnostic.file}:${diagnostic.line}:${diagnostic.column} ${diagnostic.severity} ${diagnostic.ruleId} ${diagnostic.message}`,
      );
      if (diagnostic.instead) console.log(`  建议: ${diagnostic.instead}`);
    }
    // 只有 warning 时不打 FAIL —— 退出码是 0，日志里却写着 FAIL 会让人以为门禁红了，
    // 进而要么去关规则，要么把真正的 error 也当成噪音。措辞必须与退出码一致。
    const errors = result.diagnostics.filter((d) => d.severity === "error").length;
    const warnings = result.diagnostics.length - errors;
    const verdict = errors ? "FAIL" : "WARN";
    const counts = [errors ? `${errors} error` : "", warnings ? `${warnings} warning` : ""]
      .filter(Boolean)
      .join(" + ");
    console.log(`[hulian-check] ${verdict} · ${counts} / ${result.filesChecked} files`);
  }
  if (result.diagnostics.some((diagnostic) => diagnostic.ruleId === "syntax-error")) {
    process.exitCode = 2;
  } else if (result.diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`[hulian-check] ${error.message}`);
  process.exitCode = 2;
}
