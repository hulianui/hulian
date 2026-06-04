// 工程项目协同 demo 数据模型（内置静态 mock，刷新即还原）。
// 日期统一用固定字符串（YYYY-MM-DD / YYYY-MM-DD HH:mm），避免 SSR/CSR 不一致。
//
// 角色模型：我方 = 工程/安装施工服务商；上游 = 发包甲方(client)；下游 = 施工班组(crew)/材料供应商。
// 一条主线贯穿全模块：承接项目 → 报价(甲方确认) → 施工(里程碑+现场照片) → 完工开票 → 回款。

export type ProjectStage = "勘测" | "报价" | "进场" | "施工" | "验收" | "结算";
export type ProjectStatus = "待开工" | "进行中" | "已暂停" | "已完工" | "已结算";

export interface Project {
  id: string;
  code: string; // 项目编号 PRJ-2026-001
  name: string;
  client: string; // 上游：发包甲方
  crew: string; // 下游：承接施工班组
  owner: string; // 我方项目负责人
  stage: ProjectStage;
  status: ProjectStatus;
  progress: number; // 0-100 总体进度
  contractAmount: number; // 合同额（元）
  startAt: string; // YYYY-MM-DD
  dueAt: string; // 计划竣工 YYYY-MM-DD
  address: string;
  region: string;
  tags: string[];
}

/** 项目里程碑（详情页 Steps 用）。done/active/wait 由 stage 推导，这里给定计划/实际日期。 */
export interface Milestone {
  stage: ProjectStage;
  label: string;
  plannedAt: string;
  doneAt?: string; // 有值=已完成
}

/** 项目动态流水（详情页 Timeline 用）。 */
export interface ProjectEvent {
  id: string;
  projectId: string;
  at: string; // YYYY-MM-DD HH:mm
  type: "里程碑" | "报价" | "开票" | "回款" | "照片" | "备注";
  text: string;
  by: string;
}

/** 施工排期（详情页 Gantt 用）。 */
export interface ScheduleTask {
  id: string;
  projectId: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  progress: number; // 0-100
  group?: string;
}

export type QuoteStatus = "草稿" | "已发送" | "已确认" | "已失效";

export interface QuoteItem {
  id: string;
  name: string; // 项目名称/分项
  spec: string; // 规格/型号
  unit: string; // 单位
  qty: number;
  price: number; // 单价（元）
  // 小计 = qty * price，由消费方现算，不冗余存储。
}

export interface Quote {
  id: string;
  code: string; // 报价单号 QT-2026-001
  projectId: string;
  projectName: string;
  client: string; // 甲方抬头
  owner: string; // 制单人
  createdAt: string; // YYYY-MM-DD
  validUntil: string; // 有效期至
  taxRate: number; // 税率，如 0.09
  status: QuoteStatus;
  items: QuoteItem[];
  remark: string;
}

export type InvoiceType = "增值税专用发票" | "增值税普通发票";
export type InvoiceStatus = "待开" | "已开" | "已寄送";
export type PaymentStatus = "未回款" | "部分回款" | "已结清";

/** 在线收款支付方式（收银台）。 */
export type PayMethod = "微信支付" | "支付宝" | "对公网银" | "银行卡";

export interface Payment {
  id: string;
  at: string; // YYYY-MM-DD
  amount: number;
  // 线下回款 + 在线收款方式（收银台支付成功后回写）。
  method: "银行转账" | "承兑汇票" | "现金" | PayMethod;
}

export interface Invoice {
  id: string;
  code: string; // 发票流水 INV-2026-001
  projectId: string;
  projectName: string;
  quoteId?: string; // 关联报价单
  client: string; // 购方抬头
  taxNo: string; // 购方税号
  type: InvoiceType;
  amount: number; // 价税合计（元）
  taxRate: number;
  status: InvoiceStatus;
  issuedAt?: string; // 开票日期（待开为空）
  payments: Payment[]; // 回款记录
  paymentStatus: PaymentStatus;
}

export type PhotoTag = "进度" | "隐患" | "验收" | "材料";

export interface Photo {
  id: string;
  projectId: string;
  projectName: string;
  stage: ProjectStage;
  src: string;
  takenAt: string; // YYYY-MM-DD HH:mm
  uploader: string;
  tag: PhotoTag;
  caption: string;
  /** 缩略图展示比例（瀑布流不等高用），1 = 方图。 */
  ratio: number;
}

export const OWNERS = ["陈工", "周磊", "高敏", "苏建国", "李韬"] as const;
export const CREWS = ["鸿基机电班组", "金顶装饰队", "恒通安装队", "远大暖通队", "建发土建队"] as const;
export const PROJECT_STAGES: ProjectStage[] = ["勘测", "报价", "进场", "施工", "验收", "结算"];

export type CheckoutStatus = "待支付" | "支付中" | "已支付" | "已关闭";

/** 在线收款单：对一张已开发票发起的在线收款，引用 invoice。 */
export interface Checkout {
  id: string;
  code: string; // 收款单号 PAY-2026-001
  invoiceId: string; // 关联发票
  projectName: string; // 冗余便于列表展示
  client: string; // 付款方（甲方）
  amount: number; // 收款金额（元）
  method?: PayMethod; // 甲方选定支付方式（支付后填）
  status: CheckoutStatus;
  createdAt: string; // YYYY-MM-DD
  expireAt: string; // 有效期 YYYY-MM-DD HH:mm（列表展示；倒计时另算实时窗口）
  paidAt?: string; // 支付完成时间 YYYY-MM-DD HH:mm
  serialNo?: string; // 支付流水号
}

export const PAY_METHODS: PayMethod[] = ["微信支付", "支付宝", "对公网银", "银行卡"];
