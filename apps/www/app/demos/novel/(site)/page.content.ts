import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    libraryTitle: "书库",
    libraryLead: "三本写完的短篇。点进去就是正文，章末可以接着下一章。",
    authorStudio: "作者后台",
    read: "阅读",
    details: "书页",
    chapters: "{0} 章",
  },
  en: {
    libraryTitle: "Library",
    libraryLead: "Three finished short stories. Open one and the prose starts. The next chapter waits at the end.",
    authorStudio: "Author studio",
    read: "Read",
    details: "Book",
    chapters: "{0} chapters",
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
  key: "demo-novel-catalog-page",
  content: t(content),
};

export default dictionary;
