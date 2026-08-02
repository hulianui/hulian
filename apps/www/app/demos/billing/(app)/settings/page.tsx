"use client";
import { copy } from "./page.content";
import { DEMO_RELATIVE_TIME_LOCALE } from "../../../_components/demo-locale";

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
} from "@hulianui/ui";
import { Pencil, ShieldAlert } from "lucide-react";
import { account } from "../../_data/account";
import { planById, formatMoney } from "../../_data/plans";
import { useBilling } from "../../_lib/billing-store";

const team = [
  { name: copy("shenYanzhi"), role: copy("owner"), email: "shen.yz@hanyun.io", active: "2026-06-05T08:12:00+08:00", avatar: copy("sink") },
  { name: copy("luHeng"), role: copy("administrator"), email: "lu.h@hanyun.io", active: "2026-06-04T19:40:00+08:00", avatar: copy("land") },
  { name: copy("zhouNan"), role: copy("member"), email: "zhou.n@hanyun.io", active: "2026-06-03T11:05:00+08:00", avatar: copy("week") },
  { name: copy("hanXu"), role: copy("member2"), email: "han.x@hanyun.io", active: "2026-05-28T14:22:00+08:00", avatar: copy("korea") },
  { name: copy("xuQing"), role: copy("readOnly"), email: "xu.q@hanyun.io", active: "2026-05-12T09:00:00+08:00", avatar: copy("xu") },
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
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{copy("accountSettings")}</h1>
        <p className="mt-1 text-sm text-muted">{copy("manageYourProfileTeamsAndNotificationPreferences")}</p>
      </div>

      {/* 个人资料 + 工作状态（EmojiPicker）*/}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{copy("personalData")}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Avatar size="lg" fallback={account.avatar} />
            {/* 工作状态表情：点击右下角小气泡用 EmojiPicker 改 */}
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    aria-label={copy("setWorkingStatusEmoticon")}
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
                    toast({ title: copy("jobStatusUpdatedToValue", e), tone: "info" });
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-foreground">{account.name}</span>
              <Tag tone="brand" size="sm">{copy("owner2")}</Tag>
            </div>
            <p className="text-sm text-muted">{account.email} · {account.company}</p>
          </div>
        </div>

        <Divider className="my-5" />

        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="text-sm text-muted">{copy("currentStatus", status)}</span>
          <Field label="">
            <Input
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              suffix={<Pencil className="size-3.5 text-muted" />}
              placeholder={copy("saySomething")}
            />
          </Field>
        </div>
      </section>

      {/* 团队成员 */}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{copy("teamMember")}</h2>
          <span className="text-xs text-muted">{copy("seatsAlreadyUsed", team.length, seats)}</span>
        </div>
        <ul className="divide-y divide-border">
          {team.map((m) => (
            <li key={m.email} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar size="sm" fallback={m.avatar} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                <p className="truncate text-xs text-muted">{m.email}</p>
              </div>
              <span className="hidden text-xs text-muted sm:block">{copy("activeIn")}<RelativeTime value={m.active} locale={DEMO_RELATIVE_TIME_LOCALE} />
              </span>
              <Tag tone={m.role === "拥有者" ? "brand" : "neutral"} size="sm">{m.role}</Tag>
            </li>
          ))}
        </ul>
      </section>

      {/* 通知偏好 */}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{copy("billNotification")}</h2>
        <div className="flex flex-col gap-4">
          {[
            { key: "invoice", label: copy("depositsAndDeductions"), desc: copy("emailNotificationForEachSuccessfulFailedDeduction") },
            { key: "usage", label: copy("usageWarning"), desc: copy("alertWhenResourceUsageReaches") },
            { key: "product", label: copy("productNews"), desc: copy("newFeaturesAndPromotions") },
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
        <h2 className="mb-3 text-sm font-semibold text-foreground">{copy("subscriptionStatus")}</h2>
        <p className="text-sm text-muted">
          {copy("subscriptionSummary", plan.name, cycle === "yearly" ? copy("annualPayment") : copy("monthlyPayment"), seats, formatMoney(monthlyTotal))}
        </p>
        <Banner
          tone="warning"
          variant="soft"
          icon={<ShieldAlert />}
          align="start"
          className="mt-4"
          action={
            <Button size="sm" variant="outline" onClick={() => toast({ title: copy("recordedAndCanBeRestoredAtAny"), tone: "neutral" })}>{copy("unsubscribe")}</Button>
          }
        >{copy("afterCancellationTheServiceWillContinueUntil")}</Banner>
      </section>
    </div>
  );
}
