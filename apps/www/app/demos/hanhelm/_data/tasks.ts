import { copy } from "./tasks.content";
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
  title: copy("intelligentReviewOfCrossBorderProcurementContracts"),
  type: copy("contractReview"),
  capabilities: ["rag", "translate", "moderate", "orchestrate"],
  priority: "P0",
  slaMs: 8 * MIN,
  budgetYuan: 6.0,
  status: "running",
  createdAt: 2 * MIN,
  waitedMs: 14_000,
  assignedExecutorId: "orchestrate-agent",
  submitter: copy("legalAffairsZhouLan"),
  subtasks: [
    { id: "c1", title: copy("retrieveTheInternalContractClauseDatabase"), capability: "rag", executorId: "rag-agent", status: "done", deps: [], durationMs: 12_400, costYuan: 0.42 },
    { id: "c2", title: copy("theEnglishClausesAreTranslatedIntoChinese"), capability: "translate", executorId: "haiku-4-5", status: "done", deps: ["c1"], durationMs: 6_800, costYuan: 0.11 },
    { id: "c3", title: copy("riskClauseComplianceReview"), capability: "moderate", executorId: "moderate-agent", status: "running", deps: ["c2"], durationMs: 9_200, costYuan: 0.28 },
    { id: "c4", title: copy("summarizeAndReviewTheOpinionReport"), capability: "orchestrate", executorId: "orchestrate-agent", status: "pending", deps: ["c1", "c3"], durationMs: 15_600, costYuan: 0.9 },
  ],
  edges: [
    { source: "c1", target: "c2" },
    { source: "c2", target: "c3" },
    { source: "c1", target: "c4" },
    { source: "c3", target: "c4" },
  ],
  frames: [
    { kind: "event", text: copy("missionEntersTheBusHitsTheRule"), at: 0 },
    { kind: "thinking", text: copy("ifTheContractContainsCrossBorderClauses"), at: 600 },
    { kind: "tool", text: copy("callRetrievalEnhancementAgentRecallSimilarClauses"), at: 1400 },
    { kind: "stream", text: copy("threeKeyClausesForceMajeureJurisdictionOf"), at: 5200 },
    { kind: "tool", text: copy("callHaikuBatchTranslateEnglishTerms"), at: 13_000 },
    { kind: "thinking", text: copy("liquidatedDamagesIsADirectTranslationOf"), at: 16_000 },
    { kind: "tool", text: copy("callContentReviewAgentCompareComplianceBaselines"), at: 20_000 },
    { kind: "event", text: copy("afterTheReviewIsCompletedTheOrchestration"), at: 21_000 },
  ],
  routing: {
    taskId: "task-contract-review",
    candidates: [
      { executorId: "orchestrate-agent", scores: { capability: 1, cost: 0.42, latency: 0.3, load: 0.62, priority: 0.95, sla: 0.83 }, total: 0.685 },
      { executorId: "opus-4-7", scores: { capability: 1, cost: 0.5, latency: 0.45, load: 0.29, priority: 0.85, sla: 0.76 }, total: 0.642 },
      { executorId: "sonnet-4-6", scores: { capability: 0, cost: 0, latency: 0, load: 0, priority: 0, sla: 0 }, total: 0, eliminated: copy("abilityNotSatisfiedOrchestrate") },
      { executorId: "rag-agent", scores: { capability: 0, cost: 0, latency: 0, load: 0, priority: 0, sla: 0 }, total: 0, eliminated: copy("abilityNotSatisfiedTranslateModerateOrchestrate") },
    ],
    chosenId: "orchestrate-agent",
    reason: copy("p0MultiAgentOrchestrationWithOrchestratedAnd"),
    failovers: [],
  },
};

// ════════════════════════════════════════════════════════════
// 带完整 DAG 的任务 2：财报数据抽取（含一次 failover）
// ════════════════════════════════════════════════════════════
const TASK_REPORT: Task = {
  id: "task-report-extract",
  title: copy("structuredExtractionOfListedCompanyFinancialReports"),
  type: copy("dataExtraction"),
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
  submitter: copy("investmentResearchLinAn"),
  subtasks: [
    { id: "r1", title: copy("analyzePdfFinancialReportPages"), capability: "extract", executorId: "extract-agent", status: "done", deps: [], durationMs: 8_600, costYuan: 0.18 },
    { id: "r2", title: copy("extractThreeMajorReportFields"), capability: "extract", executorId: "deepseek-v4", status: "failed", deps: ["r1"], durationMs: 4_100, costYuan: 0.02 },
    { id: "r2b", title: copy("extractThreeMajorReportFieldsDowngradeAnd"), capability: "extract", executorId: "haiku-4-5", status: "failover", deps: ["r1"], durationMs: 7_300, costYuan: 0.14 },
    { id: "r3", title: copy("verifyAndVerifyTheRelationshipsBetweenThe"), capability: "text", executorId: "haiku-4-5", status: "done", deps: ["r2b"], durationMs: 5_900, costYuan: 0.09 },
    { id: "r4", title: copy("exportingStructuredJson"), capability: "text", executorId: "extract-agent", status: "done", deps: ["r3"], durationMs: 3_200, costYuan: 0.18 },
  ],
  edges: [
    { source: "r1", target: "r2" },
    { source: "r1", target: "r2b" },
    { source: "r2b", target: "r3" },
    { source: "r3", target: "r4" },
  ],
  frames: [
    { kind: "event", text: copy("theTaskEntersTheBusHittingThe"), at: 0 },
    { kind: "tool", text: copy("callStructuredExtractAgentParseAnPage"), at: 500 },
    { kind: "tool", text: copy("callDeepseekV4ExtractBalanceSheetFields"), at: 9_200 },
    { kind: "event", text: copy("deepseekV4ReturnsATimeoutHealthDegraded"), at: 13_300 },
    { kind: "thinking", text: copy("degradationChainHaikuSonnetHaikuHealthyWith"), at: 13_500 },
    { kind: "tool", text: copy("callHaikuTryAgainToExtractThe"), at: 14_000 },
    { kind: "stream", text: copy("crossCheckingVerificationAssetsLiabilitiesEquityRevenue"), at: 21_500 },
    { kind: "event", text: copy("exportingJsonCompletesEndToEndIn"), at: 28_000 },
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
    reason: copy("p1BatchExtractionDeepseekV4HadThe"),
    failovers: [{ from: "deepseek-v4", to: "haiku-4-5", reason: copy("deepseekV4DegradedAndSwitchedToHaiku") }],
  },
};

// ════════════════════════════════════════════════════════════
// 带完整 DAG 的任务 3：营销素材生成（文 → 图 → 审）
// ════════════════════════════════════════════════════════════
const TASK_CAMPAIGN: Task = {
  id: "task-campaign-asset",
  title: copy("mainMarketingVisualMaterialGeneration"),
  type: copy("materialGeneration"),
  capabilities: ["text", "image", "moderate"],
  priority: "P2",
  slaMs: 12 * MIN,
  budgetYuan: 4.0,
  status: "running",
  createdAt: 5 * MIN,
  waitedMs: 22_000,
  assignedExecutorId: "sonnet-4-6",
  submitter: copy("marketSuWan"),
  subtasks: [
    { id: "m1", title: copy("generateSetsOfCopywritingVisualPrompts"), capability: "text", executorId: "sonnet-4-6", status: "done", deps: [], durationMs: 7_200, costYuan: 0.22 },
    { id: "m2", title: copy("textToTextImageMainVisual"), capability: "image", executorId: "vision-flux", status: "running", deps: ["m1"], durationMs: 16_800, costYuan: 1.2 },
    { id: "m3", title: copy("materialComplianceReviewAdvertisingLaw"), capability: "moderate", executorId: "moderate-agent", status: "pending", deps: ["m2"], durationMs: 4_400, costYuan: 0.15 },
  ],
  edges: [
    { source: "m1", target: "m2" },
    { source: "m2", target: "m3" },
  ],
  frames: [
    { kind: "event", text: copy("theTaskEntersTheBusAndHits"), at: 0 },
    { kind: "tool", text: copy("callSonnetGenerateSetsOfCopyAnd"), at: 400 },
    { kind: "stream", text: copy("newSummerStoresEnjoyGoodItemsAt"), at: 3_000 },
    { kind: "tool", text: copy("callingHulianScrollFluxRenderTheMain"), at: 8_000 },
    { kind: "thinking", text: copy("afterImageRenderingIsCompletedItMust"), at: 9_000 },
  ],
  routing: {
    taskId: "task-campaign-asset",
    candidates: [
      { executorId: "vision-flux", scores: { capability: 1, cost: 0.2, latency: 0.1, load: 0.5, priority: 0.5, sla: 0.65 }, total: 0.492 },
      { executorId: "sonnet-4-6", scores: { capability: 0, cost: 0, latency: 0, load: 0, priority: 0, sla: 0 }, total: 0, eliminated: copy("abilityNotSatisfiedImage") },
    ],
    chosenId: "vision-flux",
    reason: copy("withImageCapabilitiesHulianScrollFluxIs"),
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
  lite("task-translate-manual", copy("multilingualTranslationOfProductManuals"), copy("translation"), ["translate", "text"], "P2", "done", {
    assignedExecutorId: "haiku-4-5", submitter: copy("localizationGaoHeng"), createdAt: 31 * MIN, slaMs: 4 * MIN, budgetYuan: 1.0,
    elapsedMs: 96_000, spentYuan: 0.18, waitedMs: 2_400,
    reason: copy("p2TranslationHaikuIsOptimalForLow"),
  }),
  lite("task-code-review", copy("prCodeSecurityReview"), copy("codeReview"), ["code", "text"], "P1", "done", {
    assignedExecutorId: "sonnet-4-6", submitter: copy("researchAndDevelopmentChenZhao"), createdAt: 22 * MIN, slaMs: 3 * MIN, budgetYuan: 2.0,
    elapsedMs: 42_000, spentYuan: 0.33, waitedMs: 1_800,
    reason: copy("p1CodingTaskSonnetBalancingCapabilityAmple"),
  }),
  lite("task-kb-qa", copy("customerServiceKnowledgeBaseIntelligentQA"), copy("ragQA"), ["rag", "text"], "P1", "running", {
    assignedExecutorId: "rag-agent", submitter: copy("customerServiceShenZhi"), createdAt: 1 * MIN, slaMs: 90_000, budgetYuan: 0.8,
    waitedMs: 9_000,
    reason: copy("hitTheRetrievalEnhancementRagAgentRag"),
  }),
  lite("task-moderate-ugc", copy("realTimeCommunityUgcReview"), copy("contentReview"), ["moderate", "text"], "P0", "at-risk", {
    assignedExecutorId: "moderate-agent", submitter: copy("riskControlHanChe"), createdAt: 0.5 * MIN, slaMs: 30_000, budgetYuan: 0.5,
    waitedMs: 26_500,
    reason: copy("p0AuditReviewAgentAcceptanceCurrentWaiting"),
  }),
  lite("task-summary-news", copy("industryPublicOpinionDailySummary"), copy("textSummary"), ["text"], "P3", "queued", {
    assignedExecutorId: null, submitter: copy("operationsYeHe"), createdAt: 0.2 * MIN, slaMs: 10 * MIN, budgetYuan: 0.3,
    waitedMs: 12_000,
    reason: copy("p3BatchLowQualityQueueingWaitingFor"),
  }),
  lite("task-sql-gen", copy("naturalLanguageToSql"), copy("codeGeneration"), ["code", "text"], "P2", "done", {
    assignedExecutorId: "deepseek-v4", submitter: copy("dataLuoYan"), createdAt: 27 * MIN, slaMs: 2 * MIN, budgetYuan: 0.4,
    elapsedMs: 21_000, spentYuan: 0.04, waitedMs: 800,
    reason: copy("p2CodeGenerationDeepseekV4UltraLow"),
  }),
  lite("task-poster-image", copy("quickReleaseOfHolidayPosterImages"), copy("imageGeneration"), ["image"], "P2", "queued", {
    assignedExecutorId: "vision-flux", submitter: copy("designQiuBai"), createdAt: 0.1 * MIN, slaMs: 8 * MIN, budgetYuan: 3.0,
    waitedMs: 4_000,
    reason: copy("theUniqueImageActuatorFluxConcurrentlyOccupies"),
  }),
  lite("task-invoice-extract", copy("extractionOfVatInvoiceFields"), copy("dataExtraction2"), ["extract"], "P2", "done", {
    assignedExecutorId: "extract-agent", submitter: copy("financeTangNing"), createdAt: 24 * MIN, slaMs: 90_000, budgetYuan: 0.6,
    elapsedMs: 18_000, spentYuan: 0.22, waitedMs: 1_200,
    reason: copy("p2ExtractionStructuredExtractionAgentSpecializedCapability"),
  }),
  lite("task-multilang-cs", copy("multilingualHandlingOfOverseasWorkOrders"), copy("translation2"), ["translate", "text"], "P1", "running", {
    assignedExecutorId: "haiku-4-5", submitter: copy("customerServiceGuTang"), createdAt: 0.8 * MIN, slaMs: 60_000, budgetYuan: 0.5,
    waitedMs: 6_000,
    reason: copy("p1TranslationHaikuLowLatencyWithReal"),
  }),
  lite("task-orchestrate-research", copy("compilationOfCompetitorResearchFromMultipleSources"), copy("multiAgentOrchestration"), ["orchestrate", "rag", "text"], "P1", "failed", {
    assignedExecutorId: "orchestrate-agent", submitter: copy("strategyJiangyu"), createdAt: 12 * MIN, slaMs: 15 * MIN, budgetYuan: 8.0,
    elapsedMs: 9 * MIN, spentYuan: 7.8, waitedMs: 3_000,
    reason: copy("p1OrchestrationOrchestratedByAgentAcceptanceDue"),
  }),
  lite("task-bulk-classify", copy("aMassiveNumberOfCommentsAndEmotional"), copy("textClassification"), ["text", "extract"], "P3", "queued", {
    assignedExecutorId: null, submitter: copy("operationsShaoQing"), createdAt: 0.05 * MIN, slaMs: 20 * MIN, budgetYuan: 1.2,
    waitedMs: 18_000,
    reason: copy("p3BatchHitTheBatchLowQuality"),
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
