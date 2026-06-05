"use client";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Check, Layers, Plus, X } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  CodeBlock,
  Divider,
  Drawer,
  DrawerContent,
  PricingTable,
  Segmented,
  Tag,
} from "@hulian/ui";
import type { PricingColumn, PricingRow } from "@hulian/ui";
import { capabilityLabel, models, providerOf, providers } from "../../_data/providers";
import type { Capability, ModelMeta } from "../../_data/types";
import { formatPrice } from "../../_lib/pricing";

const CAP_KEYS: Capability[] = ["chat", "reason", "vision", "function", "longContext"];

// 价位段（按 input 单价 USD / 1M）。
const PRICE_BANDS = [
  { value: "all", label: "全部价位", test: () => true },
  { value: "low", label: "≤ $1", test: (m: ModelMeta) => m.inPrice <= 1 },
  { value: "mid", label: "$1–3", test: (m: ModelMeta) => m.inPrice > 1 && m.inPrice <= 3 },
  { value: "high", label: "> $3", test: (m: ModelMeta) => m.inPrice > 3 },
] as const;

function fmtContext(n: number): string {
  return n >= 1_000_000 ? `${n / 1_000_000}M` : `${Math.round(n / 1000)}K`;
}

// logo 方块。
function ProviderLogo({ providerId, size = 36 }: { providerId: string; size?: number }) {
  const p = providerOf(providerId);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[var(--radius)] font-semibold text-white"
      style={{ background: p.color, width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {p.glyph}
    </span>
  );
}

// 接入示例（curl）。
function curlSnippet(modelId: string): string {
  return [
    `curl https://api.hanhub.cn/v1/chat/completions \\`,
    `  -H "Authorization: Bearer $HANHUB_API_KEY" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{`,
    `    "model": "${modelId}",`,
    `    "messages": [{ "role": "user", "content": "你好，瀚枢！" }]`,
    `  }'`,
  ].join("\n");
}

function pythonSnippet(modelId: string): string {
  return [
    `from openai import OpenAI`,
    ``,
    `client = OpenAI(`,
    `    base_url="https://api.hanhub.cn/v1",`,
    `    api_key="$HANHUB_API_KEY",`,
    `)`,
    `resp = client.chat.completions.create(`,
    `    model="${modelId}",`,
    `    messages=[{"role": "user", "content": "你好，瀚枢！"}],`,
    `)`,
    `print(resp.choices[0].message.content)`,
  ].join("\n");
}

export default function ModelsPage() {
  const [provider, setProvider] = useState("all");
  const [band, setBand] = useState("all");
  const [caps, setCaps] = useState<Capability[]>([]);
  const [selected, setSelected] = useState<string[]>(["claude-opus-4-7", "deepseek-v4", "gpt-5.4"]);
  const [detail, setDetail] = useState<ModelMeta | null>(null);

  const toggleCap = (c: Capability) =>
    setCaps((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const filtered = useMemo(() => {
    const bandDef = PRICE_BANDS.find((b) => b.value === band) ?? PRICE_BANDS[0];
    return models.filter(
      (m) =>
        (provider === "all" || m.provider === provider) &&
        bandDef.test(m) &&
        caps.every((c) => m.capabilities.includes(c)),
    );
  }, [provider, band, caps]);

  // 对比矩阵：选中模型横排为列。性价比 = benchmark / (input+output 单价均值) 最优者标「推荐」。
  const compareModels = selected
    .map((id) => models.find((m) => m.id === id))
    .filter((m): m is ModelMeta => Boolean(m));

  const bestId = useMemo(() => {
    let best: { id: string; score: number } | null = null;
    for (const m of compareModels) {
      const score = m.benchmark / ((m.inPrice + m.outPrice) / 2 + 0.1);
      if (!best || score > best.score) best = { id: m.id, score };
    }
    return best?.id ?? null;
  }, [compareModels]);

  const columns: PricingColumn[] = compareModels.map((m) => ({
    key: m.id,
    title: m.name,
    highlight: m.id === bestId,
    badge: m.id === bestId ? "推荐" : undefined,
    header: (
      <div className="flex items-center gap-2">
        <ProviderLogo providerId={m.provider} size={28} />
        <div className="min-w-0 text-left">
          <div className="truncate text-sm font-semibold text-foreground">{m.name}</div>
          <div className="text-xs text-muted">{providerOf(m.provider).name}</div>
        </div>
      </div>
    ),
  }));

  const cell = (fn: (m: ModelMeta) => ReactNode): Record<string, ReactNode> =>
    Object.fromEntries(compareModels.map((m) => [m.id, fn(m)]));

  const rows: PricingRow[] = [
    { key: "in", label: "输入价 / 1M", values: cell((m) => <span className="tabular-nums">{formatPrice(m.inPrice)}</span>) },
    { key: "out", label: "输出价 / 1M", values: cell((m) => <span className="tabular-nums">{formatPrice(m.outPrice)}</span>) },
    { key: "ctx", label: "上下文窗口", values: cell((m) => <span className="tabular-nums">{fmtContext(m.context)}</span>) },
    { key: "max", label: "最大输出", values: cell((m) => <span className="tabular-nums">{fmtContext(m.maxOutput)}</span>) },
    { key: "rpm", label: "限速 RPM", values: cell((m) => <span className="tabular-nums">{m.rpm.toLocaleString()}</span>) },
    { key: "bench", label: "基准分", values: cell((m) => <span className="tabular-nums">{m.benchmark}</span>) },
    {
      key: "markup",
      label: "网关倍率",
      values: cell((m) => <span className="tabular-nums">×{m.markup.toFixed(2)}</span>),
    },
    ...CAP_KEYS.map((c) => ({
      key: `cap-${c}`,
      label: capabilityLabel[c],
      values: cell((m) =>
        m.capabilities.includes(c) ? (
          <Check className="mx-auto size-4 text-success" aria-label="支持" />
        ) : (
          <X className="mx-auto size-4 text-muted/50" aria-label="不支持" />
        ),
      ),
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">模型市场</h1>
        <p className="text-sm text-muted">{models.length} 款上游模型 · 一个 base_url 全部路由 · OpenAI 兼容协议</p>
      </div>

      {/* 筛选条 */}
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-16 shrink-0 text-sm text-muted">厂商</span>
            <Segmented
              size="sm"
              value={provider}
              onValueChange={setProvider}
              items={[
                { value: "all", label: "全部" },
                ...providers.map((p) => ({ value: p.id, label: p.name })),
              ]}
              aria-label="按厂商筛选"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-16 shrink-0 text-sm text-muted">价位</span>
            <Segmented
              size="sm"
              value={band}
              onValueChange={setBand}
              items={PRICE_BANDS.map((b) => ({ value: b.value, label: b.label }))}
              aria-label="按价位筛选"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 shrink-0 text-sm text-muted">能力</span>
            {CAP_KEYS.map((c) => {
              const on = caps.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCap(c)}
                  aria-pressed={on}
                  className="cursor-pointer rounded-full"
                >
                  <Chip variant={on ? "solid" : "outline"} tone={on ? "brand" : "neutral"} dot={on}>
                    {capabilityLabel[c]}
                  </Chip>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* 模型卡网格 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => {
          const inCompare = selected.includes(m.id);
          return (
            <Card key={m.id}>
              <CardHeader className="flex items-start gap-3">
                <ProviderLogo providerId={m.provider} />
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setDetail(m)}
                    className="truncate text-left text-sm font-semibold text-foreground hover:text-brand"
                  >
                    {m.name}
                  </button>
                  <div className="text-xs text-muted">{providerOf(m.provider).name}</div>
                </div>
                <Tag size="sm" tone="neutral">
                  {fmtContext(m.context)}
                </Tag>
              </CardHeader>
              <CardBody className="flex flex-col gap-2.5">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted">输入 </span>
                    <span className="font-medium tabular-nums text-foreground">{formatPrice(m.inPrice)}</span>
                  </div>
                  <div>
                    <span className="text-muted">输出 </span>
                    <span className="font-medium tabular-nums text-foreground">{formatPrice(m.outPrice)}</span>
                  </div>
                  <span className="text-xs text-muted">/ 1M tokens</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m.capabilities.map((c) => (
                    <Tag key={c} size="sm" variant="soft" tone="brand">
                      {capabilityLabel[c]}
                    </Tag>
                  ))}
                </div>
                <div className="text-xs text-muted">
                  基准分 <span className="font-medium tabular-nums text-foreground">{m.benchmark}</span> · 限速{" "}
                  <span className="tabular-nums">{m.rpm.toLocaleString()}</span> RPM
                </div>
              </CardBody>
              <CardFooter className="flex gap-2">
                <Button
                  size="sm"
                  variant={inCompare ? "solid" : "outline"}
                  onClick={() => toggleSelect(m.id)}
                >
                  {inCompare ? <Check className="size-4" /> : <Plus className="size-4" />}
                  {inCompare ? "已加入对比" : "加入对比"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDetail(m)}>
                  详情
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardBody className="py-10 text-center text-sm text-muted">没有符合当前筛选的模型，试试放宽条件。</CardBody>
          </Card>
        )}
      </div>

      {/* 定价对比矩阵 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium text-foreground">
            <Layers className="size-4" />
            定价对比矩阵
          </span>
          <span className="text-xs text-muted">已选 {compareModels.length} 款 · 「推荐」= 当前对比中性价比最优</span>
        </CardHeader>
        <CardBody>
          {compareModels.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">从上方模型卡点「加入对比」，在此横向对照定价与能力。</div>
          ) : (
            <PricingTable columns={columns} rows={rows} />
          )}
        </CardBody>
      </Card>

      {/* 模型详情 Drawer */}
      <Drawer open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        {detail && (
          <DrawerContent
            side="right"
            title={detail.name}
            description={`${providerOf(detail.provider).name} · 接入 https://api.hanhub.cn/v1`}
            className="w-[clamp(360px,42vw,560px)]"
            footer={
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    toggleSelect(detail.id);
                  }}
                >
                  {selected.includes(detail.id) ? "移出对比" : "加入对比"}
                </Button>
                <Button variant="ghost" onClick={() => setDetail(null)}>
                  关闭
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <ProviderLogo providerId={detail.provider} size={44} />
                <div>
                  <div className="text-base font-semibold text-foreground">{detail.name}</div>
                  <div className="text-xs text-muted">
                    上下文 {fmtContext(detail.context)} · 最大输出 {fmtContext(detail.maxOutput)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
                  <div className="text-xs text-muted">输入价 / 1M</div>
                  <div className="font-medium tabular-nums text-foreground">{formatPrice(detail.inPrice)}</div>
                </div>
                <div className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
                  <div className="text-xs text-muted">输出价 / 1M</div>
                  <div className="font-medium tabular-nums text-foreground">{formatPrice(detail.outPrice)}</div>
                </div>
                <div className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
                  <div className="text-xs text-muted">限速</div>
                  <div className="font-medium tabular-nums text-foreground">{detail.rpm.toLocaleString()} RPM</div>
                </div>
                <div className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
                  <div className="text-xs text-muted">网关倍率 / 基准分</div>
                  <div className="font-medium tabular-nums text-foreground">
                    ×{detail.markup.toFixed(2)} · {detail.benchmark}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-sm font-medium text-foreground">能力</div>
                <div className="flex flex-wrap gap-1.5">
                  {detail.capabilities.map((c) => (
                    <Tag key={c} size="sm" variant="soft" tone="brand">
                      {capabilityLabel[c]}
                    </Tag>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted">
                计费说明：按 token 用量计价，最终费用 =（输入 token × 输入价 + 输出 token × 输出价）÷ 1M ×{" "}
                <span className="tabular-nums text-foreground">{detail.markup.toFixed(2)}</span> 网关倍率。
              </div>

              <Divider />

              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-foreground">接入示例 · cURL</div>
                <CodeBlock code={curlSnippet(detail.id)} lang="bash" />
                <div className="mt-1 text-sm font-medium text-foreground">接入示例 · Python</div>
                <CodeBlock code={pythonSnippet(detail.id)} lang="python" />
              </div>
            </div>
          </DrawerContent>
        )}
      </Drawer>
    </div>
  );
}
