import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "online": "在线",
    "downgrade": "降级",
    "offline": "离线",
    "maintenance": "维护",
    "overview": "概览",
    "todaySGatewayOperationStatusAsOf": "今日网关运行态势 · 截至 06-05 10:42",
    "goToRecharge": "去充值",
    "accountBalanceIsLessThan": "账户余额低于",
    "expected": "，预计",
    "whenTheNumberOfDaysIsExhausted": "天后耗尽，请及时充值以免服务中断。",
    "requestToday": "今日请求",
    "consumeTokens": "消耗 Tokens",
    "spendToday": "今日花费",
    "successRate": "成功率",
    "requestVolumeInThePastDays": "近 7 日请求量",
    "unitTimes": "单位：次",
    "numberOfRequests": "请求数",
    "topModelTodaySSpending": "Top 模型（今日花费）",
    "spend": "花费 $",
    "upstreamChannelHealth": "上游渠道健康",
    "viewAll": "查看全部",
    "modelsWeights": "个模型 · 权重",
    "recentRequests": "最近请求",
    "log": "日志",
  },
  en: {
    "online": "online",
    "downgrade": "Downgrade",
    "offline": "Offline",
    "maintenance": "maintenance",
    "overview": "Overview",
    "todaySGatewayOperationStatusAsOf": "Today's gateway operation status · As of 06-05 10:42",
    "goToRecharge": "Go to recharge",
    "accountBalanceIsLessThan": "Account balance is less than",
    "expected": ", expected",
    "whenTheNumberOfDaysIsExhausted": "When the number of days is exhausted, please recharge in time to avoid service interruption.",
    "requestToday": "Request today",
    "consumeTokens": "Consume Tokens",
    "spendToday": "Spend today",
    "successRate": "success rate",
    "requestVolumeInThePastDays": "Request volume in the past 7 days",
    "unitTimes": "Unit: times",
    "numberOfRequests": "Number of requests",
    "topModelTodaySSpending": "Top model (today's spending)",
    "spend": "Spend $",
    "upstreamChannelHealth": "Upstream channel health",
    "viewAll": "View all",
    "modelsWeights": "models · weights",
    "recentRequests": "recent requests",
    "log": "Log",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhub-app-page",
  content: t(content),
};

export default dictionary;
