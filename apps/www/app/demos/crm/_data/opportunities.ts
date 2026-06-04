import type { Opportunity } from "./types";

// 16 个商机，分布于漏斗各阶段（看板按 stage 分列；工作台统计金额/分布）。
export const opportunities: Opportunity[] = [
  { id: "O2001", title: "晨光文具 2026 ERP 续约", customerId: "C1001", customerName: "晨光文具", stage: "商务谈判", amount: 480000, owner: "林晚晴", probability: 75, expectedCloseAt: "2026-06-20" },
  { id: "O2002", title: "云栖科技 SaaS 席位扩容", customerId: "C1002", customerName: "云栖科技", stage: "方案报价", amount: 320000, owner: "周明远", probability: 55, expectedCloseAt: "2026-06-28" },
  { id: "O2003", title: "百味餐饮 门店管理系统", customerId: "C1003", customerName: "百味餐饮", stage: "初步接触", amount: 86000, owner: "高敏", probability: 30, expectedCloseAt: "2026-07-10" },
  { id: "O2004", title: "恒康医疗 招标采购项目", customerId: "C1004", customerName: "恒康医疗", stage: "赢单", amount: 1200000, owner: "陈策", probability: 100, expectedCloseAt: "2026-05-21" },
  { id: "O2005", title: "知行教育 在线课程平台", customerId: "C1005", customerName: "知行教育", stage: "线索", amount: 150000, owner: "苏晓", probability: 10, expectedCloseAt: "2026-08-01" },
  { id: "O2006", title: "顺达物流 TMS 调度升级", customerId: "C1006", customerName: "顺达物流", stage: "商务谈判", amount: 360000, owner: "林晚晴", probability: 70, expectedCloseAt: "2026-06-18" },
  { id: "O2007", title: "智联软件 定制开发外包", customerId: "C1011", customerName: "智联软件", stage: "方案报价", amount: 280000, owner: "周明远", probability: 50, expectedCloseAt: "2026-07-05" },
  { id: "O2008", title: "海蓝水产 出口报关系统", customerId: "C1012", customerName: "海蓝水产", stage: "初步接触", amount: 98000, owner: "高敏", probability: 25, expectedCloseAt: "2026-07-15" },
  { id: "O2009", title: "瑞康制药 GMP 质量追溯", customerId: "C1014", customerName: "瑞康制药", stage: "方案报价", amount: 540000, owner: "陈策", probability: 60, expectedCloseAt: "2026-06-30" },
  { id: "O2010", title: "金穗银行 数据中台二期", customerId: "C1016", customerName: "金穗银行", stage: "赢单", amount: 1800000, owner: "周明远", probability: 100, expectedCloseAt: "2026-05-15" },
  { id: "O2011", title: "优米电商 营销自动化", customerId: "C1017", customerName: "优米电商", stage: "初步接触", amount: 120000, owner: "高敏", probability: 30, expectedCloseAt: "2026-07-20" },
  { id: "O2012", title: "天工机械 MES 产线改造", customerId: "C1018", customerName: "天工机械", stage: "输单", amount: 260000, owner: "陈策", probability: 0, expectedCloseAt: "2026-04-30" },
  { id: "O2013", title: "睿思咨询 知识管理平台", customerId: "C1022", customerName: "睿思咨询", stage: "线索", amount: 90000, owner: "陈策", probability: 15, expectedCloseAt: "2026-08-08" },
  { id: "O2014", title: "嘉禾食品 溯源小程序", customerId: "C1023", customerName: "嘉禾食品", stage: "初步接触", amount: 110000, owner: "高敏", probability: 35, expectedCloseAt: "2026-07-12" },
  { id: "O2015", title: "极光新能源 充电网管平台", customerId: "C1024", customerName: "极光新能源", stage: "商务谈判", amount: 760000, owner: "林晚晴", probability: 80, expectedCloseAt: "2026-06-25" },
  { id: "O2016", title: "鼎峰地产 智慧园区方案", customerId: "C1009", customerName: "鼎峰地产", stage: "方案报价", amount: 420000, owner: "陈策", probability: 45, expectedCloseAt: "2026-07-02" },
];
