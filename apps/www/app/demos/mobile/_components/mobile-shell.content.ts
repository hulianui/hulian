import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    home: "首页",
    categories: "分类",
    bookings: "订单",
    profile: "我的",
  },
  en: {
    home: "Home",
    categories: "Categories",
    bookings: "Bookings",
    profile: "Profile",
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
  key: "demo-mobile-components-mobile-shell",
  content: t(content),
};

export default dictionary;
