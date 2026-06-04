import type { Invoice } from "./types";

// 发票 mock：引用项目+报价单，覆盖待开/已开/已寄送 + 未回款/部分回款/已结清。

export const invoices: Invoice[] = [
  {
    id: "iv1",
    code: "INV-2026-001",
    projectId: "p1",
    projectName: "云栖数据中心机电安装工程",
    quoteId: "q1",
    client: "云栖科技股份有限公司",
    taxNo: "91330100MA2H8X9K1F",
    type: "增值税专用发票",
    amount: 858000,
    taxRate: 0.09,
    status: "已寄送",
    issuedAt: "2026-04-10",
    paymentStatus: "已结清",
    payments: [{ id: "pm1", at: "2026-04-28", amount: 858000, method: "银行转账" }],
  },
  {
    id: "iv2",
    code: "INV-2026-002",
    projectId: "p1",
    projectName: "云栖数据中心机电安装工程",
    quoteId: "q1",
    client: "云栖科技股份有限公司",
    taxNo: "91330100MA2H8X9K1F",
    type: "增值税专用发票",
    amount: 858000,
    taxRate: 0.09,
    status: "已开",
    issuedAt: "2026-05-06",
    paymentStatus: "部分回款",
    payments: [{ id: "pm2", at: "2026-05-20", amount: 600000, method: "银行转账" }],
  },
  {
    id: "iv3",
    code: "INV-2026-003",
    projectId: "p2",
    projectName: "瑞康制药 GMP 洁净车间装饰工程",
    quoteId: "q6",
    client: "瑞康制药有限公司",
    taxNo: "91320500MA1MX2P3Q4",
    type: "增值税专用发票",
    amount: 1218000,
    taxRate: 0.09,
    status: "已寄送",
    issuedAt: "2026-04-15",
    paymentStatus: "部分回款",
    payments: [
      { id: "pm3", at: "2026-04-30", amount: 600000, method: "银行转账" },
      { id: "pm4", at: "2026-05-25", amount: 300000, method: "承兑汇票" },
    ],
  },
  {
    id: "iv4",
    code: "INV-2026-004",
    projectId: "p6",
    projectName: "绿野农业冷链仓储制冷工程",
    quoteId: undefined,
    client: "绿野农业发展公司",
    taxNo: "91370700MA3FG5H6J7",
    type: "增值税普通发票",
    amount: 1520000,
    taxRate: 0.09,
    status: "已寄送",
    issuedAt: "2026-05-02",
    paymentStatus: "已结清",
    payments: [{ id: "pm5", at: "2026-05-18", amount: 1520000, method: "银行转账" }],
  },
  {
    id: "iv5",
    code: "INV-2026-005",
    projectId: "p7",
    projectName: "和裕酒店中央空调改造",
    quoteId: undefined,
    client: "和裕酒店管理公司",
    taxNo: "91310101MA1FL8K9M0",
    type: "增值税专用发票",
    amount: 640000,
    taxRate: 0.09,
    status: "已寄送",
    issuedAt: "2026-03-15",
    paymentStatus: "已结清",
    payments: [{ id: "pm6", at: "2026-03-28", amount: 640000, method: "银行转账" }],
  },
  {
    id: "iv6",
    code: "INV-2026-006",
    projectId: "p3",
    projectName: "极光新能源充电站电气安装",
    quoteId: "q5",
    client: "极光新能源科技公司",
    taxNo: "91330200MA2GX5Y6Z7",
    type: "增值税专用发票",
    amount: 441000,
    taxRate: 0.09,
    status: "待开",
    issuedAt: undefined,
    paymentStatus: "未回款",
    payments: [],
  },
  {
    id: "iv7",
    code: "INV-2026-007",
    projectId: "p4",
    projectName: "晨光商业综合体暖通工程",
    quoteId: "q2",
    client: "晨光置业集团",
    taxNo: "91320100MA1NX3P4Q5",
    type: "增值税专用发票",
    amount: 980000,
    taxRate: 0.09,
    status: "待开",
    issuedAt: undefined,
    paymentStatus: "未回款",
    payments: [],
  },
];

/** 已回款金额。 */
export function paidAmount(iv: Invoice): number {
  return iv.payments.reduce((s, p) => s + p.amount, 0);
}

/** 应收余额。 */
export function dueAmount(iv: Invoice): number {
  return iv.amount - paidAmount(iv);
}

export function invoiceById(id: string): Invoice | undefined {
  return invoices.find((iv) => iv.id === id);
}
