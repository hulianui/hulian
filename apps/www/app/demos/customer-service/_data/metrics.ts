import { copy } from "./metrics.content";
import type { Metric } from "./types";
import { conversations } from "./conversations";
import { tickets } from "./tickets";
import { channelLabel } from "./labels";

// 看板指标：部分由 mock 现算（单一口径），部分为静态趋势序列。

const totalConv = conversations.length;
const closed = conversations.filter((c) => c.status === "closed").length;
const resolvedTickets = tickets.filter((t) => t.status === "已解决").length;

export const todayMetrics: Metric[] = [
  { label: copy("todaySConversationVolume"), value: "1,284", delta: 12.4, hint: copy("thanYesterday") },
  { label: copy("averageFirstRing"), value: "23s", delta: -8.1, hint: copy("theLowerTheBetter") },
  { label: copy("resolutionRate"), value: `${Math.round((resolvedTickets / tickets.length) * 100)}%`, delta: 3.2, hint: copy("workOrderSize") },
  { label: copy("satisfactionCsat"), value: "96.8%", delta: 1.5, hint: copy("lastDays") },
];

/** 会话量按小时（坐席台高峰观察）。 */
export function hourlyVolume() {
  const base = [42, 28, 18, 64, 120, 156, 138, 172, 198, 164, 110, 86];
  const hours = [copy("oClock"), copy("oClock2"), copy("oClock3"), copy("oClock4"), copy("oClock5"), copy("localizedText"), copy("localizedText2"), copy("localizedText3"), copy("localizedText4"), copy("localizedText5"), copy("localizedText6"), copy("localizedText7")];
  return hours.map((hour, i) => ({ hour, 会话量: base[i] }));
}

/** 渠道分布（由当前会话现算占比，donut 饼图）。 */
export function channelDistribution() {
  const map = new Map<string, number>();
  for (const c of conversations) map.set(c.channel, (map.get(c.channel) ?? 0) + 1);
  // 叠加静态权重让占比更像真实大盘
  const weight: Record<string, number> = { 网页: 486, App: 412, 微信: 298, 电话: 88 };
  return [...map.keys()].map((name) => ({ name: channelLabel[name as keyof typeof channelLabel], value: weight[name] ?? map.get(name)! }));
}

/** 近 7 日满意度趋势（CSAT %）。 */
export function csatTrend() {
  const days = [copy("monday"), copy("tuesday"), copy("wednesday"), copy("thursday"), copy("friday"), copy("saturday"), copy("sunday")];
  const csat = [95.2, 96.1, 95.8, 97.0, 96.5, 98.2, 96.8];
  return days.map((day, i) => ({ day, 满意度: csat[i] }));
}

/** 坐席接待排行（接待量 + 满意度）。 */
export const agentLeaderboard = [
  { agent: copy("xiaoLian"), served: 186, csat: 98.1 },
  { agent: copy("ahu"), served: 172, csat: 96.4 },
  { agent: copy("wanqing"), served: 158, csat: 97.2 },
  { agent: copy("zhouMing"), served: 134, csat: 95.0 },
];

export const liveStats = {
  online: 8, // 在线坐席
  waiting: conversations.filter((c) => c.status === "waiting").length, // 排队中
  active: conversations.filter((c) => c.status === "active").length, // 进行中
  closedToday: closed,
  totalConv,
};
