"use client";
import { useState } from "react";
import {
  EmojiPicker,
  Popover,
  PopoverTrigger,
  PopoverContent,
  RelativeTime,
  Avatar,
  Tag,
  Switch,
  Button,
  Banner,
  Divider,
  Field,
  Input,
  toast,
} from "@hulian/ui";
import { Pencil, ShieldAlert } from "lucide-react";
import { account } from "../../_data/account";
import { planById, formatMoney } from "../../_data/plans";
import { useBilling } from "../../_lib/billing-store";

const team = [
  { name: "沈砚之", role: "拥有者", email: "shen.yz@hanyun.io", active: "2026-06-05T08:12:00+08:00", avatar: "沈" },
  { name: "陆衡", role: "管理员", email: "lu.h@hanyun.io", active: "2026-06-04T19:40:00+08:00", avatar: "陆" },
  { name: "周南", role: "成员", email: "zhou.n@hanyun.io", active: "2026-06-03T11:05:00+08:00", avatar: "周" },
  { name: "韩叙", role: "成员", email: "han.x@hanyun.io", active: "2026-05-28T14:22:00+08:00", avatar: "韩" },
  { name: "许清", role: "只读", email: "xu.q@hanyun.io", active: "2026-05-12T09:00:00+08:00", avatar: "许" },
];

export default function SettingsPage() {
  const { status, setStatus, planId, cycle, seats, monthlyTotal } = useBilling();
  const plan = planById[planId];
  const [statusText, setStatusText] = useState(account.statusText);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notify, setNotify] = useState({ invoice: true, usage: true, product: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">账户设置</h1>
        <p className="mt-1 text-sm text-muted">管理你的资料、团队与通知偏好。</p>
      </div>

      {/* 个人资料 + 工作状态（EmojiPicker）*/}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">个人资料</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Avatar size="lg" fallback={account.avatar} />
            {/* 工作状态表情：点击右下角小气泡用 EmojiPicker 改 */}
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    aria-label="设置工作状态表情"
                    className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-2 border-surface bg-bg text-base shadow-sm transition-transform hover:scale-110"
                  >
                    {status}
                  </button>
                }
              />
              <PopoverContent side="bottom" align="start" className="p-0">
                <EmojiPicker
                  columns={8}
                  recent={["🚀", "💼", "☕", "🎯", "🔥"]}
                  onSelect={(e) => {
                    setStatus(e);
                    setPickerOpen(false);
                    toast({ title: `工作状态已更新为 ${e}`, tone: "info" });
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-foreground">{account.name}</span>
              <Tag tone="brand" size="sm">拥有者</Tag>
            </div>
            <p className="text-sm text-muted">{account.email} · {account.company}</p>
          </div>
        </div>

        <Divider className="my-5" />

        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="text-sm text-muted">当前状态 {status}</span>
          <Field label="">
            <Input
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              suffix={<Pencil className="size-3.5 text-muted" />}
              placeholder="说点什么…"
            />
          </Field>
        </div>
      </section>

      {/* 团队成员 */}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">团队成员</h2>
          <span className="text-xs text-muted">{team.length} / {seats} 席已使用</span>
        </div>
        <ul className="divide-y divide-border">
          {team.map((m) => (
            <li key={m.email} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar size="sm" fallback={m.avatar} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                <p className="truncate text-xs text-muted">{m.email}</p>
              </div>
              <span className="hidden text-xs text-muted sm:block">
                活跃于 <RelativeTime value={m.active} />
              </span>
              <Tag tone={m.role === "拥有者" ? "brand" : "neutral"} size="sm">{m.role}</Tag>
            </li>
          ))}
        </ul>
      </section>

      {/* 通知偏好 */}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">账单通知</h2>
        <div className="flex flex-col gap-4">
          {[
            { key: "invoice", label: "出账与扣款", desc: "每次成功 / 失败扣款邮件通知" },
            { key: "usage", label: "用量预警", desc: "资源用量达 90% 时提醒" },
            { key: "product", label: "产品动态", desc: "新功能与优惠活动" },
          ].map((row) => (
            <label key={row.key} className="flex cursor-pointer items-center justify-between gap-4">
              <span>
                <span className="block text-sm text-foreground">{row.label}</span>
                <span className="block text-xs text-muted">{row.desc}</span>
              </span>
              <Switch
                checked={notify[row.key as keyof typeof notify]}
                onCheckedChange={(c) => setNotify((p) => ({ ...p, [row.key]: c }))}
              />
            </label>
          ))}
        </div>
      </section>

      {/* 订阅状态 / 取消 */}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">订阅状态</h2>
        <p className="text-sm text-muted">
          当前为 <span className="font-medium text-foreground">{plan.name}</span>（{cycle === "yearly" ? "年付" : "月付"}）· {seats} 席 · {formatMoney(monthlyTotal)}/月
        </p>
        <Banner
          tone="warning"
          variant="soft"
          icon={<ShieldAlert />}
          align="start"
          className="mt-4"
          action={
            <Button size="sm" variant="outline" onClick={() => toast({ title: "已记录，可在续费日前随时恢复", tone: "neutral" })}>
              取消订阅
            </Button>
          }
        >
          取消后服务将持续到本计费周期结束，到期不再续费，数据保留 90 天。
        </Banner>
      </section>
    </div>
  );
}
