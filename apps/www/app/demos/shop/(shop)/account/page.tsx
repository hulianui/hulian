"use client";
import { copy } from "./page.content";
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
} from "@hulianui/ui";
import { avatarArt } from "../../_data/art";
import { coupons } from "../../_data/coupons";
import { useShop } from "../../_lib/shop-store";
import type { CouponData } from "../../_data/types";

// ---- 会员等级配置 ----
// colorDark 为各等级主色降约 15% 明度的预算十六进制；用作卡片渐变第二色标，
// 避免 hsl(from … calc(l - 15%)) 相对色语法在部分环境不渲染 → 整条 gradient 失效 → 白字配浅底隐形。
const LEVELS = [
  { name: copy("bronzeMember"), min: 0, max: 999, color: "#b45309", colorDark: "#7c3a06" },
  { name: copy("silverMember"), min: 1000, max: 4999, color: "#6b7280", colorDark: "#4b5563" },
  { name: copy("goldMember"), min: 5000, max: 19999, color: "#d97706", colorDark: "#92560a" },
  { name: copy("diamondMember"), min: 20000, max: Infinity, color: "#8b5cf6", colorDark: "#6d28d9" },
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
  { id: "a1", name: copy("weiZhang"), phone: "138****8866", region: copy("yuhangDistrictHangzhouZhejiang"), detail: copy("hanyunTower969WestWenyiRoad"), isDefault: true },
  { id: "a2", name: copy("weiZhangWork"), phone: "138****8866", region: copy("xihuDistrictHangzhouZhejiang"), detail: copy("text588GudunRoad"), isDefault: false },
];

// ---- 优惠券分组 ----
function CouponTab({ claimedCoupons }: { claimedCoupons: string[] }) {
  const availableCoupons = coupons.filter((c) => c.status === "available" || (c.status === "claimed" && claimedCoupons.includes(c.id)));
  const usedCoupons = coupons.filter((c) => c.status === "used");
  const expiredCoupons = coupons.filter((c) => c.status === "expired");

  const CouponGrid = ({ items }: { items: CouponData[] }) =>
    items.length === 0 ? (
      <Empty title={copy("noCouponsYet")} size="sm" />
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
            onUse={() => toast({ title: `${copy("opening")}${c.title}${copy("closingQuote")}`, tone: "info" })}
          />
        ))}
      </div>
    );

  return (
    <Tabs defaultValue="available">
      <TabsList className="mb-4">
        <TabsTab value="available">{copy("available")}{availableCoupons.length})</TabsTab>
        <TabsTab value="used">{copy("used")}{usedCoupons.length})</TabsTab>
        <TabsTab value="expired">{copy("expired")}{expiredCoupons.length})</TabsTab>
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
      submitText={copy("saveProfile")}
      showReset
      onFinish={async () => {
        await new Promise((r) => setTimeout(r, 600));
        toast({ title: copy("profileSaved"), tone: "success" });
      }}
    >
      <Field label={copy("displayName")}>
        <Input defaultValue={copy("hanshopCustomer")} placeholder={copy("enterADisplayName")} />
      </Field>
      <Field label={copy("phoneNumber")}>
        <Input defaultValue="138****8866" disabled />
      </Field>
      <Field label={copy("email")}>
        <Input defaultValue="user@hulian.dev" placeholder={copy("enterAnEmailAddress")} />
      </Field>
      <Field label={copy("birthday")}>
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
      name: copy("newRecipient"),
      phone: "188****0000",
      region: newRegionNames.join("") || copy("selectARegion"),
      detail: copy("streetAddress"),
      isDefault: false,
    };
    setAddresses((prev) => [...prev, newAddr]);
    setAdding(false);
    setNewRegion([]);
    setNewRegionNames([]);
    toast({ title: copy("addressAdded"), tone: "success" });
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast({ title: copy("addressDeleted"), tone: "info" });
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    toast({ title: copy("defaultAddressUpdated"), tone: "info" });
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

                    {copy("default")}
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

                  {copy("setAsDefault")}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                tone="danger"
                onClick={() => handleDelete(addr.id)}
              >

                {copy("delete")}
              </Button>
            </div>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border p-4">
          <div className="flex flex-col gap-3">
            <Field label={copy("region")}>
              <RegionCascader
                value={newRegion}
                onChange={(codes, names) => {
                  setNewRegion(codes);
                  setNewRegionNames(names);
                }}
                placeholder={copy("selectProvinceCityDistrict")}
              />
            </Field>
            <div className="flex gap-2">
              <Button tone="brand" size="sm" onClick={handleAdd}>

                {copy("addAddress")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAdding(false)}>

                {copy("cancel")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full border-dashed" onClick={() => setAdding(true)}>

          {copy("addShippingAddress")}
        </Button>
      )}
    </div>
  );
}

// ---- 账户安全 ----
function SecurityTab() {
  return (
    <div className="flex flex-col gap-4">
      <Descriptions bordered column={1} title={copy("accountSecurityDetails")}>
        <DescriptionsItem label={copy("signInPhone")}>{copy("text1388866Linked")}</DescriptionsItem>
        <DescriptionsItem label={copy("signInEmail")}>{copy("userLinked")}</DescriptionsItem>
        <DescriptionsItem label={copy("password")}>{copy("setLastChangedJan152026")}</DescriptionsItem>
        <DescriptionsItem label={copy("accountStatus")}>{copy("active")}</DescriptionsItem>
      </Descriptions>

      <div className="flex flex-col gap-3 pt-2">
        <Button variant="outline" size="sm" className="self-start" onClick={() => toast({ title: copy("openingPasswordSettings"), tone: "info" })}>

          {copy("changePassword")}
        </Button>

        {/* 注销账户 AlertDialog */}
        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="outline" size="sm" tone="danger" className="self-start">

              {copy("deleteAccount")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            title={copy("deleteThisAccount")}
            description={copy("yourOrdersPointsAndFavoritesWillBePermanentlyDeletedThisCannotBeUndoneMakeSureAllPendingRefundsA")}
          >
            <AlertDialogClose>
              <Button variant="outline">{copy("cancel")}</Button>
            </AlertDialogClose>
            <AlertDialogClose>
              <Button
                tone="danger"
                onClick={() => {
                  toast({ title: copy("accountDeletionRequestSubmittedProcessingMayTakeUpTo7BusinessDays"), tone: "danger" });
                }}
              >

                {copy("deleteAccount2")}
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
            src={avatarArt(copy("hanshopCustomer"), 80)}
            alt={copy("customerAvatar")}
            size="lg"
            fallback={copy("use")}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{copy("hanshopCustomer")}</span>
              <span className="rounded-sm bg-white/20 px-2 py-0.5 text-xs font-medium">
                {level.name}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/80">{copy("uidHs10086001")}</p>

            {/* 等级进度 */}
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs text-white/80">
                <span>{level.name}</span>
                {next ? (
                  <span>{copy("pointsToNextTier", (next.min - MOCK_POINTS).toLocaleString(), next.name)}</span>
                ) : (
                  <span>{copy("highestTierReached")}</span>
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
            title={<span className="text-xs text-white/70">{copy("points")}</span>}
            valueStyle={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}
            animate
          />
          <Statistic
            value={MOCK_BALANCE}
            prefix={<span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>¥</span>}
            title={<span className="text-xs text-white/70">{copy("balance")}</span>}
            precision={2}
            valueStyle={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}
          />
          <Statistic
            value={claimedCount}
            suffix={<span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>{copy("coupons")}</span>}
            title={<span className="text-xs text-white/70">{copy("coupons2")}</span>}
            valueStyle={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}
          />
        </div>
      </div>

      {/* 功能 Tabs */}
      <Tabs defaultValue="coupons">
        <TabsList className="mb-6 flex-wrap">
          <TabsTab value="coupons">{copy("myCoupons")}</TabsTab>
          <TabsTab value="profile">{copy("profile")}</TabsTab>
          <TabsTab value="address">{copy("shippingAddresses")}</TabsTab>
          <TabsTab value="security">{copy("accountSecurity")}</TabsTab>
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
