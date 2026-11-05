import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    eyebrow: "作者工作台",
    studioTitle: "写与改",
    studioLead: "改章节和正文。保存后，前台阅读的是同一份稿 —— 两边共用这台浏览器里的同一份本地稿。",
    edit: "编辑",
    read: "阅读",
    works: "部作品",
    totalWords: "总字数",
    lastUpdate: "最近改动",
    colWork: "作品",
    colChapters: "章节",
    colWords: "字数",
    colActions: "操作",
    emptyHint: "还没有作品。",
    emptyLead: "写完的稿会出现在这里，和书库是同一份。",
    backToLibrary: "回到书库",
    unitChapters: "章",
    unitWords: "字",
  },
  en: {
    eyebrow: "Author studio",
    studioTitle: "Write and revise",
    studioLead:
      "Edit chapters and prose. Once saved, the reader sees the same manuscript — both sides share one local draft in this browser.",
    edit: "Edit",
    read: "Read",
    works: "works",
    totalWords: "words",
    lastUpdate: "Last change",
    colWork: "Work",
    colChapters: "Chapters",
    colWords: "Words",
    colActions: "Actions",
    emptyHint: "No works yet.",
    emptyLead: "Finished manuscripts show up here, the same ones as the library.",
    backToLibrary: "Back to the library",
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
  key: "demo-novel-studio-page",
  content: t(content),
};

export default dictionary;
