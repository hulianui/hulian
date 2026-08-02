import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "switchToAnnualPayment": "切到年付",
    "switchToAnnualAndSaveMonthsSame": "切换为年付立省 2 个月 —— 同样的专业版，一年少付 {0}",
    "goodAfternoon": "下午好，{0}",
    "lastLogin": "上次登录",
    "accountSince": "· 账户自",
    "letSGoTogether": "起一路同行",
    "quickOperation": "快捷操作",
    "upgradePackage": "升级套餐",
    "downloadInvoice": "下载发票",
    "consumptionThisMonth": "本月消费",
    "comparedWithLastMonth": "较上月",
    "currentMonthlyFee": "当前月费",
    "teamSeats": "团队席位",
    "valueSeats": "{0} 席",
    "nextRenewal": "下次续费",
    "consumptionInThePastMonths": "近 8 个月消费",
    "annualPayment": "年付",
    "monthlyPayment": "月付",
    "consumptionYuan": "消费(元)",
    "defaultPaymentMethod": "默认支付方式",
    "management": "管理",
    "willBeRenewedOnTheRenewalDate": "将于续费日",
    "automaticDeduction": "自动扣款",
    "resourceUsage": "资源用量",
    "recentBills": "近期账单",
    "all": "全部",
    "billingPeriodValueTotalValueDetailsTotaling": "计费周期 {0} · 共 {1} 项明细，合计 {2}。悬停即可速览，点击进入发票中心下载 PDF。",
  },
  en: {
    "switchToAnnualPayment": "Switch to annual billing",
    "switchToAnnualAndSaveMonthsSame": "Switch to annual billing and save {0} per year — the equivalent of two months.",
    "goodAfternoon": "Good afternoon, {0}",
    "lastLogin": "Last signed in ",
    "accountSince": " · Member since ",
    "letSGoTogether": ".",
    "quickOperation": "Quick actions",
    "upgradePackage": "Change plan",
    "downloadInvoice": "Download invoice",
    "consumptionThisMonth": "Spend this month",
    "comparedWithLastMonth": "vs. last month",
    "currentMonthlyFee": "Current monthly total",
    "teamSeats": "Team seats",
    "valueSeats": "{0} seats",
    "nextRenewal": "Next renewal",
    "consumptionInThePastMonths": "Spend over the past 8 months",
    "annualPayment": "Annual billing",
    "monthlyPayment": "Monthly billing",
    "consumptionYuan": "Spend (CNY)",
    "defaultPaymentMethod": "Default payment method",
    "management": "Manage",
    "willBeRenewedOnTheRenewalDate": "Autopay ",
    "automaticDeduction": ".",
    "resourceUsage": "Resource usage",
    "recentBills": "Recent invoices",
    "all": "All",
    "billingPeriodValueTotalValueDetailsTotaling": "Billing period {0} · {1} line items · {2} total. Hover for a preview, or open the invoice center to download the PDF.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-billing-app-page",
  content: t(content),
};

export default dictionary;
