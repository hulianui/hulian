import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "candidateActuators": "候选执行器",
    "selected": "选中",
    "elimination": "淘汰",
    "overallScore": "综合分",
  },
  en: {
    "candidateActuators": "Candidate executors",
    "selected": "Selected",
    "elimination": "Elimination",
    "overallScore": "Overall score",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-routing-decision-table",
  content: t(content),
};

export default dictionary;
