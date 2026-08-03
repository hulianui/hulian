import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "pleaseFillInTheFollowUpContent": "请填写跟进内容",
    "customerDoesNotExist": "客户不存在",
    "itMayHaveBeenDeletedDemoMemory": "可能已被删除（demo 内存态，刷新还原）。",
    "returnToCustomerList": "返回客户列表",
    "addFollowUp": "新增跟进",
    "editCustomer": "编辑客户",
    "demoEnvironmentEditTheEntranceAndSee": "演示环境，编辑入口见客户列表",
    "editCustomer2": "编辑客户",
    "personInCharge": "负责人",
    "industry": "所属行业",
    "area": "所在地区",
    "contactPerson": "联系人",
    "contactNumber": "联系电话",
    "email": "邮箱",
    "accumulatedTransactions": "累计成交",
    "latestFollowUp": "最近跟进",
    "creationTime": "创建时间",
    "followUpRecords": "跟进记录",
    "businessOpportunities": "商机 ·",
    "order": "订单 ·",
    "accessories": "附件",
    "noFollowUpRecordYet": "暂无跟进记录",
    "clickAddFollowUpOnTheUpper": "点击右上「新增跟进」记录第一条。",
    "personInChargeValueWinRateValue": "负责人 {0} · 赢率 {1}% · 预计 {2}",
    "noBusinessOpportunitiesYet": "暂无商机",
    "valueItemsOrderedOnValue": "{0} 件商品 · 下单于 {1}",
    "noOrdersYet": "暂无订单",
    "noAttachmentsYet": "暂无附件",
    "contractsQuotesEtcCanBeFiledHere": "合同 / 报价单等可在此归档。",
    "addFollowUp2": "新增跟进",
    "followUpRecorded": "跟进已记录",
    "followUpMethod": "跟进方式",
    "followUpContent": "跟进内容",
    "recordTheKeyPointsOfThisCommunication": "记录本次沟通要点、客户反馈、下一步计划…",
  },
  en: {
    "pleaseFillInTheFollowUpContent": "Please fill in the follow-up content",
    "customerDoesNotExist": "Customer does not exist",
    "itMayHaveBeenDeletedDemoMemory": "It may have been deleted (stored in memory for this demo; reload to restore).",
    "returnToCustomerList": "Return to customer list",
    "addFollowUp": "Add follow up",
    "editCustomer": "Edit customer",
    "demoEnvironmentEditTheEntranceAndSee": "Demo environment, edit the entrance and see the customer list",
    "editCustomer2": "Edit customer",
    "personInCharge": "Owner",
    "industry": "Industry",
    "area": "area",
    "contactPerson": "Contact person",
    "contactNumber": "Contact number",
    "email": "Email",
    "accumulatedTransactions": "Lifetime value",
    "latestFollowUp": "Latest follow up",
    "creationTime": "Created",
    "followUpRecords": "Follow up records",
    "businessOpportunities": "Business opportunities ·",
    "order": "Order ·",
    "accessories": "Accessories",
    "noFollowUpRecordYet": "No follow-up record yet",
    "clickAddFollowUpOnTheUpper": "Click \"Add Follow-up\" on the upper right to record the first one.",
    "personInChargeValueWinRateValue": "Person in charge {0} · Win rate {1}% · Expected {2}",
    "noBusinessOpportunitiesYet": "No business opportunities yet",
    "valueItemsOrderedOnValue": "{0} items · Ordered on {1}",
    "noOrdersYet": "No orders yet",
    "noAttachmentsYet": "No attachments yet",
    "contractsQuotesEtcCanBeFiledHere": "Contracts/quotes etc. can be filed here.",
    "addFollowUp2": "Add follow up",
    "followUpRecorded": "Follow up recorded",
    "followUpMethod": "Follow up method",
    "followUpContent": "Follow up content",
    "recordTheKeyPointsOfThisCommunication": "Record the key points of this communication, customer feedback, next step plan...",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-crm-components-customer-detail",
  content: t(content),
};

export default dictionary;
