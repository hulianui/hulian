import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    gallery: "示例库",
    navigate: "去往",
    about: "关于",
    aboutNote: "三篇虚构短篇，正文与写作台共用同一份本地稿。",
    colophon: "以 @hulianui/ui 排印",
    footerNote: "虚构小说占位。阅读进度记在这台浏览器里。",
  },
  en: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    gallery: "Gallery",
    navigate: "Go to",
    about: "About",
    aboutNote: "Three fictional stories. The reader and the studio share one local manuscript.",
    colophon: "Set with @hulianui/ui",
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
