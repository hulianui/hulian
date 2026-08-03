import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "hanpay": "瀚付",
    "subscriptionIsAppropriateKeepingClearAccounts": "订阅有度 · 账目分明",
    "accountOverview": "账户概览",
    "subscriptionPackage": "订阅套餐",
    "paymentMethod": "支付方式",
    "billsAndInvoices": "账单与发票",
    "accountSettings": "账户设置",
  },
  en: {
    "hanpay": "HanPay",
    "subscriptionIsAppropriateKeepingClearAccounts": "Subscriptions, simplified · Billing, clarified",
    "accountOverview": "Account overview",
    "subscriptionPackage": "Plans",
    "paymentMethod": "Payment methods",
    "billsAndInvoices": "Invoices",
    "accountSettings": "Account settings",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-billing-components-nav-config",
  content: t(content),
};

export default dictionary;
