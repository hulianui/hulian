"use client";
// 瀚舵 HanHelm · 智能路由（旗舰页）
//   1) 顶部桑基流向图：任务类型 → 六维智能路由器 → 执行器池，流宽=派发占比；点节点/连线显占比。
//   2) 六维权重控制：6 个 Slider 调 capability/cost/latency/load/priority/sla，改权重实时重算决策回放。
//   3) 路由策略规则：ROUTING_RULES 列表，每条 name/when→then + 启用 Switch（演示态）。
//   4) 路由决策回放：选一任务 → scoreExecutors(task, EXECUTORS, weights) → Table 逐候选六维分项打分。
//   5) 成本 vs 延迟分布：BarChart 各执行器成本/延迟对照。
import { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Sankey,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Switch,
  Tag,
} from "@hulian/ui";
import { SANKEY_LINKS, SANKEY_NODES } from "../../_data/metrics";
import { ROUTING_RULES } from "../../_data/routing-rules";
import { EXECUTORS } from "../../_data/executors";
import { DAG_TASK_IDS, TASKS, taskById } from "../../_data/tasks";
import type { RoutingRule, SixWeights } from "../../_data/types";
import { DEFAULT_WEIGHTS, scoreExecutors } from "../../_lib/routing";
import { RoutingWeightsPanel } from "../../_components/routing-weights-panel";
import { RoutingDecisionTable } from "../../_components/routing-decision-table";
import { RoutingCostLatencyChart } from "../../_components/routing-cost-latency-chart";
import { CAPABILITY_LABEL } from "../../_components/queue-shared";

// 节点 id → 配色（吃主题 token），让桑基三层与节点语义对齐。
const NODE_TONE: Record<string, string> = {
  // 任务类型层（src-*）
  "src-translate": "var(--color-chart-1)",
  "src-extract": "var(--color-chart-2)",
  "src-rag": "var(--color-chart-3)",
  "src-moderate": "var(--color-chart-4)",
  "src-image": "var(--color-chart-5)",
  "src-orchestrate": "var(--color-muted-foreground)",
  // 路由器层
  router: "var(--color-primary)",
  // 执行器层
  "exec-haiku": "var(--color-chart-1)",
  "exec-sonnet": "var(--color-chart-2)",
  "exec-opus": "var(--color-chart-3)",
  "exec-deepseek": "var(--color-chart-4)",
  "exec-flux": "var(--color-chart-5)",
  "exec-agents": "var(--color-primary)",
};

const RULE_SEVERITY: Record<string, "brand" | "warning" | "danger" | "neutral"> = {
  "rule-p0-safety": "danger",
  "rule-image": "brand",
  "rule-rag": "brand",
  "rule-batch-cheap": "warning",
  "rule-budget-cap": "warning",
  "rule-default": "neutral",
};

// 任务下拉选项：DAG 任务在前（含完整候选），其余按原序补齐。
const TASK_OPTIONS = (() => {
  const dag = DAG_TASK_IDS.map((id) => taskById(id)).filter(Boolean);
  const rest = TASKS.filter((t) => !DAG_TASK_IDS.includes(t.id));
  return [...dag, ...rest].map((t) => ({
    value: t!.id,
    label: `${t!.title}（${t!.priority} · ${t!.type}）`,
  }));
})();

export default function RoutingPage() {
  const [weights, setWeights] = useState<SixWeights>(DEFAULT_WEIGHTS);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(DAG_TASK_IDS[0]);
  // 规则启用态（纯演示，不真正改变打分，仅展示策略开关）。
  const [enabledRules, setEnabledRules] = useState<Record<string, boolean>>(
    () => Object.fromEntries(ROUTING_RULES.map((r) => [r.id, r.enabled])),
  );
  // 桑基选中节点：点击后在卡头展示其进/出流量小结（下钻反馈）。
  const [focusNode, setFocusNode] = useState<{ id: string; label: string } | null>(null);

  // 某节点的进/出流量合计（供点击下钻文案）。
  const nodeFlow = (id: string) => {
    const inbound = SANKEY_LINKS.filter((l) => l.target === id).reduce((s, l) => s + l.value, 0);
    const outbound = SANKEY_LINKS.filter((l) => l.source === id).reduce((s, l) => s + l.value, 0);
    return { inbound, outbound };
  };

  const selectedTask = useMemo(
    () => taskById(selectedTaskId) ?? TASKS[0],
    [selectedTaskId],
  );

  // ★ 六维权重 → 重算的接法：权重或所选任务变化 → 用纯函数 scoreExecutors 重新打分。
  const decision = useMemo(
    () => scoreExecutors(selectedTask, EXECUTORS, weights),
    [selectedTask, weights],
  );

  const toggleRule = (rule: RoutingRule) =>
    setEnabledRules((prev) => ({ ...prev, [rule.id]: !prev[rule.id] }));

  // Sankey 节点着色：注入 tone。
  const sankeyNodes = useMemo(
    () => SANKEY_NODES.map((n) => ({ ...n, tone: NODE_TONE[n.id] })),
    [],
  );
  // ribbon 继承源节点配色（流带按来源任务类型上色，更易读）。
  const sankeyLinks = useMemo(
    () => SANKEY_LINKS.map((l) => ({ ...l, tone: NODE_TONE[l.source] })),
    [],
  );

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="智能路由"
        subTitle="桑基流向 · 六维权重 · 决策回放"
        tags={
          <Tag size="sm" variant="soft" tone="brand">
            六维加权引擎
          </Tag>
        }
      />

      {/* 1) 桑基流向图 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">派发流向</div>
            <div className="text-xs text-muted">
              任务类型 → 六维智能路由器 → 执行器池；流带宽度 = 派发任务条数占比
            </div>
          </div>
          {focusNode ? (
            (() => {
              const { inbound, outbound } = nodeFlow(focusNode.id);
              return (
                <Tag size="sm" variant="soft" tone="brand">
                  {focusNode.label}：入 {inbound} · 出 {outbound} 条
                </Tag>
              );
            })()
          ) : (
            <Tag size="sm" variant="outline" tone="neutral">
              近 1h · 点击节点看流量
            </Tag>
          )}
        </CardHeader>
        <CardBody>
          <Sankey
            nodes={sankeyNodes}
            links={sankeyLinks}
            height={360}
            linkOpacity={0.45}
            onNodeClick={(node) =>
              setFocusNode({ id: node.id, label: String(node.label ?? node.id) })
            }
            renderTooltip={(item) =>
              item.type === "node" ? (
                <span className="text-xs">{item.node.label}</span>
              ) : (
                <span className="text-xs">
                  {item.link.source} → {item.link.target}：
                  <span className="font-medium">{item.link.value}</span> 条
                </span>
              )
            }
          />
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 2) 六维权重控制 */}
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-foreground">六维权重</div>
            <div className="text-xs text-muted">
              调整任一维 → 右侧决策回放按 scoreExecutors 实时重算
            </div>
          </CardHeader>
          <CardBody>
            <RoutingWeightsPanel
              weights={weights}
              onChange={setWeights}
              onReset={() => setWeights(DEFAULT_WEIGHTS)}
            />
          </CardBody>
        </Card>

        {/* 3) 路由策略规则 */}
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-foreground">路由策略规则</div>
            <div className="text-xs text-muted">按 order 依次匹配，首条命中即生效（演示开关）</div>
          </CardHeader>
          <CardBody className="space-y-2.5">
            {ROUTING_RULES.map((rule) => {
              const on = enabledRules[rule.id];
              return (
                <div
                  key={rule.id}
                  className="rounded-[var(--radius)] border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Tag size="sm" variant="soft" tone="neutral">
                          {rule.order}
                        </Tag>
                        <span className="text-sm font-medium text-foreground">
                          {rule.name}
                        </span>
                        <Tag size="sm" variant="soft" tone={RULE_SEVERITY[rule.id] ?? "neutral"}>
                          {on ? "启用" : "停用"}
                        </Tag>
                      </div>
                      <div className="text-xs text-muted">
                        <span className="text-foreground">条件</span> {rule.when}
                      </div>
                      <div className="text-xs text-muted">
                        <span className="text-foreground">动作</span> {rule.then}
                      </div>
                    </div>
                    <Switch
                      checked={on}
                      onCheckedChange={() => toggleRule(rule)}
                      aria-label={`${rule.name} 启用开关`}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* 4) 路由决策回放 */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">路由决策回放</div>
            <div className="text-xs text-muted">
              逐候选执行器的六维分项打分；淘汰者标灰 + 原因，选中者高亮
            </div>
          </div>
          <div className="w-72 max-w-full">
            <Select
              items={TASK_OPTIONS}
              value={selectedTaskId}
              onValueChange={(v) => setSelectedTaskId(v as string)}
            >
              <SelectTrigger size="sm" />
              <SelectContent>
                {TASK_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <Tag size="sm" variant="soft" tone="neutral">
              {selectedTask.priority}
            </Tag>
            <span>
              能力需求：
              <span className="text-foreground">
                {selectedTask.capabilities.map((c) => CAPABILITY_LABEL[c]).join(" / ")}
              </span>
            </span>
            <span>·</span>
            <span>
              SLA <span className="text-foreground">{Math.round(selectedTask.slaMs / 1000)}s</span>
            </span>
            <span>·</span>
            <span>
              预算 <span className="text-foreground">¥{selectedTask.budgetYuan.toFixed(1)}</span>
            </span>
          </div>
          <RoutingDecisionTable decision={decision} />
          <div className="rounded-[var(--radius)] bg-surface-hover/60 p-3 text-xs text-muted">
            <span className="font-medium text-foreground">引擎裁决：</span>
            {decision.reason}
          </div>
        </CardBody>
      </Card>

      {/* 5) 成本 vs 延迟分布 */}
      <Card>
        <CardHeader>
          <div className="text-sm font-semibold text-foreground">成本 / 延迟分布</div>
          <div className="text-xs text-muted">
            各执行器混合单价与典型延迟（同轴归一指数，越低越优）
          </div>
        </CardHeader>
        <CardBody>
          <RoutingCostLatencyChart executors={EXECUTORS} />
        </CardBody>
      </Card>
    </div>
  );
}
