// 瀚舵 HanHelm 智能体任务调度平台 —— 数据模型 SSoT。
// 异构 AI 任务涌入任务总线 → 智能路由按「能力 + 成本 + 延迟 + 负载 + 优先级 + SLA」六维打分
// 派给 agent/模型执行器池 → 多 agent 编排 + 降级/failover + 全链路可观测。
// 纯类型 + 纯数据，无真实服务；所有时间用基准时间偏移，所有随机用 mulberry32 seed。

/** 任务能力域：覆盖文本/代码/图像/翻译/检索增强/抽取/审核/编排 8 类。 */
export type Capability =
  | "text" // 文本生成
  | "code" // 代码
  | "image" // 图像
  | "translate" // 翻译
  | "rag" // 检索增强（RAG）
  | "extract" // 结构化抽取
  | "moderate" // 内容审核
  | "orchestrate"; // 多 agent 编排

/** 任务优先级：P0 最高（安全/紧急），P3 最低（批量后台）。 */
export type Priority = "P0" | "P1" | "P2" | "P3";

/** 执行器健康度。 */
export type ExecutorHealth = "healthy" | "degraded" | "offline";

/** 执行器：可承接任务的模型或 agent。价位以「人民币元 / 1k tokens」记，便于直接展示。 */
export interface Executor {
  id: string;
  name: string;
  /** model=底层大模型；agent=封装了工具/流程的智能体。 */
  kind: "model" | "agent";
  /** 简短画像（供卡片副标题）。 */
  vendor?: string;
  capabilities: Capability[];
  /** 输入价（¥/1k tokens）。 */
  pricePer1kIn: number;
  /** 输出价（¥/1k tokens）。 */
  pricePer1kOut: number;
  /** 典型端到端延迟（毫秒）。 */
  latencyMs: number;
  /** 最大并发。 */
  maxConcurrency: number;
  /** 当前负载占用率 0-1（=在途并发 / maxConcurrency）。 */
  load: number;
  health: ExecutorHealth;
  /** 降级链：本执行器失败/不可用时依序尝试的执行器 id。 */
  fallbackChain: string[];
}

/** 子任务执行状态。 */
export type SubTaskStatus = "pending" | "running" | "done" | "failed" | "failover";

/** DAG 中的单个子任务节点。 */
export interface SubTask {
  id: string;
  title: string;
  capability: Capability;
  /** 派给的执行器 id。 */
  executorId: string;
  status: SubTaskStatus;
  /** 依赖的上游子任务 id（DAG 入边来源）。 */
  deps: string[];
  /** 执行耗时（毫秒）。 */
  durationMs: number;
  /** 该子任务成本（元）。 */
  costYuan: number;
}

/** 任务总状态。queued=排队 / running=执行中 / done=完成 / failed=失败 / at-risk=临期(SLA 告急)。 */
export type TaskStatus = "queued" | "running" | "done" | "failed" | "at-risk";

/** 运行过程帧：驱动详情页右栏的「思考/工具/流式/事件」回放。 */
export interface RunFrame {
  kind: "tool" | "thinking" | "stream" | "event";
  text: string;
  /** 相对任务开始的毫秒偏移。 */
  at: number;
}

/** 六维路由权重（各维占比，和≈1）。 */
export interface SixWeights {
  /** 能力覆盖度（越高越好）。 */
  capability: number;
  /** 成本（越低越好）。 */
  cost: number;
  /** 延迟（越低越好）。 */
  latency: number;
  /** 负载（越低越好）。 */
  load: number;
  /** 优先级匹配（高优任务偏好高能力执行器）。 */
  priority: number;
  /** SLA 余量（延迟相对 SLA 越宽裕越好）。 */
  sla: number;
}

/** 单个候选执行器的六维分项打分（每项已归一化到 0-1）。 */
export interface RoutingCandidate {
  executorId: string;
  scores: {
    capability: number;
    cost: number;
    latency: number;
    load: number;
    priority: number;
    sla: number;
  };
  /** 加权综合分（0-1，越高越优）。被淘汰者为 0。 */
  total: number;
  /** 若被淘汰，记录原因（如「能力不满足: image」）；未淘汰为 undefined。 */
  eliminated?: string;
}

/** 一次路由决策的完整回放数据。 */
export interface RoutingDecision {
  taskId: string;
  /** 所有候选（含被淘汰者）的分项打分，供决策回放表。 */
  candidates: RoutingCandidate[];
  /** 选中的执行器 id；无可用候选则为 null。 */
  chosenId: string | null;
  /** 人类可读的选择理由。 */
  reason: string;
  /** 执行期间发生的降级记录。 */
  failovers: { from: string; to: string; reason: string }[];
}

/** 任务：调度的基本单元。 */
export interface Task {
  id: string;
  title: string;
  /** 业务类型展示串（如「合同翻译」「舆情审核」）。 */
  type: string;
  /** 所需能力集合。 */
  capabilities: Capability[];
  priority: Priority;
  /** SLA 目标（毫秒）：端到端必须在此内完成。 */
  slaMs: number;
  /** 预算上限（元）。 */
  budgetYuan: number;
  status: TaskStatus;
  /** 创建时间（相对基准时间的毫秒偏移；展示时叠加基准）。 */
  createdAt: number;
  /** 已等待时长（毫秒）。 */
  waitedMs: number;
  /** 实际端到端耗时（毫秒，done/failed 时有值）。 */
  elapsedMs?: number;
  /** 实际花费（元，done/failed 时有值）。 */
  spentYuan?: number;
  /** 最终承接的执行器 id（=routing.chosenId 或 failover 后的）。 */
  assignedExecutorId: string | null;
  /** 提交人展示名。 */
  submitter: string;
  /** DAG 子任务（简单任务可为空）。 */
  subtasks: SubTask[];
  /** DAG 边。 */
  edges: { source: string; target: string }[];
  /** 运行过程帧（详情页回放）。 */
  frames: RunFrame[];
  /** 路由决策回放。 */
  routing: RoutingDecision;
}

/** 路由策略规则（智能路由页展示 + 决策解释）。 */
export interface RoutingRule {
  id: string;
  /** 规则名。 */
  name: string;
  /** 触发条件描述。 */
  when: string;
  /** 命中后的动作描述。 */
  then: string;
  /** 是否启用。 */
  enabled: boolean;
  /** 优先级序（越小越先匹配）。 */
  order: number;
}

/** 时序数据点（供 Sparkline/Chart）。 */
export interface MetricPoint {
  /** 时间标签（如「09:00」）。 */
  t: string;
  /** 值。 */
  v: number;
}

/** 一条命名时序（供 Sparkline/Chart/Funnel）。 */
export interface MetricSeries {
  key: string;
  label: string;
  /** 单位（如「QPS」「ms」「条」「¥」）。 */
  unit: string;
  points: MetricPoint[];
}

/** 桑基流向连接：任务类型 → 路由器 → 执行器。 */
export interface FlowLink {
  source: string;
  target: string;
  value: number;
}

/** 告警比较运算符。 */
export type AlertOp = ">" | ">=" | "<" | "<=";

/** 告警严重级别。 */
export type AlertSeverity = "info" | "warning" | "critical";

/** 告警规则。 */
export interface AlertRule {
  id: string;
  name: string;
  /** 监控指标 key（对应 MetricSeries.key）。 */
  metric: string;
  op: AlertOp;
  /** 阈值。 */
  threshold: number;
  /** 单位。 */
  unit: string;
  severity: AlertSeverity;
  enabled: boolean;
  /** 触达渠道描述（如「企业微信 / 短信」）。 */
  channel: string;
}

/** 告警事件（已触发的一条记录）。 */
export interface AlertEvent {
  id: string;
  ruleId: string;
  title: string;
  severity: AlertSeverity;
  /** 触发时实测值。 */
  value: number;
  unit: string;
  /** 触发时间展示串（避免 SSR Date 漂移，存定值）。 */
  at: string;
  /** 处置状态。 */
  status: "firing" | "acked" | "resolved";
  /** 关联执行器/任务的说明。 */
  detail: string;
}

/** 团队成员。 */
export interface Member {
  id: string;
  name: string;
  /** 头像：用首字（@hulian/ui Avatar 走文字兜底，无远程图）。 */
  avatar: string;
  role: string;
  /** 在线状态。 */
  online: boolean;
}
