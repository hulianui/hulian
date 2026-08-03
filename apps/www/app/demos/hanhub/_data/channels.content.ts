import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "openaiOfficialMain": "OpenAI 官方 · 主",
    "secondsAgo": "30 秒前",
    "openaiAgentPrepared": "OpenAI 代理 · 备",
    "secondsAgo2": "28 秒前",
    "anthropicOfficial": "Anthropic 官方",
    "secondsAgo3": "31 秒前",
    "secondsAgo4": "33 秒前",
    "deepseekOfficial": "DeepSeek 官方",
    "secondsAgo5": "29 秒前",
    "aliBailian": "阿里百炼",
    "underMaintenance": "维护中",
    "darkSideOfTheMoon": "月之暗面",
    "minutesAgo": "5 分钟前",
    "openaiOfficialMain2": "OpenAI 官方 · 主",
    "anthropicOfficial2": "Anthropic 官方",
    "openaiAgentPrepared2": "OpenAI 代理 · 备",
    "okDelayIsHigh": "200 OK · 延迟偏高",
    "darkSideOfTheMoon2": "月之暗面",
    "connectionTimeoutMeltedTransfer": "连接超时 · 已熔断转移",
    "aliBailian2": "阿里百炼",
    "plannedMaintenancePauseRouting": "计划维护 · 暂停路由",
    "deepseekOfficial2": "DeepSeek 官方",
  },
  en: {
    "openaiOfficialMain": "OpenAI official · main",
    "secondsAgo": "30 seconds ago",
    "openaiAgentPrepared": "OpenAI agent · prepared",
    "secondsAgo2": "28 seconds ago",
    "anthropicOfficial": "Anthropic official",
    "secondsAgo3": "31 seconds ago",
    "secondsAgo4": "33 seconds ago",
    "deepseekOfficial": "DeepSeek official",
    "secondsAgo5": "29 seconds ago",
    "aliBailian": "Ali Bailian",
    "underMaintenance": "Under maintenance",
    "darkSideOfTheMoon": "dark side of the moon",
    "minutesAgo": "5 minutes ago",
    "openaiOfficialMain2": "OpenAI official · main",
    "anthropicOfficial2": "Anthropic official",
    "openaiAgentPrepared2": "OpenAI agent · prepared",
    "okDelayIsHigh": "200 OK · Delay is high",
    "darkSideOfTheMoon2": "dark side of the moon",
    "connectionTimeoutMeltedTransfer": "Connection timeout · Melted transfer",
    "aliBailian2": "Ali Bailian",
    "plannedMaintenancePauseRouting": "Planned maintenance · Pause routing",
    "deepseekOfficial2": "DeepSeek official",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-data-channels",
  content: t(content),
};

export default dictionary;
