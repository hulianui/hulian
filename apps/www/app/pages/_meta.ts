// Pages 纯数据 SSOT —— 零组件 import，server / client 皆可安全读（首页四档浏览器、画廊卡片用）。
// 「页面」= 由多个区块拼成的完整整页，比区块大一级。_registry.tsx 在此基础上补 slug→页面组件映射。

export interface PageMeta {
  slug: string;
  name: string;
  description: string;
  category: "marketing";
  tags: string[];
  /** _pages/ 下的源文件名，detail 页据此 fs 读取真实源码（=区块组合方式）。 */
  file: string;
}

export const CATEGORY_LABEL: Record<PageMeta["category"], string> = {
  marketing: "营销页",
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
];

export function getPage(slug: string): PageMeta | undefined {
  return pages.find((p) => p.slug === slug);
}
