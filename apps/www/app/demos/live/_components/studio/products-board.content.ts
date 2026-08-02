import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    nowPresenting: "已上架讲解：",
    product: "号 ·",
    text: "…",
    link: "链接",
    product2: "号",
    products: "商品",
    price: "价格",
    inventory: "库存",
    sold: "已售",
    status: "状态",
    presenting: "讲解中",
    startPresenting: "开始讲解",
    shoppingPanel: "小黄车 ·",
    products2: "件商品",
    presentationOrder: "讲解排序",
    productTable: "商品表格",
    present: "讲解",
    productList: "商品列表",
    keywords: "关键词",
    product3: "商品名",
    currentProductPreview: "当前讲解预览",
    audienceShoppingPanelOpened: "已弹出小黄车到直播间",
    openInAudienceRoom: "弹出到直播间",
    dragCardsToReorderTheRundownSelectPresentToFeatureAProductAndSyncItToTheAudienceShoppingPanel: "拖动左侧卡片调整讲解顺序，点「讲解」即把该商品置为讲解中并同步到观众端小黄车。",
  },
  en: {
    nowPresenting: "Now presenting:",
    product: " · Product ",
    text: "...",
    link: "Link",
    product2: "Product ",
    products: "Products",
    price: "Price",
    inventory: "Inventory",
    sold: "Sold",
    status: "Status",
    presenting: "Presenting",
    startPresenting: "Start presenting",
    shoppingPanel: "Shopping panel ·",
    products2: " products",
    presentationOrder: "Presentation order",
    productTable: "Product table",
    present: "Present",
    productList: "Product list",
    keywords: "Keywords",
    product3: "Product",
    currentProductPreview: "Current product preview",
    audienceShoppingPanelOpened: "Audience shopping panel opened",
    openInAudienceRoom: "Open in audience room",
    dragCardsToReorderTheRundownSelectPresentToFeatureAProductAndSyncItToTheAudienceShoppingPanel: "Drag cards to reorder the rundown. Select Present to feature a product and sync it to the audience shopping panel.",
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
  key: "demo-live-components-studio-products-board",
  content: t(content),
};

export default dictionary;
