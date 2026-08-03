"use client";
import { copy } from "./page.content";

import {
  ChoiceboxGroup,
  Choicebox,
  ButtonGroup,
  Button,
  Tag,
  Banner,
  Divider,
  toast,
} from "@hulianui/ui";
import { Zap, Rocket, Gauge, Building2, Minus, Plus, Info } from "lucide-react";
import { plans, addons, planById, addonById, unitPrice, formatMoney } from "../../_data/plans";
import type { BillingCycle } from "../../_data/types";
import { useBilling } from "../../_lib/billing-store";

const planIcon: Record<string, React.ReactNode> = {
  starter: <Zap />,
  pro: <Rocket />,
  scale: <Gauge />,
  enterprise: <Building2 />,
};

function priceLabel(p: { monthly: number; yearly: number }, cycle: BillingCycle) {
  const u = unitPrice(p, cycle);
  if (u < 0) return copy("contactSales");
  if (u === 0) return copy("free");
  return copy("valueSeatMonth", formatMoney(u));
}

export default function PlansPage() {
  const { planId, cycle, seats, addons: chosenAddons, monthlyTotal, annualTotal, setPlan, setCycle, setSeats, toggleAddon } = useBilling();
  const plan = planById[planId];
  const paid = plan.monthly > 0;
  const saving = paid ? (plan.monthly - plan.yearly) * seats * 12 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{copy("chooseTheRightPackage")}</h1>
          <p className="mt-1 text-sm text-muted">{copy("youCanBeUpgradedOrDowngradedAt")}</p>
        </div>
        {/* 计费周期切换（ButtonGroup 连排）*/}
        <div className="flex items-center gap-3">
          <ButtonGroup aria-label={copy("billingCycle")}>
            <Button variant={cycle === "monthly" ? "solid" : "outline"} onClick={() => setCycle("monthly")}>{copy("payMonthly")}</Button>
            <Button variant={cycle === "yearly" ? "solid" : "outline"} onClick={() => setCycle("yearly")}>{copy("payAnnually")}</Button>
          </ButtonGroup>
          <Tag tone="success" variant="soft" size="sm">{copy("saveMonthsWithAnnualPayment")}</Tag>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        {/* 左：套餐 + 席位 + 增值项 */}
        <div className="flex flex-col gap-6">
          <ChoiceboxGroup
            value={planId}
            onValueChange={(v) => setPlan(v as string)}
            columns={2}
            aria-label={copy("subscriptionPackage")}
          >
            {plans.map((p) => (
              <Choicebox
                key={p.id}
                value={p.id}
                icon={planIcon[p.id]}
                title={
                  <span className="flex items-center gap-2">
                    {p.name}
                    {p.featured && <Tag tone="brand" size="sm">{copy("recommended")}</Tag>}
                  </span>
                }
                description={p.tagline}
              >
                <div className="mt-2 flex flex-col gap-1.5">
                  <span className="text-base font-semibold tabular-nums text-foreground">{priceLabel(p, cycle)}</span>
                  <span className="text-xs text-muted">
                    {p.seats === 1 ? copy("includesOneSeat") : p.seats > 1 ? copy("includesValueSeats", p.seats) : copy("seatCustomization")} · {copy("featureCount", p.features.length)}
                  </span>
                </div>
              </Choicebox>
            ))}
          </ChoiceboxGroup>

          {/* 席位（ButtonGroup 步进器）*/}
          {paid && (
            <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{copy("teamSeats")}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {copy("seatPricingSummary", plan.name, plan.seats, Math.max(0, seats - plan.seats), formatMoney(unitPrice(plan, cycle)))}
                  </p>
                </div>
                <ButtonGroup aria-label={copy("numberOfSeats")}>
                  <Button variant="outline" size="icon" aria-label={copy("reduceSeats")} disabled={seats <= 1} onClick={() => setSeats(seats - 1)}>
                    <Minus className="size-4" />
                  </Button>
                  <Button variant="outline" className="pointer-events-none min-w-16 tabular-nums">{copy("valueSeats", seats)}</Button>
                  <Button variant="outline" size="icon" aria-label={copy("addSeats")} onClick={() => setSeats(seats + 1)}>
                    <Plus className="size-4" />
                  </Button>
                </ButtonGroup>
              </div>
            </section>
          )}

          {/* 增值项（Choicebox 多选）*/}
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <h2 className="mb-1 text-sm font-semibold text-foreground">{copy("valueAddedItems")}</h2>
            <p className="mb-4 text-xs text-muted">{copy("stackOnDemandAndCanBeCanceled")}</p>
            <ChoiceboxGroup
              multiple
              value={chosenAddons}
              onValueChange={(v) => {
                // 受控多选：与 store 现态比对，把差异项 toggle 回 store。
                const next = v as string[];
                addons.forEach((a) => {
                  const has = next.includes(a.id);
                  if (has !== chosenAddons.includes(a.id)) toggleAddon(a.id);
                });
              }}
              columns={2}
              aria-label={copy("valueAddedItems2")}
            >
              {addons.map((a) => (
                <Choicebox key={a.id} value={a.id} title={a.name} description={a.desc}>
                  <div className="mt-1.5 text-sm font-medium tabular-nums text-foreground">
                    +{formatMoney(unitPrice(a, cycle))}<span className="text-xs font-normal text-muted">{copy("month")}</span>
                  </div>
                </Choicebox>
              ))}
            </ChoiceboxGroup>
          </section>
        </div>

        {/* 右：账单摘要（sticky）*/}
        <aside className="lg:sticky lg:top-24">
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">{copy("billSummary")}</h2>
            <dl className="mt-4 flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{plan.name} × {paid ? copy("valueSeats", seats) : "—"}</dt>
                <dd className="tabular-nums text-foreground">{paid ? formatMoney(unitPrice(plan, cycle) * seats) : (plan.monthly === 0 ? formatMoney(0) : copy("negotiable"))}</dd>
              </div>
              {chosenAddons.map((id) => (
                <div key={id} className="flex justify-between">
                  <dt className="text-muted">{addonById[id].name}</dt>
                  <dd className="tabular-nums text-foreground">{formatMoney(unitPrice(addonById[id], cycle))}</dd>
                </div>
              ))}
            </dl>
            <Divider className="my-4" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">{copy("monthlyTotal")}</span>
              <span className="text-2xl font-semibold tabular-nums text-foreground">{formatMoney(monthlyTotal)}</span>
            </div>
            {cycle === "yearly" && (
              <p className="mt-1 text-right text-xs text-muted">{copy("oneTimeAnnualPayment", formatMoney(annualTotal))}</p>
            )}
            {cycle === "yearly" && saving > 0 && (
              <Banner tone="success" variant="soft" align="start" icon={<Info />} className="mt-4">{copy("saveMoneyComparedToMonthlyPaymentFor", formatMoney(saving))}
              </Banner>
            )}
            <Button
              className="mt-4 w-full"
              disabled={!paid && plan.monthly < 0}
              onClick={() =>
                toast({
                  title: plan.monthly < 0 ? copy("inquiryHasBeenSubmittedSalesWillContact") : copy("switchedToValueValueValueMonth", plan.name, cycle === "yearly" ? copy("annualPayment") : copy("monthlyPayment"), formatMoney(monthlyTotal)),
                  tone: "success",
                })
              }
            >
              {plan.monthly < 0 ? copy("contactSales2") : copy("confirmChanges")}
            </Button>
            <p className="mt-2 text-center text-xs text-muted">{copy("demoEnvironmentNoRealDeductionsWillBe")}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
