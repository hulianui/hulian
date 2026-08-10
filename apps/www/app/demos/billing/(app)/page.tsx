"use client";
import { copy } from "./page.content";
import { DEMO_RELATIVE_TIME_LOCALE, demoLocationHref } from "../../_components/demo-locale";

import Link from "next/link";
import {
  Banner,
  Stat,
  Progress,
  AreaChart,
  CreditCard,
  RelativeTime,
  Glimpse,
  Tag,
  Button,
  ButtonGroup,
} from "@hulianui/ui";
import { Sparkles, Users, CalendarClock, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { account, usage } from "../_data/account";
import { planById, formatMoney } from "../_data/plans";
import { invoices, spendSeries, invoiceStatusMeta } from "../_data/invoices";
import { BILLING_BASE } from "../_components/nav-config";
import { useBilling } from "../_lib/billing-store";

function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={["rounded-[var(--radius-lg)] border border-border bg-surface p-5", className]
        .filter(Boolean)
        .join(" ")}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export default function OverviewPage() {
  const {
    planId,
    cycle,
    seats,
    monthlyTotal,
    methods,
    defaultMethodId,
    promoDismissed,
    dismissPromo,
    setCycle,
  } = useBilling();
  const plan = planById[planId];
  const defaultCard =
    methods.find((m) => m.id === defaultMethodId && m.type === "card") ??
    methods.find((m) => m.type === "card");
  const monthAmount = spendSeries[spendSeries.length - 1]?.amount ?? 0;
  const prevAmount = spendSeries[spendSeries.length - 2]?.amount ?? 0;
  const delta = prevAmount ? Math.round(((monthAmount - prevAmount) / prevAmount) * 100) : 0;
  const recent = invoices.slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      {/* 促销公告条（年付未启用时提示，可关闭）*/}
      {!promoDismissed && cycle === "monthly" && (
        <Banner
          variant="solid"
          tone="brand"
          icon={<Sparkles />}
          onClose={dismissPromo}
          action={
            <button
              onClick={() => setCycle("yearly")}
              className="whitespace-nowrap rounded-[var(--radius)] bg-white/20 px-2.5 py-1 text-xs font-medium hover:bg-white/30"
            >
              {copy("switchToAnnualPayment")}
            </button>
          }
        >
          {copy(
            "switchToAnnualAndSaveMonthsSame",
            formatMoney((plan.monthly - plan.yearly) * seats * 12),
          )}
        </Banner>
      )}

      {/* 问候 */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {copy("goodAfternoon", account.name)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy("lastLogin")}
            <RelativeTime
              value={account.lastLogin}
              locale={DEMO_RELATIVE_TIME_LOCALE}
              className="text-foreground"
            />
            {copy("accountSince")}{" "}
            <RelativeTime
              value={account.memberSince}
              locale={DEMO_RELATIVE_TIME_LOCALE}
              className="text-foreground"
            />
            {copy("letSGoTogether")}
          </p>
        </div>
        <ButtonGroup aria-label={copy("quickOperation")}>
          <Button variant="outline" render={<Link href={`${BILLING_BASE}/plans`} />}>
            {copy("upgradePackage")}
          </Button>
          <Button variant="outline" render={<Link href={`${BILLING_BASE}/invoices`} />}>
            {copy("downloadInvoice")}
          </Button>
        </ButtonGroup>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label={copy("consumptionThisMonth")}
          value={formatMoney(monthAmount)}
          delta={delta}
          deltaLabel={copy("comparedWithLastMonth")}
          icon={<TrendingUp className="size-4" />}
        />
        <Stat
          label={copy("currentMonthlyFee")}
          value={formatMoney(monthlyTotal)}
          icon={<Wallet className="size-4" />}
        />
        <Stat
          label={copy("teamSeats")}
          value={copy("valueSeats", seats)}
          icon={<Users className="size-4" />}
        />
        <Stat
          label={copy("nextRenewal")}
          value={
            <RelativeTime value="2026-07-01T00:00:00+08:00" locale={DEMO_RELATIVE_TIME_LOCALE} />
          }
          icon={<CalendarClock className="size-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 消费走势 */}
        <Panel
          title={copy("consumptionInThePastMonths")}
          className="lg:col-span-2"
          action={
            <Tag tone="brand" size="sm">
              {plan.name} · {cycle === "yearly" ? copy("annualPayment") : copy("monthlyPayment")}
            </Tag>
          }
        >
          <AreaChart
            data={spendSeries}
            series={[{ key: "amount", label: copy("consumptionYuan") }]}
            xKey="month"
            height={240}
          />
        </Panel>

        {/* 默认支付方式 */}
        <Panel
          title={copy("defaultPaymentMethod")}
          action={
            <Link href={`${BILLING_BASE}/payment`} className="text-xs text-primary hover:underline">
              {copy("management")}
            </Link>
          }
        >
          {defaultCard ? (
            <div className="flex flex-col items-center gap-3">
              <CreditCard
                number={defaultCard.number ?? ""}
                holder={defaultCard.holder}
                expiry={defaultCard.expiry}
                brand={defaultCard.brand}
                className="w-full max-w-[19rem]"
              />
              <p className="text-xs text-muted-foreground">
                {copy("willBeRenewedOnTheRenewalDate")}
                <RelativeTime
                  value="2026-07-01T00:00:00+08:00"
                  locale={DEMO_RELATIVE_TIME_LOCALE}
                />
                {copy("automaticDeduction")}
              </p>
            </div>
          ) : null}
        </Panel>
      </div>

      {/* 资源用量 */}
      <Panel title={copy("resourceUsage")}>
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {usage.map((u) => {
            const pct = Math.round((u.used / u.quota) * 100);
            const near = pct >= 90;
            return (
              <div key={u.key}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{u.label}</span>
                  <span className="tabular-nums text-foreground">
                    {u.used.toLocaleString("zh-CN")}
                    <span className="text-muted-foreground">
                      {" "}
                      / {u.quota.toLocaleString("zh-CN")} {u.unit}
                    </span>
                  </span>
                </div>
                <Progress value={pct} tone={near ? "warning" : "primary"} />
              </div>
            );
          })}
        </div>
      </Panel>

      {/* 近期账单（Glimpse 悬停预览 + RelativeTime）*/}
      <Panel
        title={copy("recentBills")}
        action={
          <Link
            href={`${BILLING_BASE}/invoices`}
            className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
          >
            {copy("all")}
            <ArrowRight className="size-3" />
          </Link>
        }
      >
        <ul className="divide-y divide-border">
          {recent.map((inv) => {
            const meta = invoiceStatusMeta[inv.status];
            return (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Glimpse
                    title={`${inv.id} · ${inv.plan}`}
                    description={copy(
                      "billingPeriodValueTotalValueDetailsTotaling",
                      inv.period,
                      inv.lines.length,
                      formatMoney(inv.amount),
                    )}
                    href={demoLocationHref(`${BILLING_BASE}/invoices`)}
                  >
                    {inv.id}
                  </Glimpse>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{inv.plan}</p>
                </div>
                <div className="flex items-center gap-4 whitespace-nowrap">
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    <RelativeTime value={inv.date} locale={DEMO_RELATIVE_TIME_LOCALE} />
                  </span>
                  <span className="w-20 text-right text-sm font-medium tabular-nums text-foreground">
                    {formatMoney(inv.amount)}
                  </span>
                  <Tag tone={meta.tone} size="sm">
                    {meta.label}
                  </Tag>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
