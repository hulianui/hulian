import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    recommended: "综合",
    priceLowToHigh: "价格↑",
    priceHighToLow: "价格↓",
    sales: "销量",
    rating: "评分",
    category: "品类",
    brand: "品牌",
    priceRange: "价格区间",
    search: "搜索：",
    home: "首页",
    flashSale: "限时秒杀",
    allProducts: "全部商品",
    total: "共",
    items: "件",
    filters: "筛选",
    unableToLoad: "加载失败",
    retry: "重试",
    searchProductsOrBrands: "搜索商品或品牌…",
    sortOrder: "排序方式",
    viewMode: "视图模式",
    pages: "分页",
    infiniteScroll: "无限滚",
    selected: "已选：",
    clear: "清空",
    useTheRetryButtonAbove: "请点击上方重试按钮",
    noMatchingProducts: "没有符合条件的商品",
    adjustYourFiltersOrTryAnotherSearch: "试试调整筛选条件或搜索其他关键词",
    resetFilters: "重置筛选",
    loadingMoreProducts: "加载更多商品…",
    allProductsShown: "已显示全部",
    products: "件商品",
    categoryNavigation: "品类导航",
  },
  en: {
    recommended: "Recommended",
    priceLowToHigh: "Price: low to high",
    priceHighToLow: "Price: high to low",
    sales: "Sales",
    rating: "Rating",
    category: "Category",
    brand: "Brand",
    priceRange: "Price range",
    search: "Search: ",
    home: "Home",
    flashSale: "Flash sale",
    allProducts: "All products",
    total: "Total: ",
    items: "items",
    filters: "Filters",
    unableToLoad: "Unable to load",
    retry: "Retry",
    searchProductsOrBrands: "Search products or brands...",
    sortOrder: "Sort order",
    viewMode: "View mode",
    pages: "Pages",
    infiniteScroll: "Infinite scroll",
    selected: "Selected:",
    clear: "Clear",
    useTheRetryButtonAbove: "Use the retry button above.",
    noMatchingProducts: "No matching products",
    adjustYourFiltersOrTryAnotherSearch: "Adjust your filters or try another search.",
    resetFilters: "Reset filters",
    loadingMoreProducts: "Loading more products...",
    allProductsShown: "All products shown",
    products: " products",
    categoryNavigation: "Category navigation",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop--shop-products-page", content: t(content) };
export default dictionary;
