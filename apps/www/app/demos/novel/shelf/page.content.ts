import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    shelfTitle: "书架",
    read: "阅读",
    write: "写作",
  },
  en: {
    shelfTitle: "Shelf",
    read: "Read",
    write: "Write",
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
  key: "demo-novel-shelf-page",
  content: t(content),
};

export default dictionary;
