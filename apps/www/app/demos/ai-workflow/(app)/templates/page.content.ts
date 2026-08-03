import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    loading: "正在载入「{0}」…",
    templateLibrary: "模板库",
    startWithAPresetWorkflowAndFineTuneAndRun:
      "从预置工作流开始，一键载入画布即可在其上微调与运行。",
    node: "节点",
    useMacro: "使用模板",
  },
  en: {
    loading: 'Loading "{0}"...',
    templateLibrary: "Template library",
    startWithAPresetWorkflowAndFineTuneAndRun:
      "Load a preset workflow onto the canvas, then adjust its nodes and run it.",
    node: "Node",
    useMacro: "Use template",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-ai-workflow-app-templates-page",
  content: t(content),
};

export default dictionary;
