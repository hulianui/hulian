"use client";
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
  { value: "50", amount: 50, desc: "适合个人开发者起步" },
  { value: "200", amount: 200, desc: "团队日常调用" },
  { value: "500", amount: 500, desc: "中量生产环境", badge: "热门" },
  { value: "1000", amount: 1000, desc: "高并发 / 多项目" },
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
      { accessorKey: "date", header: "日期", cell: ({ row }) => <span className="tabular-nums">{row.original.date}</span> },
      {
        accessorKey: "requests",
        header: "请求数",
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
        header: "花费",
        cell: ({ row }) => (
          <span className="tabular-nums font-medium text-foreground">{formatUsd(row.original.costUsd)}</span>
        ),
      },
    ],
    [],
  );

  function handleTopup() {
    toast({
      title: `充值成功 · 到账 ${formatUsd(credited)}`,
      description: `含手续费 ${formatUsd(fee)}，实付 ${formatUsd(credited + fee)}`,
      tone: "success",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">计费充值</h1>
        <p className="text-sm text-muted">余额管理 · 额度充值 · 用量配额 · 账单明细</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* 余额卡 + 消费走势 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Wallet className="size-4 text-muted" />
              账户余额
            </span>
            <span className="text-xs text-muted">预计可用 {account.estimatedDays} 天</span>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold tabular-nums text-foreground">
                {formatUsd(account.balanceUsd)}
              </span>
              <span className="pb-1 text-xs text-muted">可用余额</span>
            </div>
            <AreaChart
              data={usageTrend}
              xKey="date"
              series={[{ key: "costUsd", label: "日消费 $" }]}
              height={180}
            />
          </CardBody>
        </Card>

        {/* 用量配额 */}
        <Card>
          <CardHeader className="font-medium text-foreground">本月用量配额</CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Meter
              value={account.monthlyUsedUsd}
              max={account.monthlyQuotaUsd}
              label="已用额度"
              showValue
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">已用 / 总额</span>
              <span className="tabular-nums text-foreground">
                {formatUsd(account.monthlyUsedUsd)} / {formatUsd(account.monthlyQuotaUsd)}
              </span>
            </div>
            <Divider />
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">当前档位</span>
                <Tag tone="brand" size="sm">按量计费</Tag>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">限速</span>
                <span className="tabular-nums text-foreground">5,000 req/min</span>
              </div>
              <div className="text-xs text-muted">
                免费档 20 req/min · 200 req/day；包月档解除限速并享 9 折。
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {usedPct >= 60 && (
        <Banner tone="info">
          本月额度已使用 {usedPct}%，可提前充值或升级包月档以避免触发限速。
        </Banner>
      )}

      {/* 充值区 */}
      <Card>
        <CardHeader className="flex items-center gap-2 font-medium text-foreground">
          <Coins className="size-4 text-muted" />
          账户充值
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <ChoiceboxGroup
            value={preset}
            onValueChange={(v) => {
              setPreset(v as string);
              setCustom(null);
            }}
            columns={4}
            aria-label="充值额度档位"
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
              <span className="text-sm text-muted">自定义金额（$）</span>
              <NumberField
                value={custom}
                onValueChange={setCustom}
                min={5}
                max={100000}
                step={10}
                aria-label="自定义充值金额"
                className="w-40"
              />
            </label>
            <div className="flex-1 rounded-[var(--radius)] border border-border bg-surface px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">到账额度</span>
                <span className="tabular-nums text-foreground">{formatUsd(credited)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">手续费（5.5%，$0.80 起）</span>
                <span className="tabular-nums text-foreground">{formatUsd(fee)}</span>
              </div>
              <Divider className="my-2" />
              <div className="flex items-center justify-between font-medium">
                <span className="text-foreground">实付合计</span>
                <span className="tabular-nums text-foreground">{formatUsd(credited + fee)}</span>
              </div>
            </div>
            <Button onClick={handleTopup} className="shrink-0">
              立即充值
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 账单明细 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">账单明细（近 7 日）</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast({ title: "账单导出中…", description: "CSV 将发送至账户邮箱", tone: "info" })}
          >
            <Download className="size-4" />
            导出
          </Button>
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
          <KeyRound className="size-4 text-muted" />
          BYOK · 自带上游密钥
        </CardHeader>
        <CardBody className="flex flex-col gap-2 text-sm text-muted">
          <p>
            绑定你自己的上游厂商 API Key（OpenAI / Anthropic / Google 等），网关
            <span className="font-medium text-foreground"> 免加价倍率</span>
            直接透传，仅收取
            <span className="font-medium text-foreground"> 5% 手续费</span>
            用于路由与计费。
          </p>
          <div className="flex flex-wrap gap-2">
            <Tag tone="success" size="sm">免倍率</Tag>
            <Tag tone="neutral" size="sm">5% 手续费</Tag>
            <Tag tone="neutral" size="sm">用量统一计入账单</Tag>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
