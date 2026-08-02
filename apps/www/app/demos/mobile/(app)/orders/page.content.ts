import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    contactProfessional: "联系师傅",
    calling: "正在拨打",
    calling2: "电话…",
    remove: "删除",
    professional: "师傅：",
    thankYouForYourReview: "感谢您的评价！",
    writeAReview: "去评价",
    appointment: "预约时间：",
    call: "拨打",
    phone: "电话",
    reschedule: "改约时间",
    reschedulingIsComingSoon: "改约功能即将上线",
    cancelBooking: "取消订单",
    thisBookingCannotBeRestoredAfterCancellationContinue: "取消后无法恢复，确定要取消吗？",
    confirmCancellation: "确认取消",
    yourPaymentWillBeRefundedWithinThreeBusinessDaysAfterCancellation: "取消后费用将在 3 个工作日内退回",
    bookingCanceled: "订单已取消",
    keepBooking: "不取消，继续保留",
    bookingDeleted: "订单已删除",
    myOrders: "我的订单",
    swipeLeftToContactTheProfessionalSwipeRightToDelete: "← 左滑联系师傅 · 右滑删除",
    noBookingsYet: "暂无订单",
    youHaveNotBookedAnyServicesYetExploreServicesOnTheHomePage: "您还没有预约任何服务，去首页看看吧",
    bookAService: "去下单",
  },
  en: {
    contactProfessional: "Contact professional",
    calling: "Calling",
    calling2: "Calling...",
    remove: "Remove",
    professional: "Professional:",
    thankYouForYourReview: "Thank you for your review!",
    writeAReview: "Write a review",
    appointment: "Appointment:",
    call: "Call",
    phone: "phone",
    reschedule: "Reschedule",
    reschedulingIsComingSoon: "Rescheduling is coming soon",
    cancelBooking: "Cancel booking",
    thisBookingCannotBeRestoredAfterCancellationContinue: "This booking cannot be restored after cancellation. Continue?",
    confirmCancellation: "Confirm cancellation",
    yourPaymentWillBeRefundedWithinThreeBusinessDaysAfterCancellation: "Your payment will be refunded within three business days after cancellation",
    bookingCanceled: "Booking canceled",
    keepBooking: "Keep booking",
    bookingDeleted: "Booking deleted",
    myOrders: "My orders",
    swipeLeftToContactTheProfessionalSwipeRightToDelete: "← Swipe left to contact the professional · Swipe right to delete",
    noBookingsYet: "No bookings yet",
    youHaveNotBookedAnyServicesYetExploreServicesOnTheHomePage: "You have not booked any services yet. Explore services on the home page.",
    bookAService: "Book a service",
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
  key: "demo-mobile-app-orders-page",
  content: t(content),
};

export default dictionary;
