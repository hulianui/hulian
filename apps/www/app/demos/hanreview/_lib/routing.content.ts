import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "testProfileEconomicModel": "测试/配置文件 → 经济模型",
    "securitySensitivePathsTheStrongestModel": "安全敏感路径 → 最强模型",
    "largeFileBalancedModel": "大文件 → 均衡模型",
    "defaultEqualizationModel": "默认 → 均衡模型",
    "valueDowngradingAboveCostCap": "{0}（超成本上限降级）",
  },
  en: {
    "testProfileEconomicModel": "Test/profile → economic model",
    "securitySensitivePathsTheStrongestModel": "Security-sensitive paths → the strongest model",
    "largeFileBalancedModel": "Large file → balanced model",
    "defaultEqualizationModel": "Default → equalization model",
    "valueDowngradingAboveCostCap": "{0} (Downgrading above cost cap)",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanreview-lib-routing",
  content: t(content),
};

export default dictionary;
