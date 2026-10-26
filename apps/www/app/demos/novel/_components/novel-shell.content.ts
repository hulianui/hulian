import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    gallery: "示例库",
    footerNote: "虚构小说占位。阅读进度记在这台浏览器里。",
  },
  en: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    gallery: "Gallery",
    footerNote: "Fictional novels. Reading progress stays in this browser.",
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
  key: "demo-novel-shell",
  content: t(content),
};

export default dictionary;
