// Blocks 纯数据 SSOT —— 零组件 import，server / client 皆可安全读
// （client（首页四档浏览器、画廊卡片）导入此文件，绝不能导入 _registry.tsx：
//  那里有 RSC block 组件，拖进 client 模块会报错）。_registry.tsx 在此基础上补 slug→预览组件映射。

export interface BlockMeta {
  slug: string;
  name: string;
  /** 一句话说明它解决什么、长什么样。 */
  description: string;
  /** 区块所属场景大类（营销页 / 应用骨架 / …），决定 IA 货架位置。 */
  category: "marketing" | "application";
  /** 画廊卡片展示的能力标签。 */
  tags: string[];
  /** _blocks/ 下的源文件名，detail 页据此 fs 读取真实源码。 */
  file: string;
}

export const CATEGORY_LABEL: Record<BlockMeta["category"], string> = {
  marketing: "营销页",
  application: "应用骨架",
};

// 顺序即落地页自然叙事流：主视觉 → 信任 → 能力 → 数据 → 生态 → 口碑 → 定价 → 答疑 → 转化 → 联系。
export const blocks: BlockMeta[] = [
  {
    slug: "hero",
    name: "主视觉 Hero",
    description: "落地页头屏 · 大标题(渐变文字) + 副文案 + 双 CTA。",
    category: "marketing",
    tags: ["渐变标题", "双 CTA", "AuroraText"],
    file: "hero.tsx",
  },
  {
    slug: "trust-bar",
    name: "信任墙",
    description: "客户 Logo 横向无缝滚动 + hover 暂停,低调灰度。",
    category: "marketing",
    tags: ["Logo 墙", "无缝滚动", "Marquee"],
    file: "trust-bar.tsx",
  },
  {
    slug: "features",
    name: "功能特性",
    description: "Bento 错落网格 + 图标 · 平台能力一屏概览。",
    category: "marketing",
    tags: ["错落网格", "图标", "BentoGrid"],
    file: "features.tsx",
  },
  {
    slug: "stats",
    name: "数据指标",
    description: "大数字进场滚动(NumberTicker) KPI 条 · 量化背书。",
    category: "marketing",
    tags: ["数字滚动", "KPI 指标", "NumberTicker"],
    file: "stats.tsx",
  },
  {
    slug: "integrations",
    name: "集成生态",
    description: "第三方服务图标网格 · 展示对接能力。",
    category: "marketing",
    tags: ["生态对接", "图标网格"],
    file: "integrations.tsx",
  },
  {
    slug: "testimonials",
    name: "客户证言",
    description: "双行反向跑马灯口碑卡 · hover 暂停。",
    category: "marketing",
    tags: ["口碑墙", "跑马灯", "Marquee"],
    file: "testimonials.tsx",
  },
  {
    slug: "pricing-table",
    name: "定价表",
    description: "Segmented 切月付/年付 · 三套餐卡片(推荐套餐放大上浮) · 功能项 Tooltip 释义。",
    category: "marketing",
    tags: ["套餐定价", "Segmented", "Tooltip"],
    file: "pricing-table.tsx",
  },
  {
    slug: "faq",
    name: "常见问题",
    description: "Accordion 折叠问答 · 收敛长文信息。",
    category: "marketing",
    tags: ["折叠问答", "Accordion"],
    file: "faq.tsx",
  },
  {
    slug: "cta",
    name: "行动号召",
    description: "流星背景 + 大标题 + 双 CTA · 落地页收尾转化。",
    category: "marketing",
    tags: ["收尾转化", "流星背景", "Meteors"],
    file: "cta.tsx",
  },
  {
    slug: "contact-form",
    name: "联系表单",
    description: "字段校验 + 模拟异步提交(loading/成功/失败) · 销售线索收集。",
    category: "marketing",
    tags: ["表单校验", "异步提交", "Form"],
    file: "contact-form.tsx",
  },
];

export function getBlock(slug: string): BlockMeta | undefined {
  return blocks.find((b) => b.slug === slug);
}
