import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    comingSoon: "功能即将上线",
    li: "李",
    liXiaomei: "李小美",
    member12CompletedServices: "会员 · 已服务 12 次",
    goldMember: "黄金会员",
    totalBookings: "累计订单",
    coupons: "优惠券",
    zhang: "张",
    totalSavings: "节省金额",
    myReviews: "我的评价",
    msZhangDeepCleaning: "张阿姨 · 深度保洁",
    professionalServiceAndANoticeablyCleanerHomeIWillBookAgain: "服务很专业，家里干净多了，下次还会预约！",
    text3Available: "3 张可用",
    shippingAddress: "收货地址",
    paymentMethods: "支付方式",
    myFavorites: "我的收藏",
    serviceHistory: "服务记录",
    notifications: "消息通知",
    privacySettings: "隐私设置",
    helpAndFeedback: "帮助与反馈",
    aboutUs: "关于我们",
    atHomeServices2026: "到家服务 © 2026",
  },
  en: {
    comingSoon: "Coming soon",
    li: "Li",
    liXiaomei: "Li Xiaomei",
    member12CompletedServices: "Member · 12 completed services",
    goldMember: "Gold member",
    totalBookings: "Total bookings",
    coupons: "Coupons",
    zhang: "Zhang",
    totalSavings: "Total savings",
    myReviews: "My reviews",
    msZhangDeepCleaning: "Ms. Zhang · Deep cleaning",
    professionalServiceAndANoticeablyCleanerHomeIWillBookAgain: "Professional service and a noticeably cleaner home. I will book again!",
    text3Available: "3 available",
    shippingAddress: "Shipping address",
    paymentMethods: "Payment methods",
    myFavorites: "My favorites",
    serviceHistory: "Service history",
    notifications: "Notifications",
    privacySettings: "Privacy settings",
    helpAndFeedback: "Help and feedback",
    aboutUs: "About us",
    atHomeServices2026: "At-Home Services © 2026",
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
  key: "demo-mobile-app-profile-page",
  content: t(content),
};

export default dictionary;
