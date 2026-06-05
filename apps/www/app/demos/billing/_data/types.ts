// 瀚付 HanPay 数据模型（SSoT）。纯展示 demo，所有金额以「元」为单位的 number。
import type { CardBrand } from "@hulian/ui";

export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled";

/** 套餐档位。 */
export interface PlanTier {
  id: string;
  name: string;
  nameEn: string;
  tagline: string;
  /** 月付单价（元/月）。0=免费，-1=联系销售。 */
  monthly: number;
  /** 年付单价（元/月，折算后；总额 = ×12）。 */
  yearly: number;
  /** 含席位数。 */
  seats: number;
  features: string[];
  /** 卡片高亮（推荐档）。 */
  featured?: boolean;
}

/** 增值附加项（可多选）。 */
export interface Addon {
  id: string;
  name: string;
  desc: string;
  /** 月付价（元/月）。 */
  monthly: number;
  /** 年付价（元/月）。 */
  yearly: number;
}

export type PaymentMethodType = "card" | "wallet";
export type WalletProvider = "wechat" | "alipay";

/** 已绑定的支付方式。 */
export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  /** card 专属。 */
  brand?: CardBrand;
  number?: string;
  holder?: string;
  expiry?: string;
  /** wallet 专属。 */
  wallet?: WalletProvider;
  walletAccount?: string;
}

export type InvoiceStatus = "paid" | "pending" | "failed" | "refunded";

/** 一张账单 / 发票。 */
export interface Invoice {
  id: string;
  /** 出账时间 ISO。 */
  date: string;
  /** 计费周期描述。 */
  period: string;
  /** 套餐名（出账时）。 */
  plan: string;
  amount: number;
  status: InvoiceStatus;
  /** 明细行。 */
  lines: { label: string; amount: number }[];
}

/** 资源用量。 */
export interface UsageMetric {
  key: string;
  label: string;
  used: number;
  quota: number;
  unit: string;
}

/** 月度消费点（图表）。 */
export interface SpendPoint {
  month: string;
  amount: number;
}
