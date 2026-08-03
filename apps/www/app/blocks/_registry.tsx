import type { ReactNode } from "react";
import { DOCS_LOCALE } from "../../lib/docs-locale";
import { blockPreviews as englishBlockPreviews } from "./_registry.en";
import { HeroBlock } from "./_blocks/hero";
import { TrustBarBlock } from "./_blocks/trust-bar";
import { FeaturesBlock } from "./_blocks/features";
import { StatsBlock } from "./_blocks/stats";
import { IntegrationsBlock } from "./_blocks/integrations";
import { TestimonialsBlock } from "./_blocks/testimonials";
import { PricingTableBlock } from "./_blocks/pricing-table";
import { FaqBlock } from "./_blocks/faq";
import { CtaBlock } from "./_blocks/cta";
import { ContactFormBlock } from "./_blocks/contact-form";
import { FeatureSplitBlock } from "./_blocks/feature-split";
import { TeamGridBlock } from "./_blocks/team-grid";
import { BlogListBlock } from "./_blocks/blog-list";
import { ArticleBodyBlock } from "./_blocks/article-body";
import { ChangelogBlock } from "./_blocks/changelog";
import { MilestoneTimelineBlock } from "./_blocks/milestone-timeline";
import { ArticleTocBlock } from "./_blocks/article-toc";
import { NavbarBlock } from "./_blocks/navbar";
import { BannerBlock } from "./_blocks/banner";
import { LogoCloudBlock } from "./_blocks/logo-cloud";
import { AboutBlock } from "./_blocks/about";
import { LoginBlock } from "./_blocks/login";
import { SignupBlock } from "./_blocks/signup";
import { ErrorPageBlock } from "./_blocks/error-page";
import { FooterBlock } from "./_blocks/footer";
// 批二：高流量 archetype 变体
import { HeroSplitBlock } from "./_blocks/hero-split";
import { HeroVideoBlock } from "./_blocks/hero-video";
import { HeroTerminalBlock } from "./_blocks/hero-terminal";
import { HeroWaitlistBlock } from "./_blocks/hero-waitlist";
import { FeatureTabsBlock } from "./_blocks/feature-tabs";
import { FeatureSpotlightBlock } from "./_blocks/feature-spotlight";
import { PricingCompareBlock } from "./_blocks/pricing-compare";
import { PricingUsageBlock } from "./_blocks/pricing-usage";
import { PricingCreditsBlock } from "./_blocks/pricing-credits";
import { CtaNewsletterBlock } from "./_blocks/cta-newsletter";
import { CtaCardBlock } from "./_blocks/cta-card";
import { CtaBannerBlock } from "./_blocks/cta-banner";
// 应用骨架（中后台）
import { PageHeaderBlock } from "./_blocks/page-header";
import { KpiRailBlock } from "./_blocks/kpi-rail";
import { ChartGridBlock } from "./_blocks/chart-grid";
import { DataTableBlock } from "./_blocks/data-table";
import { DetailDrawerBlock } from "./_blocks/detail-drawer";
import { ActivityTimelineBlock } from "./_blocks/activity-timeline";
import { KanbanBoardBlock } from "./_blocks/kanban-board";
import { SettingsPanelBlock } from "./_blocks/settings-panel";
import { EmptyStateBlock } from "./_blocks/empty-state";
import { SidebarNavBlock } from "./_blocks/sidebar-nav";
import { OnboardingBlock } from "./_blocks/onboarding";
// 电商 / C 端
import { ProductGridBlock } from "./_blocks/product-grid";
import { ProductDetailBlock } from "./_blocks/product-detail";
import { CartSummaryBlock } from "./_blocks/cart-summary";
import { ReviewSectionBlock } from "./_blocks/review-section";
import { UserProfileBlock } from "./_blocks/user-profile";
// AI 应用
import { ChatPanelBlock } from "./_blocks/chat-panel";
import { PromptInputBlock } from "./_blocks/prompt-input";
import { AgentCardBlock } from "./_blocks/agent-card";
import { FlowCanvasBlock } from "./_blocks/flow-canvas";

// Blocks 注册表（server-only：聚合 RSC/client block 组件 → 预览渲染）。
// 元数据是纯数据，住在 _meta.ts（client 侧栏可安全读）；本文件只补 slug→预览组件映射。
// detail 页用 fs 读 _blocks/ 真实源文件喂给 CodeBlock，因此展示的代码 = 真能跑的文件。
export { blocks, getBlock, blockMeta, CATEGORY_LABEL, type BlockMeta } from "./_meta";

// slug → 预览渲染。block 自身是 client/RSC 组件，server detail 页可直接渲染。
const chineseBlockPreviews: Record<string, () => ReactNode> = {
  hero: () => <HeroBlock />,
  "hero-split": () => <HeroSplitBlock />,
  "hero-video": () => <HeroVideoBlock />,
  "hero-terminal": () => <HeroTerminalBlock />,
  "hero-waitlist": () => <HeroWaitlistBlock />,
  "trust-bar": () => <TrustBarBlock />,
  features: () => <FeaturesBlock />,
  "feature-tabs": () => <FeatureTabsBlock />,
  "feature-spotlight": () => <FeatureSpotlightBlock />,
  stats: () => <StatsBlock />,
  integrations: () => <IntegrationsBlock />,
  testimonials: () => <TestimonialsBlock />,
  "pricing-table": () => <PricingTableBlock />,
  "pricing-compare": () => <PricingCompareBlock />,
  "pricing-usage": () => <PricingUsageBlock />,
  "pricing-credits": () => <PricingCreditsBlock />,
  faq: () => <FaqBlock />,
  cta: () => <CtaBlock />,
  "cta-newsletter": () => <CtaNewsletterBlock />,
  "cta-card": () => <CtaCardBlock />,
  "cta-banner": () => <CtaBannerBlock />,
  "contact-form": () => <ContactFormBlock />,
  "feature-split": () => <FeatureSplitBlock />,
  "team-grid": () => <TeamGridBlock />,
  "blog-list": () => <BlogListBlock />,
  "article-body": () => <ArticleBodyBlock />,
  changelog: () => <ChangelogBlock />,
  "milestone-timeline": () => <MilestoneTimelineBlock />,
  "article-toc": () => <ArticleTocBlock />,
  navbar: () => <NavbarBlock />,
  banner: () => <BannerBlock />,
  "logo-cloud": () => <LogoCloudBlock />,
  about: () => <AboutBlock />,
  login: () => <LoginBlock />,
  signup: () => <SignupBlock />,
  "error-page": () => <ErrorPageBlock />,
  footer: () => <FooterBlock />,
  // 应用骨架
  "page-header": () => <PageHeaderBlock />,
  "kpi-rail": () => <KpiRailBlock />,
  "chart-grid": () => <ChartGridBlock />,
  "data-table": () => <DataTableBlock />,
  "detail-drawer": () => <DetailDrawerBlock />,
  "activity-timeline": () => <ActivityTimelineBlock />,
  "kanban-board": () => <KanbanBoardBlock />,
  "settings-panel": () => <SettingsPanelBlock />,
  "empty-state": () => <EmptyStateBlock />,
  "sidebar-nav": () => <SidebarNavBlock />,
  onboarding: () => <OnboardingBlock />,
  // 电商 / C 端
  "product-grid": () => <ProductGridBlock />,
  "product-detail": () => <ProductDetailBlock />,
  "cart-summary": () => <CartSummaryBlock />,
  "review-section": () => <ReviewSectionBlock />,
  "user-profile": () => <UserProfileBlock />,
  // AI 应用
  "chat-panel": () => <ChatPanelBlock />,
  "prompt-input": () => <PromptInputBlock />,
  "agent-card": () => <AgentCardBlock />,
  "flow-canvas": () => <FlowCanvasBlock />,
};

export const blockPreviews = DOCS_LOCALE === "en" ? englishBlockPreviews : chineseBlockPreviews;
