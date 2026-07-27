"use client";
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
  if (u < 0) return "联系销售";
  if (u === 0) return "免费";
  return `${formatMoney(u)} / 席 / 月`;
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
          <h1 className="text-xl font-semibold tracking-tight text-foreground">选择适合的套餐</h1>
          <p className="mt-1 text-sm text-muted">随时升降级，按比例多退少补，变更即时生效。</p>
        </div>
        {/* 计费周期切换（ButtonGroup 连排）*/}
        <div className="flex items-center gap-3">
          <ButtonGroup aria-label="计费周期">
            <Button variant={cycle === "monthly" ? "solid" : "outline"} onClick={() => setCycle("monthly")}>
              按月付
            </Button>
            <Button variant={cycle === "yearly" ? "solid" : "outline"} onClick={() => setCycle("yearly")}>
              按年付
            </Button>
          </ButtonGroup>
          <Tag tone="success" variant="soft" size="sm">年付省 2 个月</Tag>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        {/* 左：套餐 + 席位 + 增值项 */}
        <div className="flex flex-col gap-6">
          <ChoiceboxGroup
            value={planId}
            onValueChange={(v) => setPlan(v as string)}
            columns={2}
            aria-label="订阅套餐"
          >
            {plans.map((p) => (
              <Choicebox
                key={p.id}
                value={p.id}
                icon={planIcon[p.id]}
                title={
                  <span className="flex items-center gap-2">
                    {p.name}
                    {p.featured && <Tag tone="brand" size="sm">推荐</Tag>}
                  </span>
                }
                description={p.tagline}
              >
                <div className="mt-2 flex flex-col gap-1.5">
                  <span className="text-base font-semibold tabular-nums text-foreground">{priceLabel(p, cycle)}</span>
                  <span className="text-xs text-muted">{p.seats > 0 ? `含 ${p.seats} 席` : "席位定制"} · {p.features.length} 项能力</span>
                </div>
              </Choicebox>
            ))}
          </ChoiceboxGroup>

          {/* 席位（ButtonGroup 步进器）*/}
          {paid && (
            <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">团队席位</h2>
                  <p className="mt-1 text-xs text-muted">
                    {plan.name}含 {plan.seats} 席，超出 {Math.max(0, seats - plan.seats)} 席按 {formatMoney(unitPrice(plan, cycle))}/席/月计费。
                  </p>
                </div>
                <ButtonGroup aria-label="席位数量">
                  <Button variant="outline" size="icon" aria-label="减少席位" disabled={seats <= 1} onClick={() => setSeats(seats - 1)}>
                    <Minus className="size-4" />
                  </Button>
                  <Button variant="outline" className="pointer-events-none min-w-16 tabular-nums">{seats} 席</Button>
                  <Button variant="outline" size="icon" aria-label="增加席位" onClick={() => setSeats(seats + 1)}>
                    <Plus className="size-4" />
                  </Button>
                </ButtonGroup>
              </div>
            </section>
          )}

          {/* 增值项（Choicebox 多选）*/}
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <h2 className="mb-1 text-sm font-semibold text-foreground">增值项</h2>
            <p className="mb-4 text-xs text-muted">按需叠加，可随时取消。</p>
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
              aria-label="增值项"
            >
              {addons.map((a) => (
                <Choicebox key={a.id} value={a.id} title={a.name} description={a.desc}>
                  <div className="mt-1.5 text-sm font-medium tabular-nums text-foreground">
                    +{formatMoney(unitPrice(a, cycle))}<span className="text-xs font-normal text-muted"> / 月</span>
                  </div>
                </Choicebox>
              ))}
            </ChoiceboxGroup>
          </section>
        </div>

        {/* 右：账单摘要（sticky）*/}
        <aside className="lg:sticky lg:top-24">
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">账单摘要</h2>
            <dl className="mt-4 flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{plan.name} × {paid ? `${seats} 席` : "—"}</dt>
                <dd className="tabular-nums text-foreground">{paid ? formatMoney(unitPrice(plan, cycle) * seats) : (plan.monthly === 0 ? formatMoney(0) : "面议")}</dd>
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
              <span className="text-sm text-muted">月度合计</span>
              <span className="text-2xl font-semibold tabular-nums text-foreground">{formatMoney(monthlyTotal)}</span>
            </div>
            {cycle === "yearly" && (
              <p className="mt-1 text-right text-xs text-muted">年付一次性 {formatMoney(annualTotal)}</p>
            )}
            {cycle === "yearly" && saving > 0 && (
              <Banner tone="success" variant="soft" align="start" icon={<Info />} className="mt-4">
                相比月付一年省 {formatMoney(saving)}
              </Banner>
            )}
            <Button
              className="mt-4 w-full"
              disabled={!paid && plan.monthly < 0}
              onClick={() =>
                toast({
                  title: plan.monthly < 0 ? "已提交咨询，销售将联系您" : `已切换到${plan.name}（${cycle === "yearly" ? "年付" : "月付"}），${formatMoney(monthlyTotal)}/月`,
                  tone: "success",
                })
              }
            >
              {plan.monthly < 0 ? "联系销售" : "确认变更"}
            </Button>
            <p className="mt-2 text-center text-xs text-muted">演示环境，不会真实扣款</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
