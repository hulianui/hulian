import { copy } from "./follows.content";
import { canonicalOwner } from "./protocol";
import type { Follow } from "./types";

// 跟进流水（详情页时间线 / 工作台最近动态）。重点客户给更完整的跟进链路。
export const follows: Follow[] = [
  { id: "F01", customerId: "C1002", type: "微信", content: copy("theOtherPartyConfirmedThatThereIs"), owner: canonicalOwner("zhouMingyuan"), createdAt: "2026-06-02 14:20" },
  { id: "F02", customerId: "C1002", type: "电话", content: copy("returnedToVisitTheTechnicalLeaderAnd"), owner: canonicalOwner("zhouMingyuan2"), createdAt: "2026-05-28 10:05" },
  { id: "F03", customerId: "C1002", type: "拜访", content: copy("onSiteVisitsWereMadeToConnect"), owner: canonicalOwner("zhouMingyuan3"), createdAt: "2026-05-19 15:40" },
  { id: "F04", customerId: "C1002", type: "邮件", content: copy("sendSaasQuoteV2WithSlaInstructions"), owner: canonicalOwner("zhouMingyuan4"), createdAt: "2026-05-12 09:30" },
  { id: "F05", customerId: "C1001", type: "电话", content: copy("contractRenewalNegotiationsTheCustomerWantsA"), owner: canonicalOwner("linWanqing"), createdAt: "2026-05-30 16:10" },
  { id: "F06", customerId: "C1001", type: "拜访", content: copy("quarterlyBusinessReviewShowsThatCustomersAre"), owner: canonicalOwner("linWanqing2"), createdAt: "2026-05-15 11:00" },
  { id: "F07", customerId: "C1004", type: "邮件", content: copy("theBiddingResultConfirmsTheWinningBid"), owner: canonicalOwner("chenCe"), createdAt: "2026-05-21 17:25" },
  { id: "F08", customerId: "C1006", type: "微信", content: copy("secondRoundOfCommunicationOnTmsScheduling"), owner: canonicalOwner("linWanqing3"), createdAt: "2026-05-31 13:15" },
  { id: "F09", customerId: "C1024", type: "拜访", content: copy("thePocOfTheChargingNetworkManagement"), owner: canonicalOwner("linWanqing4"), createdAt: "2026-06-03 10:50" },
  { id: "F10", customerId: "C1014", type: "电话", content: copy("gmpTraceabilityRequirementsAreClarifiedAndCustomers"), owner: canonicalOwner("chenCe2"), createdAt: "2026-06-01 09:45" },
  { id: "F11", customerId: "C1017", type: "微信", content: copy("theMarketingAutomationTrialAccountHasBeen"), owner: canonicalOwner("highSensitivity"), createdAt: "2026-06-03 16:30" },
  { id: "F12", customerId: "C1016", type: "邮件", content: copy("theSecondPhaseAcceptanceOfTheData"), owner: canonicalOwner("zhouMingyuan5"), createdAt: "2026-05-15 14:00" },
];

export function followsByCustomer(customerId: string): Follow[] {
  return follows
    .filter((f) => f.customerId === customerId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
