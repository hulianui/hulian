import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "paymentGateway": "支付网关",
    "keyVault": "密钥库",
    "workbench": "工作台",
    "atTheEndOfTheShoppingMall": "商城端",
    "auditLog": "审计日志",
  },
  en: {
    "paymentGateway": "Payment gateway",
    "keyVault": "Key vault",
    "workbench": "Workbench",
    "atTheEndOfTheShoppingMall": "Storefront backend",
    "auditLog": "Audit log",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-data-metrics",
  content: t(content),
};

export default dictionary;
