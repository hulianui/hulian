import { copy } from "./status.content";
import type { TagTone } from "@hulianui/ui";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";
import type { CustomerLevel, CustomerStatus, FollowType, OppStage, OrderStatus } from "./types";

export const customerLevelLabel: Record<CustomerLevel, string> = {
  重要: copy("levelKey"),
  普通: copy("levelStandard"),
  潜在: copy("levelProspect"),
};

export const customerStatusLabel: Record<CustomerStatus, string> = {
  待分配: copy("statusUnassigned"),
  跟进中: copy("statusActive"),
  已成交: copy("statusWon"),
  已流失: copy("statusLost"),
};

export const oppStageLabel: Record<OppStage, string> = {
  线索: copy("stageLead"),
  初步接触: copy("stageContact"),
  方案报价: copy("stageProposal"),
  商务谈判: copy("stageNegotiation"),
  赢单: copy("stageWon"),
  输单: copy("stageLost"),
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  待付款: copy("orderPending"),
  已付款: copy("orderPaid"),
  已发货: copy("orderShipped"),
  已完成: copy("orderCompleted"),
  已退款: copy("orderRefunded"),
};

export const followTypeLabel: Record<FollowType, string> = {
  电话: copy("followPhone"),
  拜访: copy("followVisit"),
  微信: copy("followWechat"),
  邮件: copy("followEmail"),
};

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
  if (DOCS_LOCALE === "en" && n >= 10000) {
    const thousands = n / 1000;
    return `¥${thousands.toFixed(Number.isInteger(thousands) ? 0 : 1)}K`;
  }
  if (n >= 10000) return copy("valueMillion", (n / 10000).toFixed(n % 10000 === 0 ? 0 : 1));
  return `¥${n.toLocaleString("zh-CN")}`;
}
