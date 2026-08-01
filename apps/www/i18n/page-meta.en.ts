export interface LocalizedPageMeta {
  name: string;
  description: string;
  tags: string[];
}

export const pageCategoryMetaEn = {
  marketing: { label: "Marketing" },
  application: { label: "Application" },
  ecommerce: { label: "E-commerce" },
  ai: { label: "AI Application" },
} satisfies Record<string, { label: string }>;

export const pageMetaEn: Record<string, LocalizedPageMeta> = {
  landing: {
    name: "SaaS Landing Page",
    description:
      "Complete landing page spanning hero, trust, features, metrics, integrations, testimonials, pricing, FAQ, CTA, and contact.",
    tags: ["landing page", "10-block composition"],
  },
  pricing: {
    name: "Pricing Page",
    description:
      "Conversion-focused pricing page with hero, plans, FAQ, and a closing call to action.",
    tags: ["pricing", "Segmented"],
  },
  contact: {
    name: "Contact Page",
    description:
      "Sales lead page combining a contact form, frequently asked questions, and a call to action.",
    tags: ["contact", "form"],
  },
  feature: {
    name: "Feature Detail Page",
    description:
      "Deep feature explanation with alternating media, metrics, testimonials, FAQ, and conversion content.",
    tags: ["feature", "alternating layout", "deep dive"],
  },
  integrations: {
    name: "Integrations Page",
    description: "Integration catalog with service logos, common questions, and a closing action.",
    tags: ["integrations", "ecosystem", "logo grid"],
  },
  faq: {
    name: "FAQ and Help Page",
    description:
      "Self-service help page combining accordion answers, contact, and conversion sections.",
    tags: ["FAQ", "help", "Accordion"],
  },
  about: {
    name: "About Page",
    description: "Company story with mission, metrics, team, testimonials, and a closing action.",
    tags: ["about", "team", "mission"],
  },
  blog: {
    name: "Blog Index",
    description: "Content index with a featured article and a responsive article-card grid.",
    tags: ["blog", "article list", "content"],
  },
  "blog-post": {
    name: "Blog Article",
    description:
      "Single-article reading page with metadata, prose content, and subscription conversion.",
    tags: ["article", "Prose", "reading"],
  },
  "blog-post-guide": {
    name: "Long-form Blog Guide",
    description:
      "Long-form article with a sticky side table of contents and subscription conversion.",
    tags: ["long form", "table of contents", "guide"],
  },
  changelog: {
    name: "Changelog Page",
    description: "Release timeline grouping additions, fixes, and improvements by version.",
    tags: ["changelog", "releases", "timeline"],
  },
  dashboard: {
    name: "Application Dashboard",
    description:
      "Operational dashboard composed from a page header, KPI rail, chart grid, and activity timeline.",
    tags: ["dashboard", "KPI", "charts"],
  },
  "admin-list": {
    name: "Admin List Page",
    description:
      "Customer management list with summary metrics, filters, data table, and a record detail drawer.",
    tags: ["customer management", "list page", "ProTable", "search"],
  },
  settings: {
    name: "Settings Page",
    description: "Application settings page with grouped tabs and validated forms.",
    tags: ["settings", "Tabs", "forms"],
  },
  login: {
    name: "Login Page",
    description: "Split-screen authentication page with brand content and a login form.",
    tags: ["login", "split screen", "LoginForm"],
  },
  result: {
    name: "Error and Result Page",
    description: "Reusable result page for not-found, permission, success, and failure states.",
    tags: ["404", "result page", "Result"],
  },
  "product-list": {
    name: "Product List Page",
    description: "Commerce catalog with filters, product cards, and purchase-oriented browsing.",
    tags: ["product list", "grid", "shopping"],
  },
  "product-detail": {
    name: "Product Detail Page",
    description: "Commerce detail page with gallery, variants, cart action, and customer reviews.",
    tags: ["product detail", "cart", "reviews"],
  },
  "user-center": {
    name: "Account Center",
    description: "Customer account page with membership, profile, orders, and activity sections.",
    tags: ["account", "membership", "activity"],
  },
  "ai-chat": {
    name: "AI Chat Page",
    description:
      "Complete AI assistant page with agent information, streaming messages, reasoning, tools, citations, and prompt input.",
    tags: ["AI chat", "streaming", "assistant"],
  },
};
