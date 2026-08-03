import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "actuatorPool": "执行器池",
    "modelAgentFleetCapabilityProfileRealTime": "模型 + Agent 舰队 · 能力画像 · 实时负载 · 健康态 · 降级链编排",
    "poolCapacityMaximumConcurrency": "池容量（最大并发）",
    "averageUtilization": "平均利用率",
    "healthActuators": "健康执行器",
  },
  en: {
    "actuatorPool": "Executor pool",
    "modelAgentFleetCapabilityProfileRealTime": "Model and agent fleet · Capabilities · Real-time load · Health · Fallback chains",
    "poolCapacityMaximumConcurrency": "Pool capacity (maximum concurrency)",
    "averageUtilization": "Average utilization",
    "healthActuators": "Healthy executors",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-app-agents-page",
  content: t(content),
};

export default dictionary;
