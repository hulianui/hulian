import type { ReactNode } from "react";
import { LandingPage } from "./_pages/landing.en";
import { PricingPage } from "./_pages/pricing.en";
import { ContactPage } from "./_pages/contact.en";
import { FeaturePage } from "./_pages/feature.en";
import { IntegrationsPage } from "./_pages/integrations.en";
import { FaqPage } from "./_pages/faq.en";
import { AboutPage } from "./_pages/about.en";
import { BlogPage } from "./_pages/blog.en";
import { BlogPostPage } from "./_pages/blog-post.en";
import { BlogPostGuidePage } from "./_pages/blog-post-guide.en";
import { ChangelogPage } from "./_pages/changelog.en";
import { DashboardPage } from "./_pages/dashboard.en";
import { AdminListPage } from "./_pages/admin-list.en";
import { SettingsPage } from "./_pages/settings.en";
import { LoginPage } from "./_pages/login.en";
import { ResultPage } from "./_pages/result.en";
import { ProductListPage } from "./_pages/product-list.en";
import { ProductDetailPage } from "./_pages/product-detail.en";
import { UserCenterPage } from "./_pages/user-center.en";
import { AiChatPage } from "./_pages/ai-chat.en";
export { pages, getPage, pageMeta, CATEGORY_LABEL, type PageMeta } from "./_meta";

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
  dashboard: () => <DashboardPage />,
  "admin-list": () => <AdminListPage />,
  settings: () => <SettingsPage />,
  login: () => <LoginPage />,
  result: () => <ResultPage />,
  "product-list": () => <ProductListPage />,
  "product-detail": () => <ProductDetailPage />,
  "user-center": () => <UserCenterPage />,
  "ai-chat": () => <AiChatPage />,
};
