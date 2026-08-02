import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "clickRunToReplayTheMultiAgent": "点击「运行」回放该任务的多 agent 编排过程",
    "reasoning": "推理",
  },
  en: {
    "clickRunToReplayTheMultiAgent": "Click \"Run\" to replay the multi-agent orchestration process for this task",
    "reasoning": "Reasoning",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-components-task-detail-frames",
  content: t(content),
};

export default dictionary;
