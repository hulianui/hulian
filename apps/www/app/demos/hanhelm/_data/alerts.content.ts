import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "p95LatencyExceedsThreshold": "P95 延迟超阈",
    "wechatWorkDutyGroup": "企业微信 · 值班群",
    "queueDepthBacklog": "队列深度积压",
    "article": "条",
    "wechatWorkDutyGroup2": "企业微信 · 值班群",
    "p0TaskSlaDefault": "P0 任务 SLA 违约",
    "times": "次",
    "smsPhoneDutySupervisor": "短信 + 电话 · 值班负责人",
    "hourlyCostExceedsBudget": "单小时成本超预算",
    "emailCostCenter": "邮件 · 成本中心",
    "actuatorHealthDegradation": "执行器健康降级",
    "level": "级",
    "wechatWorkSms": "企业微信 + 短信",
    "missionOverBudgetFailure": "任务超预算失败",
    "times2": "次",
    "emailSubmitter": "邮件 · 提交人",
    "p95HasLatencyOfMsExceedingThe": "P95 延迟达 2980ms，超阈值 2500ms",
    "todayAt": "今天 10:00",
    "duringTheMorningPeakOpusWasLoaded": "早高峰 Opus 4.7 负载 71%，拖尾延迟上升，建议临时上调 Sonnet 分流权重。",
    "queueDepthReachesItemsExceedingTheThreshold": "队列深度达 108 条，超阈值 100 条",
    "article2": "条",
    "todayAt2": "今天 10:00",
    "theBacklogOfP3BatchTasksHas": "P3 批量任务积压，已自动调度至 DeepSeek V4 低成本池消化。",
    "deepseekV4HealthHasBeenDowngradedTo": "DeepSeek V4 健康度降级为 degraded",
    "level2": "级",
    "todayAt3": "今天 09:42",
    "deepseekV4ExtractionTasksTimedOutAnd": "DeepSeek V4 抽取任务出现超时，已对其新流量启用降级链（Haiku 4.5 / Sonnet 4.6）。",
    "communityUgcReviewTaskSlaNearExpiration": "社区 UGC 审核任务 SLA 临期（已用 88%）",
    "todayAt4": "今天 09:58",
    "p0RealTimeReviewWaitIsSeconds": "P0 实时审核等待 26.5s，SLA 30s，建议抢占审核 Agent 并发或提级至 Opus。",
    "failureToArrangeCompetitorResearchTasksBeyond": "竞品调研编排任务超预算失败",
    "todayAt5": "今天 09:21",
    "externalSearchSourceTrafficRestrictionsCausedRetrys": "外部检索源限流导致重试，花费 ¥7.8 触顶预算 ¥8.0 后中止，已通知提交人。",
    "timeSlotCostHExceedingThreshold": "10:00 时段成本达 ¥146/h，超阈值 ¥140",
    "todayAt6": "今天 10:00",
    "duringPeakPeriodsTheProportionOfOpus": "高峰期 Opus/Flux 占比上升，已开启批量任务成本权重上调策略。",
  },
  en: {
    "p95LatencyExceedsThreshold": "P95 latency exceeds threshold",
    "wechatWorkDutyGroup": "WeChat Work · Duty group",
    "queueDepthBacklog": "Queue depth backlog",
    "article": "Article",
    "wechatWorkDutyGroup2": "WeChat Work · Duty group",
    "p0TaskSlaDefault": "P0 task SLA default",
    "times": "Times",
    "smsPhoneDutySupervisor": "SMS + Phone · Duty supervisor",
    "hourlyCostExceedsBudget": "Hourly cost exceeds budget",
    "emailCostCenter": "Email · Cost Center",
    "actuatorHealthDegradation": "Executor health degradation",
    "level": "Level",
    "wechatWorkSms": "WeChat Work + SMS",
    "missionOverBudgetFailure": "Task over-budget failure",
    "times2": "Times",
    "emailSubmitter": "Email · Submitter",
    "p95HasLatencyOfMsExceedingThe": "P95 has latency of 2980ms, exceeding the threshold by 2500ms",
    "todayAt": "Today at 10:00",
    "duringTheMorningPeakOpusWasLoaded": "During the morning peak, Opus 4.7 was loaded at 71%, with trailing latency rising; it is recommended to temporarily raise the Sonnet split weight.",
    "queueDepthReachesItemsExceedingTheThreshold": "Queue depth reaches 108 items, exceeding the threshold by 100 items",
    "article2": "Article",
    "todayAt2": "Today at 10:00",
    "theBacklogOfP3BatchTasksHas": "The backlog of P3 batch tasks has been automatically scheduled to be processed in the DeepSeek V4 low-cost pool.",
    "deepseekV4HealthHasBeenDowngradedTo": "DeepSeek V4 health has been downgraded to degraded",
    "level2": "Level",
    "todayAt3": "Today at 09:42",
    "deepseekV4ExtractionTasksTimedOutAnd": "DeepSeek V4 extraction tasks timed out, and downgrade chains have been enabled for new traffic (Haiku 4.5 / Sonnet 4.6).",
    "communityUgcReviewTaskSlaNearExpiration": "Community UGC Review Task SLA Near-Expiration (88% Used)",
    "todayAt4": "Today at 09:58",
    "p0RealTimeReviewWaitIsSeconds": "P0 real-time review wait is 26.5 seconds, SLA 30 seconds; it is recommended to preemptively review the Agent concurrently or upgrade to Opus.",
    "failureToArrangeCompetitorResearchTasksBeyond": "Failure to arrange competitor research tasks beyond budget",
    "todayAt5": "Today at 09:21",
    "externalSearchSourceTrafficRestrictionsCausedRetrys": "External search source traffic restrictions caused retrys, costing ¥7.8 to hit the top budget of ¥8.0 and then stopping; submitter notified.",
    "timeSlotCostHExceedingThreshold": "10:00 time slot cost ¥146/h, exceeding threshold ¥140",
    "todayAt6": "Today at 10:00",
    "duringPeakPeriodsTheProportionOfOpus": "During peak periods, the proportion of Opus/Flux rose, and the strategy to increase the cost weight of batch tasks has been initiated.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-data-alerts",
  content: t(content),
};

export default dictionary;
