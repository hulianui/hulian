import type { Conversation } from "./types";

// 7 个会话：覆盖 waiting / active / closed 三态与多渠道。
// messages = 已展示历史；queued = 实时引擎在坐席选中后逐条投递的客户后续消息。
export const conversations: Conversation[] = [
  {
    id: "CV01",
    customerId: "CU01",
    status: "active",
    channel: "App",
    subject: "金卡退货进度咨询",
    unread: 2,
    lastAt: "14:28",
    messages: [
      { id: "m1", author: "customer", text: "你好，我上周申请的退货到哪一步了？", at: "14:25" },
      { id: "m2", author: "agent", text: "您好婉如，正在帮您查询工单 #T-2087～", at: "14:26", status: "read" },
      { id: "m3", author: "customer", text: "好的，麻烦尽快，等着退款下个月房租 😂", at: "14:27" },
      { id: "m4", author: "customer", text: "另外我换的那件还能发金卡专属包装吗？", at: "14:28" },
    ],
    queued: [
      { id: "q1", author: "customer", text: "对了快递单号能发我一下吗？", at: "14:31" },
      { id: "q2", author: "customer", text: "谢谢你哈，服务态度真好 🌹", at: "14:34" },
    ],
  },
  {
    id: "CV02",
    customerId: "CU02",
    status: "waiting",
    channel: "网页",
    subject: "发货时效",
    unread: 1,
    lastAt: "14:22",
    messages: [
      { id: "m1", author: "customer", text: "在吗？我昨天下的单怎么还没发货", at: "14:22" },
    ],
    queued: [
      { id: "q1", author: "customer", text: "订单号 NO20260603887", at: "14:24" },
      { id: "q2", author: "customer", text: "急用，能不能加急一下", at: "14:26" },
    ],
  },
  {
    id: "CV03",
    customerId: "CU03",
    status: "active",
    channel: "微信",
    subject: "物流投诉",
    unread: 0,
    lastAt: "14:10",
    messages: [
      { id: "m1", author: "system", text: "会话由「智能助手」转接人工", at: "14:05" },
      { id: "m2", author: "customer", text: "我的快递三天没动了，到底怎么回事", at: "14:06" },
      { id: "m3", author: "agent", text: "非常抱歉给您添麻烦，我马上帮您催一下物流", at: "14:08", status: "read" },
      { id: "m4", author: "agent", text: "已联系顺丰，今晚之前会更新轨迹，给您补 10 元无门槛券作为补偿 🙇", at: "14:10", status: "sent" },
    ],
    queued: [
      { id: "q1", author: "customer", text: "好吧，那我再等等", at: "14:13" },
    ],
  },
  {
    id: "CV04",
    customerId: "CU04",
    status: "active",
    channel: "电话",
    subject: "黑卡专属·家电安装",
    unread: 0,
    lastAt: "13:50",
    messages: [
      { id: "m1", author: "customer", text: "我那台洗烘一体机什么时候能上门安装？", at: "13:46" },
      { id: "m2", author: "agent", text: "周总您好，已为您预约明天上午 9-11 点，师傅会提前电话联系", at: "13:48", status: "read" },
      { id: "m3", author: "customer", text: "可以，麻烦准时", at: "13:50" },
    ],
    queued: [],
  },
  {
    id: "CV05",
    customerId: "CU05",
    status: "waiting",
    channel: "App",
    subject: "母婴商品咨询",
    unread: 1,
    lastAt: "14:20",
    messages: [
      { id: "m1", author: "customer", text: "请问这个奶瓶是防胀气的吗？新手妈妈不太懂", at: "14:20" },
    ],
    queued: [
      { id: "q1", author: "customer", text: "0-6 个月宝宝用合适吗", at: "14:23" },
    ],
  },
  {
    id: "CV06",
    customerId: "CU06",
    status: "closed",
    channel: "网页",
    subject: "售后政策咨询",
    unread: 0,
    lastAt: "11:42",
    messages: [
      { id: "m1", author: "customer", text: "运动鞋穿了两天磨脚能换吗", at: "11:38" },
      { id: "m2", author: "agent", text: "支持 7 天无理由，鞋类需保持吊牌完整哦，我帮您发起换货～", at: "11:40", status: "read" },
      { id: "m3", author: "customer", text: "好的谢谢，已经申请了", at: "11:41" },
      { id: "m4", author: "system", text: "客户已结束会话 · 满意度评价 ⭐⭐⭐⭐⭐", at: "11:42" },
    ],
    queued: [],
  },
  {
    id: "CV07",
    customerId: "CU02",
    status: "closed",
    channel: "微信",
    subject: "发票申请",
    unread: 0,
    lastAt: "10:15",
    messages: [
      { id: "m1", author: "customer", text: "能开张电子发票吗", at: "10:12" },
      { id: "m2", author: "agent", text: "可以的，已发送到您的邮箱，注意查收～", at: "10:14", status: "read" },
      { id: "m3", author: "system", text: "客户已结束会话 · 满意度评价 ⭐⭐⭐⭐", at: "10:15" },
    ],
    queued: [],
  },
];
