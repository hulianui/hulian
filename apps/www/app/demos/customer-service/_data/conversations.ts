import { copy } from "./conversations.content";
import type { Conversation } from "./types";

// 7 个会话：覆盖 waiting / active / closed 三态与多渠道。
// messages = 已展示历史；queued = 实时引擎在坐席选中后逐条投递的客户后续消息。
export const conversations: Conversation[] = [
  {
    id: "CV01",
    customerId: "CU01",
    status: "active",
    channel: "App",
    subject: copy("goldCardReturnProgressConsultation"),
    unread: 2,
    lastAt: "14:28",
    messages: [
      { id: "m1", author: "customer", text: copy("helloWhereIsTheReturnIApplied"), at: "14:25" },
      { id: "m2", author: "agent", text: copy("helloWanruWeAreHelpingYouCheck"), at: "14:26", status: "read" },
      { id: "m3", author: "customer", text: copy("okayPleaseHurryUpAndWaitFor"), at: "14:27" },
      { id: "m4", author: "customer", text: copy("inAdditionCanTheItemIExchange"), at: "14:28" },
    ],
    queued: [
      { id: "q1", author: "customer", text: copy("byTheWayCanYouSendMe"), at: "14:31" },
      { id: "q2", author: "customer", text: copy("thankYouYourServiceAttitudeIsReally"), at: "14:34" },
    ],
  },
  {
    id: "CV02",
    customerId: "CU02",
    status: "waiting",
    channel: "网页",
    subject: copy("deliveryTime"),
    unread: 1,
    lastAt: "14:22",
    messages: [
      { id: "m1", author: "customer", text: copy("areYouThereWhyHasnTThe"), at: "14:22" },
    ],
    queued: [
      { id: "q1", author: "customer", text: copy("orderNumberNo20260603887"), at: "14:24" },
      { id: "q2", author: "customer", text: copy("iNeedItUrgentlyCanYouExpedite"), at: "14:26" },
    ],
  },
  {
    id: "CV03",
    customerId: "CU03",
    status: "active",
    channel: "微信",
    subject: copy("logisticsComplaints"),
    unread: 0,
    lastAt: "14:10",
    messages: [
      { id: "m1", author: "system", text: copy("theConversationIsTransferredManuallyByThe"), at: "14:05" },
      { id: "m2", author: "customer", text: copy("myExpressDeliveryHasnTBeenMoved"), at: "14:06" },
      { id: "m3", author: "agent", text: copy("iMVerySorryToCauseYou"), at: "14:08", status: "read" },
      { id: "m4", author: "agent", text: copy("iHaveContactedSfExpressAndWill"), at: "14:10", status: "sent" },
    ],
    queued: [
      { id: "q1", author: "customer", text: copy("okayThenILlWait"), at: "14:13" },
    ],
  },
  {
    id: "CV04",
    customerId: "CU04",
    status: "active",
    channel: "电话",
    subject: copy("blackCardExclusiveHomeApplianceInstallation"),
    unread: 0,
    lastAt: "13:50",
    messages: [
      { id: "m1", author: "customer", text: copy("whenCanMyWasherDryerBeInstalled"), at: "13:46" },
      { id: "m2", author: "agent", text: copy("helloMrZhouWeHaveMadeAn"), at: "13:48", status: "read" },
      { id: "m3", author: "customer", text: copy("okayPleaseBeOnTime"), at: "13:50" },
    ],
    queued: [],
  },
  {
    id: "CV05",
    customerId: "CU05",
    status: "waiting",
    channel: "App",
    subject: copy("maternalAndInfantProductConsultation"),
    unread: 1,
    lastAt: "14:20",
    messages: [
      { id: "m1", author: "customer", text: copy("isThisBottleAntiColicNewMothers"), at: "14:20" },
    ],
    queued: [
      { id: "q1", author: "customer", text: copy("isItSuitableForBabiesMonthsOld"), at: "14:23" },
    ],
  },
  {
    id: "CV06",
    customerId: "CU06",
    status: "closed",
    channel: "网页",
    subject: copy("afterSalesPolicyConsultation"),
    unread: 0,
    lastAt: "11:42",
    messages: [
      { id: "m1", author: "customer", text: copy("canIChangeMySneakersAfterWearing"), at: "11:38" },
      { id: "m2", author: "agent", text: copy("supportForDaysWithoutAnyReasonThe"), at: "11:40", status: "read" },
      { id: "m3", author: "customer", text: copy("okThankYouIHaveApplied"), at: "11:41" },
      { id: "m4", author: "system", text: copy("theCustomerHasEndedTheSessionSatisfaction"), at: "11:42" },
    ],
    queued: [],
  },
  {
    id: "CV07",
    customerId: "CU02",
    status: "closed",
    channel: "微信",
    subject: copy("invoiceRequest"),
    unread: 0,
    lastAt: "10:15",
    messages: [
      { id: "m1", author: "customer", text: copy("canIIssueAnElectronicInvoice"), at: "10:12" },
      { id: "m2", author: "agent", text: copy("yesItHasBeenSentToYour"), at: "10:14", status: "read" },
      { id: "m3", author: "system", text: copy("theCustomerHasEndedTheSessionSatisfaction2"), at: "10:15" },
    ],
    queued: [],
  },
];
