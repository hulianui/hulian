import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    recommendedForYou: "猜你喜欢",
    allPicks: "全部好物 ·",
    items: "件",
    unableToLoad: "加载失败",
    reload: "重新加载",
  },
  en: {
    recommendedForYou: "Recommended for you",
    allPicks: "All picks · ",
    items: "items",
    unableToLoad: "Unable to load",
    reload: "Reload",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop--components-home-home-product-grid", content: t(content) };
export default dictionary;
