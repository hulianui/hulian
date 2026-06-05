// Blocks 纯数据 SSOT —— 零组件 import，server / client 皆可安全读
// （client（首页四档浏览器、画廊卡片）导入此文件，绝不能导入 _registry.tsx：
//  那里有 RSC block 组件，拖进 client 模块会报错）。_registry.tsx 在此基础上补 slug→预览组件映射。

export interface BlockMeta {
  slug: string;
  name: string;
  /** 一句话说明它解决什么、长什么样。 */
  description: string;
  /** 区块所属场景大类（营销页 / 应用骨架 / 电商 / AI），决定 IA 货架位置。 */
  category: "marketing" | "application" | "ecommerce" | "ai";
  /** 画廊卡片展示的能力标签。 */
  tags: string[];
  /** _blocks/ 下的源文件名，detail 页据此 fs 读取真实源码。 */
  file: string;
}

export const CATEGORY_LABEL: Record<BlockMeta["category"], string> = {
  marketing: "营销页",
  application: "应用骨架",
  ecommerce: "电商 / C 端",
  ai: "AI 应用",
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

  // ——— 应用骨架（中后台）：页头 → 指标 → 图表 → 列表 → 详情 → 流水 → 看板 → 设置 → 空态 ———
  {
    slug: "page-header",
    name: "页头 PageHeader",
    description: "中后台页头 · 面包屑 + 大标题 + 副标题 + 右侧操作按钮组。",
    category: "application",
    tags: ["面包屑", "操作区", "Breadcrumb"],
    file: "page-header.tsx",
  },
  {
    slug: "kpi-rail",
    name: "KPI 指标卡排",
    description: "横向 4 张 KPI 卡 · 大数字 + 环比 delta + 迷你 Sparkline 趋势。",
    category: "application",
    tags: ["KPI", "趋势", "Sparkline"],
    file: "kpi-rail.tsx",
  },
  {
    slug: "chart-grid",
    name: "图表仪表盘段",
    description: "面积 / 柱状 / 饼图网格 · 仪表盘主体数据可视化。",
    category: "application",
    tags: ["图表", "仪表盘", "Chart"],
    file: "chart-grid.tsx",
  },
  {
    slug: "data-table",
    name: "数据表格页",
    description: "查询工具栏 + ProTable 列表 + 行内操作 + Popconfirm 删除确认。",
    category: "application",
    tags: ["数据表", "查询", "ProTable"],
    file: "data-table.tsx",
  },
  {
    slug: "detail-drawer",
    name: "详情抽屉",
    description: "右滑 Drawer 展示单条记录 · Descriptions 字段表 + Timeline 操作历史。",
    category: "application",
    tags: ["抽屉", "详情", "Drawer"],
    file: "detail-drawer.tsx",
  },
  {
    slug: "activity-timeline",
    name: "活动时间线",
    description: "倒序事件流 · 头像 + 操作者 + 动作描述 + 相对时间。",
    category: "application",
    tags: ["时间线", "活动流", "Timeline"],
    file: "activity-timeline.tsx",
  },
  {
    slug: "kanban-board",
    name: "看板泳道",
    description: "多列拖拽看板 · 任务卡含优先级 Tag + 负责人头像。",
    category: "application",
    tags: ["看板", "拖拽", "Kanban"],
    file: "kanban-board.tsx",
  },
  {
    slug: "settings-panel",
    name: "设置分区",
    description: "Tabs 分区导航 + 表单 + Switch 开关项 + 头像上传。",
    category: "application",
    tags: ["设置", "表单", "Tabs"],
    file: "settings-panel.tsx",
  },
  {
    slug: "empty-state",
    name: "空状态",
    description: "图标 + 标题 + 说明 + CTA · Empty 与 Result 两种空态范式。",
    category: "application",
    tags: ["空状态", "占位", "Empty"],
    file: "empty-state.tsx",
  },

  // ——— 电商 / C 端：商品网格 → 商品详情 → 购物车 → 评价 → 个人中心 ———
  {
    slug: "product-grid",
    name: "商品网格",
    description: "响应式商品卡网格 · 封面 + 价格(划线原价) + Rating 评分 + 加购。",
    category: "ecommerce",
    tags: ["商品卡", "评分", "加购"],
    file: "product-grid.tsx",
  },
  {
    slug: "product-detail",
    name: "商品详情",
    description: "Carousel 主图 + 规格选择(ColorSwatch) + 数量 + 库存 Meter + 双 CTA。",
    category: "ecommerce",
    tags: ["详情", "规格", "Carousel"],
    file: "product-detail.tsx",
  },
  {
    slug: "cart-summary",
    name: "购物车",
    description: "商品行(勾选 + 数量 + 删除) + 右侧价格汇总卡(满减 + 结算)。",
    category: "ecommerce",
    tags: ["购物车", "结算", "NumberField"],
    file: "cart-summary.tsx",
  },
  {
    slug: "review-section",
    name: "商品评价区",
    description: "总评分 + 星级分布 Meter 条 + 用户评论列表。",
    category: "ecommerce",
    tags: ["评价", "评分分布", "Rating"],
    file: "review-section.tsx",
  },
  {
    slug: "user-profile",
    name: "个人中心",
    description: "会员卡(头像 + 等级 + 进度) + 数据指标 + 订单 / 地址 Tabs。",
    category: "ecommerce",
    tags: ["个人中心", "会员", "Tabs"],
    file: "user-profile.tsx",
  },

  // ——— AI 应用：对话面板 → 提示输入 → 智能体卡 → 编排画布 ———
  {
    slug: "chat-panel",
    name: "AI 对话面板",
    description: "消息流(推理 / 工具调用 / 引用 / 操作) + 底部提示输入 · 模拟流式回复。",
    category: "ai",
    tags: ["对话", "流式", "Conversation"],
    file: "chat-panel.tsx",
  },
  {
    slug: "prompt-input",
    name: "提示输入区",
    description: "多行 PromptInput + 建议 chips 点击填入 + 模型切换 + 字数计数。",
    category: "ai",
    tags: ["输入框", "建议", "PromptInput"],
    file: "prompt-input.tsx",
  },
  {
    slug: "agent-card",
    name: "智能体卡片",
    description: "能力标签 + 健康 StatusDot + 负载 ScoreRing + 趋势 Sparkline + 启用开关。",
    category: "ai",
    tags: ["智能体", "负载", "ScoreRing"],
    file: "agent-card.tsx",
  },
  {
    slug: "flow-canvas",
    name: "编排画布",
    description: "只读节点画布 · 输入→模型→工具→输出 链路 + 贝塞尔连线。",
    category: "ai",
    tags: ["画布", "编排", "Flow"],
    file: "flow-canvas.tsx",
  },
];

export function getBlock(slug: string): BlockMeta | undefined {
  return blocks.find((b) => b.slug === slug);
}
