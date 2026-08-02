import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    web: "网页",
    app: "App",
    wechat: "微信",
    phone: "电话",
    low: "低",
    medium: "中",
    high: "高",
    urgent: "紧急",
    pending: "待处理",
    inProgress: "处理中",
    waitingForReply: "待回复",
    resolved: "已解决",
    levelRegular: "普通",
    levelSilver: "银卡",
    levelGold: "金卡",
    levelBlack: "黑卡",
    quickGreeting: "您好，很高兴为您服务～",
    quickChecking: "请稍等，我帮您查询一下",
    quickTicket: "已为您提交工单，会尽快处理",
    quickMoreHelp: "还有什么可以帮到您的吗？",
  },
  en: {
    web: "Web",
    app: "App",
    wechat: "WeChat",
    phone: "Phone",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    pending: "Open",
    inProgress: "In progress",
    waitingForReply: "Waiting for reply",
    resolved: "Resolved",
    levelRegular: "Standard",
    levelSilver: "Silver",
    levelGold: "Gold",
    levelBlack: "Black",
    quickGreeting: "Hello! How can I help today?",
    quickChecking: "One moment while I look that up for you.",
    quickTicket: "I've opened a ticket and our team will follow up shortly.",
    quickMoreHelp: "Is there anything else I can help with?",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-customer-service-data-labels",
  content: t(content),
};

export default dictionary;
