import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "callValueValue": "调用 {0} · {1}",
    "valueExecutionFailsTriggeringDegradation": "⚠ {0} 执行失败，触发降级。",
    "valueFailureDowngradedToValue": "{0} 失败，降级至 {1}",
    "pressTheDowngradeChainToSwitchTo": "按降级链切换至 {0} 重试…",
    "valueCompletedValueSValue": "{0} 完成（{1}s · ¥{2}）",
    "allTaskSubNodesHaveCompletedExecution": "任务全部子节点执行完成，编排结束。",
  },
  en: {
    "callValueValue": "Call {0} · {1}",
    "valueExecutionFailsTriggeringDegradation": "⚠ {0} Execution fails, triggering degradation.",
    "valueFailureDowngradedToValue": "{0} Failure, Downgraded to {1}",
    "pressTheDowngradeChainToSwitchTo": "Press the downgrade chain to switch to {0} retry...",
    "valueCompletedValueSValue": "{0} Completed ({1}s · ¥{2})",
    "allTaskSubNodesHaveCompletedExecution": "All task sub-nodes have completed execution, and orchestration is finished.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-lib-use-dispatch-run",
  content: t(content),
};

export default dictionary;
