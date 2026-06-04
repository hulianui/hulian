import type { Quote, QuoteItem } from "./types";

// 报价单 mock：挂在项目下，覆盖草稿/已发送/已确认/已失效四态。明细行项供 EditableTable 实时算价。

export const quotes: Quote[] = [
  {
    id: "q1",
    code: "QT-2026-001",
    projectId: "p1",
    projectName: "云栖数据中心机电安装工程",
    client: "云栖科技股份有限公司",
    owner: "陈工",
    createdAt: "2026-03-08",
    validUntil: "2026-04-08",
    taxRate: 0.09,
    status: "已确认",
    remark: "含主材、辅材及安装人工；不含甲供设备搬运。质保期 24 个月。",
    items: [
      { id: "q1i1", name: "镀锌桥架及配件", spec: "200×100 热镀锌", unit: "米", qty: 860, price: 145 },
      { id: "q1i2", name: "电缆敷设 YJV", spec: "4×95+1×50", unit: "米", qty: 1200, price: 198 },
      { id: "q1i3", name: "冷冻机组安装", spec: "离心式 800RT", unit: "台", qty: 2, price: 86000 },
      { id: "q1i4", name: "配电柜安装调试", spec: "GCK 低压柜", unit: "面", qty: 12, price: 9800 },
      { id: "q1i5", name: "管道保温", spec: "橡塑 B1 级", unit: "平方米", qty: 540, price: 68 },
    ],
  },
  {
    id: "q2",
    code: "QT-2026-002",
    projectId: "p4",
    projectName: "晨光商业综合体暖通工程",
    client: "晨光置业集团",
    owner: "苏建国",
    createdAt: "2026-04-22",
    validUntil: "2026-05-22",
    taxRate: 0.09,
    status: "已确认",
    remark: "分两期进场施工，价格含设备吊装。",
    items: [
      { id: "q2i1", name: "多联机室外机", spec: "VRV 56kW", unit: "台", qty: 18, price: 78000 },
      { id: "q2i2", name: "风管制作安装", spec: "镀锌 δ1.0", unit: "平方米", qty: 2600, price: 168 },
      { id: "q2i3", name: "风机盘管", spec: "FP-102", unit: "台", qty: 240, price: 1850 },
      { id: "q2i4", name: "冷媒铜管", spec: "Φ9.52~Φ41.3", unit: "米", qty: 3200, price: 96 },
    ],
  },
  {
    id: "q3",
    code: "QT-2026-003",
    projectId: "p5",
    projectName: "知行教育实验楼弱电智能化",
    client: "知行教育科技公司",
    owner: "李韬",
    createdAt: "2026-05-30",
    validUntil: "2026-06-30",
    taxRate: 0.06,
    status: "已发送",
    remark: "弱电智能化系统总承包，含三年免费维护。",
    items: [
      { id: "q3i1", name: "综合布线", spec: "六类非屏蔽", unit: "点", qty: 680, price: 280 },
      { id: "q3i2", name: "网络交换机", spec: "万兆汇聚", unit: "台", qty: 8, price: 22000 },
      { id: "q3i3", name: "视频监控", spec: "400 万半球", unit: "路", qty: 120, price: 1280 },
      { id: "q3i4", name: "门禁一体机", spec: "人脸识别", unit: "台", qty: 36, price: 3600 },
    ],
  },
  {
    id: "q4",
    code: "QT-2026-004",
    projectId: "p8",
    projectName: "星海广场景观照明工程",
    client: "星海文旅投资公司",
    owner: "高敏",
    createdAt: "2026-06-02",
    validUntil: "2026-07-02",
    taxRate: 0.09,
    status: "草稿",
    remark: "方案待甲方确认灯具品牌后调整。",
    items: [
      { id: "q4i1", name: "LED 投光灯", spec: "200W 全彩", unit: "套", qty: 180, price: 1680 },
      { id: "q4i2", name: "线条灯", spec: "DMX512 可控", unit: "米", qty: 2400, price: 88 },
      { id: "q4i3", name: "灯光控制系统", spec: "中央控制器", unit: "套", qty: 1, price: 128000 },
    ],
  },
  {
    id: "q5",
    code: "QT-2026-005",
    projectId: "p3",
    projectName: "极光新能源充电站电气安装",
    client: "极光新能源科技公司",
    owner: "高敏",
    createdAt: "2026-03-26",
    validUntil: "2026-04-26",
    taxRate: 0.09,
    status: "已确认",
    remark: "充电桩配电及防雷接地工程。",
    items: [
      { id: "q5i1", name: "直流充电桩安装", spec: "120kW 双枪", unit: "台", qty: 16, price: 6800 },
      { id: "q5i2", name: "箱式变电站", spec: "630kVA", unit: "座", qty: 1, price: 158000 },
      { id: "q5i3", name: "电缆敷设", spec: "YJV22 4×185", unit: "米", qty: 680, price: 320 },
    ],
  },
  {
    id: "q6",
    code: "QT-2026-006",
    projectId: "p2",
    projectName: "瑞康制药 GMP 洁净车间装饰工程",
    client: "瑞康制药有限公司",
    owner: "周磊",
    createdAt: "2026-02-10",
    validUntil: "2026-03-10",
    taxRate: 0.09,
    status: "已失效",
    remark: "首版报价，后经变更签证以 v2 为准。",
    items: [
      { id: "q6i1", name: "彩钢板隔墙", spec: "50mm 岩棉", unit: "平方米", qty: 1800, price: 320 },
      { id: "q6i2", name: "高效送风口", spec: "484×484", unit: "个", qty: 160, price: 1200 },
    ],
  },
];

/** 行小计 = 数量 × 单价。 */
export function lineTotal(item: QuoteItem): number {
  return item.qty * item.price;
}

/** 合计：不含税、税额、价税合计。 */
export function quoteTotals(items: QuoteItem[], taxRate: number) {
  const subtotal = items.reduce((s, it) => s + lineTotal(it), 0);
  const tax = Math.round(subtotal * taxRate);
  return { subtotal, tax, total: subtotal + tax };
}

export function quoteById(id: string): Quote | undefined {
  return quotes.find((q) => q.id === id);
}
