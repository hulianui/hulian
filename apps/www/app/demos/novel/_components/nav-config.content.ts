import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    brand: "渡口",
    slogan: "打开书就能读，章末接着下一章。",
    library: "书库",
    studio: "作者后台",
  },
  en: {
    brand: "Ferry",
    slogan: "Open a book and read. The next chapter waits at the end.",
    library: "Library",
    studio: "Author studio",
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
  key: "demo-novel-nav-config",
  content: t(content),
};

export default dictionary;
