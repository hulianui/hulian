import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "fullProcessCustomerManagement": "全流程客户管理",
    "leadBusinessOpportunityTransactionFollowUpIs": "线索 → 商机 → 成交，跟进有迹可循",
    "realTimePerformanceDashboard": "实时业绩看板",
    "oneScreenControlOfTransactionTrendsAnd": "成交趋势、商机漏斗一屏掌握",
    "dataSecurityAndControllability": "数据安全可控",
    "fieldLevelPermissionsAndOperationAuditing": "字段级权限与操作审计",
    "coral": "瑚",
    "hulianCrm": "瑚琏 CRM",
    "letEveryCustomerFollowUp": "让每一次客户跟进",
    "thereAreTracesToFollow": "都有迹可循",
    "fullProcessSalesManagementFromLeadAcquisition": "从线索接入到回款成交的全流程销售管理，团队协作、业绩透明、决策有据。",
    "hulianBuiltInExamples": "© 2026 瑚琏 Hulian · 内置示例",
    "coral2": "瑚",
    "hulianCrm2": "瑚琏 CRM",
    "welcomeBackLogInToYourSales": "欢迎回来，登录你的销售管理后台",
    "forgotPassword": "忘记密码",
    "applyForTrial": "申请试用",
    "demoEnvironmentFillInAnyUsernamePassword": "演示环境：用户名 / 密码任意填写即可登录",
  },
  en: {
    "fullProcessCustomerManagement": "Full process customer management",
    "leadBusinessOpportunityTransactionFollowUpIs": "Lead → Business opportunity → Transaction, follow-up is traceable",
    "realTimePerformanceDashboard": "Real-time performance dashboard",
    "oneScreenControlOfTransactionTrendsAnd": "One-screen control of transaction trends and business opportunity funnels",
    "dataSecurityAndControllability": "Data security and controllability",
    "fieldLevelPermissionsAndOperationAuditing": "Field-level permissions and operation auditing",
    "coral": "coral",
    "hulianCrm": "Hulian CRM",
    "letEveryCustomerFollowUp": "Let every customer follow up",
    "thereAreTracesToFollow": "There are traces to follow",
    "fullProcessSalesManagementFromLeadAcquisition": "Full-process sales management from lead acquisition to payment closing, team collaboration, performance transparency, and well-founded decision-making.",
    "hulianBuiltInExamples": "© 2026 Hulian · Built-in examples",
    "coral2": "coral",
    "hulianCrm2": "Hulian CRM",
    "welcomeBackLogInToYourSales": "Welcome back, log in to your sales management backend",
    "forgotPassword": "Forgot password",
    "applyForTrial": "Apply for trial",
    "demoEnvironmentFillInAnyUsernamePassword": "Demo environment: fill in any username/password to log in",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-crm-login-page",
  content: t(content),
};

export default dictionary;
