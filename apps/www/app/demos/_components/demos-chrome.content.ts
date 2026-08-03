import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

export const content = {
  "zh-CN": { backToGallery: "返回示例库" },
  en: { backToGallery: "Back to demos" },
} as const;

export function copy(key: keyof typeof content["zh-CN"]): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-shared-chrome",
  content: t(content),
};

export default dictionary;
