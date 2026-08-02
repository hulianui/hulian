import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    flashSale: "限时秒杀",
    todaySFlashSale: "今日秒杀",
    endsIn: "距结束",
    viewAll: "查看全部 →",
  },
  en: {
    flashSale: "Flash sale",
    todaySFlashSale: "Today's flash sale",
    endsIn: "Ends in",
    viewAll: "View all →",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop-components-home-home-flash-sale", content: t(content) };
export default dictionary;
