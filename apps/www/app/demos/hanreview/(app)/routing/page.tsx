"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Card,
  CardBody,
  CardHeader,
  Flow,
  List,
  ListItem,
  Meter,
  Segmented,
  Tag,
  type FlowApi,
  type FlowEdge,
  type FlowHandleSpec,
  type FlowNode,
} from "@hulian/ui";
import { MODELS } from "../../_data/models";
import { ROUTING_RULES } from "../../_data/rules";
import { REVIEWS } from "../../_data/reviews";
import { MODEL_USAGE } from "../../_data/metrics";
import { routeFile } from "../../_lib/routing";
import type { ReviewModel } from "../../_data/types";

// ── 查找表 ───────────────────────────────────────────────────
const modelById = (id: string): ReviewModel | undefined => MODELS.find((m) => m.id === id);
const modelName = (id: string) => modelById(id)?.name ?? id;

// tier → Tag 语气。
const tierTone: Record<ReviewModel["tier"], "neutral" | "brand" | "success" | "warning" | "danger"> = {
  economy: "success",
  balanced: "brand",
  frontier: "warning",
};
const tierLabel: Record<ReviewModel["tier"], string> = {
  economy: "经济",
  balanced: "均衡",
  frontier: "旗舰",
};

// 模型本月调用占比（喂 Meter）。
const totalCalls = MODEL_USAGE.reduce((s, u) => s + u.calls, 0);
const callsOf = (id: string) => MODEL_USAGE.find((u) => u.modelId === id)?.calls ?? 0;

// 估算每文件行数：优先 lines，否则 additions+deletions。
function fileLines(f: { lines?: number; additions: number; deletions: number }): number {
  return f.lines ?? f.additions + f.deletions;
}

// ── 分发流向：构造静态 nodes / edges ─────────────────────────
type FlowKind = "fileType" | "router" | "model";
interface NodeData {
  kind: FlowKind;
  title: string;
  subtitle?: string;
  tier?: ReviewModel["tier"];
}

// 左列：文件类型；中：路由器；右：三个目标模型。
const INITIAL_NODES: FlowNode<NodeData>[] = [
  { id: "ft-test", position: { x: 24, y: 24 }, width: 168, data: { kind: "fileType", title: "测试 / 配置", subtitle: "isTestOrConfig" } },
  { id: "ft-src", position: { x: 24, y: 120 }, width: 168, data: { kind: "fileType", title: "普通源码", subtitle: "默认业务代码" } },
  { id: "ft-large", position: { x: 24, y: 216 }, width: 168, data: { kind: "fileType", title: "大文件", subtitle: "lines > 300" } },
  { id: "ft-sec", position: { x: 24, y: 312 }, width: 168, data: { kind: "fileType", title: "安全敏感", subtitle: "鉴权 / 支付 / 密钥" } },
  { id: "router", position: { x: 296, y: 156 }, width: 176, data: { kind: "router", title: "智能路由器", subtitle: "按特征命中规则" } },
  { id: "m-haiku", position: { x: 576, y: 48 }, width: 184, data: { kind: "model", title: modelName("haiku"), subtitle: "经济兜底", tier: "economy" } },
  { id: "m-sonnet", position: { x: 576, y: 156 }, width: 184, data: { kind: "model", title: modelName("sonnet"), subtitle: "均衡主力", tier: "balanced" } },
  { id: "m-opus", position: { x: 576, y: 264 }, width: 184, data: { kind: "model", title: modelName("opus"), subtitle: "安全审计", tier: "frontier" } },
];

const INITIAL_EDGES: FlowEdge[] = [
  // 文件类型 → 路由器
  { id: "e-test-r", source: "ft-test", target: "router" },
  { id: "e-src-r", source: "ft-src", target: "router" },
  { id: "e-large-r", source: "ft-large", target: "router" },
  { id: "e-sec-r", source: "ft-sec", target: "router" },
  // 路由器 → 模型
  { id: "e-r-haiku", source: "router", target: "m-haiku" },
  { id: "e-r-sonnet", source: "router", target: "m-sonnet" },
  { id: "e-r-opus", source: "router", target: "m-opus" },
];

// 桩：文件类型只出，模型只入，路由器两侧都有。
function handlesFor(node: FlowNode<NodeData>): FlowHandleSpec[] {
  if (node.data.kind === "fileType") return [{ id: "out", type: "source" }];
  if (node.data.kind === "model") return [{ id: "in", type: "target" }];
  return [
    { id: "in", type: "target" },
    { id: "out", type: "source" },
  ];
}

function FlowNodeCard({ node }: { node: FlowNode<NodeData> }) {
  const { kind, title, subtitle, tier } = node.data;
  const accent =
    kind === "router"
      ? "border-brand/50 bg-brand/5"
      : kind === "model"
        ? "border-border bg-surface"
        : "border-border bg-surface";
  return (
    <div className={`flex flex-col gap-1 rounded-[var(--radius)] border ${accent} px-3 py-2`}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-foreground">{title}</span>
        {tier && (
          <Tag size="sm" tone={tierTone[tier]} variant="soft">
            {tierLabel[tier]}
          </Tag>
        )}
        {kind === "router" && (
          <Tag size="sm" tone="brand" variant="soft">
            路由
          </Tag>
        )}
      </div>
      {subtitle && <span className="truncate text-xs text-muted">{subtitle}</span>}
    </div>
  );
}

export default function RoutingPage() {
  const [nodes, setNodes] = useState<FlowNode<NodeData>[]>(INITIAL_NODES);
  const api = useRef<FlowApi | null>(null);

  // 决策回放：选一条 review。
  const [reviewId, setReviewId] = useState(REVIEWS[0]?.id ?? "");
  const selectedReview = REVIEWS.find((r) => r.id === reviewId) ?? REVIEWS[0];

  const reviewItems = useMemo(
    () => REVIEWS.map((r) => ({ value: r.id, label: r.title.length > 14 ? `${r.title.slice(0, 14)}…` : r.title, ariaLabel: r.title })),
    [],
  );

  // 回放行：用 routeFile 现算一遍校验（与写死 routeCost 对齐）。
  const replayRows = useMemo(() => {
    if (!selectedReview) return [];
    return selectedReview.files.map((f) => {
      const lines = fileLines(f);
      const decision = routeFile(
        { lang: f.lang, lines, securitySensitive: f.securitySensitive, isTestOrConfig: f.isTestOrConfig },
        { costCap: 0.05 },
      );
      return { f, lines, decision };
    });
  }, [selectedReview]);

  // 成本 vs 文件规模柱状图数据。
  const costChartData = useMemo(
    () =>
      replayRows.map((r) => ({
        name: r.f.path.split("/").pop() ?? r.f.path,
        cost: Math.round(r.f.routeCost * 1000) / 1000,
        lines: r.lines,
      })),
    [replayRows],
  );

  // 挂载后适配视图。
  useEffect(() => {
    const t = setTimeout(() => api.current?.fitView(), 90);
    return () => clearTimeout(t);
  }, []);

  const handleNodesChange = useCallback((next: FlowNode<NodeData>[]) => setNodes(next), []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">智能路由</h1>
        <p className="text-sm text-muted">按文件特征自动选择最优审查模型，平衡质量与成本</p>
      </div>

      {/* 1. 模型池 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">模型池</span>
          <span className="text-xs text-muted">价格单位 $/1M token · 占比为本月调用量</span>
        </CardHeader>
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {MODELS.map((m) => {
              const calls = callsOf(m.id);
              return (
                <div
                  key={m.id}
                  className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-surface p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">{m.name}</div>
                      <div className="text-xs text-muted">{m.vendor}</div>
                    </div>
                    <Tag size="sm" tone={tierTone[m.tier]} variant="soft">
                      {tierLabel[m.tier]}
                    </Tag>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {m.caps.map((c) => (
                      <Tag key={c} size="sm" tone="neutral" variant="outline">
                        {c}
                      </Tag>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span>
                      输入 <span className="tabular-nums font-medium text-foreground">${m.inPrice}</span>
                    </span>
                    <span>
                      输出 <span className="tabular-nums font-medium text-foreground">${m.outPrice}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>本月调用占比</span>
                      <span className="tabular-nums">{calls} 次</span>
                    </div>
                    <Meter value={calls} max={totalCalls} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* 2. 路由策略 */}
        <Card className="lg:col-span-1">
          <CardHeader className="font-medium text-foreground">路由策略</CardHeader>
          <CardBody className="px-0">
            <List
              items={ROUTING_RULES}
              renderItem={(rule) => (
                <ListItem key={rule.id}>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-foreground">{rule.when}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">→</span>
                      <Tag size="sm" tone="brand" variant="soft">
                        {modelName(rule.modelId)}
                      </Tag>
                    </div>
                    <p className="text-xs text-muted">{rule.note}</p>
                  </div>
                </ListItem>
              )}
            />
          </CardBody>
        </Card>

        {/* 3. 分发流向可视化 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <span className="font-medium text-foreground">分发流向</span>
            <span className="text-xs text-muted">文件类型 → 智能路由器 → 模型</span>
          </CardHeader>
          <CardBody>
            <Flow<NodeData>
              nodes={nodes}
              edges={INITIAL_EDGES}
              apiRef={api}
              getHandles={handlesFor}
              onNodesChange={handleNodesChange}
              renderNode={(n) => <FlowNodeCard node={n} />}
              controls
              className="h-[420px] rounded-[var(--radius)] border border-border"
            />
          </CardBody>
        </Card>
      </div>

      {/* 4. 路由决策回放 */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-foreground">路由决策回放</span>
          <Segmented items={reviewItems} value={reviewId} onValueChange={setReviewId} size="sm" aria-label="选择审查" />
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {selectedReview && selectedReview.files.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted">
                      <th className="py-2 pr-3 font-medium">文件</th>
                      <th className="py-2 pr-3 font-medium">规模</th>
                      <th className="py-2 pr-3 font-medium">命中规则</th>
                      <th className="py-2 pr-3 font-medium">派给模型</th>
                      <th className="py-2 pr-3 text-right font-medium">成本 ¥</th>
                    </tr>
                  </thead>
                  <tbody>
                    {replayRows.map(({ f, lines }) => (
                      <tr key={f.path} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-3">
                          <span className="truncate font-mono text-xs text-foreground">{f.path}</span>
                        </td>
                        <td className="py-2 pr-3 tabular-nums text-muted">{lines} 行</td>
                        <td className="py-2 pr-3 text-muted">{f.routeReason}</td>
                        <td className="py-2 pr-3">
                          <Tag size="sm" tone="brand" variant="soft">
                            {modelName(f.routedModelId)}
                          </Tag>
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums font-medium text-foreground">
                          {f.routeCost.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <div className="mb-2 text-xs text-muted">每文件成本 vs 规模</div>
                <BarChart
                  data={costChartData}
                  xKey="name"
                  series={[
                    { key: "cost", label: "成本 ¥" },
                    { key: "lines", label: "行数" },
                  ]}
                  height={220}
                />
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-muted">该审查暂无变更文件。</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
