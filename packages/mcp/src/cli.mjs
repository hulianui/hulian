// `npx @hulianui/mcp init-agent` —— 把 Agent Contract 幂等写进各家客户端读取的指令文件。
//
// 硬约束（issue #41）：
//   - 不覆盖用户已有内容：只动 marker 包住的自己那一段，其余原样保留。
//   - 幂等：重复运行结果一致，无改动时明说「已最新」。
//   - 冲突不猜：marker 只剩一半时报错退出，不去猜区块边界。
//   - 不静默改配置：默认只更新项目**已存在**的指令文件；一份都没有才建一个最通用的。
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { TARGETS, applyPlan, doctor, planInit, planTarget, renderPlan } from "./contract.mjs";
import { installedVersion } from "./project.mjs";

const USAGE = `用法：npx @hulianui/mcp init-agent [选项]

把瑚琏 Agent Contract 写进本项目的 Agent 指令文件（幂等，可重复运行）。

选项：
  --check, --dry-run   只报告将要做什么，不写任何文件
  --doctor             体检：契约装在哪、是否最新、MCP 有没有配
  --target <ids>       逗号分隔，只处理指定目标：${TARGETS.map((t) => t.id).join(" / ")}
  --all                四个目标全写（默认只更新项目里已存在的指令文件）
  --cwd <path>         指定项目根，默认当前目录
  -h, --help           显示本帮助

默认行为：只更新项目里**已存在**的指令文件（AGENTS.md / CLAUDE.md / .cursor/rules /
.github/copilot-instructions.md）。一份都没有时创建 AGENTS.md —— 它被 Codex 与 Copilot
的 agents 模式共同读取，最通用。要覆盖更多客户端用 --all 或 --target。`;

function parseArgs(argv) {
  const flags = new Set();
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--target" || a === "--cwd") opts[a.slice(2)] = argv[++i];
    else if (a.startsWith("--") || a === "-h") flags.add(a);
    else opts._ = a;
  }
  return { flags, opts };
}

function renderDoctor(report) {
  const lines = [`项目：${report.projectRoot}`, ""];

  if (report.installed.length) {
    lines.push("契约已装且最新：");
    for (const i of report.installed)
      lines.push(`  ✓ ${i.target.file}（${i.target.clients.join(" / ")}）`);
  }
  if (report.stale.length) {
    lines.push("契约已装但**不是最新**（跑 init-agent 更新）：");
    for (const i of report.stale) lines.push(`  ! ${i.target.file}`);
  }
  if (report.broken.length) {
    lines.push("契约区块损坏：");
    for (const i of report.broken) lines.push(`  ✗ ${i.target.file} — ${i.reason}`);
  }
  if (report.missing.length) {
    lines.push("未装契约：");
    for (const t of report.missing)
      lines.push(`  · ${t.file}（${t.clients.join(" / ")}）`);
  }

  lines.push("");
  lines.push(
    report.mcpConfigs.length
      ? `MCP 已配置于：${report.mcpConfigs.join("、")}`
      : "未在本项目发现引用 hulianui 的 MCP 配置 —— 契约里的 tool 调用会落空，" +
        "请先把 hulianui server 加进客户端配置。",
  );

  if (report.uiVersion) lines.push(`实装 @hulianui/ui：${report.uiVersion}`);
  else lines.push("本项目 node_modules 里没找到 @hulianui/ui —— 契约仍可装，但版本相关建议无法校准。");

  return lines.join("\n");
}

/** @returns {Promise<number>} 进程退出码 */
export async function runInitAgent(argv) {
  const { flags, opts } = parseArgs(argv);
  if (flags.has("--help") || flags.has("-h")) {
    console.log(USAGE);
    return 0;
  }

  const projectRoot = resolve(opts.cwd ?? process.cwd());
  if (!existsSync(projectRoot)) {
    console.error(`目录不存在：${projectRoot}`);
    return 1;
  }

  const uiVersion = installedVersion(projectRoot, "@hulianui/ui")?.version ?? null;
  const contractOpts = { uiVersion };

  if (flags.has("--doctor")) {
    console.log(renderDoctor({ ...doctor(projectRoot, { opts: contractOpts }), uiVersion }));
    return 0;
  }

  const targets = opts.target
    ? opts.target.split(",").map((s) => s.trim()).filter(Boolean)
    : null;
  if (targets) {
    const unknown = targets.filter((t) => !TARGETS.some((x) => x.id === t));
    if (unknown.length) {
      console.error(
        `未知 target：${unknown.join("、")}。可选：${TARGETS.map((t) => t.id).join(" / ")}`,
      );
      return 1;
    }
  }

  let plans = planInit(projectRoot, {
    targets,
    onlyExisting: !flags.has("--all") && !targets,
    opts: contractOpts,
  });

  // 项目里一份指令文件都没有：建一个最通用的，而不是四份全撒。
  if (!plans.length) {
    const fallback = TARGETS[0]; // AGENTS.md
    plans = [planTarget(projectRoot, fallback, contractOpts)];
    console.log(`本项目还没有任何 Agent 指令文件，将创建 ${fallback.file}（最通用）。`);
  }

  const conflicts = plans.filter((p) => p.action === "conflict");
  if (conflicts.length) {
    console.error("发现冲突，未写入任何文件：");
    console.error(renderPlan(conflicts, projectRoot));
    return 1;
  }

  const dry = flags.has("--check") || flags.has("--dry-run");
  if (dry) {
    const changing = plans.filter((p) => p.action !== "unchanged");
    console.log(changing.length ? "将要做的改动：" : "已是最新，无需改动。");
    console.log(renderPlan(plans, projectRoot));
    return changing.length ? 1 : 0; // --check 在有待办时非 0，方便进 CI
  }

  const done = applyPlan(plans);
  const changed = done.filter((p) => p.action !== "unchanged");
  console.log(changed.length ? "已更新：" : "已是最新，无需改动。");
  console.log(renderPlan(done, projectRoot));

  if (changed.length) {
    console.log("");
    console.log("契约只写了「所有 UI 任务都适用」的规则；场景差异（中后台 / 营销页 /");
    console.log("移动端…）由 MCP 的 get_agent_profile 按需给出，不往指令文件里堆。");
    console.log("跑 `npx @hulianui/mcp init-agent --doctor` 可查看当前接入状态。");
  }
  return 0;
}
