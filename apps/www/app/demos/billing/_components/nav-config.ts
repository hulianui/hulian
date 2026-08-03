import { copy } from "./nav-config.content";
import { LayoutGrid, Layers, Wallet, ReceiptText, Settings } from "lucide-react";

// 瀚付控制台导航 SSoT。
export const BILLING_BASE = "/demos/billing";

export const brand = { name: copy("hanpay"), nameEn: "HanPay", slogan: copy("subscriptionIsAppropriateKeepingClearAccounts") };

export interface BillingNavItem {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
  /** 精确匹配（仅 base 用）。 */
  exact?: boolean;
}

export const nav: BillingNavItem[] = [
  { label: copy("accountOverview"), href: BILLING_BASE, icon: LayoutGrid, exact: true },
  { label: copy("subscriptionPackage"), href: `${BILLING_BASE}/plans`, icon: Layers },
  { label: copy("paymentMethod"), href: `${BILLING_BASE}/payment`, icon: Wallet },
  { label: copy("billsAndInvoices"), href: `${BILLING_BASE}/invoices`, icon: ReceiptText },
  { label: copy("accountSettings"), href: `${BILLING_BASE}/settings`, icon: Settings },
];
