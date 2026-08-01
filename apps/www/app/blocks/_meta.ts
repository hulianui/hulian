// Blocks 纯数据 SSOT —— 零组件 import，server / client 皆可安全读
// （client（首页四档浏览器、画廊卡片）导入此文件，绝不能导入 _registry.tsx：
//  那里有 RSC block 组件，拖进 client 模块会报错）。_registry.tsx 在此基础上补 slug→预览组件映射。

import { blockCategoryMetaEn, blockMetaEn } from "../../i18n/block-meta.en";
import { DOCS_LOCALE } from "../../lib/docs-locale";

export interface CompositeInstallation {
  providers: string[];
  replace: Array<"assets" | "copy" | "mock-data" | "navigation" | "event-handlers">;
  slots: string[];
}

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
  /** 安装后的显式接入清单；生成器拒绝缺失或未知值，不从源码猜测。 */
  installation: CompositeInstallation;
}

export interface LocalizedBlockDisplayMeta {
  name: string;
  description: string;
  categoryLabel: string;
  tags: string[];
  searchAliases: string[];
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
    slug: "navbar",
    name: "顶部导航栏",
    description: "粘性毛玻璃导航 · Logo + 主菜单(含产品 mega 下拉) + 登录/CTA · 移动端汉堡抽屉。",
    category: "marketing",
    tags: ["导航", "粘性", "NavigationMenu"],
    file: "navbar.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data", "navigation"],
      slots: [],
    },
  },
  {
    slug: "banner",
    name: "通栏公告",
    description: "顶部公告条 · 信息 / 促销双 tone + 行动链接 + 可关闭。",
    category: "marketing",
    tags: ["公告", "可关闭", "Banner"],
    file: "banner.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "navigation"],
      slots: [],
    },
  },
  {
    slug: "hero",
    name: "主视觉 Hero",
    description: "落地页头屏 · 大标题(渐变文字) + 副文案 + 双 CTA。",
    category: "marketing",
    tags: ["渐变标题", "双 CTA", "AuroraText"],
    file: "hero.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "navigation"], slots: [] },
  },
  {
    slug: "hero-split",
    name: "Hero · 左文右图",
    description: "双栏头屏 · 左标题/CTA + 右 Safari 浏览器外壳产品截图 · 产品向。",
    category: "marketing",
    tags: ["左文右图", "Safari 外壳", "产品截图"],
    file: "hero-split.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "navigation"], slots: [] },
  },
  {
    slug: "hero-video",
    name: "Hero · 视频演示",
    description: "居中头屏 + HeroVideoDialog 点击播放产品 demo · 视频驱动转化。",
    category: "marketing",
    tags: ["视频演示", "HeroVideoDialog", "Lightbox"],
    file: "hero-video.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["assets", "copy", "navigation"],
      slots: [],
    },
  },
  {
    slug: "hero-terminal",
    name: "Hero · 开发者终端",
    description: "左标题(一行命令上线) + 右 Terminal 逐行部署输出 · 开发者向。",
    category: "marketing",
    tags: ["开发者", "Terminal", "命令行"],
    file: "hero-terminal.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "mock-data", "navigation"],
      slots: [],
    },
  },
  {
    slug: "hero-waitlist",
    name: "Hero · 等候名单",
    description: "居中标题 + 内嵌邮箱订阅 + AvatarCircles 社会证明 · 预发布造势。",
    category: "marketing",
    tags: ["等候名单", "内嵌订阅", "AvatarCircles"],
    file: "hero-waitlist.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["assets", "copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "trust-bar",
    name: "信任墙",
    description: "客户 Logo 横向无缝滚动 + hover 暂停,低调灰度。",
    category: "marketing",
    tags: ["Logo 墙", "无缝滚动", "Marquee"],
    file: "trust-bar.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "logo-cloud",
    name: "客户 Logo 墙",
    description: "静态灰度 Logo 网格 + hover 上色 · 对比 trust-bar 跑马灯的静态版。",
    category: "marketing",
    tags: ["Logo 墙", "灰度网格", "信任背书"],
    file: "logo-cloud.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "features",
    name: "功能特性",
    description: "Bento 错落网格 + 图标 · 平台能力一屏概览。",
    category: "marketing",
    tags: ["错落网格", "图标", "BentoGrid"],
    file: "features.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "feature-tabs",
    name: "功能 · Tab 切换",
    description: "Tabs 切换 3-4 个能力 · 每面板左要点列表 + 右界面占位 · 深度展开。",
    category: "marketing",
    tags: ["Tab 切换", "图文", "Tabs"],
    file: "feature-tabs.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "feature-spotlight",
    name: "功能 · 聚光大卡",
    description: "CardSpotlight 鼠标跟随聚光大卡 · 单功能强调 · 图标 + 描述 + 链接。",
    category: "marketing",
    tags: ["聚光", "鼠标跟随", "CardSpotlight"],
    file: "feature-spotlight.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "mock-data", "navigation"],
      slots: [],
    },
  },
  {
    slug: "stats",
    name: "数据指标",
    description: "大数字进场滚动(NumberTicker) KPI 条 · 量化背书。",
    category: "marketing",
    tags: ["数字滚动", "KPI 指标", "NumberTicker"],
    file: "stats.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "integrations",
    name: "集成生态",
    description: "第三方服务图标网格 · 展示对接能力。",
    category: "marketing",
    tags: ["生态对接", "图标网格"],
    file: "integrations.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "testimonials",
    name: "客户证言",
    description: "双行反向跑马灯口碑卡 · hover 暂停。",
    category: "marketing",
    tags: ["口碑墙", "跑马灯", "Marquee"],
    file: "testimonials.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "pricing-table",
    name: "定价表",
    description: "Segmented 切月付/年付 · 三套餐卡片(推荐套餐放大上浮) · 功能项 Tooltip 释义。",
    category: "marketing",
    tags: ["套餐定价", "Segmented", "Tooltip"],
    file: "pricing-table.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data", "navigation"],
      slots: [],
    },
  },
  {
    slug: "pricing-compare",
    name: "定价 · 功能对比矩阵",
    description: "套餐列头 + 功能分组矩阵(✓/数值) · 首列冻结 Table · 多套餐细对比。",
    category: "marketing",
    tags: ["对比矩阵", "Table", "冻结列"],
    file: "pricing-compare.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "mock-data", "navigation"],
      slots: [],
    },
  },
  {
    slug: "pricing-usage",
    name: "定价 · 用量计价器",
    description: "单卡 + Slider 拖席位/请求量 → NumberTicker 实时算月费 · 按量计费。",
    category: "marketing",
    tags: ["用量计价", "Slider", "实时算价"],
    file: "pricing-usage.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data", "navigation"],
      slots: [],
    },
  },
  {
    slug: "pricing-credits",
    name: "定价 · 积分包",
    description: "Choicebox 单选 credit 包(额度/单价/赠送) · 一次性购买非订阅。",
    category: "marketing",
    tags: ["积分包", "一次性", "Choicebox"],
    file: "pricing-credits.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data", "navigation"],
      slots: [],
    },
  },
  {
    slug: "faq",
    name: "常见问题",
    description: "Accordion 折叠问答 · 收敛长文信息。",
    category: "marketing",
    tags: ["折叠问答", "Accordion"],
    file: "faq.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "cta",
    name: "行动号召",
    description: "流星背景 + 大标题 + 双 CTA · 落地页收尾转化。",
    category: "marketing",
    tags: ["收尾转化", "流星背景", "Meteors"],
    file: "cta.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "navigation"], slots: [] },
  },
  {
    slug: "cta-newsletter",
    name: "CTA · 内嵌订阅",
    description: "居中标题 + inline 邮箱订阅(loading→成功态) + 隐私说明 · GridPattern 底纹。",
    category: "marketing",
    tags: ["内嵌订阅", "邮箱", "GridPattern"],
    file: "cta-newsletter.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "event-handlers"], slots: [] },
  },
  {
    slug: "cta-card",
    name: "CTA · 发光渐变卡",
    description: "居中圆角大卡 + BorderBeam 边框流光 + 品牌渐变 + 双 CTA。",
    category: "marketing",
    tags: ["渐变卡", "边框流光", "BorderBeam"],
    file: "cta-card.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "navigation"], slots: [] },
  },
  {
    slug: "cta-banner",
    name: "CTA · 全宽横幅",
    description: "左右分栏紧凑横幅 · 左文案右按钮组 · 深色品牌底 · 页脚上方。",
    category: "marketing",
    tags: ["横幅", "左文右钮", "紧凑"],
    file: "cta-banner.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "navigation"], slots: [] },
  },
  {
    slug: "contact-form",
    name: "联系表单",
    description: "字段校验 + 模拟异步提交(loading/成功/失败) · 销售线索收集。",
    category: "marketing",
    tags: ["表单校验", "异步提交", "Form"],
    file: "contact-form.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "feature-split",
    name: "功能图文交替",
    description: "左右交替的图文行 · 单功能深挖 · 要点列表 + 渐变占位预览。",
    category: "marketing",
    tags: ["图文交替", "功能深挖", "要点"],
    file: "feature-split.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "team-grid",
    name: "团队网格",
    description: "成员头像网格 · 姓名 + 职位 + 简介 · 关于页范式。",
    category: "marketing",
    tags: ["团队", "成员卡", "Avatar"],
    file: "team-grid.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "blog-list",
    name: "博客文章列表",
    description: "featured 大卡 + 文章卡网格 · 渐变封面 + 作者/日期 · 内容站范式。",
    category: "marketing",
    tags: ["博客", "文章卡", "封面网格"],
    file: "blog-list.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "article-body",
    name: "博客文章正文",
    description: "文章头(分类/作者/日期) + Prose 排版正文 · 单篇阅读范式。",
    category: "marketing",
    tags: ["文章正文", "Prose", "阅读"],
    file: "article-body.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy"], slots: [] },
  },
  {
    slug: "changelog",
    name: "更新日志",
    description: "纵向时间线 · 版本号 + 日期 + 新增/修复/优化分类徽章。",
    category: "marketing",
    tags: ["更新日志", "时间线", "版本"],
    file: "changelog.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "milestone-timeline",
    name: "发展历程时间线",
    description: "公司里程碑事件 · Timeline 中轴交替模式 + 进行中幽灵项 · 关于页范式。",
    category: "marketing",
    tags: ["发展历程", "中轴交替", "Timeline"],
    file: "milestone-timeline.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "article-toc",
    name: "长文 + 侧边目录",
    description:
      "左正文(Prose) + 右 sticky 目录锚点 · 博客长文指南版式(对比 article-body 案例版式)。",
    category: "marketing",
    tags: ["长文", "侧边目录", "sticky"],
    file: "article-toc.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "mock-data", "navigation"],
      slots: [],
    },
  },
  {
    slug: "about",
    name: "关于我们",
    description: "使命标语(渐变关键词) + 公司叙事 + 价值观四宫格 + 里程碑数字(NumberTicker)。",
    category: "marketing",
    tags: ["关于", "价值观", "AuroraText"],
    file: "about.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "login",
    name: "登录卡",
    description: "居中登录卡 · 复用 LoginForm(校验/记住我/异步) + 第三方登录 + 去注册。",
    category: "marketing",
    tags: ["登录", "鉴权", "LoginForm"],
    file: "login.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "navigation"],
      slots: [],
    },
  },
  {
    slug: "signup",
    name: "注册卡",
    description: "左品牌图文 + 右注册表单 · 密码强度 + 条款勾选 + 第三方注册。",
    category: "marketing",
    tags: ["注册", "鉴权", "Field"],
    file: "signup.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data", "navigation"],
      slots: [],
    },
  },
  {
    slug: "error-page",
    name: "404 错误页",
    description: "巨号 404(渐变描字) + Result 说明 + 返回首页/联系支持 · DotPattern 背景。",
    category: "marketing",
    tags: ["404", "错误页", "Result"],
    file: "error-page.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy"], slots: [] },
  },
  {
    slug: "footer",
    name: "营销页脚",
    description: "品牌列 + 社交按钮 + 多列链接 + newsletter 订阅 + 版权/备案。",
    category: "marketing",
    tags: ["页脚", "订阅", "SocialButton"],
    file: "footer.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data", "navigation"],
      slots: [],
    },
  },

  // ——— 应用骨架（中后台）：页头 → 指标 → 图表 → 列表 → 详情 → 流水 → 看板 → 设置 → 空态 ———
  {
    slug: "page-header",
    name: "页头 PageHeader",
    description: "中后台页头 · 面包屑 + 大标题 + 副标题 + 右侧操作按钮组。",
    category: "application",
    tags: ["面包屑", "操作区", "Breadcrumb"],
    file: "page-header.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "kpi-rail",
    name: "KPI 指标卡排",
    description: "横向 4 张 KPI 卡 · 大数字 + 环比 delta + 迷你 Sparkline 趋势。",
    category: "application",
    tags: ["KPI", "趋势", "Sparkline"],
    file: "kpi-rail.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "chart-grid",
    name: "图表仪表盘段",
    description: "面积 / 柱状 / 饼图网格 · 仪表盘主体数据可视化。",
    category: "application",
    tags: ["图表", "仪表盘", "Chart"],
    file: "chart-grid.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "data-table",
    name: "数据表格页",
    description: "查询工具栏 + ProTable 列表 + 行内操作 + Popconfirm 删除确认。",
    category: "application",
    tags: ["数据表", "查询", "ProTable"],
    file: "data-table.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "detail-drawer",
    name: "详情抽屉",
    description: "右滑 Drawer 展示单条记录 · Descriptions 字段表 + Timeline 操作历史。",
    category: "application",
    tags: ["抽屉", "详情", "Drawer"],
    file: "detail-drawer.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "activity-timeline",
    name: "活动时间线",
    description: "倒序事件流 · 头像 + 操作者 + 动作描述 + 相对时间。",
    category: "application",
    tags: ["时间线", "活动流", "Timeline"],
    file: "activity-timeline.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy", "mock-data"], slots: [] },
  },
  {
    slug: "kanban-board",
    name: "看板泳道",
    description: "多列拖拽看板 · 任务卡含优先级 Tag + 负责人头像。",
    category: "application",
    tags: ["看板", "拖拽", "Kanban"],
    file: "kanban-board.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "settings-panel",
    name: "设置分区",
    description: "Tabs 分区导航 + 表单 + Switch 开关项 + 头像上传。",
    category: "application",
    tags: ["设置", "表单", "Tabs"],
    file: "settings-panel.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "empty-state",
    name: "空状态",
    description: "图标 + 标题 + 说明 + CTA · Empty 与 Result 两种空态范式。",
    category: "application",
    tags: ["空状态", "占位", "Empty"],
    file: "empty-state.tsx",
    installation: { providers: ["ThemeProvider"], replace: ["copy"], slots: [] },
  },
  {
    slug: "sidebar-nav",
    name: "侧边导航",
    description: "中后台侧栏 · Logo + 分组菜单(图标 + 计数 Badge + 选中高亮) + 用户卡 · 可折叠。",
    category: "application",
    tags: ["侧边栏", "导航", "可折叠"],
    file: "sidebar-nav.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "onboarding",
    name: "新手引导",
    description: "横向 Steps 步骤条 + 当前步表单 + Progress 进度 + 上一步/下一步 · 完成态 Result。",
    category: "application",
    tags: ["引导", "步骤", "Steps"],
    file: "onboarding.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },

  // ——— 电商 / C 端：商品网格 → 商品详情 → 购物车 → 评价 → 个人中心 ———
  {
    slug: "product-grid",
    name: "商品网格",
    description: "响应式商品卡网格 · 封面 + 价格(划线原价) + Rating 评分 + 加购。",
    category: "ecommerce",
    tags: ["商品卡", "评分", "加购"],
    file: "product-grid.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "product-detail",
    name: "商品详情",
    description: "Carousel 主图 + 规格选择(ColorSwatch) + 数量 + 库存 Meter + 双 CTA。",
    category: "ecommerce",
    tags: ["详情", "规格", "Carousel"],
    file: "product-detail.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "cart-summary",
    name: "购物车",
    description: "商品行(勾选 + 数量 + 删除) + 右侧价格汇总卡(满减 + 结算)。",
    category: "ecommerce",
    tags: ["购物车", "结算", "NumberField"],
    file: "cart-summary.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "review-section",
    name: "商品评价区",
    description: "总评分 + 星级分布 Meter 条 + 用户评论列表。",
    category: "ecommerce",
    tags: ["评价", "评分分布", "Rating"],
    file: "review-section.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "user-profile",
    name: "个人中心",
    description: "会员卡(头像 + 等级 + 进度) + 数据指标 + 订单 / 地址 Tabs。",
    category: "ecommerce",
    tags: ["个人中心", "会员", "Tabs"],
    file: "user-profile.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },

  // ——— AI 应用：对话面板 → 提示输入 → 智能体卡 → 编排画布 ———
  {
    slug: "chat-panel",
    name: "AI 对话面板",
    description: "消息流(推理 / 工具调用 / 引用 / 操作) + 底部提示输入 · 模拟流式回复。",
    category: "ai",
    tags: ["对话", "流式", "Conversation"],
    file: "chat-panel.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data", "navigation"],
      slots: [],
    },
  },
  {
    slug: "prompt-input",
    name: "提示输入区",
    description: "多行 PromptInput + 建议 chips 点击填入 + 模型切换 + 字数计数。",
    category: "ai",
    tags: ["输入框", "建议", "PromptInput"],
    file: "prompt-input.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "agent-card",
    name: "智能体卡片",
    description: "能力标签 + 健康 StatusDot + 负载 ScoreRing + 趋势 Sparkline + 启用开关。",
    category: "ai",
    tags: ["智能体", "负载", "ScoreRing"],
    file: "agent-card.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "event-handlers", "mock-data"],
      slots: [],
    },
  },
  {
    slug: "flow-canvas",
    name: "编排画布",
    description: "只读节点画布 · 输入→模型→工具→输出 链路 + 贝塞尔连线。",
    category: "ai",
    tags: ["画布", "编排", "Flow"],
    file: "flow-canvas.tsx",
    installation: {
      providers: ["ThemeProvider"],
      replace: ["copy", "mock-data", "navigation"],
      slots: [],
    },
  },
];

export function getBlock(slug: string): BlockMeta | undefined {
  return blocks.find((b) => b.slug === slug);
}

/** Localized display/search overlay. Installation data and source filenames remain canonical. */
export function blockMeta(item: BlockMeta): LocalizedBlockDisplayMeta {
  if (DOCS_LOCALE === "en") {
    const localized = blockMetaEn[item.slug];
    return {
      ...localized,
      categoryLabel: blockCategoryMetaEn[item.category].label,
      searchAliases: [item.name, item.description, CATEGORY_LABEL[item.category], ...item.tags],
    };
  }
  return {
    name: item.name,
    description: item.description,
    categoryLabel: CATEGORY_LABEL[item.category],
    tags: item.tags,
    searchAliases: [],
  };
}
