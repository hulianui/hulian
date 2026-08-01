// guard 桥：把 @hulianui/guard 当**库**调，而不是让模型自己拼一条 shell 命令再解析文本。
//
// 此前 install_block 只给出一行 `npx -y @hulianui/guard <files>`，跑不跑、怎么读结果全靠
// 模型临场发挥；多数时候它只跑 typecheck 就收工，瑚琏专属约束（style 覆盖、toast 成员方法、
// 颜色 token 前缀、私有深导入）一条都没检。这里返回结构化诊断，定位到 file:line:column。
//
// 约定：**业务代码违规不是工具失败**。ok:false 表示代码有问题，isError 只留给参数错误、
// 文件读不出来、guard 自身崩了这类「工具没能完成工作」的情况 —— 两者混用会让模型
// 把「你的代码有 3 个错误」误读成「这个工具坏了」，从而绕开验证。

import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { extname, isAbsolute, join, relative, resolve } from "node:path";

import { checkSource, loadConventions } from "@hulianui/guard";

const require_ = createRequire(import.meta.url);
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

export function guardVersion() {
  try {
    // 不能直接 require("@hulianui/guard/package.json")：guard 的 exports 只开了 "."，
    // 深路径会被解析器挡掉。先解析入口文件，再从它所在目录往上找 package.json。
    const entry = require_.resolve("@hulianui/guard");
    return JSON.parse(readFileSync(resolve(entry, "..", "..", "package.json"), "utf8")).version ?? null;
  } catch {
    return null;
  }
}

/**
 * 检查若干文件（可选叠加一段还没落盘的代码）。
 * 单个文件读失败只影响它自己，其余文件的诊断照常返回。
 */
export function validateUsage({ files = [], code, filePath, projectRoot, configPath } = {}) {
  if (!files.length && typeof code !== "string") {
    return { ok: false, invalid: "至少要给 files（文件路径数组）或 code（待检查的源码）" };
  }
  const root = projectRoot ? resolve(projectRoot) : process.cwd();
  const conventions = loadConventions(configPath);

  const diagnostics = [];
  const checked = [];
  const skipped = [];

  for (const entry of files) {
    const abs = isAbsolute(entry) ? entry : join(root, entry);
    try {
      if (!existsSync(abs)) {
        skipped.push({ file: entry, reason: "文件不存在" });
        continue;
      }
      if (statSync(abs).isDirectory()) {
        skipped.push({ file: entry, reason: "是目录；请传具体文件，或用 npx @hulianui/guard <dir>" });
        continue;
      }
      if (!SOURCE_EXTENSIONS.has(extname(abs))) {
        skipped.push({ file: entry, reason: `不是可检查的源码类型（${extname(abs) || "无扩展名"}）` });
        continue;
      }
      const source = readFileSync(abs, "utf8");
      const display = abs.startsWith(root) ? relative(root, abs) || entry : abs;
      const result = checkSource(source, { filePath: abs, conventions });
      diagnostics.push(...result.diagnostics.map((item) => ({ ...item, file: display })));
      checked.push(display);
    } catch (error) {
      // 一个文件炸掉不该带走整批诊断
      skipped.push({ file: entry, reason: error.message });
    }
  }

  if (typeof code === "string") {
    const display = filePath ?? "(inline).tsx";
    try {
      const result = checkSource(code, { filePath: display, conventions });
      diagnostics.push(...result.diagnostics);
      checked.push(display);
    } catch (error) {
      skipped.push({ file: display, reason: error.message });
    }
  }

  const errors = diagnostics.filter((item) => item.severity === "error").length;
  const warnings = diagnostics.length - errors;

  // 一个文件都没检查成 → 这是**工具没能完成工作**，不是「代码没问题」。
  // 否则「路径拼错」会安静地渲染成 `✅ guard 通过 · 0 个文件`，比不验更糟：
  // 模型据此认为验过了，实际一行代码都没看过。
  if (checked.length === 0) {
    return {
      unusable:
        `没有任何文件被检查（${skipped.length} 个被跳过）：` +
        skipped.map((item) => `${item.file} —— ${item.reason}`).join("；") +
        "。检查路径是否正确，或用 projectRoot 指定基准目录。",
      skipped,
    };
  }

  // 部分文件没检查成 → 已检查的那部分干净也不能叫「通过」，
  // 否则漏掉的文件会被当成验过。ok 只在**全部要检查的都检查了且无 error** 时为真。
  const partial = skipped.length > 0;
  return {
    ok: errors === 0 && !partial,
    partial,
    summary: { files: checked.length, errors, warnings, skipped: skipped.length },
    diagnostics,
    checked,
    skipped,
  };
}

export function renderValidation(result, { versions }) {
  if (result.invalid) return result.invalid;
  const headline = () => {
    const { files, errors, warnings } = result.summary;
    if (errors || warnings) {
      return `❌ guard 未通过 · ${errors} error / ${warnings} warning · 已检查 ${files} 个文件${
        result.partial ? `（另有 ${result.summary.skipped} 个未检查）` : ""
      }`;
    }
    return result.partial
      ? `⚠️ 部分完成 · 已检查的 ${files} 个文件无违规，但另有 ${result.summary.skipped} 个未检查 —— 未检查的部分不算通过`
      : `✅ guard 通过 · ${files} 个文件`;
  };
  const lines = [headline()];
  for (const item of result.diagnostics) {
    lines.push(
      `${item.file}:${item.line}:${item.column} ${item.severity} ${item.ruleId} ${item.message}`,
    );
    if (item.instead) lines.push(`  该怎么做：${item.instead}`);
  }
  if (result.skipped.length) {
    lines.push("", "未检查：");
    for (const item of result.skipped) lines.push(`- ${item.file}：${item.reason}`);
  }
  lines.push(
    "",
    `guard ${versions.guard ?? "?"}${versions.ui ? ` · registry v${versions.ui}` : ""}`,
    "> 这是**约束门禁**，不替代 typecheck、单元测试、a11y 与真实视觉验证 —— 通过不等于页面是对的。",
  );
  return lines.join("\n");
}
