import { copy } from "./checkouts.content";
import { dueAmount, invoiceById } from "./invoices";
import type { Checkout } from "./types";

// 收款单 mock：引用已开发票，覆盖 待支付/已支付/已关闭。与 invoices 共享内存态（刷新还原）。

export const checkouts: Checkout[] = [
  {
    id: "co1",
    code: "PAY-2026-001",
    invoiceId: "iv2", // 部分回款的发票，仍有应收余额
    projectName: copy("yunqiDataCenterMechanicalAndElectricalInstallation"),
    client: copy("yunqiTechnologyCoLtd"),
    amount: 258000,
    status: "待支付",
    createdAt: "2026-06-03",
    expireAt: "2026-06-03 18:00",
  },
  {
    id: "co2",
    code: "PAY-2026-002",
    invoiceId: "iv3",
    projectName: copy("ruikangPharmaceuticalGmpCleanWorkshopDecorationProject"),
    client: copy("ruikangPharmaceuticalCoLtd"),
    amount: 318000,
    status: "待支付",
    createdAt: "2026-06-02",
    expireAt: "2026-06-02 20:00",
  },
  {
    id: "co3",
    code: "PAY-2026-003",
    invoiceId: "iv1",
    projectName: copy("yunqiDataCenterMechanicalAndElectricalInstallation2"),
    client: copy("yunqiTechnologyCoLtd2"),
    amount: 858000,
    method: "微信支付",
    status: "已支付",
    createdAt: "2026-04-26",
    expireAt: "2026-04-26 18:00",
    paidAt: "2026-04-28 10:24",
    serialNo: "HL202604281024005887",
  },
  {
    id: "co4",
    code: "PAY-2026-004",
    invoiceId: "iv6",
    projectName: copy("auroraNewEnergyChargingStationElectricalInstallation"),
    client: copy("auroraNewEnergyTechnologyCompany"),
    amount: 200000,
    status: "已关闭",
    createdAt: "2026-05-10",
    expireAt: "2026-05-10 12:00",
  },
];

export function checkoutById(id: string): Checkout | undefined {
  return checkouts.find((c) => c.id === id);
}

/** 收银台支付链接（编进二维码，仅 demo 展示）。 */
export function payUrl(c: Checkout): string {
  return `https://pay.hulian.demo/checkout/${c.code}`;
}

/**
 * 模拟支付成功：回写发票 payments + 重算 paymentStatus（denormalized 字段必须同写，
 * 否则发票列表的状态 Tag 与应收余额会不一致）。返回支付流水号。
 */
export function settlePayment(c: Checkout, paidAt: string): string {
  const iv = invoiceById(c.invoiceId);
  if (iv) {
    iv.payments.push({
      id: `pm-${c.id}-${iv.payments.length + 1}`,
      at: paidAt.slice(0, 10),
      amount: c.amount,
      method: c.method ?? "微信支付",
    });
    const due = dueAmount(iv);
    iv.paymentStatus = due <= 0 ? "已结清" : iv.payments.length > 0 ? "部分回款" : "未回款";
  }
  return `HL${paidAt.replace(/\D/g, "")}${String(1000 + (c.amount % 9000))}`;
}
