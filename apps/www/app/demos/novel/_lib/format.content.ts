import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    // 章序在中文排版里读「一、二、三」，不是「1、2、3」
    digits: "零一二三四五六七八九",
    ten: "十",
    useCjkNumerals: "1",
  },
  en: {
    digits: "0123456789",
    ten: "10",
    useCjkNumerals: "0",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-novel-format",
  content: t(content),
};

export default dictionary;
