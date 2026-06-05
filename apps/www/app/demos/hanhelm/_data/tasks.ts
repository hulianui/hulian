// 任务池（mock）：14 个异构任务，覆盖 8 种能力、4 优先级、各状态（排队/执行中/完成/失败/临期）。
// 其中 3 个带完整 DAG（subtasks + edges）+ frames（tool/thinking/stream/event）+ routing（六维打分 + failover 记录）。
// 时间字段为「相对基准时间的毫秒偏移」，展示时由页面叠加 BASE_TIME；避免 SSR/CSR Date 漂移。

import type { Capability, RoutingDecision, Task } from "./types";

/** 基准时间：2026-06-05 09:00:00（本地）。所有 createdAt 为相对此的毫秒偏移。 */
export const BASE_TIME = new Date(2026, 5, 5, 9, 0, 0).getTime();

const MIN = 60_000;

// ── 辅助：构造一条「单执行器、无 DAG」的轻量路由决策 ──────────────
function simpleRouting(taskId: string, chosenId: string | null, reason: string): RoutingDecision {
  return { taskId, candidates: [], chosenId, reason, failovers: [] };
}

// ════════════════════════════════════════════════════════════
// 带完整 DAG 的任务 1：跨境合同审阅（RAG + 翻译 + 审核 + 编排）
// ════════════════════════════════════════════════════════════
const TASK_CONTRACT: Task = {
  id: "task-contract-review",
  title: "跨境采购合同智能审阅",
  type: "合同审阅",
  capabilities: ["rag", "translate", "moderate", "orchestrate"],
  priority: "P0",
  slaMs: 8 * MIN,
  budgetYuan: 6.0,
  status: "running",
  createdAt: 2 * MIN,
  waitedMs: 14_000,
  assignedExecutorId: "orchestrate-agent",
  submitter: "法务 · 周澜",
  subtasks: [
    { id: "c1", title: "检索内部合同条款库", capability: "rag", executorId: "rag-agent", status: "done", deps: [], durationMs: 12_400, costYuan: 0.42 },
    { id: "c2", title: "翻译英文条款为中文", capability: "translate", executorId: "haiku-4-5", status: "done", deps: ["c1"], durationMs: 6_800, costYuan: 0.11 },
    { id: "c3", title: "风险条款合规审核", capability: "moderate", executorId: "moderate-agent", status: "running", deps: ["c2"], durationMs: 9_200, costYuan: 0.28 },
    { id: "c4", title: "汇总审阅意见报告", capability: "orchestrate", executorId: "orchestrate-agent", status: "pending", deps: ["c1", "c3"], durationMs: 15_600, costYuan: 0.9 },
  ],
  edges: [
    { source: "c1", target: "c2" },
    { source: "c2", target: "c3" },
    { source: "c1", target: "c4" },
    { source: "c3", target: "c4" },
  ],
  frames: [
    { kind: "event", text: "任务进入总线，命中规则「P0 安全敏感 → 旗舰」", at: 0 },
    { kind: "thinking", text: "合同含跨境条款，需先建立条款上下文再翻译，避免术语漂移。", at: 600 },
    { kind: "tool", text: "调用 检索增强 Agent · 向量召回 24 条相似条款，重排取 Top 8。", at: 1400 },
    { kind: "stream", text: "已抽取「不可抗力」「争议管辖」「付款节点」三类关键条款…", at: 5200 },
    { kind: "tool", text: "调用 Haiku 4.5 · 批量翻译 8 条英文条款。", at: 13_000 },
    { kind: "thinking", text: "「liquidated damages」直译为「违约金」存歧义，标注为「约定损害赔偿金」。", at: 16_000 },
    { kind: "tool", text: "调用 内容审核 Agent · 比对合规基线，标记 2 处高风险。", at: 20_000 },
    { kind: "event", text: "等待审核完成后由 编排 Agent 汇总最终报告。", at: 21_000 },
  ],
  routing: {
    taskId: "task-contract-review",
    candidates: [
      { executorId: "orchestrate-agent", scores: { capability: 1, cost: 0.42, latency: 0.3, load: 0.62, priority: 0.95, sla: 0.83 }, total: 0.685 },
      { executorId: "opus-4-7", scores: { capability: 1, cost: 0.5, latency: 0.45, load: 0.29, priority: 0.85, sla: 0.76 }, total: 0.642 },
      { executorId: "sonnet-4-6", scores: { capability: 0, cost: 0, latency: 0, load: 0, priority: 0, sla: 0 }, total: 0, eliminated: "能力不满足: orchestrate" },
      { executorId: "rag-agent", scores: { capability: 0, cost: 0, latency: 0, load: 0, priority: 0, sla: 0 }, total: 0, eliminated: "能力不满足: translate/moderate/orchestrate" },
    ],
    chosenId: "orchestrate-agent",
    reason: "P0 + 多 agent 编排，编排调度 Agent 综合分最高（0.685），由其拉起 RAG/翻译/审核子链。",
    failovers: [],
  },
};

// ════════════════════════════════════════════════════════════
// 带完整 DAG 的任务 2：财报数据抽取（含一次 failover）
// ════════════════════════════════════════════════════════════
const TASK_REPORT: Task = {
  id: "task-report-extract",
  title: "上市公司财报结构化抽取",
  type: "数据抽取",
  capabilities: ["extract", "text"],
  priority: "P1",
  slaMs: 5 * MIN,
  budgetYuan: 2.5,
  status: "done",
  createdAt: 18 * MIN,
  waitedMs: 3_200,
  elapsedMs: 38_400,
  spentYuan: 0.61,
  assignedExecutorId: "haiku-4-5",
  submitter: "投研 · 林岸",
  subtasks: [
    { id: "r1", title: "解析 PDF 财报分页", capability: "extract", executorId: "extract-agent", status: "done", deps: [], durationMs: 8_600, costYuan: 0.18 },
    { id: "r2", title: "抽取三大报表字段", capability: "extract", executorId: "deepseek-v4", status: "failed", deps: ["r1"], durationMs: 4_100, costYuan: 0.02 },
    { id: "r2b", title: "抽取三大报表字段（降级重试）", capability: "extract", executorId: "haiku-4-5", status: "failover", deps: ["r1"], durationMs: 7_300, costYuan: 0.14 },
    { id: "r3", title: "校验勾稽关系", capability: "text", executorId: "haiku-4-5", status: "done", deps: ["r2b"], durationMs: 5_900, costYuan: 0.09 },
    { id: "r4", title: "导出结构化 JSON", capability: "text", executorId: "extract-agent", status: "done", deps: ["r3"], durationMs: 3_200, costYuan: 0.18 },
  ],
  edges: [
    { source: "r1", target: "r2" },
    { source: "r1", target: "r2b" },
    { source: "r2b", target: "r3" },
    { source: "r3", target: "r4" },
  ],
  frames: [
    { kind: "event", text: "任务进入总线，命中规则「批量低优 → 低成本池」，初选 DeepSeek V4。", at: 0 },
    { kind: "tool", text: "调用 结构化抽取 Agent · 解析 86 页财报，分离报表区块。", at: 500 },
    { kind: "tool", text: "调用 DeepSeek V4 · 抽取资产负债表字段…", at: 9_200 },
    { kind: "event", text: "⚠ DeepSeek V4 返回超时（健康度 degraded），触发降级。", at: 13_300 },
    { kind: "thinking", text: "降级链 [haiku-4-5, sonnet-4-6]，Haiku healthy 且具备 extract，切换。", at: 13_500 },
    { kind: "tool", text: "调用 Haiku 4.5 · 重试抽取三大报表字段，成功。", at: 14_000 },
    { kind: "stream", text: "勾稽校验：资产=负债+权益 ✓，营收-成本=毛利 ✓…", at: 21_500 },
    { kind: "event", text: "导出 JSON 完成，端到端 38.4s，花费 ¥0.61，SLA 余量充足。", at: 28_000 },
  ],
  routing: {
    taskId: "task-report-extract",
    candidates: [
      { executorId: "deepseek-v4", scores: { capability: 1, cost: 1, latency: 0.55, load: 0.56, priority: 0.6, sla: 0.76 }, total: 0.735 },
      { executorId: "haiku-4-5", scores: { capability: 1, cost: 0.82, latency: 0.9, load: 0.68, priority: 0.45, sla: 0.91 }, total: 0.727 },
      { executorId: "extract-agent", scores: { capability: 1, cost: 0.6, latency: 0.78, load: 0.45, priority: 0.6, sla: 0.82 }, total: 0.708 },
      { executorId: "sonnet-4-6", scores: { capability: 1, cost: 0.3, latency: 0.7, load: 0.42, priority: 0.9, sla: 0.8 }, total: 0.637 },
    ],
    chosenId: "deepseek-v4",
    reason: "P1 批量抽取，DeepSeek V4 极低成本综合分最高（0.735）；运行中超时降级至 Haiku 4.5。",
    failovers: [{ from: "deepseek-v4", to: "haiku-4-5", reason: "DeepSeek V4 抽取超时（degraded），按降级链切换至 Haiku 4.5" }],
  },
};

// ════════════════════════════════════════════════════════════
// 带完整 DAG 的任务 3：营销素材生成（文 → 图 → 审）
// ════════════════════════════════════════════════════════════
const TASK_CAMPAIGN: Task = {
  id: "task-campaign-asset",
  title: "618 营销主视觉素材生成",
  type: "素材生成",
  capabilities: ["text", "image", "moderate"],
  priority: "P2",
  slaMs: 12 * MIN,
  budgetYuan: 4.0,
  status: "running",
  createdAt: 5 * MIN,
  waitedMs: 22_000,
  assignedExecutorId: "sonnet-4-6",
  submitter: "市场 · 苏晚",
  subtasks: [
    { id: "m1", title: "生成 5 组文案 + 视觉提示词", capability: "text", executorId: "sonnet-4-6", status: "done", deps: [], durationMs: 7_200, costYuan: 0.22 },
    { id: "m2", title: "文生图 · 主视觉 1024×1024", capability: "image", executorId: "vision-flux", status: "running", deps: ["m1"], durationMs: 16_800, costYuan: 1.2 },
    { id: "m3", title: "素材合规审核（广告法）", capability: "moderate", executorId: "moderate-agent", status: "pending", deps: ["m2"], durationMs: 4_400, costYuan: 0.15 },
  ],
  edges: [
    { source: "m1", target: "m2" },
    { source: "m2", target: "m3" },
  ],
  frames: [
    { kind: "event", text: "任务进入总线，命中规则「图像任务 → 视觉模型」。", at: 0 },
    { kind: "tool", text: "调用 Sonnet 4.6 · 生成 5 组文案与配套视觉提示词。", at: 400 },
    { kind: "stream", text: "「盛夏开新场，好物半价享」「囤货季 · 一键凑单更划算」…", at: 3_000 },
    { kind: "tool", text: "调用 瑚琏绘卷 Flux · 渲染主视觉，1024×1024，CFG 7。", at: 8_000 },
    { kind: "thinking", text: "等待图像渲染完成后，须过广告法合规审核再发布。", at: 9_000 },
  ],
  routing: {
    taskId: "task-campaign-asset",
    candidates: [
      { executorId: "vision-flux", scores: { capability: 1, cost: 0.2, latency: 0.1, load: 0.5, priority: 0.5, sla: 0.65 }, total: 0.492 },
      { executorId: "sonnet-4-6", scores: { capability: 0, cost: 0, latency: 0, load: 0, priority: 0, sla: 0 }, total: 0, eliminated: "能力不满足: image" },
    ],
    chosenId: "vision-flux",
    reason: "含 image 能力，瑚琏绘卷 Flux 为唯一具备 image 的执行器，文/审环节由 Sonnet/审核 Agent 协作。",
    failovers: [],
  },
};

// ── 其余 11 个轻量任务（无 DAG，覆盖各能力/优先级/状态）──────────────
function lite(
  id: string,
  title: string,
  type: string,
  capabilities: Capability[],
  priority: Task["priority"],
  status: Task["status"],
  opts: Partial<Task> & { assignedExecutorId: string | null; submitter: string; createdAt: number; slaMs: number; budgetYuan: number; reason: string },
): Task {
  return {
    id,
    title,
    type,
    capabilities,
    priority,
    slaMs: opts.slaMs,
    budgetYuan: opts.budgetYuan,
    status,
    createdAt: opts.createdAt,
    waitedMs: opts.waitedMs ?? 0,
    elapsedMs: opts.elapsedMs,
    spentYuan: opts.spentYuan,
    assignedExecutorId: opts.assignedExecutorId,
    submitter: opts.submitter,
    subtasks: [],
    edges: [],
    frames: [],
    routing: simpleRouting(id, opts.assignedExecutorId, opts.reason),
  };
}

const LITE_TASKS: Task[] = [
  lite("task-translate-manual", "产品手册多语翻译", "翻译", ["translate", "text"], "P2", "done", {
    assignedExecutorId: "haiku-4-5", submitter: "本地化 · 高珩", createdAt: 31 * MIN, slaMs: 4 * MIN, budgetYuan: 1.0,
    elapsedMs: 96_000, spentYuan: 0.18, waitedMs: 2_400,
    reason: "P2 翻译，Haiku 4.5 低成本 + 低延迟综合最优。",
  }),
  lite("task-code-review", "PR 代码安全审查", "代码审查", ["code", "text"], "P1", "done", {
    assignedExecutorId: "sonnet-4-6", submitter: "研发 · 陈昭", createdAt: 22 * MIN, slaMs: 3 * MIN, budgetYuan: 2.0,
    elapsedMs: 42_000, spentYuan: 0.33, waitedMs: 1_800,
    reason: "P1 代码任务，Sonnet 4.6 均衡能力 + SLA 余量充足。",
  }),
  lite("task-kb-qa", "客服知识库智能问答", "RAG 问答", ["rag", "text"], "P1", "running", {
    assignedExecutorId: "rag-agent", submitter: "客服 · 沈知", createdAt: 1 * MIN, slaMs: 90_000, budgetYuan: 0.8,
    waitedMs: 9_000,
    reason: "命中「检索增强 → RAG Agent」，RAG Agent 承接。",
  }),
  lite("task-moderate-ugc", "社区 UGC 实时审核", "内容审核", ["moderate", "text"], "P0", "at-risk", {
    assignedExecutorId: "moderate-agent", submitter: "风控 · 韩澈", createdAt: 0.5 * MIN, slaMs: 30_000, budgetYuan: 0.5,
    waitedMs: 26_500,
    reason: "P0 审核，审核 Agent 承接；当前等待已达 SLA 88%，临期告警。",
  }),
  lite("task-summary-news", "行业舆情日报摘要", "文本摘要", ["text"], "P3", "queued", {
    assignedExecutorId: null, submitter: "运营 · 叶禾", createdAt: 0.2 * MIN, slaMs: 10 * MIN, budgetYuan: 0.3,
    waitedMs: 12_000,
    reason: "P3 批量低优排队中，待低成本池（DeepSeek/Haiku）释放并发。",
  }),
  lite("task-sql-gen", "自然语言转 SQL", "代码生成", ["code", "text"], "P2", "done", {
    assignedExecutorId: "deepseek-v4", submitter: "数据 · 罗砚", createdAt: 27 * MIN, slaMs: 2 * MIN, budgetYuan: 0.4,
    elapsedMs: 21_000, spentYuan: 0.04, waitedMs: 800,
    reason: "P2 代码生成，DeepSeek V4 超低成本综合最优。",
  }),
  lite("task-poster-image", "节日海报快速出图", "图像生成", ["image"], "P2", "queued", {
    assignedExecutorId: "vision-flux", submitter: "设计 · 邱白", createdAt: 0.1 * MIN, slaMs: 8 * MIN, budgetYuan: 3.0,
    waitedMs: 4_000,
    reason: "唯一 image 执行器 Flux 并发占满，排队等待空槽。",
  }),
  lite("task-invoice-extract", "增值税发票字段抽取", "数据抽取", ["extract"], "P2", "done", {
    assignedExecutorId: "extract-agent", submitter: "财务 · 唐宁", createdAt: 24 * MIN, slaMs: 90_000, budgetYuan: 0.6,
    elapsedMs: 18_000, spentYuan: 0.22, waitedMs: 1_200,
    reason: "P2 抽取，结构化抽取 Agent 专项能力 + SLA 充足。",
  }),
  lite("task-multilang-cs", "海外工单多语应答", "翻译", ["translate", "text"], "P1", "running", {
    assignedExecutorId: "haiku-4-5", submitter: "客服 · 顾棠", createdAt: 0.8 * MIN, slaMs: 60_000, budgetYuan: 0.5,
    waitedMs: 6_000,
    reason: "P1 翻译，Haiku 4.5 低延迟保实时性。",
  }),
  lite("task-orchestrate-research", "竞品调研多源汇编", "多 agent 编排", ["orchestrate", "rag", "text"], "P1", "failed", {
    assignedExecutorId: "orchestrate-agent", submitter: "战略 · 江屿", createdAt: 12 * MIN, slaMs: 15 * MIN, budgetYuan: 8.0,
    elapsedMs: 9 * MIN, spentYuan: 7.8, waitedMs: 3_000,
    reason: "P1 编排，编排 Agent 承接；因外部检索源限流，子链超预算失败。",
  }),
  lite("task-bulk-classify", "海量评论情感分类", "文本分类", ["text", "extract"], "P3", "queued", {
    assignedExecutorId: null, submitter: "运营 · 邵青", createdAt: 0.05 * MIN, slaMs: 20 * MIN, budgetYuan: 1.2,
    waitedMs: 18_000,
    reason: "P3 批量，命中「批量低优 → 低成本池」，排队等 DeepSeek 释放。",
  }),
];

/** 全部任务（3 个 DAG 任务在前，便于详情页 generateStaticParams 优先）。 */
export const TASKS: Task[] = [TASK_CONTRACT, TASK_REPORT, TASK_CAMPAIGN, ...LITE_TASKS];

/** 带完整 DAG 的任务 id（详情页主推这几个的编排回放）。 */
export const DAG_TASK_IDS = [TASK_CONTRACT.id, TASK_REPORT.id, TASK_CAMPAIGN.id];

/** 按 id 取任务。 */
export function taskById(id: string): Task | undefined {
  return TASKS.find((t) => t.id === id);
}
