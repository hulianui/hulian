import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "theOtherPartyConfirmedThatThereIs": "对方确认本季度有 30 个席位的扩容预算，等内部走流程。",
    "zhouMingyuan": "周明远",
    "returnedToVisitTheTechnicalLeaderAnd": "回访技术负责人，演示了新版协作看板，反馈积极。",
    "zhouMingyuan2": "周明远",
    "onSiteVisitsWereMadeToConnect": "上门拜访，对接采购与 IT，明确了 SSO 与数据导出两个硬需求。",
    "zhouMingyuan3": "周明远",
    "sendSaasQuoteV2WithSlaInstructions": "发送 SaaS 报价单 v2 与 SLA 说明。",
    "zhouMingyuan4": "周明远",
    "contractRenewalNegotiationsTheCustomerWantsA": "续约谈判，客户希望多年期折扣，已上报审批。",
    "linWanqing": "林晚晴",
    "quarterlyBusinessReviewShowsThatCustomersAre": "季度业务复盘，客户对去年实施满意度高，倾向续约。",
    "linWanqing2": "林晚晴",
    "theBiddingResultConfirmsTheWinningBid": "招标结果确认中标，进入合同与回款阶段。",
    "chenCe": "陈策",
    "secondRoundOfCommunicationOnTmsScheduling": "TMS 调度升级方案二轮沟通，等待客户排期。",
    "linWanqing3": "林晚晴",
    "thePocOfTheChargingNetworkManagement": "充电网管平台 POC 现场验证通过，推进商务条款。",
    "linWanqing4": "林晚晴",
    "gmpTraceabilityRequirementsAreClarifiedAndCustomers": "GMP 追溯需求澄清，客户索要同行业案例。",
    "chenCe2": "陈策",
    "theMarketingAutomationTrialAccountHasBeen": "营销自动化试用账号已开通，约定下周演示。",
    "highSensitivity": "高敏",
    "theSecondPhaseAcceptanceOfTheData": "数据中台二期验收完成，发起尾款流程。",
    "zhouMingyuan5": "周明远",
  },
  en: {
    "theOtherPartyConfirmedThatThereIs": "The other party confirmed that there is an expansion budget of 30 seats for this quarter and is waiting for the internal process.",
    "zhouMingyuan": "Zhou Mingyuan",
    "returnedToVisitTheTechnicalLeaderAnd": "Returned to visit the technical leader and demonstrated the new version of the collaboration dashboard, and the feedback was positive.",
    "zhouMingyuan2": "Zhou Mingyuan",
    "onSiteVisitsWereMadeToConnect": "On-site visits were made to connect procurement and IT, and two hard requirements for SSO and data export were clarified.",
    "zhouMingyuan3": "Zhou Mingyuan",
    "sendSaasQuoteV2WithSlaInstructions": "Send SaaS quote v2 with SLA instructions.",
    "zhouMingyuan4": "Zhou Mingyuan",
    "contractRenewalNegotiationsTheCustomerWantsA": "Contract renewal negotiations, the customer wants a multi-year discount, has been submitted for approval.",
    "linWanqing": "Lin Wanqing",
    "quarterlyBusinessReviewShowsThatCustomersAre": "Quarterly business review shows that customers are highly satisfied with last year's implementation and are inclined to renew their contracts.",
    "linWanqing2": "Lin Wanqing",
    "theBiddingResultConfirmsTheWinningBid": "The bidding result confirms the winning bid and enters the contract and payment stage.",
    "chenCe": "Chen Ce",
    "secondRoundOfCommunicationOnTmsScheduling": "Second round of communication on TMS scheduling upgrade plan, waiting for customer scheduling.",
    "linWanqing3": "Lin Wanqing",
    "thePocOfTheChargingNetworkManagement": "The POC of the charging network management platform passed on-site verification and business terms were promoted.",
    "linWanqing4": "Lin Wanqing",
    "gmpTraceabilityRequirementsAreClarifiedAndCustomers": "GMP traceability requirements are clarified, and customers ask for cases from the same industry.",
    "chenCe2": "Chen Ce",
    "theMarketingAutomationTrialAccountHasBeen": "The marketing automation trial account has been opened and a demonstration is scheduled for next week.",
    "highSensitivity": "Gao Min",
    "theSecondPhaseAcceptanceOfTheData": "The second phase acceptance of the data center is completed and the final payment process is initiated.",
    "zhouMingyuan5": "Zhou Mingyuan",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-crm-data-follows",
  content: t(content),
};

export default dictionary;
