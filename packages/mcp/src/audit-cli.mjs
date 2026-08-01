// `npx @hulianui/mcp audit` —— 命令行跑一次采用体检，可落基线、可进 CI。
//
// 为什么写盘归 CLI 而不是 MCP tool：`audit_hulian_adoption` 声明了 readOnlyHint，
// 且 #41 的非目标里写着「不让 MCP 自动修改消费项目」。一个声明只读的 tool 顺手写文件，
// 比不提供这个能力更糟 —— 调用方是照着 annotation 决定要不要审批的。
// 所以 tool 只把 baseline.snapshot 交出来，落盘是人在命令行里的显式动作。
//
// ratchet 的语义（#43）：存量项目不能用「全量合规」当门禁，第一次体检几百条只会让门禁被
// 整个关掉。所以 --check 只在**新增**违规时非 0 退出，存量债务不阻断。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { auditAdoption, renderAudit } from "./audit.mjs";
import { loadRegistry } from "./data.mjs";
import { listModifiers, listSurfaces, listWorkflows } from "./profiles.mjs";

const BASELINE_FILE = ".hulianui/adoption-baseline.json";

const USAGE = `用法：npx @hulianui/mcp audit [选项]

给已经有代码的项目做组件采用体检。只读源码，不改任何业务文件。

选项：
  --cwd <path>        项目根，默认当前目录
  --surface <id>      人工覆盖场景判定：${listSurfaces().map((s) => s.id).join(" / ")}
  --modifiers <ids>   逗号分隔：${listModifiers().map((m) => m.id).join(" / ")}
  --workflow <id>     任务性质，默认 build：${listWorkflows().map((w) => w.id).join(" / ")}
                      原型 / demo 务必传 prototype，否则会按正式系统的尺子量它
  --baseline          读 ${BASELINE_FILE} 出差异
  --write-baseline    把本次结果写成基线（唯一会写文件的选项）
  --check             ratchet 门禁：只有**新增**违规才非 0 退出，存量债务不阻断
  --json              输出结构化数据
  -h, --help          显示本帮助

典型用法：

  npx @hulianui/mcp audit                          # 看一眼现状
  npx @hulianui/mcp audit --write-baseline         # 接受现有债务，立基线
  npx @hulianui/mcp audit --baseline --check       # 进 CI：只拦新增`;

function parseArgs(argv) {
  const flags = new Set();
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (["--cwd", "--surface", "--modifiers", "--workflow"].includes(a)) opts[a.slice(2)] = argv[++i];
    else flags.add(a);
  }
  return { flags, opts };
}

const readJson = (path) => {
  try {
    return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
  } catch {
    return null;
  }
};

/** @returns {Promise<number>} 进程退出码 */
export async function runAudit(argv) {
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

  const invalid = [
    opts.surface && !listSurfaces().some((s) => s.id === opts.surface) ? `surface: ${opts.surface}` : null,
    opts.workflow && !listWorkflows().some((w) => w.id === opts.workflow) ? `workflow: ${opts.workflow}` : null,
    ...(opts.modifiers ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((id) => !listModifiers().some((m) => m.id === id))
      .map((id) => `modifier: ${id}`),
  ].filter(Boolean);
  if (invalid.length) {
    console.error(`未知取值：${invalid.join("、")}\n\n${USAGE}`);
    return 1;
  }

  const baselinePath = join(projectRoot, BASELINE_FILE);
  const previous = flags.has("--baseline") || flags.has("--check") ? readJson(baselinePath) : null;
  if ((flags.has("--baseline") || flags.has("--check")) && !previous) {
    console.error(
      `读不到基线 ${BASELINE_FILE}。先跑 \`npx @hulianui/mcp audit --write-baseline\` 立一份 —— ` +
        `第一次体检的存量债务应当被接受为基线，而不是当成待修清单。`,
    );
    return 1;
  }

  let registry;
  try {
    registry = await loadRegistry();
  } catch (error) {
    console.error(`读不到 registry：${error.message}`);
    return 1;
  }

  const report = auditAdoption({
    projectRoot,
    registry,
    surface: opts.surface,
    modifiers: opts.modifiers?.split(",").map((s) => s.trim()).filter(Boolean),
    workflow: opts.workflow,
    baseline: previous,
  });

  if (flags.has("--json")) console.log(JSON.stringify(report, null, 2));
  else console.log(renderAudit(report));

  if (flags.has("--write-baseline")) {
    mkdirSync(dirname(baselinePath), { recursive: true });
    // 人类可读、diff 友好，且**不含项目源码** —— #41 已约定不采集隐式遥测
    writeFileSync(baselinePath, `${JSON.stringify(report.baseline.snapshot, null, 2)}\n`);
    console.log(`\n已写入基线：${BASELINE_FILE}（提交进仓库，之后 CI 只拦新增）`);
  }

  if (flags.has("--check")) {
    const broken = report.baseline.diff?.ratchetBroken ?? [];
    if (broken.length) {
      console.error(`\n❌ ratchet 破线：${broken.join("；")}`);
      console.error("存量债务不阻断，但**新增**违规要挡住。修掉，或确认合理后重新 --write-baseline。");
      return 1;
    }
    console.log("\n✅ ratchet 通过：没有新增违规。");
  }

  return 0;
}
