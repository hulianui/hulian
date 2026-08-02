import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "wechatPay": "微信支付",
    "alipay": "支付宝",
    "cardNumber": "卡号",
    "cardholder": "持卡人",
    "validityPeriod": "有效期",
    "securityCode": "安全码",
    "threeDigitsOnTheBackOfThe": "卡背三位",
    "addBankCard": "添加银行卡",
    "identifiedAs": "识别为 {0}",
    "previewTheCardSurfaceWhileTyping": "边输入边预览卡面",
    "unboundValue": "已解绑{0}",
    "boundValue": "已绑定{0}",
    "paymentMethod": "支付方式",
    "theCardNumberIsStoredEncryptedBy": "卡号经 PCI-DSS 加密存储，仅展示后四位",
    "defaultPaymentMethod": "默认扣款方式",
    "defaultPaymentMethod2": "默认扣款方式",
    "default": "默认",
    "wechatPay2": "微信支付",
    "alipay2": "支付宝",
    "default2": "默认",
    "valueValidityPeriodValue": "{0} · 有效期 {1}",
    "removeThisPaymentMethod": "移除此支付方式",
    "paymentMethodRemoved": "已移除支付方式",
    "quickPayment": "快捷支付",
    "afterBindingYouCanUseTheCorresponding": "绑定后可用对应钱包一键扣款。",
    "boundValue2": "已绑定{0}",
    "bindingValue": "绑定{0}",
    "alreadyActivated": "已开通",
    "addBankCard2": "添加银行卡",
    "testCardNumber": "测试卡号",
    "testCardNumberVisa": "测试卡号 4111 1111 1111 1111（Visa）",
    "useTestCard": "用测试卡",
    "valueAddedValue": "已添加 {0} •••• {1}",
  },
  en: {
    "wechatPay": "WeChat Pay",
    "alipay": "Alipay",
    "cardNumber": "Card number",
    "cardholder": "Cardholder name",
    "validityPeriod": "Expiration date",
    "securityCode": "Security code",
    "threeDigitsOnTheBackOfThe": "3 or 4 digits on the card",
    "addBankCard": "Add card",
    "identifiedAs": "Detected as {0}",
    "previewTheCardSurfaceWhileTyping": "Enter card details to preview the card",
    "unboundValue": "Disconnected {0}",
    "boundValue": "Connected {0}",
    "paymentMethod": "Payment methods",
    "theCardNumberIsStoredEncryptedBy": "Card details are encrypted in accordance with PCI DSS. Only the last four digits are displayed.",
    "defaultPaymentMethod": "Default payment method",
    "defaultPaymentMethod2": "Default payment method",
    "default": "Default",
    "wechatPay2": "WeChat Pay",
    "alipay2": "Alipay",
    "default2": "Default",
    "valueValidityPeriodValue": "{0} · Expires {1}",
    "removeThisPaymentMethod": "Remove this payment method",
    "paymentMethodRemoved": "Payment method removed",
    "quickPayment": "Digital wallets",
    "afterBindingYouCanUseTheCorresponding": "Connect a wallet to use it for one-click payments.",
    "boundValue2": "Disconnect {0}",
    "bindingValue": "Connect {0}",
    "alreadyActivated": "Connected",
    "addBankCard2": "Add a card",
    "testCardNumber": "Test card number",
    "testCardNumberVisa": "Test card number 4111 1111 1111 1111 (Visa)",
    "useTestCard": "Use test card",
    "valueAddedValue": "Added {0} •••• {1}",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-billing-app-payment-page",
  content: t(content),
};

export default dictionary;
