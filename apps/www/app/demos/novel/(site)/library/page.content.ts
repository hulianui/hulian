import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    eyebrow: "渡口 · 短篇小说集",
    heroLine1: "一盏灯，",
    heroLine2: "一段夜航。",
    heroLead:
      "三篇写完的短篇：江上的夜航、井台下的信、一扇朝南的窗。没有连载，没有付费章节，点开就是正文。",
    startReading: "从《{0}》开始",
    authorStudio: "作者工作台",
    shelfTitle: "书架",
    shelfLead: "按写作的时间排，最新的在最前。",
    filterAll: "全部",
    searchLabel: "在书架上找",
    searchPlaceholder: "书名、作者或一句",
    emptyTitle: "这层架是空的",
    emptyDescription: "换个词，或把分类放回全部。",
    emptyReset: "看全部",
    finished: "已完结",
    read: "阅读",
    details: "书页",
    continueReading: "继续读",
    progress: "读到这里",
    quoteOpen: "「",
    quoteClose: "」",
    unitPieces: "篇",
    unitChapters: "章",
    unitWords: "字",
  },
  en: {
    eyebrow: "FERRY · SHORT FICTION",
    heroLine1: "One lamp,",
    heroLine2: "one night crossing.",
    heroLead:
      "Three finished short stories: a night crossing on the river, a letter under the well stone, a window facing south. No serials, no paywalled chapters — open one and the prose starts.",
    startReading: "Start with {0}",
    authorStudio: "Author studio",
    shelfTitle: "The shelf",
    shelfLead: "Ordered by when they were written, newest first.",
    filterAll: "All",
    searchLabel: "Search the shelf",
    searchPlaceholder: "Title, author, or a line",
    emptyTitle: "This shelf is empty",
    emptyDescription: "Try another word, or show every story.",
    emptyReset: "Show all",
    finished: "Finished",
    read: "Read",
    details: "Book",
    continueReading: "Continue",
    progress: "You are here",
    quoteOpen: '"',
    quoteClose: '"',
    unitPieces: "stories",
    unitChapters: "chapters",
    unitWords: "words",
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
