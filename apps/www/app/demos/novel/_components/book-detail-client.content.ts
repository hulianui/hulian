import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    backToLibrary: "返回书库",
    read: "开始阅读",
    continueReading: "继续阅读",
    edit: "编辑这部书",
    chapterList: "目录",
    author: "作者",
    genre: "分类",
    year: "写作年份",
    length: "篇幅",
    status: "状态",
    finished: "已完结",
    words: "{0} 字",
    chapters: "{0} 章",
    minutes: "约 {0} 分钟",
    quoteOpen: "「",
    quoteClose: "」",
  },
  en: {
    backToLibrary: "Back to the library",
    read: "Start reading",
    continueReading: "Continue reading",
    edit: "Edit this book",
    chapterList: "Contents",
    author: "Author",
    genre: "Genre",
    year: "Written",
    length: "Length",
    status: "Status",
    finished: "Finished",
    words: "{0} words",
    chapters: "{0} chapters",
    minutes: "About {0} min",
    quoteOpen: '"',
    quoteClose: '"',
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
