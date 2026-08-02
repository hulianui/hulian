import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "waitingForAccess": "待接入",
    "inProgress": "进行中",
    "ended": "已结束",
    "sessionFiltering": "会话筛选",
    "allValue": "全部 {0}",
    "pendingAccessValue": "待接入 {0}",
    "inProgressValue": "进行中 {0}",
    "thereAreCurrentlyNoConversationsInThis": "该分类暂无会话",
    "entering": "正在输入…",
    "meValue": "我: {0}",
    "visitor": "访客",
  },
  en: {
    "waitingForAccess": "Waiting for access",
    "inProgress": "In progress",
    "ended": "ended",
    "sessionFiltering": "Session filtering",
    "allValue": "All {0}",
    "pendingAccessValue": "Pending access {0}",
    "inProgressValue": "In progress {0}",
    "thereAreCurrentlyNoConversationsInThis": "There are currently no conversations in this category",
    "entering": "Entering...",
    "meValue": "Me: {0}",
    "visitor": "visitor",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-components-workbench-conversation-list",
  content: t(content),
};

export default dictionary;
