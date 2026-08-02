import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    allSavedItemsAreCurrentlySoldOut: "收藏的商品均已售罄",
    default: "默认",
    added: "已将",
    itemsToYourCart: "件商品加入购物车",
    myFavorites: "我的收藏",
    total: "共",
    savedItems: "件心仪好物",
    addAllToCart: "全部加购",
    yourFavoritesAreEmpty: "收藏夹空空如也",
    browseTheCatalogAndSaveTheProductsYouLove: "快去逛逛，把心仪的商品加入收藏吧",
    browseProducts: "去逛逛",
  },
  en: {
    allSavedItemsAreCurrentlySoldOut: "All saved items are currently sold out",
    default: "Default",
    added: "Added ",
    itemsToYourCart: " items to your cart",
    myFavorites: "My favorites",
    total: "Total: ",
    savedItems: " saved items",
    addAllToCart: "Add all to cart",
    yourFavoritesAreEmpty: "Your favorites are empty",
    browseTheCatalogAndSaveTheProductsYouLove: "Browse the catalog and save the products you love.",
    browseProducts: "Browse products",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop-shop-favorites-page", content: t(content) };
export default dictionary;
