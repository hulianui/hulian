import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    referenceDiagram: "参考图",
    upscaleFactor: "×{0} 超分",
    node: "节点",
    generating: "生成中…",
    done: "完成",
    stepComplete: "{0} 完成",
    workflowRunComplete: "工作流运行完成 🎉",
    processedNodeCount: "共处理 {0} 个节点",
  },
  en: {
    referenceDiagram: "Reference image",
    upscaleFactor: "{0}x upscale",
    node: "Node",
    generating: "Generating...",
    done: "Done",
    stepComplete: "{0} complete",
    workflowRunComplete: "Workflow complete 🎉",
    processedNodeCount: "Processed {0} nodes",
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
  key: "demo-ai-workflow-lib-use-flow-run",
  content: t(content),
};

export default dictionary;
