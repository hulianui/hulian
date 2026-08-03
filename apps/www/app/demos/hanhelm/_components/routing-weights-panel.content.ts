import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "abilityMatching": "能力匹配",
    "coveringTheRequiredCapabilitiesForTasksThe": "覆盖任务所需能力，越全越优",
    "cost": "成本",
    "theLowerTheMixedUnitPriceThe": "混合单价越低越优",
    "delay": "延迟",
    "theLowerTheEndToEndLatency": "端到端延迟越低越优",
    "load": "负载",
    "theLowerTheCurrentOccupancyRateThe": "当前占用率越低越优",
    "priority": "优先级",
    "preferredForHighQualityTasksThoseWith": "高优任务偏好能力更全者",
    "slaMargin": "SLA 余量",
    "theWiderTheRelativeSlaThresholdThe": "相对 SLA 阈值越宽裕越优",
    "andAuthorityWasWeightyAndHarmonious": "权重和",
    "scoringIsCalculatedByWeightingAndSumming": "（打分按各维加权求和，无需归一）",
    "resetsToEqualWeight": "重置为等权",
    "valueHeldGreatPower": "{0}权重",
  },
  en: {
    "abilityMatching": "Capability match",
    "coveringTheRequiredCapabilitiesForTasksThe": "Prefer executors that cover all required task capabilities",
    "cost": "Cost",
    "theLowerTheMixedUnitPriceThe": "Prefer a lower blended unit price",
    "delay": "Latency",
    "theLowerTheEndToEndLatency": "Prefer lower end-to-end latency",
    "load": "Load",
    "theLowerTheCurrentOccupancyRateThe": "Prefer lower current utilization",
    "priority": "Priority",
    "preferredForHighQualityTasksThoseWith": "For high-quality tasks, prefer higher-tier executors",
    "slaMargin": "SLA margin",
    "theWiderTheRelativeSlaThresholdThe": "Prefer candidates with more time remaining before the SLA deadline",
    "andAuthorityWasWeightyAndHarmonious": "Weights total {0}",
    "scoringIsCalculatedByWeightingAndSumming": "Scores are the weighted sum of all six normalized dimensions.",
    "resetsToEqualWeight": "Reset to equal weights",
    "valueHeldGreatPower": "{0} weight",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-routing-weights-panel",
  content: t(content),
};

export default dictionary;
