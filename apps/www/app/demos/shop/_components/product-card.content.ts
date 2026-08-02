import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    addedToFavorites: "已加入收藏",
    removedFromFavorites: "已取消收藏",
    thisItemIsSoldOut: "该商品已售罄",
    default: "默认",
    addedToCart: "已加入购物车：",
    flashSale: "限时秒杀",
    new: "新品",
    soldOut: "售罄",
    removeFromFavorites: "取消收藏",
    addToFavorites: "加入收藏",
    sold: "+ 销量",
    ofListPrice: "折",
    addToCart: "加入购物车",
  },
  en: {
    addedToFavorites: "Added to favorites",
    removedFromFavorites: "Removed from favorites",
    thisItemIsSoldOut: "This item is sold out",
    default: "Default",
    addedToCart: "Added to cart: ",
    flashSale: "Flash sale",
    new: "New",
    soldOut: "Sold out",
    removeFromFavorites: "Remove from favorites",
    addToFavorites: "Add to favorites",
    sold: "+ sold",
    ofListPrice: "% of list price",
    addToCart: "Add to cart",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop--components-product-card", content: t(content) };
export default dictionary;
