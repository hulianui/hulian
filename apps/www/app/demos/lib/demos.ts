// 内置 demo 项目清单（SSoT）。
// /demos 占位页与正式 gallery（另会话）共读这份；各 demo 自身也可引用其元数据。
export interface DemoMeta {
  /** 唯一 slug，对应 /demos/<slug> 下的路由段。 */
  slug: string;
  title: string;
  /** 一句话简介。 */
  description: string;
  /** 入口路由。 */
  href: string;
  /** 归类（中后台 / 电商 / 数据可视化 …）。 */
  category: string;
  /** 进度状态：wip=建设中，done=可用。 */
  status: "wip" | "done";
  /** 标签（用到的核心能力，gallery 卡片展示）。 */
  tags: string[];
}

export const demos: DemoMeta[] = [
  {
    slug: "hanhelm",
    title: "瀚舵 HanHelm 智能体任务调度平台",
    description:
      "异构 AI 任务涌入任务总线 → 智能路由按「能力+成本+延迟+负载+优先级+SLA」六维打分派给 agent/模型池 → 多 agent 编排 + 降级/failover + 全链路可观测 —— 100% 由 @hulian/ui 搭建的调度控制台。调度总览(任务漏斗)、优先级泳道队列、任务详情多 agent 编排 DAG、智能路由桑基流向 + 六维决策回放、执行器池负载、SLA 告警模拟，dogfood 全新 Sankey / Sparkline / Funnel / QueueLane 4 组件。",
    href: "/demos/hanhelm",
    category: "AI 应用",
    status: "done",
    tags: ["Sankey", "QueueLane", "Funnel", "Flow", "智能路由", "多 agent 编排"],
  },
  {
    slug: "billing",
    title: "瀚付 HanPay 订阅结算控制台",
    description:
      "SaaS 订阅计费 + 账户中心：账户概览(消费走势/用量/默认卡)、订阅套餐(档位切换+席位步进+增值项)、支付方式(银行卡实时预览+钱包绑定)、账单与发票(筛选+悬停预览+详情抽屉)、账户设置(工作状态表情/团队/通知) —— 100% 由 @hulian/ui 搭建的精致 fintech 控制台，dogfood 全新 8 组件 ButtonGroup / SocialButton / Banner / RelativeTime / Choicebox / CreditCard / EmojiPicker / Glimpse。",
    href: "/demos/billing",
    category: "中后台",
    status: "done",
    tags: ["Choicebox", "CreditCard", "SocialButton", "Banner", "订阅计费"],
  },
  {
    slug: "scheduler",
    title: "瀚约 诊所预约管理台",
    description:
      "医生排班 / 号源 / 患者预约全流程 —— 月/周/日/资源四视图时间轴排班台，拖空白建预约、拖事件改期、拖下缘改时长，100% 由 @hulian/ui 搭建。点亮整个日期时间族（Calendar 导航 / DatePicker 跳转 / DateTimePicker 起诊 / TimeField 结束 / DateRangePicker 停诊登记），并新造全功能 Scheduler 事件日历组件。",
    href: "/demos/scheduler",
    category: "中后台",
    status: "done",
    tags: ["Scheduler", "Calendar", "DateTimePicker", "排班", "拖拽"],
  },
  {
    slug: "knowledge",
    title: "瀚库 HanVault 团队知识库",
    description:
      "经典三栏文件中心 / 网盘：左栏目录树(搜索+右键菜单+上传)、中栏文档在线编辑(Markdown)与文件网格、右栏协作者/版本/标签/访问权限 —— 100% 由 @hulian/ui 搭建，点亮 FileTree/Tree/TreeSelect 树族与 MarkdownEditor 主角，含图片全屏预览、批量移动与完整增删改生命周期。",
    href: "/demos/knowledge",
    category: "中后台",
    status: "done",
    tags: ["FileTree", "Tree", "MarkdownEditor", "ImageViewer", "TreeSelect", "Transfer"],
  },
  {
    slug: "dashboard",
    title: "瀚云全球调度指挥中心",
    description:
      "全球节点分布 + 跨境调度飞线、实时 KPI 跳数、密集图表(折线/柱状/环形/堆叠面积)、滚动告警事件流 —— 16:9 等比铺满的数据可视化大屏，100% 由 @hulian/ui 搭建。点亮可点击下钻的 WorldMap 与全新 FitScreen，含实时刷新 loading 帧、数据源异常 Alert+重试、点节点开 Drawer 下钻。",
    href: "/demos/dashboard",
    category: "数据可视化",
    status: "done",
    tags: ["WorldMap", "FitScreen", "实时大屏", "飞线", "NumberTicker"],
  },
  {
    slug: "learn",
    title: "瀚学 在线课程平台",
    description:
      "课程目录筛选、课程播放页(大 Video 播放器+章节标记/续播/播完结束屏) + 章节 Tree(当前小节高亮/完成打勾) + 简介/笔记(MarkdownEditor)/讨论(Comment+@提及) + 报名 StepsForm 轻流程 —— 100% 由 @hulian/ui 搭建的 LMS，让旗舰 Video 从画廊配角升为教学主角。",
    href: "/demos/learn",
    category: "在线教育",
    status: "done",
    tags: ["Video", "Tree", "章节树", "学习进度", "MarkdownEditor"],
  },
  {
    slug: "shop",
    title: "瀚选 HanShop 买家商城",
    description:
      "首页轮播秒杀、商品列表筛选、商品详情(图廊放大镜+SKU+评价)、购物车、结算全链路、订单物流、商品对比、收藏、会员中心、移动端店铺预览 —— 100% 由 @hulian/ui 搭建的 C 端电商，含优惠券、限时倒计时、地址级联与完整 H5 触屏交互。",
    href: "/demos/shop",
    category: "电商",
    status: "done",
    tags: ["Carousel", "Lens", "Coupon", "SKU", "结算", "移动端"],
  },
  {
    slug: "website",
    title: "瀚云 HanCloud 公司官网",
    description:
      "Hero、能力 Bento、产品演示、客户证言、定价、FAQ、联系表单 —— 100% 由 @hulian/ui 搭建的营销官网示例。",
    href: "/demos/website",
    category: "营销官网",
    status: "done",
    tags: ["Navbar", "BentoGrid", "Marquee", "Accordion"],
  },
  {
    slug: "crm",
    title: "CRM 客户管理后台",
    description: "工作台、客户、商机看板、订单、系统设置 —— 100% 由 @hulian/ui 搭建的完整中后台示例。",
    href: "/demos/crm",
    category: "中后台",
    status: "done",
    tags: ["AdminLayout", "ProTable", "Chart", "ProForm"],
  },
  {
    slug: "customer-service",
    title: "客服中心",
    description:
      "实时会话工作台、工单流转、知识库、服务看板 —— 100% 由 @hulian/ui 搭建的坐席台示例，含进线提醒、输入状态与已读回执。",
    href: "/demos/customer-service",
    category: "中后台",
    status: "done",
    tags: ["实时会话", "ProTable", "Timeline", "Chart"],
  },
  {
    slug: "ai-chat",
    title: "AI 对话工具",
    description:
      "会话列表、流式回复、思考过程、工具调用、引用来源 —— 100% 由 @hulian/ui 搭建的 AI agent 对话产品，走 MSW 真流式。",
    href: "/demos/ai-chat",
    category: "AI 应用",
    status: "done",
    tags: ["Conversation", "StreamingText", "ToolCall", "Markdown"],
  },
  {
    slug: "projects",
    title: "工程项目协同后台",
    description:
      "工作台、项目追踪、报价生成器、开票回款、在线收款、工作照片 —— 上下游工程服务商全流程，100% 由 @hulian/ui 搭建，含报价实时算价、单据打印态、施工甘特、扫码收银台与全屏照片查看器。",
    href: "/demos/projects",
    category: "中后台",
    status: "done",
    tags: ["Gantt", "DocumentSheet", "EditableTable", "ImageViewer", "收银台", "QRCode"],
  },
  {
    slug: "ai-workflow",
    title: "AI 生图 / 视频工作流",
    description:
      "可视化节点画布编排 AI 生图与视频流水线：提示词 → 模型 → 放大 → 图生视频 → 输出，拖拽连线即可运行 —— 100% 由 @hulian/ui 搭建，含全新 Flow 节点画布组件、模拟执行与产物画廊。",
    href: "/demos/ai-workflow",
    category: "AI 应用",
    status: "done",
    tags: ["Flow", "节点编排", "Upload", "Video"],
  },
  {
    slug: "mobile",
    title: "同城到家服务 App",
    description:
      "家政 / 维修 / 美甲上门下单全流程移动端 App —— 100% 由 @hulian/ui 搭建，含 TabBar 底部导航、下拉刷新 feed、左右滑订单操作、滚轮选择预约时间、ActionSheet 二次确认、Fab 悬浮钮与安全区适配。",
    href: "/demos/mobile",
    category: "移动端",
    status: "done",
    tags: ["TabBar", "SwipeAction", "Picker", "PullToRefresh"],
  },
  {
    slug: "personal",
    title: "独立开发者个人站 / 作品集",
    description:
      "Hero 极光 + 打字动画、作品集设备外壳展示、技能条、留言板 —— 虚构独立 maker「林屿」的个人作品集，100% 由 @hulian/ui 搭建，dogfood 全新复刻的 Aurora / Silk / WebGL 等设计感背景与五种设备外壳。",
    href: "/demos/personal",
    category: "个人站",
    status: "done",
    tags: ["Aurora", "Silk", "CardSpotlight", "Dock", "设备外壳"],
  },
  {
    slug: "hanhub",
    title: "瀚枢 HanHub 大模型 API 中转网关",
    description:
      "开发者自托管的多厂商 LLM 网关控制台：概览、模型市场(定价对比矩阵)、API 密钥、用量日志(请求/响应 JSON 检查器)、Playground(流式调试+查看为代码)、健康探测(渠道测速/熔断转移)、计费充值、接入设置 —— 一个 base_url 路由十余家上游，100% 由 @hulian/ui 搭建，dogfood 全新 JsonViewer / SecretField / PricingTable / StatusDot 四组件，费用与健康探测两条主线贯穿全站。",
    href: "/demos/hanhub",
    category: "AI 应用",
    status: "done",
    tags: ["JsonViewer", "SecretField", "PricingTable", "StatusDot", "健康探测", "Token 计费"],
  },
  {
    slug: "live",
    title: "瀚播 HanLive AI 实时直播工作站",
    description:
      "一套实时引擎驱动两张脸：主播 AI 中控台（LivePlayer 预览 + 实时 KPI/趋势 + 弹幕监看 + AI 副驾自动答弹幕/提词/上小黄车/情绪转化分析）、小黄车讲解排序、数据复盘，以及 C 端竖屏观众直播间（弹幕覆盖 + 礼物连击 + 飘心点赞 + 小黄车抢购 + AI 客服）—— 100% 由 @hulian/ui 搭建，dogfood 全新 Danmaku / LiveChat / GiftFeed / FloatingReactions / LivePlayer / LiveProductCard 六组件，纯 reducer + 种子模拟实时流。",
    href: "/demos/live",
    category: "直播电商",
    status: "done",
    tags: ["Danmaku", "LivePlayer", "GiftFeed", "FloatingReactions", "LiveChat", "AI 副驾"],
  },
  {
    slug: "hanreview",
    title: "瀚审 HanReview AI 代码审查质检平台",
    description:
      "PR/提交进来 → AI 审查员(带智能选模型)逐文件审 → 行内批注问题、给质量分、跑质量门禁 —— 100% 由 @hulian/ui 搭建的研发质量中枢。点亮全新 CodeReviewThread 行内批注线程、Heatmap 代码热点、ScoreRing 质量分环、DiffStat 改动条，并增强 code-diff 行锚定批注，含审查过程回放(AgentPlan/ToolCall/ThinkingBlock)、门禁模拟器与智能路由分发流向(Flow)。",
    href: "/demos/hanreview",
    category: "中后台",
    status: "done",
    tags: ["CodeReviewThread", "code-diff", "Heatmap", "ScoreRing", "代码审查", "质量门禁"],
  },
];
