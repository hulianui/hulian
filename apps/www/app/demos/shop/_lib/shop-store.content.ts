import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    obsidianBlack: "曜石黑",
    noiseCancelingPro: "降噪 Pro 版",
    mintGreen: "薄荷绿",
    useshopMustBeUsedWithinShopstoreprovider: "useShop 必须在 ShopStoreProvider 内使用",
  },
  en: {
    obsidianBlack: "Obsidian black",
    noiseCancelingPro: "Noise Canceling Pro",
    mintGreen: "Mint green",
    useshopMustBeUsedWithinShopstoreprovider: "useShop must be used within ShopStoreProvider",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop-lib-shop-store", content: t(content) };
export default dictionary;
