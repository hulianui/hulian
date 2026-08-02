import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    selectADocumentOnTheLeftToViewEditOr: "选择左侧文档查看 / 编辑，或选择文件夹浏览内容",
    hanku: "瀚库",
    file: "文件",
    documentation: "说明文档",
    middleColumnViewMode: "中栏视图模式",
  },
  en: {
    selectADocumentOnTheLeftToViewEditOr:
      "Select a document to view or edit it, or choose a folder to browse its contents.",
    hanku: "HanVault",
    file: "File",
    documentation: "Documentation",
    middleColumnViewMode: "Content view",
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
  key: "demo-knowledge-components-center-pane",
  content: t(content),
};

export default dictionary;
