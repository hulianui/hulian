import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    topic: "选题",
    survey: "文献调研",
    drafting: "撰写",
    figures: "作图",
    review: "内审",
    submission: "投稿",
    published: "已发表",
  },
  en: {
    topic: "Topic",
    survey: "Survey",
    drafting: "Drafting",
    figures: "Figures",
    review: "Review",
    submission: "Submission",
    published: "Published",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-components-stage",
  content: t(content),
};

export default dictionary;
