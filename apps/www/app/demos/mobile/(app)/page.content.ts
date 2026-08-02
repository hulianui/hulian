import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    serviceListRefreshed: "已刷新服务列表",
    searchCleaningRepairsManicures: "搜索家政、维修、美甲…",
    atHomeServicesBookWithConfidence: "到家服务 · 放心用",
    verifiedProfessionalsAtHomeServiceSatisfactionGuaranteed: "专业师傅 · 上门服务 · 满意保障",
    newCustomersSave20: "新用户立减 20 元 →",
    popularServices: "热门服务",
    quickActions: "快捷操作",
    bookInstantly: "一键下单",
    openingTheBookingPage: "即将跳转下单页",
    liveSupport: "在线客服",
    connectingYouWithSupport: "客服正在接入…",
    myFavorites: "我的收藏",
    viewFavorites: "查看收藏列表",
  },
  en: {
    serviceListRefreshed: "Service list refreshed",
    searchCleaningRepairsManicures: "Search cleaning, repairs, manicures...",
    atHomeServicesBookWithConfidence: "At-Home Services · Book with confidence",
    verifiedProfessionalsAtHomeServiceSatisfactionGuaranteed: "Verified professionals · At-home service · Satisfaction guaranteed",
    newCustomersSave20: "New customers save ¥20 →",
    popularServices: "Popular services",
    quickActions: "Quick actions",
    bookInstantly: "Book instantly",
    openingTheBookingPage: "Opening the booking page",
    liveSupport: "Live support",
    connectingYouWithSupport: "Connecting you with support...",
    myFavorites: "My favorites",
    viewFavorites: "View favorites",
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
  key: "demo-mobile-app-page",
  content: t(content),
};

export default dictionary;
