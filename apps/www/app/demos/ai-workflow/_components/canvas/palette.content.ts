import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    input: "输入",
    generate: "生成",
    postProcessing: "后处理",
    output: "输出",
    nodeLibrary: "节点库",
    clickToAddToCanvas: "点击添加到画布",
  },
  en: {
    input: "Input",
    generate: "Generate",
    postProcessing: "Post-processing",
    output: "Output",
    nodeLibrary: "Node library",
    clickToAddToCanvas: "Click to add to canvas",
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
  key: "demo-ai-workflow-components-canvas-palette",
  content: t(content),
};

export default dictionary;
