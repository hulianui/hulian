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
];
