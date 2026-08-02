import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "all": "全部",
    "ticketHasBeenClosed": "工单已关闭",
    "ticketValueHasBeenMarkedAsResolved": "工单 #{0} 已标记为已解决",
    "workOrderNumber": "工单号",
    "topic": "主题",
    "priority": "优先级",
    "status": "状态",
    "assignee": "受理人",
    "updateTime": "更新时间",
    "operation": "操作",
    "view": "查看",
    "confirmToCloseTheWorkOrder": "确认关闭工单？",
    "afterClosingTheStatusChangesToResolved": "关闭后状态变为已解决，如需继续处理需重新开单。",
    "close": "关闭",
    "closeTicket": "关闭工单",
    "closeTicket2": "关闭工单",
    "tryAgain": "重试",
    "workOrderManagement": "工单管理",
    "keywords": "关键词",
    "ticketNumberSubjectCustomer": "工单号 / 主题 / 客户",
    "status2": "状态",
    "priority2": "优先级",
  },
  en: {
    "all": "All",
    "ticketHasBeenClosed": "Ticket has been closed",
    "ticketValueHasBeenMarkedAsResolved": "Ticket #{0} has been marked as resolved",
    "workOrderNumber": "Ticket number",
    "topic": "Topic",
    "priority": "priority",
    "status": "Status",
    "assignee": "Assignee",
    "updateTime": "Update time",
    "operation": "Operation",
    "view": "View",
    "confirmToCloseTheWorkOrder": "Confirm to close the ticket?",
    "afterClosingTheStatusChangesToResolved": "Closing this ticket marks it resolved. Reopen it before making further changes.",
    "close": "close",
    "closeTicket": "Close ticket",
    "closeTicket2": "Close ticket",
    "tryAgain": "Try again",
    "workOrderManagement": "Ticket management",
    "keywords": "keywords",
    "ticketNumberSubjectCustomer": "Ticket Number/Subject/Customer",
    "status2": "Status",
    "priority2": "priority",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-app-tickets-page",
  content: t(content),
};

export default dictionary;
