import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "comparedWithLastMonth": "较上月",
    "workbench": "工作台",
    "todayIsJune": "今天是 2026 年 6 月 4 日 ·",
    "projectsUnderConstructionPaymentAwaitingPayment": "个项目在建 · 待回款",
    "projectsUnderConstruction": "在建项目",
    "quotationAmountThisMonth": "本月报价额",
    "amountToBeInvoiced": "待开票额",
    "amountToBeRefunded": "待回款额",
    "outputValueAndRepayment": "产值与回款",
    "lastMonthsYuan": "近 6 个月 · 万元",
    "invoicingOutputValue": "开票产值（万）",
    "actualRepayment": "实际回款（万）",
    "projectStageDistribution": "项目阶段分布",
    "progressOfProjectsUnderConstruction": "在建项目进度",
    "viewAll": "查看全部",
    "contractAmount": "· 合同额",
    "recentNews": "近期动态",
  },
  en: {
    "comparedWithLastMonth": "Compared with last month",
    "workbench": "workbench",
    "todayIsJune": "Today is June 4, 2026 ·",
    "projectsUnderConstructionPaymentAwaitingPayment": "Projects under construction · Payment awaiting payment",
    "projectsUnderConstruction": "Projects under construction",
    "quotationAmountThisMonth": "Quote amount this month",
    "amountToBeInvoiced": "Amount to be invoiced",
    "amountToBeRefunded": "Outstanding receivables",
    "outputValueAndRepayment": "Output value and repayment",
    "lastMonthsYuan": "Last 6 months · 10,000 yuan",
    "invoicingOutputValue": "Invoicing output value (10,000)",
    "actualRepayment": "Actual repayment (10,000)",
    "projectStageDistribution": "Project stage distribution",
    "progressOfProjectsUnderConstruction": "Progress of projects under construction",
    "viewAll": "View all",
    "contractAmount": "· Contract amount",
    "recentNews": "Recent news",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-projects-app-page",
  content: t(content),
};

export default dictionary;
