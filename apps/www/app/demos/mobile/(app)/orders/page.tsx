"use client";
import { copy } from "./page.content";
import { useState } from "react";
import Link from "next/link";
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
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE, SEED_ORDERS } from "../../_data/orders";
import type { Order } from "../../_data/types";
import { demoHref } from "../../../_components/demo-locale";

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
            label: copy("contactProfessional"),
            tone: "primary",
            onClick: () => toast({ title: `${copy("calling")}${order.workerName}${copy("calling2")}`, tone: "info" }),
          },
        ]}
        right={[
          {
            key: "delete",
            label: copy("remove"),
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
                {ORDER_STATUS_LABELS[order.status]}
              </Tag>
            </div>
            <div className="mt-0.5 text-xs text-muted">

              {copy("professional")}{order.workerName} · {order.appointedAt}
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
                    onClick={() => toast({ title: copy("thankYouForYourReview"), tone: "neutral" })}
                    className="rounded-lg border border-primary px-2.5 py-1 text-xs text-primary hover:bg-primary/8"
                  >

                    {copy("writeAReview")}
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
                    description={`${copy("appointment")}${order.appointedAt}`}
                    actions={[
                      {
                        key: "call",
                        label: copy("contactProfessional"),
                        description: `${copy("call")}${order.workerName}${copy("phone")}`,
                        onClick: () => toast({ title: `${copy("calling")}${order.workerName}${copy("calling2")}`, tone: "info" }),
                      },
                      {
                        key: "reschedule",
                        label: copy("reschedule"),
                        onClick: () => toast({ title: copy("reschedulingIsComingSoon"), tone: "neutral" }),
                        disabled: order.status === "已完成" || order.status === "已取消",
                      },
                      {
                        key: "cancel",
                        label: copy("cancelBooking"),
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
          title={copy("cancelBooking")}
          description={copy("thisBookingCannotBeRestoredAfterCancellationContinue")}
          actions={[
            {
              key: "confirm-cancel",
              label: copy("confirmCancellation"),
              danger: true,
              description: copy("yourPaymentWillBeRefundedWithinThreeBusinessDaysAfterCancellation"),
              onClick: () => {
                onDelete(order.id);
                toast({ title: copy("bookingCanceled"), tone: "neutral" });
              },
            },
          ]}
          cancelText={copy("keepBooking")}
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
    toast({ title: copy("bookingDeleted"), tone: "neutral" });
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* 顶部标题 */}
      <div className="sticky top-0 z-10 bg-surface px-4 py-3 shadow-sm">
        <h1 className="text-base font-semibold">{copy("myOrders")}</h1>
        <p className="text-xs text-muted mt-0.5">{copy("swipeLeftToContactTheProfessionalSwipeRightToDelete")}</p>
      </div>

      {loading ? (
        <div className="p-4">
          <ListSkeleton rows={4} />
        </div>
      ) : list.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Empty
            title={copy("noBookingsYet")}
            description={copy("youHaveNotBookedAnyServicesYetExploreServicesOnTheHomePage")}
          >
            <Link href={demoHref("/demos/mobile")} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:brightness-105">{copy("bookAService")}</Link>
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
