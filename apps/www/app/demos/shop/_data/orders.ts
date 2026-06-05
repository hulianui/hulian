import type { Order, OrderStatus } from "./types";

// 我的订单 mock：覆盖全部订单状态 + 物流轨迹。
export const orders: Order[] = [
  {
    id: "HS2026060300128",
    status: "shipped",
    createdAt: "2026-06-03 10:24",
    items: [{ productId: "p-hp-pro", name: "瀚拍 Pro 影像旗舰手机", color: "远峰蓝", size: "16G+512G", qty: 1, price: 4299 }],
    total: 4299,
    receiver: "张伟 138****8866",
    address: "浙江省杭州市余杭区文一西路 969 号瀚云大厦",
    tracks: [
      { time: "2026-06-04 09:12", text: "【杭州转运中心】快件已发出，下一站【杭州余杭分拨中心】" },
      { time: "2026-06-03 20:40", text: "【杭州转运中心】快件已到达" },
      { time: "2026-06-03 14:05", text: "商品已出库，等待揽收" },
      { time: "2026-06-03 10:24", text: "您的订单已提交，等待付款确认" },
    ],
  },
  {
    id: "HS2026060200096",
    status: "paid",
    createdAt: "2026-06-02 19:48",
    items: [
      { productId: "p-hs-air", name: "瀚声 Air 主动降噪耳机", color: "曜石黑", size: "降噪 Pro 版", qty: 1, price: 899 },
      { productId: "p-ho-bottle", name: "瀚野 保温运动水壶", color: "薄荷绿", size: "900ml", qty: 2, price: 119 },
    ],
    total: 1137,
    receiver: "李娜 159****2030",
    address: "上海市浦东新区张江高科技园区博云路 2 号",
    tracks: [
      { time: "2026-06-02 19:50", text: "支付成功，商家正在备货" },
      { time: "2026-06-02 19:48", text: "订单提交成功" },
    ],
  },
  {
    id: "HS2026053100451",
    status: "completed",
    createdAt: "2026-05-31 08:15",
    items: [{ productId: "p-hy-serum", name: "瀚研 烟酰胺修护精华", color: "30ml 标准", size: "买一送一礼盒", qty: 1, price: 268 }],
    total: 268,
    receiver: "王芳 137****5521",
    address: "广东省深圳市南山区科技园南区高新南一道",
    tracks: [
      { time: "2026-06-02 14:30", text: "已签收，签收人：本人。期待您的评价" },
      { time: "2026-06-02 08:20", text: "【深圳南山派送中心】派送中" },
      { time: "2026-06-01 22:10", text: "【深圳转运中心】快件已到达" },
      { time: "2026-05-31 09:00", text: "商品已出库" },
    ],
  },
  {
    id: "HS2026052800377",
    status: "pending",
    createdAt: "2026-05-28 22:03",
    items: [{ productId: "p-ha-jacket", name: "瀚衣 三防冲锋衣", color: "军绿", size: "L", qty: 1, price: 699 }],
    total: 699,
    receiver: "赵强 188****9012",
    address: "北京市朝阳区望京 SOHO T1",
    tracks: [{ time: "2026-05-28 22:03", text: "订单提交成功，请在 30 分钟内完成支付" }],
  },
  {
    id: "HS2026052000219",
    status: "refunding",
    createdAt: "2026-05-20 11:20",
    items: [{ productId: "p-hy-lip", name: "瀚研 丝绒雾面口红", color: "枫叶棕", size: "标准装", qty: 1, price: 159 }],
    total: 159,
    receiver: "孙丽 135****7788",
    address: "江苏省南京市鼓楼区中山北路 100 号",
    tracks: [
      { time: "2026-05-22 10:00", text: "退款申请已提交，等待商家处理" },
      { time: "2026-05-21 16:30", text: "已签收" },
      { time: "2026-05-20 11:25", text: "商品已出库" },
    ],
  },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "待付款",
  paid: "待发货",
  shipped: "待收货",
  completed: "已完成",
  refunding: "退款中",
  closed: "已关闭",
};

export const STATUS_TONE: Record<OrderStatus, "warning" | "brand" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  paid: "brand",
  shipped: "brand",
  completed: "success",
  refunding: "danger",
  closed: "neutral",
};
