// Pages 纯数据 SSOT —— 零组件 import，server / client 皆可安全读（首页四档浏览器、画廊卡片用）。
// 「页面」= 由多个区块拼成的完整整页，比区块大一级。_registry.tsx 在此基础上补 slug→页面组件映射。

export interface PageMeta {
  slug: string;
  name: string;
  description: string;
  category: "marketing" | "application" | "ecommerce" | "ai";
  tags: string[];
  /** _pages/ 下的源文件名，detail 页据此 fs 读取真实源码（=区块组合方式）。 */
  file: string;
}

export const CATEGORY_LABEL: Record<PageMeta["category"], string> = {
  marketing: "营销页",
  application: "应用骨架",
  ecommerce: "电商 / C 端",
  ai: "AI 应用",
};

export const pages: PageMeta[] = [
  {
    slug: "landing",
    name: "SaaS 营销落地页",
    description:
      "完整落地页:主视觉 → 信任墙 → 功能 → 数据 → 生态 → 口碑 → 定价 → 答疑 → 转化 → 联系,由 10 个区块顺序拼成。",
    category: "marketing",
    tags: ["落地页", "10 区块组合"],
    file: "landing.tsx",
  },
  {
    slug: "pricing",
    name: "定价页",
    description: "聚焦转化的定价页:主视觉 + 定价表 + 常见问题 + 行动号召。",
    category: "marketing",
    tags: ["定价", "Segmented"],
    file: "pricing.tsx",
  },
  {
    slug: "contact",
    name: "联系页",
    description: "销售线索页:联系表单 + 常见问题 + 行动号召。",
    category: "marketing",
    tags: ["联系", "表单"],
    file: "contact.tsx",
  },

  // ——— 应用骨架（中后台）———
  {
    slug: "dashboard",
    name: "中后台仪表盘页",
    description: "页头 + KPI 指标卡排 + 图表网格 + 近期数据表，由 4 个应用区块组合的概览页。",
    category: "application",
    tags: ["仪表盘", "KPI", "图表"],
    file: "dashboard.tsx",
  },
  {
    slug: "admin-list",
    name: "中后台列表页",
    description: "页头 + 数据表格（查询工具栏 + ProTable + 行内操作），资源管理最常见范式。",
    category: "application",
    tags: ["列表页", "ProTable", "查询"],
    file: "admin-list.tsx",
  },
  {
    slug: "settings",
    name: "设置页",
    description: "页头 + 设置分区（Tabs 导航 + 表单 + 开关项），账户 / 团队 / 偏好配置范式。",
    category: "application",
    tags: ["设置", "Tabs", "表单"],
    file: "settings.tsx",
  },
  {
    slug: "login",
    name: "登录页",
    description: "左品牌叙事面板（Spotlight + 卖点）+ 右 LoginForm 表单的经典分屏登录范式。",
    category: "application",
    tags: ["登录", "分屏", "LoginForm"],
    file: "login.tsx",
  },
  {
    slug: "result",
    name: "异常 / 结果页",
    description: "居中状态图标 + 标题 + 说明 + 操作，404 / 403 / 500 / 成功统一范式。",
    category: "application",
    tags: ["404", "结果页", "Result"],
    file: "result.tsx",
  },

  // ——— 电商 / C 端 ———
  {
    slug: "product-list",
    name: "商品列表页",
    description: "频道标题 + 分类标签 + 商品网格，C 端选购入口页范式。",
    category: "ecommerce",
    tags: ["商品列表", "网格", "选购"],
    file: "product-list.tsx",
  },
  {
    slug: "product-detail",
    name: "商品详情页",
    description: "商品详情（轮播主图 + 规格 + 加购）+ 评价区，下单转化的核心页范式。",
    category: "ecommerce",
    tags: ["商品详情", "加购", "评价"],
    file: "product-detail.tsx",
  },
  {
    slug: "user-center",
    name: "个人中心页",
    description: "会员资料卡（指标 + 订单 Tabs）+ 近期动态时间线，C 端账户主页范式。",
    category: "ecommerce",
    tags: ["个人中心", "会员", "动态"],
    file: "user-center.tsx",
  },

  // ——— AI 应用 ———
  {
    slug: "ai-chat",
    name: "AI 对话页",
    description: "完整对话面板（消息流含推理 / 工具调用 / 引用 + 底部提示输入），AI 助手应用主页范式。",
    category: "ai",
    tags: ["AI 对话", "流式", "助手"],
    file: "ai-chat.tsx",
  },
];

export function getPage(slug: string): PageMeta | undefined {
  return pages.find((p) => p.slug === slug);
}
