import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "noReviewRecordsFound": "未找到审查记录",
  },
  en: {
    "noReviewRecordsFound": "No review records found",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-app-reviews-id-page",
  content: t(content),
};

export default dictionary;
