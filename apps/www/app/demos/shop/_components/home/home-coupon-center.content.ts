import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    openingQuote: "「",
    claimedUseItOnYourNextOrder: "」已领取，快去使用吧！",
    couponCenter: "领券中心",
    claimACouponAndSaveOnYourNextOrder: "领券享折扣，下单省更多",
  },
  en: {
    openingQuote: "\"",
    claimedUseItOnYourNextOrder: "\" claimed. Use it on your next order!",
    couponCenter: "Coupon center",
    claimACouponAndSaveOnYourNextOrder: "Claim a coupon and save on your next order.",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop-components-home-home-coupon-center", content: t(content) };
export default dictionary;
