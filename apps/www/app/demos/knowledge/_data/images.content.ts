import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    designDraft: "设计稿",
    poster: "海报",
    screenshot: "截图",
    illustration: "插画",
    prototype: "原型",
  },
  en: {
    designDraft: "Design",
    poster: "Poster",
    screenshot: "Screenshot",
    illustration: "Illustration",
    prototype: "Prototype",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-knowledge-data-images",
  content: t(content),
};

export default dictionary;
