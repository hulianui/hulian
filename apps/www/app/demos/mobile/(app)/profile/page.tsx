"use client";
import { copy } from "./page.content";
import type { ReactNode } from "react";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  CreditCard,
  HelpCircle,
  Info,
  MapPin,
  ShieldCheck,
  Star,
  Ticket,
} from "lucide-react";
import { Avatar, Divider, List, ListItem, Rating, Statistic, Tag, toast } from "@hulianui/ui";

// 功能菜单行：左侧彩色图标芯片 + 文案 + 右值 + chevron。用库 List/ListItem 承载，图标走 lucide 线性图标（非 emoji）。
function SettingRow({
  icon,
  tint,
  label,
  value,
}: {
  icon: ReactNode;
  tint: string;
  label: string;
  value?: string;
}) {
  return (
    <ListItem
      onClick={() => toast({ title: `${label}${copy("comingSoon")}`, tone: "neutral" })}
      className="cursor-pointer px-4 py-3 hover:bg-surface-hover"
    >
      <div className="flex w-full items-center gap-3">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${tint}`}>{icon}</span>
        <span className="flex-1 text-sm">{label}</span>
        {value && <span className="text-xs text-muted-foreground">{value}</span>}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
    </ListItem>
  );
}

export default function ProfilePage() {
  return (
    <div className="h-full overflow-y-auto">
      {/* 用户信息头 */}
      <div className="bg-gradient-to-br from-primary/15 to-surface px-4 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Avatar fallback={copy("li")} size="lg" />
          <div>
            <div className="text-base font-semibold">{copy("liXiaomei")}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{copy("member12CompletedServices")}</div>
            <div className="mt-1">
              <Tag tone="warning" size="sm" variant="soft">

                {copy("goldMember")}
              </Tag>
            </div>
          </div>
        </div>

        {/* 统计数字（align=center 让数值行居中，text-center 对 flex 数值行无效） */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-3 shadow-sm">
          <Statistic title={copy("totalBookings")} value={12} align="center" />
          <Statistic title={copy("coupons")} value={3} suffix={copy("zhang")} align="center" />
          <Statistic title={copy("totalSavings")} value={186} prefix="¥" align="center" />
        </div>
      </div>

      {/* 我的评价 */}
      <div className="mx-4 mt-4 rounded-2xl border border-border bg-surface p-4">
        <div className="mb-2 text-sm font-semibold">{copy("myReviews")}</div>
        <div className="flex items-center gap-3">
          <Avatar fallback={copy("zhang")} size="sm" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">{copy("msZhangDeepCleaning")}</span>
              <Rating value={5} readOnly size="sm" />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{copy("professionalServiceAndANoticeablyCleanerHomeIWillBookAgain")}</p>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <List split>
          <SettingRow icon={<Ticket className="size-4 text-amber-600" />} tint="bg-amber-500/12" label={copy("coupons")} value={copy("text3Available")} />
          <SettingRow icon={<MapPin className="size-4 text-rose-600" />} tint="bg-rose-500/12" label={copy("shippingAddress")} />
          <SettingRow icon={<CreditCard className="size-4 text-blue-600" />} tint="bg-blue-500/12" label={copy("paymentMethods")} />
          <SettingRow icon={<Star className="size-4 text-yellow-600" />} tint="bg-yellow-500/12" label={copy("myFavorites")} />
          <SettingRow icon={<ClipboardList className="size-4 text-emerald-600" />} tint="bg-emerald-500/12" label={copy("serviceHistory")} />
        </List>
      </div>

      <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
        <List split>
          <SettingRow icon={<Bell className="size-4 text-violet-600" />} tint="bg-violet-500/12" label={copy("notifications")} />
          <SettingRow icon={<ShieldCheck className="size-4 text-teal-600" />} tint="bg-teal-500/12" label={copy("privacySettings")} />
          <SettingRow icon={<HelpCircle className="size-4 text-sky-600" />} tint="bg-sky-500/12" label={copy("helpAndFeedback")} />
          <SettingRow icon={<Info className="size-4 text-muted-foreground" />} tint="bg-foreground/8" label={copy("aboutUs")} value="v2.6.1" />
        </List>
      </div>

      <Divider className="mx-4 my-4" />
      <div className="pb-6 text-center text-xs text-muted-foreground">{copy("atHomeServices2026")}</div>
    </div>
  );
}
