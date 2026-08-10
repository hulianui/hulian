"use client";
import { copy } from "./page.content";

import { useMemo, useState } from "react";
import { Coins, Download, KeyRound, Wallet } from "lucide-react";
import {
  AreaChart,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  Choicebox,
  ChoiceboxGroup,
  Divider,
  Meter,
  NumberField,
  Table,
  Tag,
  toast,
  type ColumnDef,
} from "@hulianui/ui";
import { account, billingRows, usageTrend } from "../../_data/usage";
import { formatUsd, topupFee } from "../../_lib/pricing";

const PRESETS = [
  { value: "50", amount: 50, desc: copy("suitableForIndividualDevelopersToStart") },
  { value: "200", amount: 200, desc: copy("teamDailyCalls") },
  { value: "500", amount: 500, desc: copy("mediumVolumeProductionEnvironment"), badge: copy("popular") },
  { value: "1000", amount: 1000, desc: copy("highConcurrencyMultipleProjects") },
];

interface BillingRow {
  date: string;
  requests: number;
  tokens: number;
  costUsd: number;
}

export default function BillingPage() {
  const [preset, setPreset] = useState("200");
  const [custom, setCustom] = useState<number | null>(null);

  // 自定义金额优先；否则取档位。
  const amount = custom != null && custom > 0 ? custom : Number(preset);
  const fee = useMemo(() => topupFee(amount), [amount]);
  const credited = amount; // 到账额度（手续费另计）

  const usedPct = Math.round((account.monthlyUsedUsd / account.monthlyQuotaUsd) * 100);

  const columns = useMemo<ColumnDef<BillingRow, any>[]>(
    () => [
      { accessorKey: "date", header: copy("date"), cell: ({ row }) => <span className="tabular-nums">{row.original.date}</span> },
      {
        accessorKey: "requests",
        header: copy("numberOfRequests"),
        cell: ({ row }) => <span className="tabular-nums">{row.original.requests.toLocaleString()}</span>,
      },
      {
        accessorKey: "tokens",
        header: "Tokens",
        cell: ({ row }) => (
          <span className="tabular-nums">{(row.original.tokens / 1_000_000).toFixed(1)}M</span>
        ),
      },
      {
        accessorKey: "costUsd",
        header: copy("cost"),
        cell: ({ row }) => (
          <span className="tabular-nums font-medium text-foreground">{formatUsd(row.original.costUsd)}</span>
        ),
      },
    ],
    [],
  );

  function handleTopup() {
    toast({
      title: copy("rechargeSuccessfulArrivalValue", formatUsd(credited)),
      description: copy("includingHandlingFeeValueActualPaymentValue", formatUsd(fee), formatUsd(credited + fee)),
      tone: "success",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{copy("billedRecharge")}</h1>
        <p className="text-sm text-muted-foreground">{copy("balanceManagementQuotaRechargeUsageQuotaBill")}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* 余额卡 + 消费走势 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Wallet className="size-4 text-muted-foreground" />{copy("accountBalance")}</span>
            <span className="text-xs text-muted-foreground">{copy("expectedToBeAvailable")}{account.estimatedDays}{copy("day")}</span>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                {formatUsd(account.balanceUsd)}
              </span>
              <span className="pb-1 text-xs text-muted-foreground">{copy("availableBalance")}</span>
            </div>
            <AreaChart
              data={usageTrend}
              xKey="date"
              series={[{ key: "costUsd", label: copy("dailyConsumption") }]}
              height={180}
            />
          </CardBody>
        </Card>

        {/* 用量配额 */}
        <Card>
          <CardHeader className="font-medium text-foreground">{copy("thisMonthSUsageQuota")}</CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Meter
              value={account.monthlyUsedUsd}
              max={account.monthlyQuotaUsd}
              label={copy("usedCredit")}
              showValue
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{copy("usedTotal")}</span>
              <span className="tabular-nums text-foreground">
                {formatUsd(account.monthlyUsedUsd)} / {formatUsd(account.monthlyQuotaUsd)}
              </span>
            </div>
            <Divider />
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{copy("currentGear")}</span>
                <Tag tone="brand" size="sm">{copy("payAsYouGo")}</Tag>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{copy("speedLimit")}</span>
                <span className="tabular-nums text-foreground">5,000 req/min</span>
              </div>
              <div className="text-xs text-muted-foreground">{copy("theFreePlanIsReqMinReq")}</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {usedPct >= 60 && (
        <Banner tone="info">{copy("thisMonthSQuotaHasBeenUsed")}{usedPct}{copy("youCanRechargeInAdvanceOrUpgrade")}</Banner>
      )}

      {/* 充值区 */}
      <Card>
        <CardHeader className="flex items-center gap-2 font-medium text-foreground">
          <Coins className="size-4 text-muted-foreground" />{copy("accountRecharge")}</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <ChoiceboxGroup
            value={preset}
            onValueChange={(v) => {
              setPreset(v as string);
              setCustom(null);
            }}
            columns={4}
            aria-label={copy("rechargeAmountLevel")}
          >
            {PRESETS.map((p) => (
              <Choicebox
                key={p.value}
                value={p.value}
                title={<span className="tabular-nums">${p.amount}</span>}
                description={p.desc}
              >
                {p.badge && (
                  <Tag tone="brand" size="sm" className="mt-1">
                    {p.badge}
                  </Tag>
                )}
              </Choicebox>
            ))}
          </ChoiceboxGroup>

          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">{copy("customAmount")}</span>
              <NumberField
                value={custom}
                onValueChange={setCustom}
                min={5}
                max={100000}
                step={10}
                aria-label={copy("customizedRechargeAmount")}
                className="w-40"
              />
            </label>
            <div className="flex-1 rounded-[var(--radius)] border border-border bg-surface px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{copy("creditLimit")}</span>
                <span className="tabular-nums text-foreground">{formatUsd(credited)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{copy("handlingFeeStartingAt")}</span>
                <span className="tabular-nums text-foreground">{formatUsd(fee)}</span>
              </div>
              <Divider className="my-2" />
              <div className="flex items-center justify-between font-medium">
                <span className="text-foreground">{copy("totalActualPayment")}</span>
                <span className="tabular-nums text-foreground">{formatUsd(credited + fee)}</span>
              </div>
            </div>
            <Button onClick={handleTopup} className="shrink-0">{copy("rechargeNow")}</Button>
          </div>
        </CardBody>
      </Card>

      {/* 账单明细 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">{copy("billDetailsLastDays")}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast({ title: copy("billExporting"), description: copy("csvWillBeSentToAccountEmail"), tone: "info" })}
          >
            <Download className="size-4" />{copy("export")}</Button>
        </CardHeader>
        <CardBody className="p-0">
          <Table
            columns={columns}
            data={billingRows as BillingRow[]}
            enableSorting
            density="middle"
            getRowId={(r) => r.date}
          />
        </CardBody>
      </Card>

      {/* BYOK */}
      <Card>
        <CardHeader className="flex items-center gap-2 font-medium text-foreground">
          <KeyRound className="size-4 text-muted-foreground" />{copy("byokBringYourOwnUpstreamKey")}</CardHeader>
        <CardBody className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>{copy("bindYourOwnUpstreamVendorApiKey")}<span className="font-medium text-foreground">{copy("noMarkUpRatio")}</span>{copy("directPassThroughOnlyReceive")}<span className="font-medium text-foreground">{copy("handlingFee")}</span>{copy("usedForRoutingAndAccounting")}</p>
          <div className="flex flex-wrap gap-2">
            <Tag tone="success" size="sm">{copy("freeOfMagnification")}</Tag>
            <Tag tone="neutral" size="sm">{copy("handlingFee2")}</Tag>
            <Tag tone="neutral" size="sm">{copy("usageIsIncludedInTheBill")}</Tag>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
