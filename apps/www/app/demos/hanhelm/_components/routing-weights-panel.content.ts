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
    "abilityMatching": "Ability matching",
    "coveringTheRequiredCapabilitiesForTasksThe": "Covering the required capabilities for tasks—the more complete, the better",
    "cost": "Cost",
    "theLowerTheMixedUnitPriceThe": "The lower the mixed unit price, the better",
    "delay": "Delay",
    "theLowerTheEndToEndLatency": "The lower the end-to-end latency, the better",
    "load": "Load",
    "theLowerTheCurrentOccupancyRateThe": "The lower the current occupancy rate, the better",
    "priority": "Priority",
    "preferredForHighQualityTasksThoseWith": "Preferred for high-quality tasks, those with more comprehensive abilities",
    "slaMargin": "SLA margin",
    "theWiderTheRelativeSlaThresholdThe": "The wider the relative SLA threshold, the better the margin",
    "andAuthorityWasWeightyAndHarmonious": "and authority was weighty and harmonious",
    "scoringIsCalculatedByWeightingAndSumming": "(Scoring is calculated by weighting and summing each dimension, no need to unify the score)",
    "resetsToEqualWeight": "Resets to equal weight",
    "valueHeldGreatPower": "{0} held great power",
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
