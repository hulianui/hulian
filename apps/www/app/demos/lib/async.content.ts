import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    intentionalLoadError: "加载失败，请重试（这里报错是故意设计展示组件的）",
  },
  en: {
    intentionalLoadError: "Loading failed. Try again. This error is intentional so the demo can show its error state.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-lib-async",
  content: t(content),
};

export default dictionary;
