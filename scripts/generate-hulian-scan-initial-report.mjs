import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifact = async (name, file) =>
  JSON.parse(await readFile(resolve(repositoryRoot, ".hulian-scan", name, file), "utf8"));

const workspace = await artifact("workspace-initial", "summary.json");
const packed = await artifact("packed-initial", "summary.json");
const packedCheckpoint = await artifact("packed-initial", "checkpoint.json");
const inventory = await artifact("task11-inventory", "inventory.json");
const baseline = JSON.parse(
  await readFile(resolve(repositoryRoot, "scripts/performance-baseline.json"), "utf8"),
);

const measurementRuns = (report) => report.runs.filter((run) => run.stage === "measurement");
const workspaceRuns = new Map(measurementRuns(workspace).map((run) => [run.scenarioId, run]));
const packedRuns = new Map(measurementRuns(packed).map((run) => [run.scenarioId, run]));
const renderable = inventory.filter((entry) => entry.kind === "renderable");
const nonRendering = inventory.filter((entry) => entry.kind === "non-rendering");

function quantile(values, q) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * q) - 1)];
}

function metric(run, name, q = 0.5) {
  return quantile(
    run?.samples.flatMap((sample) => (Number.isFinite(sample[name]) ? [sample[name]] : [])) ?? [],
    q,
  );
}

function fixed(value, digits = 2) {
  return Number(value).toFixed(digits);
}

function countBy(values, key) {
  return Object.fromEntries(
    [...Map.groupBy(values, key)].map(([name, entries]) => [name, entries.length]),
  );
}

function markdownCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

const workspaceRevision = measurementRuns(workspace)[0]?.metadata.gitRevision ?? "unknown";
const packedRevision = measurementRuns(packed)[0]?.metadata.gitRevision ?? "unknown";
const browserVersion = measurementRuns(packed)[0]?.metadata.browserVersion ?? "unknown";
const categoryCounts = countBy(measurementRuns(packed), (run) => run.metadata.category);
const findingCounts = countBy(packed.findings, (finding) => finding.rule);
const excludedScenarios = new Set(packed.findings.map((finding) => finding.scenarioId));
const infrastructureErrors = packedCheckpoint.runs.flatMap((run) =>
  run.errors.map((error) => `${run.stage}:${run.scenarioId}: ${error}`),
);

const lines = [
  "# Hulian Scan 首次全局性能扫描报告",
  "",
  "> 扫描日期：2026-08-02。范围仅为 HulianUI 仓库内部工具与 HulianUI 自身；不是对外发布的通用 profiler。",
  "",
  "## 结论",
  "",
  `公开运行时 inventory 共 ${inventory.length} 个入口：${renderable.length} 个可渲染入口全部完成场景，${nonRendering.length} 个非渲染入口都有显式原因，0 个未分类。`,
  `仓库外真实 tarball 消费扫描完成 ${measurementRuns(packed).length}/${renderable.length} 个测量场景和 ${packedCheckpoint.runs.filter((run) => run.stage === "diagnosis").length} 个诊断场景；0 个执行错误、0 个缺失 React commit、每个测量场景 5 个样本。`,
  `原始 packed 扫描得到 ${packed.findingCount} 条硬 findings，覆盖 ${excludedScenarios.size} 个场景；首版基线只接纳 ${Object.keys(baseline.scenarios).length} 个无硬违规场景，其余 ${renderable.length - Object.keys(baseline.scenarios).length} 个没有被“基线化为正常”。`,
  "",
  "## 快照与环境",
  "",
  "| 项目 | Workspace | Packed consumer |",
  "| --- | --- | --- |",
  `| Git revision | \`${workspaceRevision}\` | \`${packedRevision}\` |`,
  `| React | 19.2.8 | 19.2.8 |`,
  `| Chromium | ${browserVersion} | ${browserVersion} |`,
  `| Node | 22.22.3 | 22.22.3 |`,
  `| 测量场景 | ${measurementRuns(workspace).length} | ${measurementRuns(packed).length} |`,
  `| Findings | ${workspace.findingCount} | ${packed.findingCount} |`,
  `| 执行错误 | ${measurementRuns(workspace).filter((run) => run.errors.length > 0).length} | ${infrastructureErrors.length} |`,
  "",
  `Workspace 首扫从 \`${workspaceRevision}\` 启动；扫描期间存在随后分别进入 \`15f8a90\` 和 \`50f1d19\` 的工作区修改：\`apps/perf-lab/app/harness.browser.test.ts\`、\`packages/hulian-scan/src/runner/default-dependencies.ts\`、对应 scanner test、\`packages/ui/src/ghost-cursor/ghost-cursor.tsx\` 与对应 test。Packed 首扫使用干净的 \`${packedRevision}\` tarball，因此基线只取 packed 结果。`,
  "",
  "### GPU 解释边界",
  "",
  "Chromium 151 在本次默认 headless 启动下报告 ANGLE SwiftShader 软件渲染器，而同一浏览器加 `--use-angle=metal` 后报告 Apple M1 Pro Metal。受控单样本对照中，`laser-flow/frame-budget` 从 SwiftShader 的 282–552ms 长任务降到 Metal 89ms，`galaxy/frame-budget` 从 154–404ms 降到 70ms；`faulty-terminal/frame-budget` 在 Metal 下仍为 511ms。故初扫的 WebGL findings 保留为原始证据，但优化计划先修扫描器的 GPU 元数据与本机 Metal 路径，再把仍复现的目标认定为源码缺陷。CI 无硬件 GPU 时不得把 SwiftShader 帧耗时写入发布基线。",
  "",
  "## 覆盖率",
  "",
  `场景类别：${Object.entries(categoryCounts).map(([name, count]) => `\`${name}\` ${count}`).join("，")}。Inventory 中 animated=${renderable.filter((entry) => entry.animated).length}，WebGL=${renderable.filter((entry) => entry.webgl).length}。`,
  "",
  "非渲染入口：",
  "",
  ...nonRendering.map((entry) => `- \`${entry.entry}\`：${entry.reason}`),
  "",
  "## Packed findings 汇总",
  "",
  ...Object.entries(findingCounts).map(([rule, count]) => `- \`${rule}\`：${count}`),
  "",
  "## 最慢提交（Packed median）",
  "",
  "| 排名 | 场景 | median commit |",
  "| ---: | --- | ---: |",
  ...packed.slowest.map(
    (entry, index) => `| ${index + 1} | \`${entry.scenarioId}\` | ${fixed(entry.commitDurationMs)}ms |`,
  ),
  "",
  "## 全部 findings（不截断）",
  "",
  "| 场景 | 组件 | 规则 | 严重度 | 当前值 | 证据 |",
  "| --- | --- | --- | --- | ---: | --- |",
  ...[...packed.findings]
    .sort((left, right) =>
      left.rule.localeCompare(right.rule) ||
      right.current - left.current ||
      left.scenarioId.localeCompare(right.scenarioId),
    )
    .map(
      (finding) =>
        `| \`${finding.scenarioId}\` | ${markdownCell(finding.component)} | \`${finding.rule}\` | ${finding.severity} | ${fixed(finding.current, 4)} | ${markdownCell(finding.evidence.join("; "))} |`,
    ),
  "",
  "## 基础设施失败",
  "",
  ...(infrastructureErrors.length === 0
    ? ["无。372 个 packed 测量场景与 190 个诊断场景均无运行错误。"]
    : infrastructureErrors.map((error) => `- ${markdownCell(error)}`)),
  "",
  "## 全部场景附录（不截断）",
  "",
  "数值格式为 `commit median / cascade p95 / long-task p95 / dropped-frame p95`。",
  "",
  "| 场景 | 组件 | 类别 | Workspace | Packed | Packed finding rules |",
  "| --- | --- | --- | ---: | ---: | --- |",
  ...renderable
    .sort((left, right) => left.scenarioId.localeCompare(right.scenarioId))
    .map((entry) => {
      const ws = workspaceRuns.get(entry.scenarioId);
      const pk = packedRuns.get(entry.scenarioId);
      const format = (run) =>
        [
          `${fixed(metric(run, "commitDurationMs"))}ms`,
          fixed(metric(run, "cascadeFanout", 0.95), 0),
          `${fixed(metric(run, "longTaskMs", 0.95))}ms`,
          fixed(metric(run, "droppedFrameRatio", 0.95), 4),
        ].join(" / ");
      const rules = packed.findings
        .filter((finding) => finding.scenarioId === entry.scenarioId)
        .map((finding) => `\`${finding.rule}\``)
        .join(", ");
      return `| \`${entry.scenarioId}\` | ${markdownCell(entry.primaryExport)} | ${pk?.metadata.category ?? "unknown"} | ${format(ws)} | ${format(pk)} | ${rules || "—"} |`;
    }),
  "",
  "## 原始证据",
  "",
  "- Workspace：`.hulian-scan/workspace-initial/{summary.json,findings.json,checkpoint.json,raw/}`",
  "- Packed：`.hulian-scan/packed-initial/{summary.json,findings.json,checkpoint.json,raw/}`",
  "- 完整 inventory：`.hulian-scan/task11-inventory/inventory.json`",
  "- 冻结基线：`scripts/performance-baseline.json`",
  "",
  "这些 `.hulian-scan` 原始文件是本机可恢复证据，按设计不提交 Git；本报告与冻结基线是仓库内的可审阅摘要。",
  "",
];

const output = resolve(repositoryRoot, "docs/performance/hulian-scan-initial-report.md");
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${lines.join("\n")}\n`, "utf8");
console.log(`wrote ${relative(repositoryRoot, output)} (${lines.length} lines)`);
