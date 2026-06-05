import type { Invoice, SpendPoint } from "./types";

// 账单历史（近一年，倒序）。金额含税。
export const invoices: Invoice[] = [
  {
    id: "INV-2026-0601",
    date: "2026-06-01T02:00:00+08:00",
    period: "2026-07-01 ~ 2027-06-30",
    plan: "专业版（年付）",
    amount: 9_864,
    status: "paid",
    lines: [
      { label: "专业版 × 8 席（年付）", amount: 7_872 },
      { label: "AI 智能助手（年付）", amount: 468 },
      { label: "扩展存储 1TB（年付）", amount: 288 },
      { label: "增值税 6%", amount: 1_236 },
    ],
  },
  {
    id: "INV-2026-0501",
    date: "2026-05-01T02:00:00+08:00",
    period: "2026-05 用量超额",
    plan: "用量结算",
    amount: 326,
    status: "paid",
    lines: [
      { label: "API 超额 32.6 万次", amount: 326 },
    ],
  },
  {
    id: "INV-2026-0401",
    date: "2026-04-01T02:00:00+08:00",
    period: "2026-04 用量超额",
    plan: "用量结算",
    amount: 218,
    status: "paid",
    lines: [{ label: "API 超额 21.8 万次", amount: 218 }],
  },
  {
    id: "INV-2026-0312",
    date: "2026-03-12T14:20:00+08:00",
    period: "席位扩容",
    plan: "席位变更",
    amount: 612,
    status: "refunded",
    lines: [
      { label: "新增 3 席（按比例）", amount: 612 },
      { label: "降配退款", amount: -612 },
    ],
  },
  {
    id: "INV-2026-0301",
    date: "2026-03-01T02:00:00+08:00",
    period: "2026-03 用量超额",
    plan: "用量结算",
    amount: 0,
    status: "failed",
    lines: [{ label: "API 超额 19.4 万次", amount: 194 }],
  },
  {
    id: "INV-2025-0701",
    date: "2025-07-01T02:00:00+08:00",
    period: "2025-07-01 ~ 2026-06-30",
    plan: "专业版（年付）",
    amount: 6_360,
    status: "paid",
    lines: [
      { label: "专业版 × 5 席（年付）", amount: 4_920 },
      { label: "AI 智能助手（年付）", amount: 468 },
      { label: "增值税 6%", amount: 972 },
    ],
  },
  {
    id: "INV-2025-0615",
    date: "2025-06-15T09:00:00+08:00",
    period: "首次开通",
    plan: "专业版试用转正",
    amount: 99,
    status: "paid",
    lines: [{ label: "专业版（月付）首月", amount: 99 }],
  },
];

export const invoiceById: Record<string, Invoice> = Object.fromEntries(invoices.map((i) => [i.id, i]));

// 近 8 个月消费走势（图表）。
export const spendSeries: SpendPoint[] = [
  { month: "11月", amount: 530 },
  { month: "12月", amount: 480 },
  { month: "1月", amount: 512 },
  { month: "2月", amount: 540 },
  { month: "3月", amount: 0 },
  { month: "4月", amount: 218 },
  { month: "5月", amount: 326 },
  { month: "6月", amount: 822 },
];

export const invoiceStatusMeta: Record<Invoice["status"], { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  paid: { label: "已支付", tone: "success" },
  pending: { label: "待支付", tone: "warning" },
  failed: { label: "支付失败", tone: "danger" },
  refunded: { label: "已退款", tone: "neutral" },
};
