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
    slug: "crm",
    title: "CRM 客户管理后台",
    description: "工作台、客户、商机看板、订单、系统设置 —— 100% 由 @hulian/ui 搭建的完整中后台示例。",
    href: "/demos/crm",
    category: "中后台",
    status: "wip",
    tags: ["AdminLayout", "ProTable", "Chart", "ProForm"],
  },
];
