import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "mGStationeryMultiYearDiscountFor": "晨光文具 · 续约多年期折扣待审批",
    "today": "今天",
    "yunqiTechnologySaasQuotationV2AwaitsCustomer": "云栖科技 · SaaS 报价单 v2 待客户确认",
    "today2": "今天",
    "auroraNewEnergyChargingNetworkManagementBusiness": "极光新能源 · 充电网管商务条款跟进",
    "tomorrow": "明天",
    "ruikangPharmaceuticalGmpCasesInTheSame": "瑞康制药 · 同行业 GMP 案例待发送",
    "zhixingEducationGreenfieldAgricultureNewLeadsTo": "知行教育 / 绿野农业 · 3 条新线索待分配",
    "thisWeek": "本周",
    "comparedWithLastMonth": "较上月",
    "workbench": "工作台",
    "dashboardSummary": "今天是 2026 年 6 月 4 日 · 你有 {0} 条待办、{1} 个客户跟进中",
    "totalNumberOfCustomers": "客户总数",
    "newThisMonth": "本月新增",
    "businessOpportunityAmount": "商机金额",
    "accumulatedTransactions": "累计成交",
    "transactionTrend": "成交趋势",
    "lastMonthsYuan": "近 6 个月 · 万元",
    "turnover2": "成交额（万）",
    "businessOpportunityStageDistribution": "商机阶段分布",
    "recentCustomers": "最近客户",
    "viewAll": "查看全部",
    "toDoList": "待办事项",
  },
  en: {
    "mGStationeryMultiYearDiscountFor": "M&G Stationery · Multi-year discount for renewal is pending approval",
    "today": "Today",
    "yunqiTechnologySaasQuotationV2AwaitsCustomer": "Yunqi Technology · SaaS quotation v2 awaits customer confirmation",
    "today2": "Today",
    "auroraNewEnergyChargingNetworkManagementBusiness": "Aurora New Energy · Charging Network Management Business Terms Follow-up",
    "tomorrow": "Tomorrow",
    "ruikangPharmaceuticalGmpCasesInTheSame": "Ruikang Pharmaceutical · GMP cases in the same industry are to be sent",
    "zhixingEducationGreenfieldAgricultureNewLeadsTo": "Zhixing Education / Greenfield Agriculture · 3 new leads to be assigned",
    "thisWeek": "This week",
    "comparedWithLastMonth": "Compared with last month",
    "workbench": "Dashboard",
    "dashboardSummary": "June 4, 2026 · {0} tasks due · {1} active customers",
    "totalNumberOfCustomers": "Total customers",
    "newThisMonth": "New this month",
    "businessOpportunityAmount": "Active pipeline",
    "accumulatedTransactions": "Total sales",
    "transactionTrend": "Sales trend",
    "lastMonthsYuan": "Past 6 months · CNY 10K",
    "turnover2": "Sales (CNY 10K)",
    "businessOpportunityStageDistribution": "Pipeline by stage",
    "recentCustomers": "Recent customers",
    "viewAll": "View all",
    "toDoList": "To-do list",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-crm-app-page",
  content: t(content),
};

export default dictionary;
