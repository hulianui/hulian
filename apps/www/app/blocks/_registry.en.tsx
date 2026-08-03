import type { ReactNode } from "react";
import { HeroBlock } from "./_blocks/hero.en";
import { TrustBarBlock } from "./_blocks/trust-bar.en";
import { FeaturesBlock } from "./_blocks/features.en";
import { StatsBlock } from "./_blocks/stats.en";
import { IntegrationsBlock } from "./_blocks/integrations.en";
import { TestimonialsBlock } from "./_blocks/testimonials.en";
import { PricingTableBlock } from "./_blocks/pricing-table.en";
import { FaqBlock } from "./_blocks/faq.en";
import { CtaBlock } from "./_blocks/cta.en";
import { ContactFormBlock } from "./_blocks/contact-form.en";
import { FeatureSplitBlock } from "./_blocks/feature-split.en";
import { TeamGridBlock } from "./_blocks/team-grid.en";
import { BlogListBlock } from "./_blocks/blog-list.en";
import { ArticleBodyBlock } from "./_blocks/article-body.en";
import { ChangelogBlock } from "./_blocks/changelog.en";
import { MilestoneTimelineBlock } from "./_blocks/milestone-timeline.en";
import { ArticleTocBlock } from "./_blocks/article-toc.en";
import { NavbarBlock } from "./_blocks/navbar.en";
import { BannerBlock } from "./_blocks/banner.en";
import { LogoCloudBlock } from "./_blocks/logo-cloud.en";
import { AboutBlock } from "./_blocks/about.en";
import { LoginBlock } from "./_blocks/login.en";
import { SignupBlock } from "./_blocks/signup.en";
import { ErrorPageBlock } from "./_blocks/error-page.en";
import { FooterBlock } from "./_blocks/footer.en";
import { HeroSplitBlock } from "./_blocks/hero-split.en";
import { HeroVideoBlock } from "./_blocks/hero-video.en";
import { HeroTerminalBlock } from "./_blocks/hero-terminal.en";
import { HeroWaitlistBlock } from "./_blocks/hero-waitlist.en";
import { FeatureTabsBlock } from "./_blocks/feature-tabs.en";
import { FeatureSpotlightBlock } from "./_blocks/feature-spotlight.en";
import { PricingCompareBlock } from "./_blocks/pricing-compare.en";
import { PricingUsageBlock } from "./_blocks/pricing-usage.en";
import { PricingCreditsBlock } from "./_blocks/pricing-credits.en";
import { CtaNewsletterBlock } from "./_blocks/cta-newsletter.en";
import { CtaCardBlock } from "./_blocks/cta-card.en";
import { CtaBannerBlock } from "./_blocks/cta-banner.en";
import { PageHeaderBlock } from "./_blocks/page-header.en";
import { KpiRailBlock } from "./_blocks/kpi-rail.en";
import { ChartGridBlock } from "./_blocks/chart-grid.en";
import { DataTableBlock } from "./_blocks/data-table.en";
import { DetailDrawerBlock } from "./_blocks/detail-drawer.en";
import { ActivityTimelineBlock } from "./_blocks/activity-timeline.en";
import { KanbanBoardBlock } from "./_blocks/kanban-board.en";
import { SettingsPanelBlock } from "./_blocks/settings-panel.en";
import { EmptyStateBlock } from "./_blocks/empty-state.en";
import { SidebarNavBlock } from "./_blocks/sidebar-nav.en";
import { OnboardingBlock } from "./_blocks/onboarding.en";
import { ProductGridBlock } from "./_blocks/product-grid.en";
import { ProductDetailBlock } from "./_blocks/product-detail.en";
import { CartSummaryBlock } from "./_blocks/cart-summary.en";
import { ReviewSectionBlock } from "./_blocks/review-section.en";
import { UserProfileBlock } from "./_blocks/user-profile.en";
import { ChatPanelBlock } from "./_blocks/chat-panel.en";
import { PromptInputBlock } from "./_blocks/prompt-input.en";
import { AgentCardBlock } from "./_blocks/agent-card.en";
import { FlowCanvasBlock } from "./_blocks/flow-canvas.en";
export { blocks, getBlock, blockMeta, CATEGORY_LABEL, type BlockMeta } from "./_meta";
export const blockPreviews: Record<string, () => ReactNode> = {
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
  "product-grid": () => <ProductGridBlock />,
  "product-detail": () => <ProductDetailBlock />,
  "cart-summary": () => <CartSummaryBlock />,
  "review-section": () => <ReviewSectionBlock />,
  "user-profile": () => <UserProfileBlock />,
  "chat-panel": () => <ChatPanelBlock />,
  "prompt-input": () => <PromptInputBlock />,
  "agent-card": () => <AgentCardBlock />,
  "flow-canvas": () => <FlowCanvasBlock />,
};
