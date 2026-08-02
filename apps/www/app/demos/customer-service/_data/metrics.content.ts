import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "todaySConversationVolume": "今日会话量",
    "thanYesterday": "较昨日",
    "averageFirstRing": "平均首响",
    "theLowerTheBetter": "越低越好",
    "resolutionRate": "解决率",
    "workOrderSize": "工单口径",
    "satisfactionCsat": "满意度 CSAT",
    "lastDays": "近 7 日",
    "oClock": "8时",
    "oClock2": "9时",
    "oClock3": "10时",
    "oClock4": "11时",
    "oClock5": "12时",
    "localizedText": "13时",
    "localizedText2": "14时",
    "localizedText3": "15时",
    "localizedText4": "16时",
    "localizedText5": "17时",
    "localizedText6": "18时",
    "localizedText7": "19时",
    "monday": "周一",
    "tuesday": "周二",
    "wednesday": "周三",
    "thursday": "周四",
    "friday": "周五",
    "saturday": "周六",
    "sunday": "周日",
    "xiaoLian": "小琏",
    "ahu": "阿瑚",
    "wanqing": "晚晴",
    "zhouMing": "周明",
  },
  en: {
    "todaySConversationVolume": "Today's conversation volume",
    "thanYesterday": "vs. yesterday",
    "averageFirstRing": "Average first response",
    "theLowerTheBetter": "Lower is better",
    "resolutionRate": "Resolution rate",
    "workOrderSize": "Based on resolved tickets",
    "satisfactionCsat": "Customer satisfaction (CSAT)",
    "lastDays": "Last 7 days",
    "oClock": "08:00",
    "oClock2": "09:00",
    "oClock3": "10:00",
    "oClock4": "11:00",
    "oClock5": "12:00",
    "localizedText": "13:00",
    "localizedText2": "14:00",
    "localizedText3": "15:00",
    "localizedText4": "16:00",
    "localizedText5": "17:00",
    "localizedText6": "18:00",
    "localizedText7": "19:00",
    "monday": "Monday",
    "tuesday": "Tuesday",
    "wednesday": "Wednesday",
    "thursday": "Thursday",
    "friday": "Friday",
    "saturday": "Saturday",
    "sunday": "Sunday",
    "xiaoLian": "Xiao Lian",
    "ahu": "Ahu",
    "wanqing": "Wanqing",
    "zhouMing": "Zhou Ming",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-data-metrics",
  content: t(content),
};

export default dictionary;
