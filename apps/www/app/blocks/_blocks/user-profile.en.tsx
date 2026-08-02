"use client";
import { useState } from "react";
import { ChevronRight, MapPin, Settings, ShoppingBag } from "lucide-react";
import { Avatar, Button, List, ListItem, Progress, Statistic, Tag, Tabs, TabsList, TabsPanel, TabsTab, Text, toast, } from "@hulianui/ui";
const LEVELS = [
    { name: "Bronze Member", min: 0, max: 999, color: "#b45309", colorDark: "#7c3a06" },
    { name: "Silver Member", min: 1000, max: 4999, color: "#6b7280", colorDark: "#4b5563" },
    { name: "Gold Member", min: 5000, max: 19999, color: "#d97706", colorDark: "#92560a" },
    { name: "Diamond Member", min: 20000, max: Infinity, color: "#8b5cf6", colorDark: "#6d28d9" },
];
const MOCK_POINTS = 2680;
const MOCK_BALANCE = 188.5;
const MOCK_COUPONS = 3;
const MOCK_FAVORITES = 27;
function getLevelInfo(points: number) {
    let idx = 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (points >= LEVELS[i].min) {
            idx = i;
            break;
        }
    }
    const level = LEVELS[idx];
    const next = LEVELS[idx + 1];
    const progress = next
        ? Math.min(100, Math.round(((points - level.min) / (next.min - level.min)) * 100))
        : 100;
    return { level, next, progress };
}
type OrderStatus = "Pending payment" | "Awaiting shipment" | "Awaiting receipt" | "Completed" | "Canceled";
const STATUS_TONE: Record<OrderStatus, "warning" | "brand" | "success" | "neutral" | "danger"> = {
    "Pending payment": "warning",
    "Awaiting shipment": "brand",
    "Awaiting receipt": "brand",
    "Completed": "success",
    "Canceled": "neutral",
};
interface Order {
    id: string;
    name: string;
    price: number;
    qty: number;
    status: OrderStatus;
    date: string;
    gradient: string;
}
const ORDERS: Order[] = [
    { id: "o1", name: "Premium Reversible Mulberry Silk Pillowcase \u00D7 2", price: 596, qty: 2, status: "Awaiting receipt", date: "2026-06-02", gradient: "from-rose-200 to-pink-100" },
    { id: "o2", name: "Ergonomic Office Chair with Adjustable Lumbar Support", price: 1299, qty: 1, status: "Completed", date: "2026-05-18", gradient: "from-slate-200 to-gray-100" },
    { id: "o3", name: "OLED Eye-Care Desk Lamp Pro Max", price: 459, qty: 1, status: "Completed", date: "2026-05-10", gradient: "from-amber-200 to-yellow-100" },
    { id: "o4", name: "3-Piece Quick-Dry Bamboo Bath Towel Set", price: 128, qty: 1, status: "Pending payment", date: "2026-06-04", gradient: "from-emerald-200 to-teal-100" },
];
const ADDRESSES = [
    { id: "a1", name: "Zhang Wei", phone: "138****8866", addr: "HanCloud Building, 969 Wenyi West Road, Yuhang District, Hangzhou, Zhejiang", isDefault: true },
    { id: "a2", name: "Zhang Wei (company)", phone: "138****8866", addr: "No. 588 Gudun Road, Xihu District, Hangzhou City, Zhejiang Province", isDefault: false },
];
function formatPrice(n: number) {
    return `\u00A5${n.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
}
function OrdersTab() {
    return (<List className="space-y-3" split={false}>
      {ORDERS.map((order) => (<ListItem key={order.id} className="cursor-pointer rounded-xl border border-border bg-surface p-4 hover:bg-surface-hover transition-colors" onClick={() => toast({ title: `View order ${order.id} (demo)`, tone: "info" })}>
          <div className="flex items-center gap-3">

            <div className={`size-14 shrink-0 rounded-lg bg-gradient-to-br ${order.gradient}`} aria-hidden/>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{order.name}</p>
              <p className="mt-0.5 text-xs text-muted">{order.date}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{formatPrice(order.price)}</span>
                <Tag tone={STATUS_TONE[order.status]} size="sm" variant="soft">
                  {order.status}
                </Tag>
              </div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden/>
          </div>
        </ListItem>))}
    </List>);
}
function AddressTab() {
    return (<div className="space-y-3">
      {ADDRESSES.map((addr) => (<div key={addr.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden/>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{addr.name}</span>
                  <span className="text-sm text-muted">{addr.phone}</span>
                  {addr.isDefault && (<span className="rounded-sm bg-primary/12 px-1.5 py-0.5 text-xs font-medium text-primary">
                      Default
                    </span>)}
                </div>
                <p className="mt-0.5 text-xs text-muted">{addr.addr}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toast({ title: `Edit address: ${addr.name} (demo)`, tone: "info" })}>
              Edit
            </Button>
          </div>
        </div>))}
      <Button variant="outline" className="w-full border-dashed" onClick={() => toast({ title: "Add shipping address (demo)", tone: "info" })}>
        + Add a new shipping address
      </Button>
    </div>);
}
function SettingsTab() {
    const fields = [
        { label: "Nickname", value: "HanSelect Member" },
        { label: "Mobile phone number", value: "138****8866" },
        { label: "Email", value: "user@hulian.dev" },
        { label: "Login password", value: "Configured" },
    ];
    return (<div className="space-y-3">
      {fields.map((f) => (<div key={f.label} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
          <div>
            <Text size="xs" tone="muted">{f.label}</Text>
            <Text size="sm" className="font-medium text-foreground">{f.value}</Text>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toast({ title: `Edit ${f.label} (demo)`, tone: "info" })}>
            <Settings className="size-4" aria-hidden/>
          </Button>
        </div>))}
    </div>);
}
export function UserProfileBlock() {
    const { level, next, progress } = getLevelInfo(MOCK_POINTS);
    return (<div className="mx-auto w-full max-w-2xl">

      <div className="mb-6 overflow-hidden rounded-2xl p-6 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${level.color}, ${level.colorDark})` }}>

        <div className="flex items-start gap-4">
          <Avatar fallback="U" size="lg" className="ring-2 ring-white/40"/>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold">HanSelect Member</span>
              <Tag size="sm" className="border-white/30 bg-white/20 text-white">
                {level.name}
              </Tag>
            </div>
            <p className="mt-0.5 text-sm text-white/70">UID: HS10086001</p>


            <div className="mt-3">
              <div className="mb-1.5 flex justify-between text-xs text-white/70">
                <span>{level.name}</span>
                {next ? (<span>Earn another {(next.min - MOCK_POINTS).toLocaleString()} points to reach {next.name}</span>) : (<span>Reached the highest level</span>)}
              </div>
              <Progress value={progress} tone="primary"/>
            </div>
          </div>
        </div>


        <div className="mt-5 grid grid-cols-4 divide-x divide-white/20 text-center">
          <Statistic value={MOCK_POINTS} title={<span className="text-xs text-white/60">Points</span>} valueStyle={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }} animate/>
          <Statistic value={MOCK_COUPONS} suffix={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}>coupons</span>} title={<span className="text-xs text-white/60">Coupons</span>} valueStyle={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}/>
          <Statistic value={MOCK_FAVORITES} title={<span className="text-xs text-white/60">Favorites</span>} valueStyle={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}/>
          <Statistic value={MOCK_BALANCE} prefix={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>¥</span>} precision={2} title={<span className="text-xs text-white/60">Balance</span>} valueStyle={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}/>
        </div>
      </div>


      <Tabs defaultValue="orders">
        <TabsList className="mb-5">
          <TabsTab value="orders">
            <ShoppingBag className="mr-1.5 size-4" aria-hidden/>
            My orders
          </TabsTab>
          <TabsTab value="address">
            <MapPin className="mr-1.5 size-4" aria-hidden/>
            Shipping address
          </TabsTab>
          <TabsTab value="settings">
            <Settings className="mr-1.5 size-4" aria-hidden/>
            Account settings
          </TabsTab>
        </TabsList>

        <TabsPanel value="orders">
          <OrdersTab />
        </TabsPanel>
        <TabsPanel value="address">
          <AddressTab />
        </TabsPanel>
        <TabsPanel value="settings">
          <SettingsTab />
        </TabsPanel>
      </Tabs>
    </div>);
}
