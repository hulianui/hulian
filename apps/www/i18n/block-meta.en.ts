export interface LocalizedBlockMeta {
  name: string;
  description: string;
  tags: string[];
}

export const blockCategoryMetaEn = {
  marketing: { label: "Marketing" },
  application: { label: "Application" },
  ecommerce: { label: "E-commerce" },
  ai: { label: "AI Application" },
} satisfies Record<string, { label: string }>;

export const blockMetaEn: Record<string, LocalizedBlockMeta> = {
  navbar: {
    name: "Navigation Bar",
    description:
      "Sticky glass navigation with a mega menu, sign-in action, CTA, and mobile drawer.",
    tags: ["navigation", "sticky", "NavigationMenu"],
  },
  banner: {
    name: "Announcement Banner",
    description: "Dismissible full-width announcement for information or promotions.",
    tags: ["announcement", "dismissible", "Banner"],
  },
  hero: {
    name: "Hero",
    description:
      "Landing-page hero with a gradient heading, supporting copy, and two calls to action.",
    tags: ["gradient heading", "dual CTA", "AuroraText"],
  },
  "hero-split": {
    name: "Split Hero",
    description: "Two-column hero with product copy and a browser-framed screenshot.",
    tags: ["split layout", "Safari mockup", "product screenshot"],
  },
  "hero-video": {
    name: "Video Hero",
    description: "Centered hero that opens a product demonstration in a video dialog.",
    tags: ["video demo", "HeroVideoDialog", "lightbox"],
  },
  "hero-terminal": {
    name: "Developer Terminal Hero",
    description: "Developer-focused hero pairing deployment copy with animated terminal output.",
    tags: ["developer", "Terminal", "command line"],
  },
  "hero-waitlist": {
    name: "Waitlist Hero",
    description: "Prelaunch hero with inline email signup and avatar-based social proof.",
    tags: ["waitlist", "email signup", "AvatarCircles"],
  },
  "trust-bar": {
    name: "Trust Bar",
    description: "Continuously scrolling customer-logo row that pauses on hover.",
    tags: ["logo wall", "continuous scroll", "Marquee"],
  },
  "logo-cloud": {
    name: "Logo Cloud",
    description: "Static grayscale customer-logo grid with color on hover.",
    tags: ["logo wall", "grayscale grid", "social proof"],
  },
  features: {
    name: "Feature Overview",
    description: "Bento-style icon grid summarizing a product's core capabilities.",
    tags: ["bento grid", "icons", "BentoGrid"],
  },
  "feature-tabs": {
    name: "Feature Tabs",
    description: "Tabbed feature deep dive with key points and a product-preview panel.",
    tags: ["tabs", "feature content", "Tabs"],
  },
  "feature-spotlight": {
    name: "Feature Spotlight",
    description: "Pointer-following spotlight card for emphasizing one product capability.",
    tags: ["spotlight", "pointer tracking", "CardSpotlight"],
  },
  stats: {
    name: "Metrics",
    description: "KPI strip with animated number transitions for quantitative proof.",
    tags: ["number animation", "KPI", "NumberTicker"],
  },
  integrations: {
    name: "Integrations",
    description: "Icon grid presenting supported third-party services and connections.",
    tags: ["integrations", "icon grid"],
  },
  testimonials: {
    name: "Testimonials",
    description: "Two opposing marquee rows of customer testimonial cards.",
    tags: ["testimonials", "marquee", "Marquee"],
  },
  "pricing-table": {
    name: "Pricing Table",
    description: "Monthly and annual pricing switcher with three plan cards and feature tooltips.",
    tags: ["plans", "Segmented", "Tooltip"],
  },
  "pricing-compare": {
    name: "Pricing Comparison",
    description: "Grouped plan-feature matrix with a sticky first column.",
    tags: ["comparison matrix", "Table", "sticky column"],
  },
  "pricing-usage": {
    name: "Usage Pricing Calculator",
    description: "Slider-driven calculator that updates monthly usage pricing in real time.",
    tags: ["usage pricing", "Slider", "live calculation"],
  },
  "pricing-credits": {
    name: "Credit Packages",
    description: "Single-select credit packages for one-time purchases rather than subscriptions.",
    tags: ["credits", "one-time purchase", "Choicebox"],
  },
  faq: {
    name: "Frequently Asked Questions",
    description: "Accordion-based question and answer section for long-form support content.",
    tags: ["questions", "answers", "Accordion"],
  },
  cta: {
    name: "Call to Action",
    description: "Closing conversion section with a meteor background, headline, and two actions.",
    tags: ["conversion", "meteor background", "Meteors"],
  },
  "cta-newsletter": {
    name: "Newsletter CTA",
    description: "Inline email subscription call to action on a patterned background.",
    tags: ["newsletter", "email", "GridPattern"],
  },
  "cta-card": {
    name: "Gradient Card CTA",
    description: "Centered gradient call-to-action card with an animated border beam.",
    tags: ["gradient card", "border beam", "BorderBeam"],
  },
  "cta-banner": {
    name: "Full-width CTA Banner",
    description:
      "Compact full-width call to action with copy on the left and an action on the right.",
    tags: ["banner", "split CTA", "compact"],
  },
  "contact-form": {
    name: "Contact Form",
    description: "Validated contact form with asynchronous submission states.",
    tags: ["validation", "async submit", "Form"],
  },
  "feature-split": {
    name: "Alternating Features",
    description: "Alternating copy and media rows for detailed feature explanations.",
    tags: ["alternating layout", "feature detail", "key points"],
  },
  "team-grid": {
    name: "Team Grid",
    description: "Responsive member-card grid with avatars, roles, and profile links.",
    tags: ["team", "member cards", "Avatar"],
  },
  "blog-list": {
    name: "Blog List",
    description: "Featured article and cover-card grid for a blog landing section.",
    tags: ["blog", "article cards", "cover grid"],
  },
  "article-body": {
    name: "Article Body",
    description: "Long-form article layout using readable prose typography.",
    tags: ["article", "Prose", "reading"],
  },
  changelog: {
    name: "Changelog",
    description: "Version timeline grouping additions, fixes, and improvements.",
    tags: ["changelog", "timeline", "releases"],
  },
  "milestone-timeline": {
    name: "Milestone Timeline",
    description: "Alternating centerline timeline for company or product milestones.",
    tags: ["milestones", "centerline", "Timeline"],
  },
  "article-toc": {
    name: "Article with Table of Contents",
    description: "Long-form article layout with a sticky side table of contents.",
    tags: ["long form", "table of contents", "sticky"],
  },
  about: {
    name: "About Us",
    description: "Company introduction covering purpose, values, and team identity.",
    tags: ["about", "values", "AuroraText"],
  },
  login: {
    name: "Login Card",
    description: "Authentication card built around a complete login form.",
    tags: ["login", "authentication", "LoginForm"],
  },
  signup: {
    name: "Signup Card",
    description: "Account-registration card with validated fields and consent controls.",
    tags: ["signup", "authentication", "Field"],
  },
  "error-page": {
    name: "404 Error Page",
    description: "Not-found result state with recovery navigation.",
    tags: ["404", "error page", "Result"],
  },
  footer: {
    name: "Marketing Footer",
    description: "Multi-column footer with newsletter signup and social links.",
    tags: ["footer", "newsletter", "SocialButton"],
  },
  "page-header": {
    name: "Page Header",
    description: "Application page heading with breadcrumbs, supporting text, and actions.",
    tags: ["breadcrumbs", "actions", "Breadcrumb"],
  },
  "kpi-rail": {
    name: "KPI Rail",
    description: "Responsive row of KPI cards with trends and compact sparklines.",
    tags: ["KPI", "trends", "Sparkline"],
  },
  "chart-grid": {
    name: "Chart Dashboard",
    description: "Dashboard section combining several chart cards in a responsive grid.",
    tags: ["charts", "dashboard", "Chart"],
  },
  "data-table": {
    name: "Data Table",
    description: "Application table with search, filters, row actions, and pagination.",
    tags: ["data table", "search", "ProTable"],
  },
  "detail-drawer": {
    name: "Detail Drawer",
    description: "Side drawer for inspecting structured record details without leaving a list.",
    tags: ["drawer", "record details", "Drawer"],
  },
  "activity-timeline": {
    name: "Activity Timeline",
    description: "Chronological activity feed with actors, timestamps, and event details.",
    tags: ["timeline", "activity feed", "Timeline"],
  },
  "kanban-board": {
    name: "Kanban Board",
    description: "Drag-and-drop work lanes for status-based task management.",
    tags: ["kanban", "drag and drop", "Kanban"],
  },
  "settings-panel": {
    name: "Settings Panel",
    description: "Tabbed settings sections containing validated configuration forms.",
    tags: ["settings", "forms", "Tabs"],
  },
  "empty-state": {
    name: "Empty State",
    description: "Placeholder state with explanation and a recovery or creation action.",
    tags: ["empty state", "placeholder", "Empty"],
  },
  "sidebar-nav": {
    name: "Sidebar Navigation",
    description: "Collapsible application sidebar with grouped navigation items.",
    tags: ["sidebar", "navigation", "collapsible"],
  },
  onboarding: {
    name: "Onboarding",
    description: "Step-based first-run flow for collecting setup choices.",
    tags: ["onboarding", "steps", "Steps"],
  },
  "product-grid": {
    name: "Product Grid",
    description: "Responsive product cards with ratings, prices, and add-to-cart actions.",
    tags: ["product cards", "ratings", "cart"],
  },
  "product-detail": {
    name: "Product Detail",
    description: "Product gallery, variant selection, quantity, and purchase actions.",
    tags: ["product detail", "variants", "Carousel"],
  },
  "cart-summary": {
    name: "Cart Summary",
    description: "Editable cart lines with quantities, totals, and checkout action.",
    tags: ["cart", "checkout", "NumberField"],
  },
  "review-section": {
    name: "Product Reviews",
    description: "Rating distribution, review filters, and customer review cards.",
    tags: ["reviews", "rating distribution", "Rating"],
  },
  "user-profile": {
    name: "User Profile",
    description: "Account overview with membership details, orders, and profile sections.",
    tags: ["profile", "membership", "Tabs"],
  },
  "chat-panel": {
    name: "AI Chat Panel",
    description: "Streaming conversation panel with reasoning, tools, citations, and prompt input.",
    tags: ["conversation", "streaming", "Conversation"],
  },
  "prompt-input": {
    name: "Prompt Input",
    description: "Prompt composer with suggestions, attachments, and submission controls.",
    tags: ["prompt", "suggestions", "PromptInput"],
  },
  "agent-card": {
    name: "Agent Card",
    description: "Agent status card with capabilities, health, load, trend, and enable control.",
    tags: ["agent", "load", "ScoreRing"],
  },
  "flow-canvas": {
    name: "Workflow Canvas",
    description: "Read-only node canvas showing input, model, tool, and output connections.",
    tags: ["canvas", "workflow", "Flow"],
  },
};
