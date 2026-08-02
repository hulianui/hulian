import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "usebillingMustBeUsedWithinBillingstoreprovider": "useBilling 必须在 BillingStoreProvider 内使用",
  },
  en: {
    "usebillingMustBeUsedWithinBillingstoreprovider": "useBilling must be used within BillingStoreProvider",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-billing-lib-billing-store",
  content: t(content),
};

export default dictionary;
