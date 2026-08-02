import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "newSessionIncoming": "新会话进线",
    "zhaoTiezhuInitiatedConsultationThroughTheWeb": "赵铁柱 通过网页发起咨询，等待接入",
    "justNow": "刚刚",
    "workOrderAssigned": "工单已分配",
    "tAppWasNotShippedAfterOrdering": "#T-2093「App 下单后未发货」已指派给你",
    "minutesAgo": "3 分钟前",
    "receivedPositiveReviewsFromCustomers": "收到客户好评",
    "linWanruGaveThisServiceAStar": "林婉如 对本次服务给出 5 星评价 ⭐",
    "minutesAgo2": "12 分钟前",
    "valueUnreadItems": "（{0} 条未读）",
    "notificationValue": "通知{0}",
    "notification": "通知",
    "unreadItems": "条未读",
    "allRead": "全部已读",
    "unread": "未读",
    "viewAllNotifications": "查看全部通知",
  },
  en: {
    "newSessionIncoming": "New session incoming",
    "zhaoTiezhuInitiatedConsultationThroughTheWeb": "Zhao Tiezhu initiated consultation through the web page and is waiting for access.",
    "justNow": "just now",
    "workOrderAssigned": "Ticket assigned",
    "tAppWasNotShippedAfterOrdering": "#T-2093 \"App was not shipped after ordering\" has been assigned to you",
    "minutesAgo": "3 minutes ago",
    "receivedPositiveReviewsFromCustomers": "Received positive reviews from customers",
    "linWanruGaveThisServiceAStar": "Lin Wanru gave this service a 5-star rating ⭐",
    "minutesAgo2": "12 minutes ago",
    "valueUnreadItems": "({0} unread items)",
    "notificationValue": "Notification {0}",
    "notification": "Notification",
    "unreadItems": "unread items",
    "allRead": "All read",
    "unread": "unread",
    "viewAllNotifications": "View all notifications",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-components-notification-bell",
  content: t(content),
};

export default dictionary;
