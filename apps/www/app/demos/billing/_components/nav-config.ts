import { LayoutGrid, Layers, Wallet, ReceiptText, Settings } from "lucide-react";

// 瀚付控制台导航 SSoT。
export const BILLING_BASE = "/demos/billing";

export const brand = { name: "瀚付", nameEn: "HanPay", slogan: "订阅有度 · 账目分明" };

export interface BillingNavItem {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
  /** 精确匹配（仅 base 用）。 */
  exact?: boolean;
}

export const nav: BillingNavItem[] = [
  { label: "账户概览", href: BILLING_BASE, icon: LayoutGrid, exact: true },
  { label: "订阅套餐", href: `${BILLING_BASE}/plans`, icon: Layers },
  { label: "支付方式", href: `${BILLING_BASE}/payment`, icon: Wallet },
  { label: "账单与发票", href: `${BILLING_BASE}/invoices`, icon: ReceiptText },
  { label: "账户设置", href: `${BILLING_BASE}/settings`, icon: Settings },
];
