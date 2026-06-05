import type { ReactNode } from "react";

/** 券类型：满减额 / 折扣 / 包邮(无门槛)。决定左侧面额区主视觉。 */
export type CouponKind = "amount" | "discount" | "shipping";

/** 券状态：可领 / 已领待用 / 已使用 / 已过期。驱动操作区文案与置灰。 */
export type CouponStatus = "available" | "claimed" | "used" | "expired";

export type CouponTone = "brand" | "danger" | "neutral";

export interface CouponProps {
  /** 券类型：amount=满减，discount=折扣，shipping=包邮。默认 amount。 */
  kind?: CouponKind;
  /** 面额（满减额，单位元）。kind=amount 时显示 ¥{amount}。 */
  amount?: number;
  /** 折扣（如 8.5 显示 8.5 折）。kind=discount 时使用。 */
  discount?: number;
  /** 使用门槛（满 X 元可用）。0 / 省略 = 无门槛。 */
  threshold?: number;
  /** 券标题（如「全场通用券」）。 */
  title: ReactNode;
  /** 适用范围 / 副说明（如「仅限数码品类」）。 */
  scope?: ReactNode;
  /** 有效期文案（如「2026.06.30 前有效」）。 */
  validUntil?: ReactNode;
  /** 状态，默认 available。 */
  status?: CouponStatus;
  /** 配色，默认 brand。 */
  tone?: CouponTone;
  /** 尺寸，默认 md。 */
  size?: "sm" | "md";
  /** 券面扫光动效：面额区周期性掠过高光带，引导领取。建议仅对可领（available）券开启；已用/过期券自动不播。 */
  shine?: boolean;
  /** 选中态（结算页选券高亮 ring）。 */
  selected?: boolean;
  /** 领取回调（status=available 时操作区按钮触发）。 */
  onClaim?: () => void;
  /** 使用 / 去凑单回调（status=claimed 时操作区按钮触发）。 */
  onUse?: () => void;
  /** 覆盖操作区按钮文案。 */
  actionLabel?: string;
  /** 整券可点（结算选券场景），点击触发。与右侧按钮独立。 */
  onSelect?: () => void;
  className?: string;
}
