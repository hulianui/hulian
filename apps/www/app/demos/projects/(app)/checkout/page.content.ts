import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "all": "全部",
    "pleaseSelectAnInvoice": "请选择发票",
    "thePaymentAmountMustBeGreaterThan": "收款金额需大于 0",
    "invoiceHasBeenGenerated": "已生成收款单",
    "invoiceHasBeenClosed": "收款单已关闭",
    "collectionSlip": "收款单",
    "payer": "付款方",
    "paymentAmount": "收款金额",
    "paymentMethod": "支付方式",
    "status": "状态",
    "validityPeriod": "有效期",
    "operation": "操作",
    "goToTheCashier": "去收银台",
    "goToTheCashier2": "去收银台",
    "confirmToCancelPayment": "确认取消收款？",
    "afterClosingTheInvoiceWillNoLonger": "关闭后该收款单将无法再支付。",
    "confirmCancellation": "确认取消",
    "cancel": "取消",
    "amountToBeCollected": "待收款金额",
    "amountReceived": "已收款金额",
    "numberOfReceipts": "收款单数",
    "collectMoneyOnline": "在线收款",
    "initiatePayment": "发起收款",
    "keywords": "关键词",
    "invoiceNumberItemPayer": "收款单号 / 项目 / 付款方",
    "status2": "状态",
    "initiateOnlinePaymentCollection": "发起在线收款",
    "associatedInvoice": "关联发票",
    "receivable": "（应收",
    "amountOfPaymentYuan": "收款金额（元）",
    "suchAs": "如 258000",
    "validityPeriod2": "有效期",
  },
  en: {
    "all": "All",
    "pleaseSelectAnInvoice": "Please select an invoice",
    "thePaymentAmountMustBeGreaterThan": "The payment amount must be greater than 0",
    "invoiceHasBeenGenerated": "Invoice has been generated",
    "invoiceHasBeenClosed": "Invoice has been closed",
    "collectionSlip": "Collection slip",
    "payer": "Payer",
    "paymentAmount": "Payment amount",
    "paymentMethod": "Payment method",
    "status": "Status",
    "validityPeriod": "Validity period",
    "operation": "Operation",
    "goToTheCashier": "Go to the cashier",
    "goToTheCashier2": "Go to the cashier",
    "confirmToCancelPayment": "Confirm to cancel payment?",
    "afterClosingTheInvoiceWillNoLonger": "After closing, the invoice will no longer be able to be paid.",
    "confirmCancellation": "Confirm cancellation",
    "cancel": "Cancel",
    "amountToBeCollected": "Amount to be collected",
    "amountReceived": "Amount received",
    "numberOfReceipts": "Number of receipts",
    "collectMoneyOnline": "Collect money online",
    "initiatePayment": "Initiate payment",
    "keywords": "keywords",
    "invoiceNumberItemPayer": "Invoice number/item/payer",
    "status2": "Status",
    "initiateOnlinePaymentCollection": "Initiate online payment collection",
    "associatedInvoice": "Associated invoice",
    "receivable": "(receivable",
    "amountOfPaymentYuan": "Amount of payment (yuan)",
    "suchAs": "Such as 258000",
    "validityPeriod2": "Validity period",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-projects-app-checkout-page",
  content: t(content),
};

export default dictionary;
