import type { UsagePoint } from "./types";

// 近 7 日用量趋势。
export const usageTrend: UsagePoint[] = [
  { date: "05-30", requests: 18420, costUsd: 142.18, tokens: 24_800_000 },
  { date: "05-31", requests: 16880, costUsd: 128.4, tokens: 22_100_000 },
  { date: "06-01", requests: 21260, costUsd: 168.92, tokens: 29_400_000 },
  { date: "06-02", requests: 24910, costUsd: 196.34, tokens: 34_200_000 },
  { date: "06-03", requests: 23040, costUsd: 181.7, tokens: 31_800_000 },
  { date: "06-04", requests: 26380, costUsd: 214.56, tokens: 37_600_000 },
  { date: "06-05", requests: 12740, costUsd: 102.88, tokens: 18_300_000 },
];

// Top 模型调用排行（今日）。
export const topModels: { model: string; requests: number; costUsd: number }[] = [
  { model: "claude-opus-4-7", requests: 4280, costUsd: 38.6 },
  { model: "gpt-5.4", requests: 3120, costUsd: 21.4 },
  { model: "deepseek-v4", requests: 2840, costUsd: 6.8 },
  { model: "gemini-3-pro", requests: 1560, costUsd: 12.2 },
  { model: "claude-haiku-4-5", requests: 940, costUsd: 2.1 },
];

// 概览 KPI（今日）。
export const todayKpi = {
  requests: 12740,
  tokens: 18_300_000,
  costUsd: 102.88,
  successRate: 0.991,
};

// 账户余额。
export const account = {
  balanceUsd: 1862.44,
  monthlyQuotaUsd: 2000,
  monthlyUsedUsd: 1339.98,
  estimatedDays: 18,
  lowBalanceThreshold: 200,
};

// 账单明细（按日）。
export const billingRows = usageTrend.map((u) => ({
  date: u.date,
  requests: u.requests,
  tokens: u.tokens,
  costUsd: u.costUsd,
}));
