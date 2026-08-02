import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "transferred": "已转接",
    "conversationValueHasBeenTransferredToAnother": "会话 {0} 已转交其他坐席处理",
    "sessionClosed": "会话已关闭",
    "sessionValueEndedAndArchived": "会话 {0} 已结束并归档",
    "valuePeopleCurrentlyQueued": "当前排队 {0} 人",
    "thereIsAPeakIncomingCallsPlease": "进线高峰，请加快处理速度或呼叫备班坐席上线。",
  },
  en: {
    "transferred": "Transferred",
    "conversationValueHasBeenTransferredToAnother": "Conversation {0} has been transferred to another agent.",
    "sessionClosed": "Session closed",
    "sessionValueEndedAndArchived": "Session {0} ended and archived",
    "valuePeopleCurrentlyQueued": "{0} people currently queued",
    "thereIsAPeakIncomingCallsPlease": "There is a peak incoming calls, please speed up the processing or call the backup agent to come online.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-components-workbench-workbench",
  content: t(content),
};

export default dictionary;
