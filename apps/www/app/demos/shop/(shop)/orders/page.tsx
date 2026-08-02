"use client";
import { copy } from "./page.content";
import { useState } from "react";
import {
  Tabs, TabsList, TabsTab, TabsPanel,
  Tag, Button, Empty, Skeleton, Drawer, DrawerContent,
  Timeline, Popconfirm, Rating, toast,
} from "@hulianui/ui";
import { useMockData, usePending } from "../../../lib/async";
import { orders, STATUS_LABEL, STATUS_TONE } from "../../_data/orders";
import { productById, productImage, formatPrice } from "../../_data/products";
import { useShop } from "../../_lib/shop-store";
import type { Order } from "../../_data/types";
import { SHOP_BASE } from "../../_components/nav-config";

// 订单状态 Tabs
const TAB_FILTERS = [
  { value: "all", label: copy("all") },
  { value: "pending", label: copy("awaitingPayment") },
  { value: "paid", label: copy("preparingShipment") },
  { value: "shipped", label: copy("inTransit") },
  { value: "completed", label: copy("completed") },
  { value: "refunding", label: copy("refundInProgress") },
] as const;

function OrderSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((k) => (
        <div key={k} className="rounded-[var(--radius)] border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="size-16 shrink-0 rounded-[var(--radius)]" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-[var(--radius)]" />
              <Skeleton className="h-8 w-20 rounded-[var(--radius)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, onViewLogistics }: { order: Order; onViewLogistics: (o: Order) => void }) {
  const { addToCart } = useShop();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [_pending, run] = usePending();

  const handlePay = () =>
    run(async () => {
      toast({ title: `${copy("orderPrefix")}${order.id}${copy("openingPayment")}`, tone: "info" });
    });

  const handleConfirmReceipt = () =>
    run(async () => {
      toast({ title: copy("deliveryConfirmedThanksForYourPurchase"), tone: "success" });
    });

  const handleBuyAgain = (item: Order["items"][0]) => {
    const product = productById[item.productId];
    addToCart({
      productId: item.productId,
      color: item.color,
      size: item.size,
      qty: item.qty,
      price: item.price,
    });
    toast({ title: `${copy("added")}${product?.name ?? item.name}${copy("toYourCart")}`, tone: "info" });
  };

  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-4 shadow-sm">
      {/* 订单头 */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-foreground">{copy("order")}{order.id}</span>
          <span className="text-xs text-muted">{order.createdAt}</span>
        </div>
        <Tag tone={STATUS_TONE[order.status]} size="sm">
          {STATUS_LABEL[order.status]}
        </Tag>
      </div>

      {/* 商品行 */}
      <div className="flex flex-col gap-2">
        {order.items.map((item, idx) => {
          const product = productById[item.productId];
          return (
            <div key={idx} className="flex items-start gap-3">
              {product && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={productImage(product, 0, 120, 120)}
                  alt={item.name}
                  className="size-16 shrink-0 rounded-[var(--radius)] object-cover"
                />
              )}
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="line-clamp-1 text-sm font-medium text-foreground">{item.name}</span>
                <span className="text-xs text-muted">
                  {item.color} / {item.size} × {item.qty}
                </span>
                <span className="text-sm font-semibold text-danger">{formatPrice(item.price)}</span>
              </div>
              {/* 已完成订单可评价 */}
              {order.status === "completed" && (
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs text-muted">{copy("review")}</span>
                  <Rating
                    value={ratings[`${order.id}-${idx}`] ?? 0}
                    onValueChange={(v) =>
                      setRatings((prev) => {
                        const key = `${order.id}-${idx}`;
                        if (prev[key] === v) return prev;
                        toast({ title: copy("thankYouForYourReview"), tone: "success" });
                        return { ...prev, [key]: v ?? 0 };
                      })
                    }
                    size="sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 合计 + 操作区 */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-sm text-muted">

          {copy("total")} {order.items.reduce((s, i) => s + i.qty, 0)}  {copy("itemsAndTotal")}
          <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
        </span>

        <div className="flex flex-wrap gap-2">
          {/* 待付款 */}
          {order.status === "pending" && (
            <>
              <Popconfirm
                title={copy("cancelThisOrder")}
                description={copy("thisCannotBeUndoneAnyPaymentWillBeRefundedToTheOriginalPaymentMethod")}
                danger
                onConfirm={async () => {
                  await new Promise((r) => setTimeout(r, 400));
                  toast({ title: copy("orderCanceled"), tone: "info" });
                }}
              >
                <Button variant="outline" size="sm">

                  {copy("cancelOrder")}
                </Button>
              </Popconfirm>
              <Button size="sm" tone="brand" onClick={handlePay}>

                {copy("payNow")}
              </Button>
            </>
          )}

          {/* 待收货 */}
          {order.status === "shipped" && (
            <>
              <Button variant="outline" size="sm" onClick={() => onViewLogistics(order)}>

                {copy("trackShipment")}
              </Button>
              <Popconfirm
                title={copy("confirmDelivery")}
                description={copy("theOrderWillBeMarkedCompleteAndWillNoLongerBeEligibleForARefund")}
                onConfirm={handleConfirmReceipt}
              >
                <Button size="sm" tone="brand">

                  {copy("confirmDelivery2")}
                </Button>
              </Popconfirm>
            </>
          )}

          {/* 已完成 */}
          {order.status === "completed" && (
            <>
              {order.items.map((item, idx) => (
                <Button key={idx} variant="outline" size="sm" onClick={() => handleBuyAgain(item)}>

                  {copy("buyAgain")}
                </Button>
              ))}
            </>
          )}

          {/* 退款中 */}
          {order.status === "refunding" && (
            <Button variant="outline" size="sm" onClick={() => onViewLogistics(order)}>

              {copy("refundStatus")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { data, loading } = useMockData(orders);
  const [activeTab, setActiveTab] = useState("all");
  const [logisticsOrder, setLogisticsOrder] = useState<Order | null>(null);

  const filtered =
    activeTab === "all" ? (data ?? []) : (data ?? []).filter((o) => o.status === activeTab);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{copy("myOrders")}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap">
          {TAB_FILTERS.map((t) => (
            <TabsTab key={t.value} value={t.value}>
              {t.label}
              {t.value !== "all" && data && (
                <span className="ml-1 text-xs text-muted">
                  ({data.filter((o) => o.status === t.value).length})
                </span>
              )}
            </TabsTab>
          ))}
        </TabsList>

        {TAB_FILTERS.map((t) => (
          <TabsPanel key={t.value} value={t.value}>
            {loading ? (
              <OrderSkeleton />
            ) : filtered.length === 0 ? (
              <Empty
                title={copy("noOrdersYet")}
                description={t.value === "all" ? copy("findSomethingYouLoveInTheStore") : `${copy("no")}${t.label}${copy("orders")}`}
              >
                <Button
                  tone="brand"
                  onClick={() => (window.location.href = `${SHOP_BASE}/products`)}
                >

                  {copy("browseProducts")}
                </Button>
              </Empty>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((o) => (
                  <OrderCard key={o.id} order={o} onViewLogistics={setLogisticsOrder} />
                ))}
              </div>
            )}
          </TabsPanel>
        ))}
      </Tabs>

      {/* 物流详情 Drawer */}
      <Drawer open={!!logisticsOrder} onOpenChange={(o) => !o && setLogisticsOrder(null)}>
        <DrawerContent
          side="right"
          title={logisticsOrder?.status === "refunding" ? copy("refundStatus") : copy("shipmentTracking")}
          description={logisticsOrder ? `${copy("order")}${logisticsOrder.id}` : undefined}
          className="w-[min(560px,92vw)]"
        >
          {logisticsOrder && (
            <div className="flex flex-col gap-4 overflow-y-auto">
              {/* 收货地址 */}
              <div className="rounded-[var(--radius)] bg-surface-hover p-3 text-sm">
                <div className="font-medium text-foreground">{logisticsOrder.receiver}</div>
                <div className="mt-0.5 text-muted">{logisticsOrder.address}</div>
              </div>
              {/* 物流轨迹 */}
              <Timeline
                items={logisticsOrder.tracks.map((t, i) => ({
                  label: t.time,
                  children: t.text,
                  color: i === 0 ? "primary" : "default",
                }))}
              />
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </main>
  );
}
