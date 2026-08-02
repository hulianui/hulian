import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    payMonthly: "按月付费",
    payAnnuallyAndSave2Months: "按年付费，立省 2 个月",
    payAnnually: "按年付费",
    save2Months: "省 2 个月",
  },
  en: {
    payMonthly: "Pay monthly",
    payAnnuallyAndSave2Months: "Pay annually and save 2 months",
    payAnnually: "Pay annually",
    save2Months: "Save 2 months",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-website-components-pricing-table",
  content: t(content),
};

export default dictionary;
