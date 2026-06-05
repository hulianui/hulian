"use client";
import { useState } from "react";
import {
  Tabs, TabsList, TabsTab, TabsPanel,
  Avatar, Statistic, Progress,
  Coupon, Button, Empty,
  ProForm, Field, Input,
  AlertDialog, AlertDialogTrigger, AlertDialogClose, AlertDialogContent,
  Descriptions, DescriptionsItem,
  RegionCascader,
  toast,
} from "@hulian/ui";
import { avatarArt } from "../../_data/art";
import { coupons } from "../../_data/coupons";
import { useShop } from "../../_lib/shop-store";
import type { CouponData } from "../../_data/types";

// ---- 会员等级配置 ----
// colorDark 为各等级主色降约 15% 明度的预算十六进制；用作卡片渐变第二色标，
// 避免 hsl(from … calc(l - 15%)) 相对色语法在部分环境不渲染 → 整条 gradient 失效 → 白字配浅底隐形。
const LEVELS = [
  { name: "铜牌会员", min: 0, max: 999, color: "#b45309", colorDark: "#7c3a06" },
  { name: "银牌会员", min: 1000, max: 4999, color: "#6b7280", colorDark: "#4b5563" },
  { name: "金牌会员", min: 5000, max: 19999, color: "#d97706", colorDark: "#92560a" },
  { name: "钻石会员", min: 20000, max: Infinity, color: "#8b5cf6", colorDark: "#6d28d9" },
];

const MOCK_POINTS = 2680;
const MOCK_BALANCE = 188.5;

function getLevelInfo(points: number) {
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) { idx = i; break; }
  }
  const level = LEVELS[Math.max(0, idx)];
  const next = LEVELS[idx + 1];
  const progress = next
    ? Math.min(100, Math.round(((points - level.min) / (next.min - level.min)) * 100))
    : 100;
  return { level, next, progress };
}

// ---- 地址条目 ----
interface AddressItem {
  id: string;
  name: string;
  phone: string;
  region: string;
  detail: string;
  isDefault: boolean;
}

const MOCK_ADDRESSES: AddressItem[] = [
  { id: "a1", name: "张伟", phone: "138****8866", region: "浙江省杭州市余杭区", detail: "文一西路 969 号瀚云大厦", isDefault: true },
  { id: "a2", name: "张伟（公司）", phone: "138****8866", region: "浙江省杭州市西湖区", detail: "古墩路 588 号", isDefault: false },
];

// ---- 优惠券分组 ----
function CouponTab({ claimedCoupons }: { claimedCoupons: string[] }) {
  const availableCoupons = coupons.filter((c) => c.status === "available" || (c.status === "claimed" && claimedCoupons.includes(c.id)));
  const usedCoupons = coupons.filter((c) => c.status === "used");
  const expiredCoupons = coupons.filter((c) => c.status === "expired");

  const CouponGrid = ({ items }: { items: CouponData[] }) =>
    items.length === 0 ? (
      <Empty title="暂无优惠券" size="sm" />
    ) : (
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((c) => (
          <Coupon
            key={c.id}
            kind={c.kind}
            amount={c.amount}
            discount={c.discount}
            threshold={c.threshold}
            title={c.title}
            scope={c.scope}
            validUntil={c.validUntil}
            status={c.status === "available" && claimedCoupons.includes(c.id) ? "claimed" : c.status}
            tone={c.tone}
            onUse={() => toast({ title: `正在跳转去使用「${c.title}」`, tone: "info" })}
          />
        ))}
      </div>
    );

  return (
    <Tabs defaultValue="available">
      <TabsList className="mb-4">
        <TabsTab value="available">可用 ({availableCoupons.length})</TabsTab>
        <TabsTab value="used">已用 ({usedCoupons.length})</TabsTab>
        <TabsTab value="expired">过期 ({expiredCoupons.length})</TabsTab>
      </TabsList>
      <TabsPanel value="available"><CouponGrid items={availableCoupons} /></TabsPanel>
      <TabsPanel value="used"><CouponGrid items={usedCoupons} /></TabsPanel>
      <TabsPanel value="expired"><CouponGrid items={expiredCoupons} /></TabsPanel>
    </Tabs>
  );
}

// ---- 账户资料 ProForm ----
function ProfileForm() {
  return (
    <ProForm
      columns={2}
      submitText="保存资料"
      showReset
      onFinish={async () => {
        await new Promise((r) => setTimeout(r, 600));
        toast({ title: "资料保存成功", tone: "info" });
      }}
    >
      <Field label="昵称">
        <Input defaultValue="瀚选用户" placeholder="请输入昵称" />
      </Field>
      <Field label="手机号">
        <Input defaultValue="138****8866" disabled />
      </Field>
      <Field label="邮箱">
        <Input defaultValue="user@hulian.dev" placeholder="请输入邮箱" />
      </Field>
      <Field label="生日">
        <Input defaultValue="1990-06-04" type="date" />
      </Field>
    </ProForm>
  );
}

// ---- 收货地址 ----
function AddressBook() {
  const [addresses, setAddresses] = useState<AddressItem[]>(MOCK_ADDRESSES);
  const [adding, setAdding] = useState(false);
  const [newRegion, setNewRegion] = useState<string[]>([]);
  const [newRegionNames, setNewRegionNames] = useState<string[]>([]);

  const handleAdd = async () => {
    await new Promise((r) => setTimeout(r, 400));
    const newAddr: AddressItem = {
      id: `a${Date.now()}`,
      name: "新收货人",
      phone: "188****0000",
      region: newRegionNames.join("") || "请选择地区",
      detail: "详细地址",
      isDefault: false,
    };
    setAddresses((prev) => [...prev, newAddr]);
    setAdding(false);
    setNewRegion([]);
    setNewRegionNames([]);
    toast({ title: "地址添加成功", tone: "info" });
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "地址已删除", tone: "info" });
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    toast({ title: "已设为默认地址", tone: "info" });
  };

  return (
    <div className="flex flex-col gap-4">
      {addresses.map((addr) => (
        <div key={addr.id} className="rounded-[var(--radius)] border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{addr.name}</span>
                <span className="text-sm text-muted">{addr.phone}</span>
                {addr.isDefault && (
                  <span className="rounded-sm bg-primary/12 px-1.5 py-0.5 text-xs font-medium text-primary">
                    默认
                  </span>
                )}
              </div>
              <span className="text-sm text-muted">
                {addr.region} {addr.detail}
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              {!addr.isDefault && (
                <Button variant="ghost" size="sm" onClick={() => handleSetDefault(addr.id)}>
                  设为默认
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                tone="danger"
                onClick={() => handleDelete(addr.id)}
              >
                删除
              </Button>
            </div>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border p-4">
          <div className="flex flex-col gap-3">
            <Field label="所在地区">
              <RegionCascader
                value={newRegion}
                onChange={(codes, names) => {
                  setNewRegion(codes);
                  setNewRegionNames(names);
                }}
                placeholder="选择省/市/区"
              />
            </Field>
            <div className="flex gap-2">
              <Button tone="brand" size="sm" onClick={handleAdd}>
                确认添加
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAdding(false)}>
                取消
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full border-dashed" onClick={() => setAdding(true)}>
          + 新增收货地址
        </Button>
      )}
    </div>
  );
}

// ---- 账户安全 ----
function SecurityTab() {
  return (
    <div className="flex flex-col gap-4">
      <Descriptions bordered column={1} title="账户安全信息">
        <DescriptionsItem label="登录手机">138****8866 · 已绑定</DescriptionsItem>
        <DescriptionsItem label="登录邮箱">user@hulian.dev · 已绑定</DescriptionsItem>
        <DescriptionsItem label="登录密码">已设置 · 上次修改 2026-01-15</DescriptionsItem>
        <DescriptionsItem label="账户状态">正常</DescriptionsItem>
      </Descriptions>

      <div className="flex flex-col gap-3 pt-2">
        <Button variant="outline" size="sm" className="self-start" onClick={() => toast({ title: "跳转修改密码页面", tone: "info" })}>
          修改登录密码
        </Button>

        {/* 注销账户 AlertDialog */}
        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="outline" size="sm" tone="danger" className="self-start">
              注销账户
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            title="确认注销账户？"
            description="注销后，您的账户数据（订单、积分、收藏）将被永久清除，此操作不可恢复。确认前请确保已处理完所有待退款订单。"
          >
            <AlertDialogClose>
              <Button variant="outline">取消</Button>
            </AlertDialogClose>
            <AlertDialogClose>
              <Button
                tone="danger"
                onClick={() => {
                  toast({ title: "账户注销申请已提交，将在 7 个工作日内处理", tone: "danger" });
                }}
              >
                确认注销
              </Button>
            </AlertDialogClose>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ---- 主页面 ----
export default function AccountPage() {
  const { claimedCoupons } = useShop();
  const { level, next, progress } = getLevelInfo(MOCK_POINTS);
  const claimedCount = claimedCoupons.length + coupons.filter((c) => c.status === "claimed").length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* 会员卡 */}
      <div
        className="mb-8 overflow-hidden rounded-[var(--radius)] p-6 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${level.color}, ${level.colorDark})` }}
      >
        <div className="flex items-start gap-4">
          <Avatar
            src={avatarArt("瀚选用户", 80)}
            alt="用户头像"
            size="lg"
            fallback="用"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">瀚选用户</span>
              <span className="rounded-sm bg-white/20 px-2 py-0.5 text-xs font-medium">
                {level.name}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/80">UID：HS10086001</p>

            {/* 等级进度 */}
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs text-white/80">
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

        {/* 核心数据 */}
        <div className="mt-6 grid grid-cols-3 divide-x divide-white/20 text-center">
          <Statistic
            value={MOCK_POINTS}
            title={<span className="text-xs text-white/70">积分</span>}
            valueStyle={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}
            animate
          />
          <Statistic
            value={MOCK_BALANCE}
            prefix={<span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>¥</span>}
            title={<span className="text-xs text-white/70">余额</span>}
            precision={2}
            valueStyle={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}
          />
          <Statistic
            value={claimedCount}
            suffix={<span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>张</span>}
            title={<span className="text-xs text-white/70">优惠券</span>}
            valueStyle={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}
          />
        </div>
      </div>

      {/* 功能 Tabs */}
      <Tabs defaultValue="coupons">
        <TabsList className="mb-6 flex-wrap">
          <TabsTab value="coupons">我的优惠券</TabsTab>
          <TabsTab value="profile">账户资料</TabsTab>
          <TabsTab value="address">收货地址</TabsTab>
          <TabsTab value="security">账户安全</TabsTab>
        </TabsList>

        <TabsPanel value="coupons">
          <CouponTab claimedCoupons={claimedCoupons} />
        </TabsPanel>

        <TabsPanel value="profile">
          <ProfileForm />
        </TabsPanel>

        <TabsPanel value="address">
          <AddressBook />
        </TabsPanel>

        <TabsPanel value="security">
          <SecurityTab />
        </TabsPanel>
      </Tabs>
    </main>
  );
}
