import type { TagTone } from "@hulian/ui";
import type { CustomerLevel, CustomerStatus, OppStage, OrderStatus } from "./types";

// 业务状态 → Tag 语气色（全 CRM 统一口径，避免各页各自映射漂移）。
export const customerStatusTone: Record<CustomerStatus, TagTone> = {
  待分配: "neutral",
  跟进中: "brand",
  已成交: "success",
  已流失: "danger",
};

export const customerLevelTone: Record<CustomerLevel, TagTone> = {
  重要: "danger",
  普通: "brand",
  潜在: "neutral",
};

export const orderStatusTone: Record<OrderStatus, TagTone> = {
  待付款: "warning",
  已付款: "brand",
  已发货: "brand",
  已完成: "success",
  已退款: "danger",
};

export const oppStageTone: Record<OppStage, TagTone> = {
  线索: "neutral",
  初步接触: "neutral",
  方案报价: "brand",
  商务谈判: "warning",
  赢单: "success",
  输单: "danger",
};

/** 金额 → 「¥1.2万 / ¥120万」紧凑展示。 */
export function yuan(n: number): string {
  if (n >= 10000) return `¥${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}万`;
  return `¥${n.toLocaleString("zh-CN")}`;
}
