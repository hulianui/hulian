import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "all": "全部",
    "paid": "已支付",
    "paymentFailed": "支付失败",
    "refunded": "已退款",
    "billsAndInvoices": "账单与发票",
    "totalPaid": "累计已支付",
    "invoiceCount": " · 共 {0} 张账单",
    "oneFailedPayment": "有 {0} 笔扣款失败，请检查支付方式后重试。",
    "failedPaymentCount": "有 {0} 笔扣款失败，请检查支付方式后重试。",
    "filterByStatus": "按状态筛选",
    "reDebitHasBeenInitiated": "已发起重新扣款",
    "tryAgainNow": "立即重试",
    "thereIsNoBillInThisStatus": "该状态下暂无账单",
    "invoiceNumber": "发票号",
    "project": "项目",
    "settlement": "出账",
    "amount": "金额",
    "status": "状态",
    "operation": "操作",
    "billingPeriodValueTotalValueIncludingValue": "计费周期 {0}，合计 {1}，含 {2} 项明细。",
    "details": "详情",
    "downloadPdf": "下载 PDF",
    "downloadedValuePdf": "已下载 {0}.pdf",
    "valueInvoiceDetails": "{0} · 发票详情",
    "close": "关闭",
    "downloadedValuePdf2": "已下载 {0}.pdf",
    "downloadPdf2": "下载 PDF",
    "settlement2": "出账",
    "invoiceNumber2": "发票号",
    "invoicingSubject": "开票主体",
    "hanyunDigitalIntelligenceTechnologyCoLtd": "瀚云数智科技有限公司",
    "taxIdNumber": "税号",
    "paymentMethod": "付款方式",
    "automaticDeduction": "自动扣款",
    "costDetails": "费用明细",
    "total2": "合计",
  },
  en: {
    "all": "All",
    "paid": "Paid",
    "paymentFailed": "Payment failed",
    "refunded": "Refunded",
    "billsAndInvoices": "Invoices",
    "totalPaid": "Total paid",
    "invoiceCount": " · {0} invoices",
    "oneFailedPayment": "{0} payment failed. Check the payment method and try again.",
    "failedPaymentCount": "{0} payments failed. Check the payment method and try again.",
    "filterByStatus": "Filter by status",
    "reDebitHasBeenInitiated": "Payment retry started",
    "tryAgainNow": "Try again now",
    "thereIsNoBillInThisStatus": "No invoices match this status.",
    "invoiceNumber": "Invoice",
    "project": "Plan",
    "settlement": "Billing date",
    "amount": "Amount",
    "status": "Status",
    "operation": "Actions",
    "billingPeriodValueTotalValueIncludingValue": "Billing period {0} · {1} total · {2} line items.",
    "details": "Details",
    "downloadPdf": "Download PDF",
    "downloadedValuePdf": "Downloaded {0}.pdf",
    "valueInvoiceDetails": "{0} · Invoice details",
    "close": "Close",
    "downloadedValuePdf2": "Downloaded {0}.pdf",
    "downloadPdf2": "Download PDF",
    "settlement2": "Billed ",
    "invoiceNumber2": "Invoice",
    "invoicingSubject": "Legal entity",
    "hanyunDigitalIntelligenceTechnologyCoLtd": "Hanyun Digital Technology Co., Ltd.",
    "taxIdNumber": "Tax ID",
    "paymentMethod": "Payment method",
    "automaticDeduction": "Autopay",
    "costDetails": "Line items",
    "total2": "Total",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-billing-app-invoices-page",
  content: t(content),
};

export default dictionary;
