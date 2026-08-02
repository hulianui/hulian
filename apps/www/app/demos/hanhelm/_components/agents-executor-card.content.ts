import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "health": "健康",
    "downgrade": "降级",
    "offline": "离线",
    "text": "文本",
    "code": "代码",
    "image": "图像",
    "translation": "翻译",
    "retrievalEnhancement": "检索增强",
    "extract": "抽取",
    "review": "审核",
    "arrangement": "编排",
    "surplus": "富余",
    "moderate": "适中",
    "relativelyHigh": "偏高",
    "saturated": "饱和",
    "model": "模型",
    "currentLoad": "当前负载",
    "loadTrends": "负载趋势",
    "andIssuedThemSimultaneously": "并发",
    "bidBid": "入/出价",
    "typicalDelay": "典型延迟",
    "maximumConcurrency": "最大并发",
    "downgradeChain": "降级链",
    "noneSoleAbilityActuator": "无（唯一能力执行器）",
    "startAndStopValue": "启停 {0}",
    "enabled": "已启用",
    "discontinued": "已停用",
    "concurrentCap": "并发上限",
    "valueConcurrencyLimit": "{0} 并发上限",
  },
  en: {
    "health": "Health",
    "downgrade": "Degraded",
    "offline": "Offline",
    "text": "Text",
    "code": "Code",
    "image": "Image",
    "translation": "Translation",
    "retrievalEnhancement": "Retrieval enhancement",
    "extract": "Extraction",
    "review": "Review",
    "arrangement": "Orchestration",
    "surplus": "Available",
    "moderate": "Moderate",
    "relativelyHigh": "High",
    "saturated": "Saturated",
    "model": "Model",
    "currentLoad": "Current load",
    "loadTrends": "Load trends",
    "andIssuedThemSimultaneously": "concurrent tasks",
    "bidBid": "Input / output",
    "typicalDelay": "Typical delay",
    "maximumConcurrency": "Maximum concurrency",
    "downgradeChain": "Fallback chain",
    "noneSoleAbilityActuator": "None (only executor with this capability)",
    "startAndStopValue": "{0} executor",
    "enabled": "Enabled",
    "discontinued": "Disabled",
    "concurrentCap": "Concurrent cap",
    "valueConcurrencyLimit": "{0} Concurrency limit",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-agents-executor-card",
  content: t(content),
};

export default dictionary;
