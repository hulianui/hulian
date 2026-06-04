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
];
