import { copy } from "./invoices.content";
import type { Invoice } from "./types";

// 发票 mock：引用项目+报价单，覆盖待开/已开/已寄送 + 未回款/部分回款/已结清。

export const invoices: Invoice[] = [
  {
    id: "iv1",
    code: "INV-2026-001",
    projectId: "p1",
    projectName: copy("yunqiDataCenterMechanicalAndElectricalInstallation"),
    quoteId: "q1",
    client: copy("yunqiTechnologyCoLtd"),
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
    projectName: copy("yunqiDataCenterMechanicalAndElectricalInstallation2"),
    quoteId: "q1",
    client: copy("yunqiTechnologyCoLtd2"),
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
    projectName: copy("ruikangPharmaceuticalGmpCleanWorkshopDecorationProject"),
    quoteId: "q6",
    client: copy("ruikangPharmaceuticalCoLtd"),
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
    projectName: copy("greenfieldAgriculturalColdChainStorageAndRefrigeration"),
    quoteId: undefined,
    client: copy("greenfieldAgriculturalDevelopmentCorp"),
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
    projectName: copy("heyuHotelCentralAirConditioningRenovation"),
    quoteId: undefined,
    client: copy("heyuHotelManagementCompany"),
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
    projectName: copy("auroraNewEnergyChargingStationElectricalInstallation"),
    quoteId: "q5",
    client: copy("auroraNewEnergyTechnologyCompany"),
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
    projectName: copy("chenguangCommercialComplexHeatingAndVentilationProject"),
    quoteId: "q2",
    client: copy("chenguangRealEstateGroup"),
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
