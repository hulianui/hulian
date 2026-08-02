/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

// C 端个人中心区块 —— 顶部头像 + 昵称 + 等级 Tag + 一排数据 Statistic（积分/优惠券/收藏/余额）。
// Tabs 含：我的订单/收货地址/账户设置，订单列表用 List/ListItem 展示。
// 所有数据内联，复制即独立运行，无任何外部依赖。

import { useState } from "react";
import { ChevronRight, MapPin, Settings, ShoppingBag } from "lucide-react";
import {
  Avatar,
  Button,
  List,
  ListItem,
  Progress,
  Statistic,
  Tag,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
  toast,
} from "../../../lib/fixture-ui";

// ---- 等级配置 ----
const LEVELS = [
  { name: "铜牌会员", min: 0, max: 999, color: "#b45309", colorDark: "#7c3a06" },
  { name: "银牌会员", min: 1000, max: 4999, color: "#6b7280", colorDark: "#4b5563" },
  { name: "金牌会员", min: 5000, max: 19999, color: "#d97706", colorDark: "#92560a" },
  { name: "钻石会员", min: 20000, max: Infinity, color: "#8b5cf6", colorDark: "#6d28d9" },
];

const MOCK_POINTS = 2680;
const MOCK_BALANCE = 188.5;
const MOCK_COUPONS = 3;
const MOCK_FAVORITES = 27;

function getLevelInfo(points: number) {
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) { idx = i; break; }
  }
  const level = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const progress = next
    ? Math.min(100, Math.round(((points - level.min) / (next.min - level.min)) * 100))
    : 100;
  return { level, next, progress };
}

// ---- 订单数据 ----
type OrderStatus = "待付款" | "待发货" | "待收货" | "已完成" | "已取消";

const STATUS_TONE: Record<OrderStatus, "warning" | "brand" | "success" | "neutral" | "danger"> = {
  "待付款": "warning",
  "待发货": "brand",
  "待收货": "brand",
  "已完成": "success",
  "已取消": "neutral",
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
  { id: "o1", name: "轻奢蚕丝枕套双面桑蚕丝 × 2", price: 596, qty: 2, status: "待收货", date: "2026-06-02", gradient: "from-rose-200 to-pink-100" },
  { id: "o2", name: "人体工学办公椅腰托可调", price: 1299, qty: 1, status: "已完成", date: "2026-05-18", gradient: "from-slate-200 to-gray-100" },
  { id: "o3", name: "OLED 护眼台灯 Pro Max 版", price: 459, qty: 1, status: "已完成", date: "2026-05-10", gradient: "from-amber-200 to-yellow-100" },
  { id: "o4", name: "竹纤维速干浴巾套装 3 件", price: 128, qty: 1, status: "待付款", date: "2026-06-04", gradient: "from-emerald-200 to-teal-100" },
];

// ---- 地址数据 ----
const ADDRESSES = [
  { id: "a1", name: "张伟", phone: "138****8866", addr: "浙江省杭州市余杭区 文一西路 969 号瀚云大厦", isDefault: true },
  { id: "a2", name: "张伟（公司）", phone: "138****8866", addr: "浙江省杭州市西湖区 古墩路 588 号", isDefault: false },
];

function formatPrice(n: number) {
  return `¥${n.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
}

// ---- 子组件 ----
function OrdersTab() {
  return (
    <List className="space-y-3" split={false}>
      {ORDERS.map((order) => (
        <ListItem
          key={order.id}
          className="cursor-pointer rounded-xl border border-border bg-surface p-4 hover:bg-surface-hover transition-colors"
          onClick={() => toast({ title: `查看订单 ${order.id}（演示）`, tone: "info" })}
        >
          <div className="flex items-center gap-3">
            {/* 缩略图 */}
            <div
              className={`size-14 shrink-0 rounded-lg bg-gradient-to-br ${order.gradient}`}
              aria-hidden
            />
            {/* 信息 */}
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
            <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
          </div>
        </ListItem>
      ))}
    </List>
  );
}

function AddressTab() {
  return (
    <div className="space-y-3">
      {ADDRESSES.map((addr) => (
        <div
          key={addr.id}
          className="rounded-xl border border-border bg-surface p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{addr.name}</span>
                  <span className="text-sm text-muted">{addr.phone}</span>
                  {addr.isDefault && (
                    <span className="rounded-sm bg-primary/12 px-1.5 py-0.5 text-xs font-medium text-primary">
                      默认
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted">{addr.addr}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast({ title: `编辑地址：${addr.name}（演示）`, tone: "info" })}
            >
              编辑
            </Button>
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={() => toast({ title: "新增收货地址（演示）", tone: "info" })}
      >
        + 新增收货地址
      </Button>
    </div>
  );
}

function SettingsTab() {
  const fields = [
    { label: "昵称", value: "瀚选用户" },
    { label: "手机号", value: "138****8866" },
    { label: "邮箱", value: "user@hulian.dev" },
    { label: "登录密码", value: "已设置" },
  ];
  return (
    <div className="space-y-3">
      {fields.map((f) => (
        <div
          key={f.label}
          className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
        >
          <div>
            <Text size="xs" tone="muted">{f.label}</Text>
            <Text size="sm" className="font-medium text-foreground">{f.value}</Text>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast({ title: `修改${f.label}（演示）`, tone: "info" })}
          >
            <Settings className="size-4" aria-hidden />
          </Button>
        </div>
      ))}
    </div>
  );
}

// ---- 主区块 ----
export function UserProfileBlock() {
  const { level, next, progress } = getLevelInfo(MOCK_POINTS);

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* 会员卡 */}
      <div
        className="mb-6 overflow-hidden rounded-2xl p-6 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${level.color}, ${level.colorDark})` }}
      >
        {/* 头像 + 昵称 + 等级 */}
        <div className="flex items-start gap-4">
          <Avatar
            fallback="用"
            size="lg"
            className="ring-2 ring-white/40"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold">瀚选用户</span>
              <Tag
                size="sm"
                className="border-white/30 bg-white/20 text-white"
              >
                {level.name}
              </Tag>
            </div>
            <p className="mt-0.5 text-sm text-white/70">UID：HS10086001</p>

            {/* 等级进度条 */}
            <div className="mt-3">
              <div className="mb-1.5 flex justify-between text-xs text-white/70">
                <span>{level.name}</span>
                {next ? (
                  <span>距 {next.name} 还差 {(next.min - MOCK_POINTS).toLocaleString()} 积分</span>
                ) : (
                  <span>已达最高等级</span>
                )}
              </div>
              <Progress value={progress} tone="primary" />
            </div>
          </div>
        </div>

        {/* 核心数据 Statistic */}
        <div className="mt-5 grid grid-cols-4 divide-x divide-white/20 text-center">
          <Statistic
            value={MOCK_POINTS}
            title={<span className="text-xs text-white/60">积分</span>}
            valueStyle={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}
            animate
          />
          <Statistic
            value={MOCK_COUPONS}
            suffix={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem" }}>张</span>}
            title={<span className="text-xs text-white/60">优惠券</span>}
            valueStyle={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}
          />
          <Statistic
            value={MOCK_FAVORITES}
            title={<span className="text-xs text-white/60">收藏</span>}
            valueStyle={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}
          />
          <Statistic
            value={MOCK_BALANCE}
            prefix={<span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>¥</span>}
            precision={2}
            title={<span className="text-xs text-white/60">余额</span>}
            valueStyle={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList className="mb-5">
          <TabsTab value="orders">
            <ShoppingBag className="mr-1.5 size-4" aria-hidden />
            我的订单
          </TabsTab>
          <TabsTab value="address">
            <MapPin className="mr-1.5 size-4" aria-hidden />
            收货地址
          </TabsTab>
          <TabsTab value="settings">
            <Settings className="mr-1.5 size-4" aria-hidden />
            账户设置
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
    </div>
  );
}
