import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "inProgress": "进行中",
    "waitingForAccess": "待接入",
    "ended": "已结束",
    "selectTheSessionOnTheLeftTo": "选择左侧会话开始接待",
    "visitor": "访客",
    "mobile": "手机：",
    "region": "地区：",
    "register": "注册：",
    "order": "订单：",
    "pen": "笔",
    "visitorNoProfileYet": "访客，暂无档案",
    "confirmToTransferThisConversation": "确认转接此会话？",
    "theSessionWillBeHandedOverTo": "会话将移交给其他在线坐席，请确认后操作。",
    "transfer": "转接",
    "transfer2": "转接",
    "transferSession": "转接会话",
    "call": "呼叫",
    "callFunction": "呼叫功能",
    "theDemoEnvironmentDoesNotCurrentlySupport": "demo 环境暂不支持实际通话",
    "callCustomer": "呼叫客户",
    "areYouSureYouWantToClose": "确认关闭此会话？",
    "afterClosingTheConversationEntersTheEnded": "关闭后对话进入已结束状态，客户将无法继续发送消息。",
    "close": "关闭",
    "closeSession": "关闭会话",
    "closeSession2": "关闭会话",
    "more": "更多",
    "moreActions": "更多操作",
    "lian": "琏",
    "entering": "正在输入",
    "sessionEnded": "会话已结束",
    "enterTheReplyAndPressEnterTo": "输入回复，回车发送…",
  },
  en: {
    "inProgress": "In progress",
    "waitingForAccess": "Waiting for access",
    "ended": "Ended",
    "selectTheSessionOnTheLeftTo": "Select a conversation to start helping the customer",
    "visitor": "Visitor",
    "mobile": "Mobile:",
    "region": "Region:",
    "register": "Joined:",
    "order": "Orders:",
    "pen": " total",
    "visitorNoProfileYet": "Visitor, no profile yet",
    "confirmToTransferThisConversation": "Confirm to transfer this conversation?",
    "theSessionWillBeHandedOverTo": "This conversation will be assigned to another available agent.",
    "transfer": "Transfer",
    "transfer2": "Transfer",
    "transferSession": "Transfer session",
    "call": "Call",
    "callFunction": "Call function",
    "theDemoEnvironmentDoesNotCurrentlySupport": "The demo environment does not currently support actual calls.",
    "callCustomer": "Call customer",
    "areYouSureYouWantToClose": "Are you sure you want to close this session?",
    "afterClosingTheConversationEntersTheEnded": "After closing, the conversation enters the ended state and the customer will no longer be able to send messages.",
    "close": "Close",
    "closeSession": "Close session",
    "closeSession2": "Close session",
    "more": "More",
    "moreActions": "More actions",
    "lian": "Lian",
    "entering": "Typing",
    "sessionEnded": "Session ended",
    "enterTheReplyAndPressEnterTo": "Enter the reply and press Enter to send...",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-components-workbench-chat-thread",
  content: t(content),
};

export default dictionary;
