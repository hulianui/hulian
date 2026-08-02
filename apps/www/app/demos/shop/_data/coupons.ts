import { copy } from "./coupons.content";
import type { CouponData } from "./types";

// 优惠券池：首页领券中心 + 结算选券 + 会员中心「我的券」。
export const coupons: CouponData[] = [
  {
    id: "cp-1",
    kind: "amount",
    amount: 50,
    threshold: 299,
    title: copy("storewideSavingsCoupon"),
    scope: copy("validAcrossAllCategories"),
    validUntil: copy("validThroughJun302026"),
    status: "available",
    tone: "danger",
  },
  {
    id: "cp-2",
    kind: "amount",
    amount: 120,
    threshold: 599,
    title: copy("techCoupon"),
    scope: copy("techCategoryOnly"),
    validUntil: copy("validThroughJun182026"),
    status: "available",
    tone: "brand",
  },
  {
    id: "cp-3",
    kind: "discount",
    discount: 8.5,
    threshold: 199,
    title: copy("beautyCareCoupon"),
    scope: copy("beautyCareCategoryOnly"),
    validUntil: copy("validThroughJun202026"),
    status: "available",
    tone: "danger",
  },
  {
    id: "cp-4",
    kind: "shipping",
    title: copy("freeNationwideShipping"),
    scope: copy("remoteAreasExcluded"),
    validUntil: copy("validThroughJul312026"),
    status: "available",
    tone: "neutral",
  },
  {
    id: "cp-5",
    kind: "amount",
    amount: 30,
    threshold: 199,
    title: copy("newCustomerCoupon"),
    scope: copy("storewideNewCustomersOnly"),
    validUntil: copy("validThroughJun152026"),
    status: "claimed",
    tone: "brand",
  },
  {
    id: "cp-6",
    kind: "amount",
    amount: 20,
    threshold: 99,
    title: copy("groceryCoupon"),
    scope: copy("foodGroceryCategoryOnly"),
    validUntil: copy("expiredMay312026"),
    status: "expired",
    tone: "neutral",
  },
];

export const couponById = Object.fromEntries(coupons.map((c) => [c.id, c]));
