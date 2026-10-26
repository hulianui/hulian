import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    studioTitle: "作者后台",
    studioLead: "改章节和正文。保存后，前台阅读的是同一份稿。",
    edit: "编辑",
    read: "阅读",
    chapters: "{0} 章",
  },
  en: {
    studioTitle: "Author studio",
    studioLead: "Edit chapters and the prose. The reader uses the same manuscript.",
    edit: "Edit",
    read: "Read",
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
  key: "demo-novel-studio-page",
  content: t(content),
};

export default dictionary;
