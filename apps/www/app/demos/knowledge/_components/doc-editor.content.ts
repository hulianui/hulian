import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    add: "新增",
    changed: "已改动",
    words: "字",
    saving: "保存中…",
    saved: "已保存",
    lastEdited: "最后编辑 ·",
    startWritingTheContentOfTheDocumentSupportsTitlesLists:
      "开始编写文档内容……支持标题、列表、代码块、引用。",
    editDocumentLabel: "编辑文档 {0}",
  },
  en: {
    add: "Add",
    changed: "Changed",
    words: "Words",
    saving: "Saving...",
    saved: "Saved",
    lastEdited: "Last edited ·",
    startWritingTheContentOfTheDocumentSupportsTitlesLists:
      "Start writing... Markdown headings, lists, code blocks, and links are supported.",
    editDocumentLabel: "Edit document {0}",
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
  key: "demo-knowledge-components-doc-editor",
  content: t(content),
};

export default dictionary;
