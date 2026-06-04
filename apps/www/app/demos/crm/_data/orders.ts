import { customers } from "./customers";
import type { Order, OrderStatus } from "./types";

// 40 条订单，从客户主数据确定性派生（无随机/无 new Date，保证 SSR/CSR 一致）。
const STATUS_POOL: OrderStatus[] = ["已完成", "已完成", "已发货", "已付款", "待付款", "已完成", "已退款", "已发货"];

// 固定日期池（2026-01 → 2026-06，近半年），按 index 取，趋势统计可按月聚合。
const DATE_POOL = [
  "2026-01-08", "2026-01-17", "2026-01-26", "2026-02-05", "2026-02-14", "2026-02-23",
  "2026-03-04", "2026-03-12", "2026-03-21", "2026-03-29", "2026-04-06", "2026-04-15",
  "2026-04-24", "2026-05-02", "2026-05-09", "2026-05-16", "2026-05-23", "2026-05-30",
  "2026-06-01", "2026-06-03",
];

export const orders: Order[] = Array.from({ length: 40 }, (_, i): Order => {
  const c = customers[(i * 7) % customers.length];
  const status = STATUS_POOL[i % STATUS_POOL.length];
  const amount = (((i * 37) % 48) + 6) * 2500; // 1.5w ~ 13.5w
  const createdAt = DATE_POOL[(i * 11) % DATE_POOL.length];
  return {
    id: `R${3001 + i}`,
    orderNo: `HT2026${String(1001 + i).padStart(5, "0")}`,
    customerId: c.id,
    customerName: c.name,
    amount,
    status,
    createdAt,
    items: ((i * 3) % 5) + 1,
  };
});
