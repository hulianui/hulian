// 瀚枢 HanHub mock 领域类型（全内存态）。

export type Capability = "chat" | "reason" | "vision" | "function" | "longContext";

export interface ModelMeta {
  id: string;
  name: string;
  provider: string; // providerId
  /** 输入价 USD / 1M tokens。 */
  inPrice: number;
  /** 输出价 USD / 1M tokens。 */
  outPrice: number;
  /** 上下文窗口（tokens）。 */
  context: number;
  /** 最大输出 tokens。 */
  maxOutput: number;
  capabilities: Capability[];
  /** 网关加价倍率（分组定价）。 */
  markup: number;
  /** 基准分（0-100，演示用）。 */
  benchmark: number;
  /** 限速 req/min。 */
  rpm: number;
}

export interface ProviderMeta {
  id: string;
  name: string;
  /** 品牌色（CSS 颜色），用于 logo 方块。 */
  color: string;
  /** logo 文字（1-2 字）。 */
  glyph: string;
}

export type KeyStatus = "active" | "disabled";

export interface ApiKey {
  id: string;
  name: string;
  /** 完整密钥（mock，用于显形/复制）。 */
  secret: string;
  group: string;
  status: KeyStatus;
  /** 本月已用花费 USD。 */
  usedUsd: number;
  /** 月度限额 USD（null = 不限）。 */
  limitUsd: number | null;
  rpm: number;
  createdAt: string;
  expiresAt: string | null;
  /** 允许调用的模型 id（空 = 全部）。 */
  allowedModels: string[];
}

export type LogStatus = "success" | "error" | "rate_limited" | "timeout";

export interface RequestLog {
  id: string;
  time: string; // ISO
  model: string; // modelId
  channel: string; // channelId
  keyName: string;
  status: LogStatus;
  httpStatus: number;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  /** 计费金额 USD。 */
  costUsd: number;
  /** 完整请求体（OpenAI 兼容）。 */
  request: unknown;
  /** 完整响应体。 */
  response: unknown;
}

export type ChannelHealth = "online" | "degraded" | "offline" | "maintenance";

export interface Channel {
  id: string;
  name: string;
  provider: string; // providerId
  health: ChannelHealth;
  latencyMs: number;
  /** 成功率 0-1。 */
  successRate: number;
  /** 近 12 次成功率 sparkline 点（0-1）。 */
  trend: number[];
  weight: number;
  priority: number;
  /** 限速余量 0-1。 */
  rpmHeadroom: number;
  /** 承载的模型 id。 */
  models: string[];
  lastProbe: string;
}

export interface UsagePoint {
  date: string; // MM-DD
  requests: number;
  costUsd: number;
  tokens: number;
}

export interface ProbeRecord {
  time: string;
  channel: string;
  ok: boolean;
  latencyMs: number;
  note: string;
}
