import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    followers: "的关注者",
    iAmA: "我是一名",
    exploreMyWork: "看看我的作品",
    contactMe: "联系我",
    savedBy: "已被",
    developerSaves: "位开发者收藏",
    scrollDown: "向下滚动",
  },
  en: {
    followers: " followers",
    iAmA: "I am a",
    exploreMyWork: "Explore my work",
    contactMe: "Contact me",
    savedBy: "Saved by ",
    developerSaves: " developer saves",
    scrollDown: "Scroll down",
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
  key: "demo-personal-components-sections-hero",
  content: t(content),
};

export default dictionary;
