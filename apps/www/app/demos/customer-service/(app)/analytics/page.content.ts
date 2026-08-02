import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "onlineAgent": "在线坐席",
    "queuing": "排队中",
    "inProgress": "进行中",
    "todayIsOver": "今日已结束",
    "dataDashboard": "数据看板",
    "realTimeMeasurementOfServiceQualityAnd": "服务质量与坐席效能的实时度量（demo 数据，刷新还原）。",
    "todaySSessionVolumeByHour": "今日会话量（按小时）",
    "sessionVolume2": "会话量",
    "channelDistribution": "渠道分布",
    "satisfactionTrendsCsatOverTheLastDays": "满意度趋势（近 7 日 CSAT %）",
    "seatReceptionRanking": "坐席接待排行",
    "receptionCapacity": "接待量：",
    "single": "单",
    "satisfaction2": "满意度：",
    "single2": "单 ·",
  },
  en: {
    "onlineAgent": "Online agent",
    "queuing": "Queuing",
    "inProgress": "In progress",
    "todayIsOver": "Resolved today",
    "dataDashboard": "Data dashboard",
    "realTimeMeasurementOfServiceQualityAnd": "Real-time measurement of service quality and agent performance (demo data resets on reload).",
    "todaySSessionVolumeByHour": "Today's session volume (by hour)",
    "sessionVolume2": "Session volume",
    "channelDistribution": "Channel distribution",
    "satisfactionTrendsCsatOverTheLastDays": "Satisfaction trend (CSAT over the last 7 days)",
    "seatReceptionRanking": "Agent leaderboard",
    "receptionCapacity": "Conversations handled: ",
    "single": " conversations",
    "satisfaction2": "Satisfaction:",
    "single2": " conversations · ",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-customer-service-app-analytics-page",
  content: t(content),
};

export default dictionary;
