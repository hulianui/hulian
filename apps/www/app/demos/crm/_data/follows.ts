import type { Follow } from "./types";

// 跟进流水（详情页时间线 / 工作台最近动态）。重点客户给更完整的跟进链路。
export const follows: Follow[] = [
  { id: "F01", customerId: "C1002", type: "微信", content: "对方确认本季度有 30 个席位的扩容预算，等内部走流程。", owner: "周明远", createdAt: "2026-06-02 14:20" },
  { id: "F02", customerId: "C1002", type: "电话", content: "回访技术负责人，演示了新版协作看板，反馈积极。", owner: "周明远", createdAt: "2026-05-28 10:05" },
  { id: "F03", customerId: "C1002", type: "拜访", content: "上门拜访，对接采购与 IT，明确了 SSO 与数据导出两个硬需求。", owner: "周明远", createdAt: "2026-05-19 15:40" },
  { id: "F04", customerId: "C1002", type: "邮件", content: "发送 SaaS 报价单 v2 与 SLA 说明。", owner: "周明远", createdAt: "2026-05-12 09:30" },
  { id: "F05", customerId: "C1001", type: "电话", content: "续约谈判，客户希望多年期折扣，已上报审批。", owner: "林晚晴", createdAt: "2026-05-30 16:10" },
  { id: "F06", customerId: "C1001", type: "拜访", content: "季度业务复盘，客户对去年实施满意度高，倾向续约。", owner: "林晚晴", createdAt: "2026-05-15 11:00" },
  { id: "F07", customerId: "C1004", type: "邮件", content: "招标结果确认中标，进入合同与回款阶段。", owner: "陈策", createdAt: "2026-05-21 17:25" },
  { id: "F08", customerId: "C1006", type: "微信", content: "TMS 调度升级方案二轮沟通，等待客户排期。", owner: "林晚晴", createdAt: "2026-05-31 13:15" },
  { id: "F09", customerId: "C1024", type: "拜访", content: "充电网管平台 POC 现场验证通过，推进商务条款。", owner: "林晚晴", createdAt: "2026-06-03 10:50" },
  { id: "F10", customerId: "C1014", type: "电话", content: "GMP 追溯需求澄清，客户索要同行业案例。", owner: "陈策", createdAt: "2026-06-01 09:45" },
  { id: "F11", customerId: "C1017", type: "微信", content: "营销自动化试用账号已开通，约定下周演示。", owner: "高敏", createdAt: "2026-06-03 16:30" },
  { id: "F12", customerId: "C1016", type: "邮件", content: "数据中台二期验收完成，发起尾款流程。", owner: "周明远", createdAt: "2026-05-15 14:00" },
];

export function followsByCustomer(customerId: string): Follow[] {
  return follows
    .filter((f) => f.customerId === customerId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
