import { copy } from "./metrics.content";
import { invoices, paidAmount, dueAmount } from "./invoices";
import { projects } from "./projects";
import { quotes, quoteTotals } from "./quotes";
import { PROJECT_STAGES } from "./types";
import { projectStageLabel } from "./status";

// 工作台指标：全部由 mock 数据现算（单一口径，供 Stat/Chart/列表复用）。
const MONTH_OPEN = "2026-05-01"; // 「本月」口径

export const metrics = {
  activeProjects: projects.filter((p) => p.status === "进行中").length,
  totalProjects: projects.length,
  contractTotal: projects.reduce((s, p) => s + p.contractAmount, 0),
  // 本月报价额（价税合计）
  quotedThisMonth: quotes
    .filter((q) => q.createdAt >= MONTH_OPEN && q.status !== "已失效")
    .reduce((s, q) => s + quoteTotals(q.items, q.taxRate).total, 0),
  // 已开票总额
  invoicedTotal: invoices.filter((iv) => iv.status !== "待开").reduce((s, iv) => s + iv.amount, 0),
  // 待开票额（待开状态发票合计）
  pendingInvoice: invoices.filter((iv) => iv.status === "待开").reduce((s, iv) => s + iv.amount, 0),
  // 待回款额（已开票未结清的应收余额）
  pendingPayment: invoices.reduce((s, iv) => s + dueAmount(iv), 0),
  // 已回款总额
  collectedTotal: invoices.reduce((s, iv) => s + paidAmount(iv), 0),
};

/** 近 6 个月：产值（按发票开具月聚合）+ 回款（按到账月聚合），单位万元。 */
export function monthlyTrend() {
  const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
  return months.map((m) => {
    const output = invoices
      .filter((iv) => iv.issuedAt?.startsWith(m))
      .reduce((s, iv) => s + iv.amount, 0);
    const collected = invoices
      .flatMap((iv) => iv.payments)
      .filter((p) => p.at.startsWith(m))
      .reduce((s, p) => s + p.amount, 0);
    return {
      month: copy("valueMonths", Number(m.slice(5))),
      output: Math.round(output / 10000),
      collected: Math.round(collected / 10000),
    };
  });
}

/** 项目阶段分布（各阶段项目数）。 */
export function stageDistribution() {
  return PROJECT_STAGES.map((stage) => ({
    name: projectStageLabel[stage],
    value: projects.filter((p) => p.stage === stage).length,
  })).filter((d) => d.value > 0);
}

/** 在建项目进度（工作台进度卡片用，按进度倒序取前几）。 */
export function activeProgress() {
  return projects
    .filter((p) => p.status === "进行中")
    .sort((a, b) => b.progress - a.progress);
}
