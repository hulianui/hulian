import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    text100GbPerMonth: "每月 100 GB 流量",
    text1TbPerMonth: "每月 1 TB 流量",
    autoscalingCompute: "弹性算力自动伸缩",
    metricsLogsDistributedTraces: "指标 / 日志 / 链路追踪",
    upTo10Members: "最多 10 名成员",
    fourHourTicketResponse: "工单 4 小时响应",
    soc2ClassIiiCompliance: "SOC 2 / 等保三级合规",
    ssoAndFineGrainedAuditing: "SSO 与细粒度审计",
    text9999SlaGuaranteed: "99.99% SLA 保障",
    privateDeploymentOptional: "私有化部署可选",
    additionalUsageCosts030GbTrafficIsNeverCutOffAutomatically: "超出后按 ¥0.3/GB 计费，不会强制断流。",
    additionalUsageCosts025GbSetABudgetCapToReceiveAnEarlyWarning: "超出后按 ¥0.25/GB 计费，可设预算上限提前告警。",
    payOnlyForRequestExecutionTimeScaleToZeroWhenTrafficStopsWithNoIdleCharges: "按实际请求时长计费，零流量时归零，不产生闲置费用。",
    builtInOpentelemetryCollectionWith30DaysOfRetentionReadyFromDayOne: "内置 OpenTelemetry 采集栈，30 天数据保留，开箱可用。",
    addSeatsAsNeededFor29PerUserEachMonth: "可申请扩展席位，超额成员按 ¥29/人·月单独计费。",
    guaranteedResponsesFrom0900To2200OnBusinessDaysWith247OnCallCoverageForP0Incidents: "工作日 09:00–22:00 保证响应，P0 故障 7×24 值班。",
    independentAnnualAuditsWithComplianceDocumentsAvailableForEnterpriseProcurement: "年度第三方审计，企业采购可提供合规证明文件。",
    saml20AndOidcSingleSignOnWithExportableAuditLogs: "支持 SAML 2.0 / OIDC 单点登录，操作日志可导出。",
    ifMonthlyAvailabilityFallsBelowTheSlaServiceCreditsAreAppliedAutomatically: "月度可用性低于承诺时自动按比例减免账单，无需申请。",
    deployToYourOwnDataCenterOrPrivateCloudContactSalesForATailoredPlan: "支持客户自有 IDC 或专有云，联系销售获取方案。",
    freeForever: "/ 永久免费",
    year: "/ 年",
    month: "/ 月",
    mostPopular: "最受欢迎",
    save: "省",
    learnMore: "了解更多：",
  },
  en: {
    text100GbPerMonth: "100 GB per month",
    text1TbPerMonth: "1 TB per month",
    autoscalingCompute: "Autoscaling compute",
    metricsLogsDistributedTraces: "Metrics / logs / distributed traces",
    upTo10Members: "Up to 10 members",
    fourHourTicketResponse: "Four-hour ticket response",
    soc2ClassIiiCompliance: "SOC 2 / MLPS Level 3 compliance",
    ssoAndFineGrainedAuditing: "SSO and fine-grained auditing",
    text9999SlaGuaranteed: "99.99% SLA guaranteed",
    privateDeploymentOptional: "Private deployment optional",
    additionalUsageCosts030GbTrafficIsNeverCutOffAutomatically: "Additional usage costs ¥0.30/GB; traffic is never cut off automatically.",
    additionalUsageCosts025GbSetABudgetCapToReceiveAnEarlyWarning: "Additional usage costs ¥0.25/GB. Set a budget cap to receive an early warning.",
    payOnlyForRequestExecutionTimeScaleToZeroWhenTrafficStopsWithNoIdleCharges: "Pay only for request execution time. Scale to zero when traffic stops, with no idle charges.",
    builtInOpentelemetryCollectionWith30DaysOfRetentionReadyFromDayOne: "Built-in OpenTelemetry collection with 30 days of retention, ready from day one.",
    addSeatsAsNeededFor29PerUserEachMonth: "Add seats as needed for ¥29 per user each month.",
    guaranteedResponsesFrom0900To2200OnBusinessDaysWith247OnCallCoverageForP0Incidents: "Guaranteed responses from 09:00 to 22:00 on business days, with 24/7 on-call coverage for P0 incidents.",
    independentAnnualAuditsWithComplianceDocumentsAvailableForEnterpriseProcurement: "Independent annual audits, with compliance documents available for enterprise procurement.",
    saml20AndOidcSingleSignOnWithExportableAuditLogs: "SAML 2.0 and OIDC single sign-on with exportable audit logs.",
    ifMonthlyAvailabilityFallsBelowTheSlaServiceCreditsAreAppliedAutomatically: "If monthly availability falls below the SLA, service credits are applied automatically.",
    deployToYourOwnDataCenterOrPrivateCloudContactSalesForATailoredPlan: "Deploy to your own data center or private cloud. Contact sales for a tailored plan.",
    freeForever: "/ Free forever",
    year: "/year",
    month: "/month",
    mostPopular: "most popular",
    save: "Save",
    learnMore: "Learn more: ",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-website-components-pricing-cards",
  content: t(content),
};

export default dictionary;
