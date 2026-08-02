import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    today0604: "今天 06/04",
    tomorrow0605: "明天 06/05",
    inTwoDays0606: "后天 06/06",
    saturday0607: "周六 06/07",
    sunday0608: "周日 06/08",
    booked: "已预约",
    professionalArrives: "师傅上门",
    reviews: "评",
    verifiedProfessional: "· 认证师傅",
    calling: "正在拨打",
    calling2: "电话…",
    serviceDetails: "服务说明",
    appointmentTime: "预约时间",
    cancel: "取消",
    selectedAppointment: "预约时间已选：",
    confirm: "确认",
    quantity: "服务数量",
    total: "合计",
    booking: "下单中…",
    bookNow: "立即预约",
  },
  en: {
    today0604: "Today 06/04",
    tomorrow0605: "Tomorrow 06/05",
    inTwoDays0606: "In two days 06/06",
    saturday0607: "Saturday 06/07",
    sunday0608: "Sunday 06/08",
    booked: "Booked",
    professionalArrives: "Professional arrives",
    reviews: " reviews",
    verifiedProfessional: "· Verified professional",
    calling: "Calling",
    calling2: "Calling...",
    serviceDetails: "Service details",
    appointmentTime: "Appointment time",
    cancel: "Cancel",
    selectedAppointment: "Selected appointment:",
    confirm: "Confirm",
    quantity: "Quantity",
    total: "Total",
    booking: "Booking...",
    bookNow: "Book now",
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
  key: "demo-mobile-app-services-id-booking-client",
  content: t(content),
};

export default dictionary;
