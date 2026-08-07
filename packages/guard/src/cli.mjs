#!/usr/bin/env node

import { checkFiles } from "./check.mjs";

function parseArgs(argv) {
  const options = { format: "text", paths: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") {
      continue;
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
