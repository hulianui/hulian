// 内置 Demo 项目元数据 —— 纯数据 SSoT，零 @hulian/ui import，server/client 皆可读。
// 仿 manifest.ts：画廊卡片从此渲染；每个 demo 是具名路由文件夹（非 [slug] 动态注册）。
export type DemoStatus = "live" | "coming-soon";

export interface DemoMeta {
  slug: string;
  title: string;
  tagline: string; // 一句话定位
  desc: string; // 卡片副文案
  /** lucide-react 图标名，页面侧映射成组件（保持本文件零 import）。 */
  icon: "bot" | "layout-dashboard" | "table-2";
  tags: string[];
  status: DemoStatus;
  href: string; // live 指向具名路由；coming-soon 为 ""
}

export const DEMOS: DemoMeta[] = [
  {
    slug: "ai-chat",
    title: "AI 对话工具",
    tagline: "一个能跑的 AI agent 对话产品",
    desc: "会话列表 · 流式回复 · 思考过程 · 工具调用 · 引用来源，全部用瑚琏 AI 组件拼成。",
    icon: "bot",
    tags: ["AI", "流式", "MSW"],
    status: "live",
    href: "/demos/ai-chat",
  },
];

/** 画廊占位卡数量（"敬请期待"）。 */
export const DEMO_COMING_SOON = 2;
