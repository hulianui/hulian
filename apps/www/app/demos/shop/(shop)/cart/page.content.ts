import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    itemRemoved: "已移除商品",
    cartCleared: "购物车已清空",
    selectAtLeastOneItemToCheckOut: "请先勾选要结算的商品",
    hanshopHome: "瀚选首页",
    cart: "购物车",
    yourCartIsEmpty: "购物车是空的",
    browseTheStoreAndFindSomethingYouLove: "去逛逛挑点好物吧",
    shopNow: "去购物",
    selectAll: "全选",
    total: "共",
    products: "种商品",
    selectProduct: "选择{0}",
    productQuantity: "{0}数量",
    removeThisItem: "确定删除该商品？",
    youWillNeedToAddItAgainIfYouChangeYourMind: "移除后需重新加入购物车。",
    delete: "删除",
    clearCart: "清空购物车",
    clearYourCart: "清空购物车？",
    allItemsWillBeRemovedFromYourCartThisCannotBeUndone: "购物车内所有商品将被移除，此操作不可撤销。",
    cancel: "取消",
    clear: "清空",
    selected: "已选",
    items: "件",
    total2: "合计：",
    checkout: "去结算",
  },
  en: {
    itemRemoved: "Item removed",
    cartCleared: "Cart cleared",
    selectAtLeastOneItemToCheckOut: "Select at least one item to check out",
    hanshopHome: "HanShop home",
    cart: "Cart",
    yourCartIsEmpty: "Your cart is empty",
    browseTheStoreAndFindSomethingYouLove: "Browse the store and find something you love.",
    shopNow: "Shop now",
    selectAll: "Select all",
    total: "Total: ",
    products: "products",
    selectProduct: "Select {0}",
    productQuantity: "{0} quantity",
    removeThisItem: "Remove this item?",
    youWillNeedToAddItAgainIfYouChangeYourMind: "You will need to add it again if you change your mind.",
    delete: "Delete",
    clearCart: "Clear cart",
    clearYourCart: "Clear your cart?",
    allItemsWillBeRemovedFromYourCartThisCannotBeUndone: "All items will be removed from your cart. This cannot be undone.",
    cancel: "Cancel",
    clear: "Clear",
    selected: "Selected: ",
    items: "items",
    total2: "Total:",
    checkout: "Checkout",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop--shop-cart-page", content: t(content) };
export default dictionary;
