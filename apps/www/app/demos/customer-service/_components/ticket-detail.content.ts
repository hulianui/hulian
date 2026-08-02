import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "workOrderDoesNotExist": "工单不存在",
    "ticketValueNotFoundMayHaveBeen": "未找到工单 #{0}，可能已被删除。",
    "returnToWorkOrderList": "返回工单列表",
    "pleaseEnterTheReplyContent": "请输入回复内容",
    "replySubmitted": "回复已提交",
    "repliedToTicketValue": "已回复工单 #{0}",
    "return": "返回",
    "workOrderSummary": "工单概要",
    "customer": "客户",
    "channel": "渠道",
    "assignee": "受理人",
    "creationTime": "创建时间",
    "updateTime": "更新时间",
    "problemDescription": "问题描述",
    "processingProgress": "处理进展",
    "replyToCustomer": "回复客户",
    "enterTheReplyContentAndItWill": "输入回复内容，提交后将同步至客户…",
    "clear": "清空",
    "waitingForAgent": "等待坐席跟进…",
    "submitReply": "提交回复",
  },
  en: {
    "workOrderDoesNotExist": "Ticket does not exist",
    "ticketValueNotFoundMayHaveBeen": "Ticket #{0} not found, may have been deleted.",
    "returnToWorkOrderList": "Return to ticket list",
    "pleaseEnterTheReplyContent": "Please enter the reply",
    "replySubmitted": "Reply submitted",
    "repliedToTicketValue": "Replied to ticket #{0}",
    "return": "Return",
    "workOrderSummary": "Ticket summary",
    "customer": "Customer",
    "channel": "Channel",
    "assignee": "Assignee",
    "creationTime": "Created",
    "updateTime": "Updated",
    "problemDescription": "Problem description",
    "processingProgress": "Progress",
    "replyToCustomer": "Reply to customer",
    "enterTheReplyContentAndItWill": "Write a reply to send to the customer...",
    "clear": "Clear",
    "waitingForAgent": "Waiting for an agent...",
    "submitReply": "Send reply",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-components-ticket-detail",
  content: t(content),
};

export default dictionary;
