// 同城到家服务 App — 类型定义
export type ServiceCategory = "家政保洁" | "家电维修" | "上门美甲" | "管道疏通" | "搬家搬运" | "开锁换锁";

export interface Service {
  id: string;
  title: string;
  category: ServiceCategory;
  price: number; // 元/小时 or 元/次
  unit: string;
  rating: number; // 1-5
  reviewCount: number;
  tag: string; // e.g. "爆款" "好评"
  workerName: string;
  workerAvatar: string; // just initials
  description: string;
}

export type OrderStatus = "待确认" | "服务中" | "待评价" | "已完成" | "已取消";

export interface Order {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: ServiceCategory;
  workerName: string;
  status: OrderStatus;
  price: number;
  quantity: number;
  unit: string;
  appointedAt: string;
  address: string;
}
