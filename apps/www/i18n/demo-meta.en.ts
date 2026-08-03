export interface LocalizedDemoMeta {
  title: string;
  description: string;
  category: string;
  tags: string[];
}

export const demoMetaEn: Record<string, LocalizedDemoMeta> = {
  hanship: {
    title: "HanShip Deployment Platform",
    description:
      "Deployment console for Git-connected edge releases, build logs, domains, environment variables, rollback, and project settings.",
    category: "Application",
    tags: ["GitCommit", "DeployStatus", "ProTable", "LogViewer", "Steps", "CI/CD"],
  },
  hanhelm: {
    title: "HanHelm Agent Scheduler",
    description:
      "AI task-routing console with scored dispatch, multi-agent orchestration, failover, queue lanes, observability, and SLA simulation.",
    category: "AI Application",
    tags: ["Sankey", "QueueLane", "Funnel", "Flow", "smart routing", "multi-agent orchestration"],
  },
  billing: {
    title: "HanPay Subscription Billing",
    description:
      "Subscription and account console covering plans, usage, payment methods, invoices, team preferences, and account settings.",
    category: "Application",
    tags: ["Choicebox", "CreditCard", "SocialButton", "Banner", "subscription billing"],
  },
  scheduler: {
    title: "Clinic Appointment Scheduler",
    description:
      "Clinic scheduling workspace with month, week, day, and resource views plus drag-to-create, reschedule, and resize interactions.",
    category: "Application",
    tags: ["Scheduler", "Calendar", "DateTimePicker", "appointments", "drag and drop"],
  },
  knowledge: {
    title: "HanVault Team Knowledge Base",
    description:
      "Three-column knowledge workspace with file navigation, Markdown editing, collaborators, versions, tags, permissions, and previews.",
    category: "Application",
    tags: ["FileTree", "Tree", "MarkdownEditor", "ImageViewer", "TreeSelect", "Transfer"],
  },
  dashboard: {
    title: "Global Operations Dashboard",
    description:
      "Full-screen operations display with a world map, cross-region routes, live KPIs, dense charts, alerts, loading, and drill-down states.",
    category: "Data Visualization",
    tags: ["WorldMap", "FitScreen", "live dashboard", "routes", "NumberTicker"],
  },
  learn: {
    title: "Online Learning Platform",
    description:
      "Learning management experience with course video, chapter tree, progress, notes, discussion, and guided enrollment.",
    category: "Online Education",
    tags: ["Video", "Tree", "chapters", "learning progress", "MarkdownEditor"],
  },
  shop: {
    title: "HanShop Storefront",
    description:
      "Responsive storefront spanning discovery, product filtering, product details, variants, cart, checkout, orders, comparison, favorites, and account flows.",
    category: "E-commerce",
    tags: ["Carousel", "Lens", "Coupon", "SKU", "checkout", "mobile"],
  },
  website: {
    title: "HanCloud Company Website",
    description:
      "Marketing website with hero, bento features, product demo, testimonials, pricing, FAQ, and contact form.",
    category: "Marketing Website",
    tags: ["Navbar", "BentoGrid", "Marquee", "Accordion"],
  },
  crm: {
    title: "CRM Customer Management",
    description:
      "Customer relationship workspace with dashboard, customer management, opportunity board, orders, and system settings.",
    category: "Application",
    tags: ["customer management", "AdminLayout", "ProTable", "Chart", "ProForm"],
  },
  "customer-service": {
    title: "Customer Service Center",
    description:
      "Agent workspace for live conversations, ticket workflows, knowledge lookup, and service analytics.",
    category: "Application",
    tags: ["live chat", "ProTable", "Timeline", "Chart"],
  },
  "ai-chat": {
    title: "AI Chat Application",
    description:
      "Streaming AI conversation product with threads, reasoning, tool calls, citations, and source references.",
    category: "AI Application",
    tags: ["Conversation", "StreamingText", "ToolCall", "Markdown"],
  },
  projects: {
    title: "Project Operations Workspace",
    description:
      "End-to-end project operations for tracking, estimates, invoices, payments, work photos, scheduling, and point-of-sale collection.",
    category: "Application",
    tags: ["Gantt", "DocumentSheet", "EditableTable", "ImageViewer", "point of sale", "QRCode"],
  },
  "ai-workflow": {
    title: "AI Image and Video Workflow",
    description:
      "Visual node workflow for prompts, models, upscaling, image-to-video generation, execution, and output galleries.",
    category: "AI Application",
    tags: ["workflow", "Flow", "node orchestration", "Upload", "Video"],
  },
  mobile: {
    title: "Local Services Mobile App",
    description:
      "Touch-first local services app covering discovery, booking, orders, gestures, scheduling, confirmations, and safe-area navigation.",
    category: "Mobile",
    tags: ["TabBar", "SwipeAction", "Picker", "PullToRefresh"],
  },
  personal: {
    title: "Independent Developer Portfolio",
    description:
      "Personal portfolio with animated hero, device-framed projects, skills, messages, and visual backgrounds.",
    category: "Personal Website",
    tags: ["Aurora", "Silk", "CardSpotlight", "Dock", "device mockups"],
  },
  hanhub: {
    title: "HanHub LLM API Gateway",
    description:
      "Self-hosted multi-provider LLM gateway console for models, API keys, usage logs, streaming playground, health checks, billing, and setup.",
    category: "AI Application",
    tags: [
      "JsonViewer",
      "SecretField",
      "PricingTable",
      "StatusDot",
      "health checks",
      "token billing",
    ],
  },
  live: {
    title: "HanLive AI Streaming Studio",
    description:
      "Live-commerce studio and audience room with player monitoring, metrics, chat, AI assistance, products, gifts, reactions, and replay analytics.",
    category: "Live Commerce",
    tags: ["Danmaku", "LivePlayer", "GiftFeed", "FloatingReactions", "LiveChat", "AI copilot"],
  },
  hanreview: {
    title: "HanReview AI Code Review",
    description:
      "Code-quality workspace with file review, inline findings, scores, gates, agent execution replay, model routing, and review analytics.",
    category: "Application",
    tags: ["CodeReviewThread", "code-diff", "Heatmap", "ScoreRing", "code review", "quality gates"],
  },
};
