import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    generating: "正在生成…",
    buildComplete: "生成完成",
    run: "运行",
    closeRunPanel: "关闭运行面板",
  },
  en: {
    generating: "Generating...",
    buildComplete: "Generation complete",
    run: "Run",
    closeRunPanel: "Close run panel",
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
  key: "demo-ai-workflow-components-canvas-run-panel",
  content: t(content),
};

export default dictionary;
