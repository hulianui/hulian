import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    popularProducts: "热门商品",
    productCategories: "商品分类",
    allCategories: "全部分类",
    myFavorites: "我的收藏",
    cart: "购物车",
    account: "会员中心",
    searchProductsK: "搜索商品（⌘K）",
    searchProducts: "搜索商品",
    searchProductsOrCategories: "搜索商品或分类…",
    noMatchingProductsFound: "没有找到相关商品",
    thisStorefrontIsADemoProductsAndPricesAreFictional: "—— 本商城为 @hulianui/ui 演示，商品与价格均为虚构。",
    shoppingGuide: "购物指南",
    gettingStarted: "新手上路",
    paymentMethods: "支付方式",
    deliveryInformation: "配送说明",
    returnsSupport: "售后服务",
    sellerServices: "商家服务",
    sellOnHanshop: "商家入驻",
    marketingCenter: "营销中心",
    shippingRates: "运费规则",
    developerPlatform: "开放平台",
    aboutHanshop: "关于瀚选",
    aboutUs: "关于我们",
    careers: "加入我们",
    contactSupport: "联系客服",
    privacyPolicy: "隐私政策",
    demoSite: "· 演示站点",
    backToDemoGallery: "返回 Demo 画廊",
  },
  en: {
    popularProducts: "Popular products",
    productCategories: "Product categories",
    allCategories: "All categories",
    myFavorites: "My favorites",
    cart: "Cart",
    account: "Account",
    searchProductsK: "Search products (⌘ K)",
    searchProducts: "Search products",
    searchProductsOrCategories: "Search products or categories...",
    noMatchingProductsFound: "No matching products found",
    thisStorefrontIsADemoProductsAndPricesAreFictional: "This @hulianui/ui storefront is a demo. Products and prices are fictional.",
    shoppingGuide: "Shopping guide",
    gettingStarted: "Getting started",
    paymentMethods: "Payment methods",
    deliveryInformation: "Delivery information",
    returnsSupport: "Returns & support",
    sellerServices: "Seller services",
    sellOnHanshop: "Sell on HanShop",
    marketingCenter: "Marketing center",
    shippingRates: "Shipping rates",
    developerPlatform: "Developer platform",
    aboutHanshop: "About HanShop",
    aboutUs: "About us",
    careers: "Careers",
    contactSupport: "Contact support",
    privacyPolicy: "Privacy policy",
    demoSite: "· Demo site",
    backToDemoGallery: "Back to demo gallery",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop-components-shop-shell", content: t(content) };
export default dictionary;
