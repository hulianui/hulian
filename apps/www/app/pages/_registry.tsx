import type { ReactNode } from "react";
import { LandingPage } from "./_pages/landing";
import { PricingPage } from "./_pages/pricing";
import { ContactPage } from "./_pages/contact";
import { FeaturePage } from "./_pages/feature";
import { IntegrationsPage } from "./_pages/integrations";
import { FaqPage } from "./_pages/faq";
import { AboutPage } from "./_pages/about";
import { BlogPage } from "./_pages/blog";
import { BlogPostPage } from "./_pages/blog-post";
import { BlogPostGuidePage } from "./_pages/blog-post-guide";
import { ChangelogPage } from "./_pages/changelog";
// 应用骨架（中后台）
import { DashboardPage } from "./_pages/dashboard";
import { AdminListPage } from "./_pages/admin-list";
import { SettingsPage } from "./_pages/settings";
import { LoginPage } from "./_pages/login";
import { ResultPage } from "./_pages/result";
// 电商 / C 端
import { ProductListPage } from "./_pages/product-list";
import { ProductDetailPage } from "./_pages/product-detail";
import { UserCenterPage } from "./_pages/user-center";
// AI 应用
import { AiChatPage } from "./_pages/ai-chat";

// Pages 注册表（server-only：聚合页面组件 → 预览渲染）。
// 元数据是纯数据，住在 _meta.ts（client 可安全读）；本文件只补 slug→页面组件映射。
// detail 页用 fs 读 _pages/ 真实源文件喂给 CodeBlock，因此展示的代码 = 真的区块组合方式。
export { pages, getPage, CATEGORY_LABEL, type PageMeta } from "./_meta";

export const pagePreviews: Record<string, () => ReactNode> = {
  landing: () => <LandingPage />,
  pricing: () => <PricingPage />,
  contact: () => <ContactPage />,
  feature: () => <FeaturePage />,
  integrations: () => <IntegrationsPage />,
  faq: () => <FaqPage />,
  about: () => <AboutPage />,
  blog: () => <BlogPage />,
  "blog-post": () => <BlogPostPage />,
  "blog-post-guide": () => <BlogPostGuidePage />,
  changelog: () => <ChangelogPage />,
  // 应用骨架
  dashboard: () => <DashboardPage />,
  "admin-list": () => <AdminListPage />,
  settings: () => <SettingsPage />,
  login: () => <LoginPage />,
  result: () => <ResultPage />,
  // 电商 / C 端
  "product-list": () => <ProductListPage />,
  "product-detail": () => <ProductDetailPage />,
  "user-center": () => <UserCenterPage />,
  // AI 应用
  "ai-chat": () => <AiChatPage />,
};
