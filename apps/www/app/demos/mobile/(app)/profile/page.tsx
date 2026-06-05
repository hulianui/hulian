"use client";
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
      onClick={() => toast({ title: `${label} 功能即将上线`, tone: "neutral" })}
      className="cursor-pointer px-4 py-3 hover:bg-surface-hover"
    >
      <div className="flex w-full items-center gap-3">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${tint}`}>{icon}</span>
        <span className="flex-1 text-sm">{label}</span>
        {value && <span className="text-xs text-muted">{value}</span>}
        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
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
          <Avatar fallback="李" size="lg" />
          <div>
            <div className="text-base font-semibold">李小美</div>
            <div className="mt-0.5 text-xs text-muted">会员 · 已服务 12 次</div>
            <div className="mt-1">
              <Tag tone="warning" size="sm" variant="soft">
                黄金会员
              </Tag>
            </div>
          </div>
        </div>

        {/* 统计数字（align=center 让数值行居中，text-center 对 flex 数值行无效） */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-3 shadow-sm">
          <Statistic title="累计订单" value={12} align="center" />
          <Statistic title="优惠券" value={3} suffix="张" align="center" />
          <Statistic title="节省金额" value={186} prefix="¥" align="center" />
        </div>
      </div>

      {/* 我的评价 */}
      <div className="mx-4 mt-4 rounded-2xl border border-border bg-surface p-4">
        <div className="mb-2 text-sm font-semibold">我的评价</div>
        <div className="flex items-center gap-3">
          <Avatar fallback="张" size="sm" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">张阿姨 · 深度保洁</span>
              <Rating value={5} readOnly size="sm" />
            </div>
            <p className="mt-0.5 text-xs text-muted">服务很专业，家里干净多了，下次还会预约！</p>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <List split>
          <SettingRow icon={<Ticket className="size-4 text-amber-600" />} tint="bg-amber-500/12" label="优惠券" value="3 张可用" />
          <SettingRow icon={<MapPin className="size-4 text-rose-600" />} tint="bg-rose-500/12" label="收货地址" />
          <SettingRow icon={<CreditCard className="size-4 text-blue-600" />} tint="bg-blue-500/12" label="支付方式" />
          <SettingRow icon={<Star className="size-4 text-yellow-600" />} tint="bg-yellow-500/12" label="我的收藏" />
          <SettingRow icon={<ClipboardList className="size-4 text-emerald-600" />} tint="bg-emerald-500/12" label="服务记录" />
        </List>
      </div>

      <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
        <List split>
          <SettingRow icon={<Bell className="size-4 text-violet-600" />} tint="bg-violet-500/12" label="消息通知" />
          <SettingRow icon={<ShieldCheck className="size-4 text-teal-600" />} tint="bg-teal-500/12" label="隐私设置" />
          <SettingRow icon={<HelpCircle className="size-4 text-sky-600" />} tint="bg-sky-500/12" label="帮助与反馈" />
          <SettingRow icon={<Info className="size-4 text-muted" />} tint="bg-foreground/8" label="关于我们" value="v2.6.1" />
        </List>
      </div>

      <Divider className="mx-4 my-4" />
      <div className="pb-6 text-center text-xs text-muted">到家服务 © 2026</div>
    </div>
  );
}
