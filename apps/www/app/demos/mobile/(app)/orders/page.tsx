"use client";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  ActionSheet,
  ActionSheetContent,
  ActionSheetTrigger,
  Avatar,
  Empty,
  ListSkeleton,
  SwipeAction,
  Tag,
  toast,
} from "@hulianui/ui";
import { useMockData } from "../../../lib/async";
import { useMobileFrame } from "../../_components/mobile-shell";
import { ORDER_STATUS_TONE, SEED_ORDERS } from "../../_data/orders";
import type { Order } from "../../_data/types";

// 电话图标
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.98 1.18 2 2 0 012.96 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}
// 删除图标
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16" aria-hidden>
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}

function OrderCard({ order, onDelete }: { order: Order; onDelete: (id: string) => void }) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const frame = useMobileFrame(); // overlay portal 进手机框，避免逃逸桌面外层

  return (
    <>
      <SwipeAction
        left={[
          {
            key: "call",
            label: "联系师傅",
            tone: "primary",
            onClick: () => toast({ title: `正在拨打 ${order.workerName} 电话…`, tone: "info" }),
          },
        ]}
        right={[
          {
            key: "delete",
            label: "删除",
            tone: "danger",
            onClick: () => onDelete(order.id),
          },
        ]}
      >
        <div className="flex items-start gap-3 border-b border-border bg-surface px-4 py-3">
          <Avatar fallback={order.workerName[0]} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{order.serviceTitle}</span>
              <Tag
                tone={ORDER_STATUS_TONE[order.status]}
                size="sm"
                variant="soft"
              >
                {order.status}
              </Tag>
            </div>
            <div className="mt-0.5 text-xs text-muted">
              师傅：{order.workerName} · {order.appointedAt}
            </div>
            <div className="mt-0.5 truncate text-xs text-muted">{order.address}</div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                ¥{order.price * order.quantity}
                <span className="text-xs font-normal text-muted"> · {order.quantity}{order.unit}</span>
              </span>
              <div className="flex items-center gap-2">
                {order.status === "待评价" && (
                  <button
                    type="button"
                    onClick={() => toast({ title: "感谢您的评价！", tone: "neutral" })}
                    className="rounded-lg border border-primary px-2.5 py-1 text-xs text-primary hover:bg-primary/8"
                  >
                    去评价
                  </button>
                )}
                {/* ActionSheet 更多操作 */}
                <ActionSheet open={moreOpen} onOpenChange={setMoreOpen}>
                  <ActionSheetTrigger className="flex items-center justify-center rounded-lg border border-border p-1.5 text-muted hover:bg-surface-hover">
                    <MoreHorizontal className="size-[18px]" aria-hidden />
                  </ActionSheetTrigger>
                  <ActionSheetContent
                    container={frame}
                    title={order.serviceTitle}
                    description={`预约时间：${order.appointedAt}`}
                    actions={[
                      {
                        key: "call",
                        label: "联系师傅",
                        description: `拨打 ${order.workerName} 电话`,
                        onClick: () => toast({ title: `正在拨打 ${order.workerName} 电话…`, tone: "info" }),
                      },
                      {
                        key: "reschedule",
                        label: "改约时间",
                        onClick: () => toast({ title: "改约功能即将上线", tone: "neutral" }),
                        disabled: order.status === "已完成" || order.status === "已取消",
                      },
                      {
                        key: "cancel",
                        label: "取消订单",
                        danger: true,
                        onClick: () => {
                          setMoreOpen(false);
                          setCancelOpen(true);
                        },
                        disabled: order.status === "已完成" || order.status === "已取消",
                      },
                    ]}
                  />
                </ActionSheet>
              </div>
            </div>
          </div>
        </div>
      </SwipeAction>

      {/* 取消确认 ActionSheet */}
      <ActionSheet open={cancelOpen} onOpenChange={setCancelOpen}>
        <ActionSheetContent
          container={frame}
          title="取消订单"
          description="取消后无法恢复，确定要取消吗？"
          actions={[
            {
              key: "confirm-cancel",
              label: "确认取消",
              danger: true,
              description: "取消后费用将在 3 个工作日内退回",
              onClick: () => {
                onDelete(order.id);
                toast({ title: "订单已取消", tone: "neutral" });
              },
            },
          ]}
          cancelText="不取消，继续保留"
        />
      </ActionSheet>
    </>
  );
}

export default function OrdersPage() {
  const { data, loading } = useMockData(SEED_ORDERS, { delay: 700 });
  const [orders, setOrders] = useState<Order[] | null>(null);

  const list = orders ?? data ?? [];

  const deleteOrder = (id: string) => {
    const base = orders ?? data ?? SEED_ORDERS;
    setOrders(base.filter((o) => o.id !== id));
    toast({ title: "订单已删除", tone: "neutral" });
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* 顶部标题 */}
      <div className="sticky top-0 z-10 bg-surface px-4 py-3 shadow-sm">
        <h1 className="text-base font-semibold">我的订单</h1>
        <p className="text-xs text-muted mt-0.5">← 左滑联系师傅 · 右滑删除</p>
      </div>

      {loading ? (
        <div className="p-4">
          <ListSkeleton rows={4} />
        </div>
      ) : list.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Empty
            title="暂无订单"
            description="您还没有预约任何服务，去首页看看吧"
          >
            <a href="/demos/mobile" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:brightness-105">去下单</a>
          </Empty>
        </div>
      ) : (
        <div>
          {list.map((order) => (
            <OrderCard key={order.id} order={order} onDelete={deleteOrder} />
          ))}
        </div>
      )}
    </div>
  );
}
