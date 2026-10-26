import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    backToLibrary: "返回书库",
    read: "开始阅读",
    continueReading: "继续阅读",
    edit: "编辑这部书",
    chapterList: "章节",
    numbered: "第 {0} 章 {1}",
  },
  en: {
    backToLibrary: "Back to the library",
    read: "Start reading",
    continueReading: "Continue reading",
    edit: "Edit this book",
    chapterList: "Chapters",
    numbered: "Chapter {0}. {1}",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-novel-book-detail",
  content: t(content),
};

export default dictionary;
