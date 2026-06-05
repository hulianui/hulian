import type { ReactNode } from "react";
import { LandingPage } from "./_pages/landing";
import { PricingPage } from "./_pages/pricing";
import { ContactPage } from "./_pages/contact";

// Pages 注册表（server-only：聚合页面组件 → 预览渲染）。
// 元数据是纯数据，住在 _meta.ts（client 可安全读）；本文件只补 slug→页面组件映射。
// detail 页用 fs 读 _pages/ 真实源文件喂给 CodeBlock，因此展示的代码 = 真的区块组合方式。
export { pages, getPage, CATEGORY_LABEL, type PageMeta } from "./_meta";

export const pagePreviews: Record<string, () => ReactNode> = {
  landing: () => <LandingPage />,
  pricing: () => <PricingPage />,
  contact: () => <ContactPage />,
};
