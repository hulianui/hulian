import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    home: "首页",
    flashSale: "限时秒杀",
    allProducts: "全部商品",
    mobile: "移动版",
    hanshop: "瀚选",
    curatedGoodsDeliveredToYourDoor: "好物臻选 · 万物到家",
  },
  en: {
    home: "Home",
    flashSale: "Flash sale",
    allProducts: "All products",
    mobile: "Mobile",
    hanshop: "HanShop",
    curatedGoodsDeliveredToYourDoor: "Curated goods, delivered to your door",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop-components-nav-config", content: t(content) };
export default dictionary;
