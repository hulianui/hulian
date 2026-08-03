import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "qualityScoreValueLowerThanAccessControl": "质量分 {0} 低于门禁 {1}",
    "seriousIssuesValueExceedingTheLimitValue": "严重问题 {0} 超过上限 {1}",
    "coverageOfValueIsBelowValue": "覆盖率 {0}% 低于 {1}%",
  },
  en: {
    "qualityScoreValueLowerThanAccessControl": "Quality score {0} is below the gate threshold of {1}",
    "seriousIssuesValueExceedingTheLimitValue": "Critical findings {0} exceed the limit of {1}",
    "coverageOfValueIsBelowValue": "Coverage of {0}% is below {1}%",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-lib-gate",
  content: t(content),
};

export default dictionary;
