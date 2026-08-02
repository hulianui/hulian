import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    storewideSavingsCoupon: "全场通用满减券",
    validAcrossAllCategories: "支持全部品类",
    validThroughJun302026: "2026.06.30 前有效",
    techCoupon: "数码 3C 专享券",
    techCategoryOnly: "仅限数码 3C 品类",
    validThroughJun182026: "2026.06.18 前有效",
    beautyCareCoupon: "美妆个护折扣券",
    beautyCareCategoryOnly: "仅限美妆个护品类",
    validThroughJun202026: "2026.06.20 前有效",
    freeNationwideShipping: "全国包邮券",
    remoteAreasExcluded: "偏远地区除外",
    validThroughJul312026: "2026.07.31 前有效",
    newCustomerCoupon: "新人首单券",
    storewideNewCustomersOnly: "全场可用 · 仅限新用户",
    validThroughJun152026: "2026.06.15 前有效",
    groceryCoupon: "食品生鲜券",
    foodGroceryCategoryOnly: "仅限食品生鲜品类",
    expiredMay312026: "已于 2026.05.31 过期",
  },
  en: {
    storewideSavingsCoupon: "Storewide savings coupon",
    validAcrossAllCategories: "Valid across all categories",
    validThroughJun302026: "Valid through Jun 30, 2026",
    techCoupon: "Tech coupon",
    techCategoryOnly: "Tech category only",
    validThroughJun182026: "Valid through Jun 18, 2026",
    beautyCareCoupon: "Beauty & care coupon",
    beautyCareCategoryOnly: "Beauty & care category only",
    validThroughJun202026: "Valid through Jun 20, 2026",
    freeNationwideShipping: "Free nationwide shipping",
    remoteAreasExcluded: "Remote areas excluded",
    validThroughJul312026: "Valid through Jul 31, 2026",
    newCustomerCoupon: "New-customer coupon",
    storewideNewCustomersOnly: "Storewide · New customers only",
    validThroughJun152026: "Valid through Jun 15, 2026",
    groceryCoupon: "Grocery coupon",
    foodGroceryCategoryOnly: "Food & grocery category only",
    expiredMay312026: "Expired May 31, 2026",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = { key: "demo-shop-data-coupons", content: t(content) };
export default dictionary;
