// 瀚审 HanReview demo 数据契约（全 mock 内存态）。

export type Severity = "critical" | "major" | "minor" | "info";
export type FindingType = "bug" | "security" | "perf" | "style" | "complexity" | "test";
export type FindingStatus = "open" | "fixed" | "ignored" | "wontfix";
export type ReviewStatus = "queued" | "reviewing" | "done" | "failed";
export type GateResult = "pass" | "block";
export type FileChangeStatus = "added" | "modified" | "deleted" | "renamed";

export interface Repo {
  id: string;
  name: string;
  defaultBranch: string;
}

/** 审查用模型池条目（grounded 2026 价位，$/1M token）。 */
export interface ReviewModel {
  id: string;
  name: string;
  vendor: string;
  inPrice: number;
  outPrice: number;
  /** 能力标签。 */
  caps: string[];
  /** 适配场景一句话。 */
  fit: string;
  tier: "economy" | "balanced" | "frontier";
}

/** 一条行内 AI 批注（锚定到 diff 新文件行）。 */
export interface InlineAnnotation {
  line: number;
  severity: Severity;
  author: string;
  authorKind: "ai" | "human";
  body: string;
  suggestion?: { oldText?: string; newText: string };
}

export interface ChangedFile {
  path: string;
  status: FileChangeStatus;
  additions: number;
  deletions: number;
  /** 文件特征（喂路由纯函数）。 */
  lang: string;
  securitySensitive: boolean;
  isTestOrConfig: boolean;
  /** diff 文本（unified 渲染源）。 */
  oldText: string;
  newText: string;
  /** 行内批注。 */
  annotations: InlineAnnotation[];
  /** 路由：本文件派给的模型 id + 理由 + 成本。 */
  routedModelId: string;
  routeReason: string;
  routeCost: number;
}

/** AI 审查过程帧（右栏回放）。 */
export interface ReviewStep {
  kind: "plan" | "tool" | "thinking" | "summary";
  title: string;
  detail?: string;
  /** tool 帧：工具名 + 输出。 */
  tool?: string;
  output?: string;
  status?: "done" | "running" | "pending";
}

export interface Review {
  id: string;
  repoId: string;
  branch: string;
  title: string;
  author: { name: string; avatar?: string };
  status: ReviewStatus;
  /** 质量分 0-100（quality-score 算）。 */
  score: number;
  coverage: number;
  gate: GateResult;
  gateReasons: string[];
  /** 主审模型 id（取改动里最强的）。 */
  modelId: string;
  /** 本次审查总成本 ¥。 */
  cost: number;
  createdAt: string;
  files: ChangedFile[];
  steps: ReviewStep[];
}

export interface Finding {
  id: string;
  reviewId: string;
  repoId: string;
  severity: Severity;
  type: FindingType;
  rule: string;
  ruleDesc: string;
  file: string;
  line: number;
  status: FindingStatus;
  firstSeen: string;
  /** 问题代码片段（Drawer code-block）。 */
  snippet: string;
  suggestion?: { oldText?: string; newText: string };
}

export interface RoutingRule {
  id: string;
  when: string;
  modelId: string;
  note: string;
}

export interface GateRule {
  id: string;
  repoId: string;
  branch: string;
  minScore: number;
  maxCritical: number;
  minCoverage: number;
  rulesets: { key: FindingType; enabled: boolean }[];
}

export interface Member {
  name: string;
  avatar?: string;
  role: "管理员" | "审查者" | "只读";
  email: string;
}
