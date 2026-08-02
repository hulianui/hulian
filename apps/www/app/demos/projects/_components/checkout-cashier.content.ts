import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "hulianConstructionEngineeringGroupCoLtd": "瑚琏建工集团有限公司",
    "pleaseScanWithWechatToCompleteThe": "请用微信扫一扫完成支付",
    "pleaseUseAlipayToScanAndComplete": "请用支付宝扫一扫完成支付",
    "pleaseUseCorporateOnlineBankingToScan": "请用企业网银扫码或按下方账号转账",
    "pleaseUseTheMobileBankingAppTo": "请用手机银行 App 扫码支付",
    "theReceiptDoesNotExist": "收款单不存在",
    "paymentSuccessful": "支付成功",
    "valueValueHasArrived": "{0} · {1} 已到账",
    "paymentSuccessful2": "支付成功",
    "paymentAmount": "收款金额",
    "paymentMethod": "支付方式",
    "serialNumber": "流水号",
    "returnToPaymentList": "返回收款列表",
    "viewInvoicePayment": "查看发票回款",
    "invoiceHasBeenClosed": "收款单已关闭",
    "thePaymentValidityPeriodHasExpiredPlease": "支付有效期已过，请返回列表重新发起收款",
    "returnToPaymentList2": "返回收款列表",
    "collectMoneyOnline": "· 在线收款",
    "payRemainingTime": "支付剩余时间",
    "paymentMethod2": "支付方式",
    "waitingForPaymentConfirmation": "等待支付确认…",
    "processing": "处理中",
    "iHaveCompletedPayment": "我已完成支付",
  },
  en: {
    "hulianConstructionEngineeringGroupCoLtd": "Hulian Construction Engineering Group Co., Ltd.",
    "pleaseScanWithWechatToCompleteThe": "Please scan with WeChat to complete the payment",
    "pleaseUseAlipayToScanAndComplete": "Please use Alipay to scan and complete the payment.",
    "pleaseUseCorporateOnlineBankingToScan": "Please use corporate online banking to scan the code or click the account number below to transfer money",
    "pleaseUseTheMobileBankingAppTo": "Please use the mobile banking app to scan the QR code to pay.",
    "theReceiptDoesNotExist": "Payment request not found",
    "paymentSuccessful": "Payment successful",
    "valueValueHasArrived": "{0} · {1} has arrived",
    "paymentSuccessful2": "Payment successful",
    "paymentAmount": "Payment amount",
    "paymentMethod": "Payment method",
    "serialNumber": "serial number",
    "returnToPaymentList": "Return to payment list",
    "viewInvoicePayment": "View invoice payment",
    "invoiceHasBeenClosed": "Invoice has been closed",
    "thePaymentValidityPeriodHasExpiredPlease": "The payment validity period has expired. Please return to the list to initiate payment again.",
    "returnToPaymentList2": "Return to payment list",
    "collectMoneyOnline": "· Collect money online",
    "payRemainingTime": "Pay remaining time",
    "paymentMethod2": "Payment method",
    "waitingForPaymentConfirmation": "Waiting for payment confirmation...",
    "processing": "Processing",
    "iHaveCompletedPayment": "I have completed payment",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-projects-components-checkout-cashier",
  content: t(content),
};

export default dictionary;
