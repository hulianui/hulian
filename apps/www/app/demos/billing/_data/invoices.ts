import { copy } from "./invoices.content";
import type { Invoice, SpendPoint } from "./types";

// 账单历史（近一年，倒序）。金额含税。
export const invoices: Invoice[] = [
  {
    id: "INV-2026-0601",
    date: "2026-06-01T02:00:00+08:00",
    period: "2026-07-01 ~ 2027-06-30",
    plan: copy("professionalEditionAnnualPayment"),
    amount: 9_864,
    status: "paid",
    lines: [
      { label: copy("professionalEditionSeatsAnnualPayment"), amount: 7_872 },
      { label: copy("aiSmartAssistantAnnualPayment"), amount: 468 },
      { label: copy("extendedStorageTbAnnualPayment"), amount: 288 },
      { label: copy("vat"), amount: 1_236 },
    ],
  },
  {
    id: "INV-2026-0501",
    date: "2026-05-01T02:00:00+08:00",
    period: copy("usageExceeded"),
    plan: copy("usageSettlement"),
    amount: 326,
    status: "paid",
    lines: [
      { label: copy("apiExceededTimes"), amount: 326 },
    ],
  },
  {
    id: "INV-2026-0401",
    date: "2026-04-01T02:00:00+08:00",
    period: copy("usageExceeded2"),
    plan: copy("usageSettlement2"),
    amount: 218,
    status: "paid",
    lines: [{ label: copy("apiExceededTimes2"), amount: 218 }],
  },
  {
    id: "INV-2026-0312",
    date: "2026-03-12T14:20:00+08:00",
    period: copy("seatExpansion"),
    plan: copy("seatChange"),
    amount: 612,
    status: "refunded",
    lines: [
      { label: copy("newSeatsAddedProportional"), amount: 612 },
      { label: copy("refundForDowngrade"), amount: -612 },
    ],
  },
  {
    id: "INV-2026-0301",
    date: "2026-03-01T02:00:00+08:00",
    period: copy("usageExceeded3"),
    plan: copy("usageSettlement3"),
    amount: 0,
    status: "failed",
    lines: [{ label: copy("apiExceededTimes3"), amount: 194 }],
  },
  {
    id: "INV-2025-0701",
    date: "2025-07-01T02:00:00+08:00",
    period: "2025-07-01 ~ 2026-06-30",
    plan: copy("professionalEditionAnnualPayment2"),
    amount: 6_360,
    status: "paid",
    lines: [
      { label: copy("professionalEditionSeatsAnnualPayment2"), amount: 4_920 },
      { label: copy("aiSmartAssistantAnnualPayment2"), amount: 468 },
      { label: copy("vat2"), amount: 972 },
    ],
  },
  {
    id: "INV-2025-0615",
    date: "2025-06-15T09:00:00+08:00",
    period: copy("firstTimeOpening"),
    plan: copy("professionalVersionTrialToRegularVersion"),
    amount: 99,
    status: "paid",
    lines: [{ label: copy("professionalVersionMonthlyPaymentFirstMonth"), amount: 99 }],
  },
];

export const invoiceById: Record<string, Invoice> = Object.fromEntries(invoices.map((i) => [i.id, i]));

// 近 8 个月消费走势（图表）。
export const spendSeries: SpendPoint[] = [
  { month: copy("november"), amount: 530 },
  { month: copy("december"), amount: 480 },
  { month: copy("january"), amount: 512 },
  { month: copy("february"), amount: 540 },
  { month: copy("march"), amount: 0 },
  { month: copy("april"), amount: 218 },
  { month: copy("may"), amount: 326 },
  { month: copy("june"), amount: 822 },
];

export const invoiceStatusMeta: Record<Invoice["status"], { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  paid: { label: copy("paid"), tone: "success" },
  pending: { label: copy("toBePaid"), tone: "warning" },
  failed: { label: copy("paymentFailed"), tone: "danger" },
  refunded: { label: copy("refunded"), tone: "neutral" },
};
