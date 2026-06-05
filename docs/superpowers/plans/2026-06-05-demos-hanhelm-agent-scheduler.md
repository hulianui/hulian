# 瀚舵 HanHelm 智能体任务调度平台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `@hulian/ui` 仓库新建第 16 个内置 demo「瀚舵 HanHelm」智能体任务调度平台（7 页 + login），并为支撑它新造 4 个库组件（Sankey/Sparkline/Funnel/QueueLane），100% dogfood、全 mock、output:export。

**Architecture:** 先把 4 个新组件按库内「四件套 + 10 接入点」约定造好并单测，再写 demo 数据层 + `_lib` 纯函数调度引擎，最后 AdminLayout 外壳 + 七页 dogfood。详情页拆 server(`generateStaticParams`)+client 子件以适配 `output: export`。负载仪表软依赖瀚审 ScoreRing（不存在则 meter 兜底），流向 DAG 复用既有 Flow。

**Tech Stack:** Next.js 15 App Router · TypeScript · `@hulian/ui` · Tailwind(token 驱动) · vitest · 零依赖 SVG 几何。

---

## 库组件落地的 10 个接入点（每个新组件都要做）

对组件 `<name>`（kebab）：
1. `packages/ui/src/<name>/<name>.types.ts` — 类型（可选，简单件可内联）
2. `packages/ui/src/<name>/<name>-geometry.ts` + `<name>-geometry.test.ts` — 纯函数 + 单测
3. `packages/ui/src/<name>/<name>.tsx` — 组件（SVG 圆弧用属性不靠 CSS transform；token 配色）
4. `packages/ui/src/<name>/<name>.showcase.tsx` — `export const <camel>Showcase: ShowcaseSpec`（`import type { ShowcaseSpec } from "../showcase/types"`）
5. `packages/ui/src/<name>/<name>.test.tsx` — 渲染 + 交互测
6. `packages/ui/src/<name>/index.ts` — barrel（导出组件 + 纯函数 + 类型）
7. `packages/ui/src/index.ts` — 加 `export * from "./<name>";`
8. `packages/ui/src/showcase.ts` — 加 `export { <camel>Showcase } from "./<name>/<name>.showcase";`
9. `apps/www/lib/manifest.ts` — 加 `{ slug: "<name>", name: "<Name>", description: "…", category: "data-display", group: "collection|info", status: "new" }`
10. `apps/www/lib/registry.tsx` — import `<camel>Showcase` + 在默认导出 map 加 `<name>: <camel>Showcase`

**ShowcaseSpec 契约**：`{ controls: Control[]; states: StateSpec[]; renderWithProps(props); toCode(props): string }`。

**测试命令**：`pnpm --filter @hulian/ui test`（vitest）。整库全绿基线 1278+。

---

## Task 1: Sankey 组件（旗舰 · 库内首个桑基图）

**Files:**
- Create: `packages/ui/src/sankey/sankey.types.ts`
- Create: `packages/ui/src/sankey/sankey-geometry.ts`
- Test: `packages/ui/src/sankey/sankey-geometry.test.ts`
- Create: `packages/ui/src/sankey/sankey.tsx`
- Create: `packages/ui/src/sankey/sankey.showcase.tsx`
- Test: `packages/ui/src/sankey/sankey.test.tsx`
- Create: `packages/ui/src/sankey/index.ts`
- Modify: `packages/ui/src/index.ts`, `packages/ui/src/showcase.ts`, `apps/www/lib/manifest.ts`, `apps/www/lib/registry.tsx`

- [ ] **Step 1: 写类型 `sankey.types.ts`**

```ts
import type { ReactNode } from "react";

export interface SankeyNode {
  id: string;
  label?: ReactNode;
  layer?: number;       // 不给则按 links 拓扑推导
  tone?: string;        // CSS 颜色或 token 变量；默认走主题
}
export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  tone?: string;
}
export interface SankeyLayoutOptions {
  width: number;
  height: number;
  nodeWidth: number;    // 默认 16
  nodePadding: number;  // 默认 12
}
export interface SankeyLaidNode extends SankeyNode {
  layer: number;
  x: number;            // 节点矩形左上 x
  y: number;            // 节点矩形左上 y
  height: number;       // 按流量
}
export interface SankeyLaidLink extends SankeyLink {
  path: string;         // SVG ribbon path（d 属性）
  width: number;        // 笔宽 = value 占比
  sy: number;           // 源端纵坐标中点
  ty: number;           // 目标端纵坐标中点
}
export interface SankeyLayout {
  nodes: SankeyLaidNode[];
  links: SankeyLaidLink[];
  layers: number;
}
export interface SankeyProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  linkOpacity?: number;
  renderNodeLabel?: (node: SankeyLaidNode) => ReactNode;
  renderTooltip?: (item: { type: "node"; node: SankeyLaidNode } | { type: "link"; link: SankeyLaidLink }) => ReactNode;
  onNodeClick?: (node: SankeyLaidNode) => void;
  onLinkClick?: (link: SankeyLaidLink) => void;
  className?: string;
}
```

- [ ] **Step 2: 写失败测试 `sankey-geometry.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { assignLayers, computeSankeyLayout } from "./sankey-geometry";

const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
const links = [
  { source: "a", target: "b", value: 6 },
  { source: "a", target: "c", value: 4 },
];

describe("assignLayers", () => {
  it("源在 0 层，目标在 1 层", () => {
    const m = assignLayers(nodes, links);
    expect(m.get("a")).toBe(0);
    expect(m.get("b")).toBe(1);
    expect(m.get("c")).toBe(1);
  });
  it("尊重显式 layer", () => {
    const m = assignLayers([{ id: "a", layer: 2 }, { id: "b" }], [{ source: "a", target: "b", value: 1 }]);
    expect(m.get("a")).toBe(2);
    expect(m.get("b")).toBe(3);
  });
});

describe("computeSankeyLayout", () => {
  const layout = computeSankeyLayout(nodes, links, { width: 400, height: 200, nodeWidth: 16, nodePadding: 10 });
  it("层数正确", () => {
    expect(layout.layers).toBe(2);
  });
  it("节点高度按流量成比例（a 总流量=10，最高）", () => {
    const a = layout.nodes.find((n) => n.id === "a")!;
    const b = layout.nodes.find((n) => n.id === "b")!;
    expect(a.height).toBeGreaterThan(b.height);
  });
  it("每条 link 有非空 path 和正 width", () => {
    for (const l of layout.links) {
      expect(l.path).toMatch(/^M/);
      expect(l.width).toBeGreaterThan(0);
    }
  });
  it("link width 与 value 成比例（6 > 4）", () => {
    const ab = layout.links.find((l) => l.target === "b")!;
    const ac = layout.links.find((l) => l.target === "c")!;
    expect(ab.width).toBeGreaterThan(ac.width);
  });
  it("空输入不崩", () => {
    expect(computeSankeyLayout([], [], { width: 100, height: 100, nodeWidth: 16, nodePadding: 10 }).nodes).toEqual([]);
  });
});
```

- [ ] **Step 3: 运行测试确认失败** — `pnpm --filter @hulian/ui test sankey-geometry`，预期 FAIL（模块不存在）。

- [ ] **Step 4: 写 `sankey-geometry.ts`**

实现：
- `assignLayers(nodes, links)`：Kahn 风格按边松弛 `layer[target] = max(layer[target], layer[source]+1)`；显式 `node.layer` 作为下界种子；返回 `Map<id, number>`。
- `computeSankeyLayout(nodes, links, opts)`：
  1. 算每节点 layer，layers = max+1。
  2. 每节点 `flow = max(入流和, 出流和)`；每层节点垂直按 flow 比例分高度，`nodePadding` 间隔，整体在 height 内居中。值域守恒：用全图 max 单节点 flow 作高度比例尺，保证跨层一致。
  3. 节点 x = `layer * (width - nodeWidth) / (layers-1)`（layers>1），单层时 x=0。
  4. 每节点维护出端/入端的纵向游标，按 link value 切分端口纵坐标。
  5. link 用三次贝塞尔：`M sx,sy C mx,sy mx,ty tx,ty`（sx=源右沿，tx=目标左沿，mx 中点），`width = value / maxLinkValue * maxRibbon`（maxRibbon 取 nodePadding 量级或按比例）；实际 ribbon 用 stroke-width=按端口高度的描边线，width 直接= value 端口高度。
  6. 返回 `{ nodes, links, layers }`。

- [ ] **Step 5: 运行测试确认通过** — `pnpm --filter @hulian/ui test sankey-geometry`，预期 PASS。

- [ ] **Step 6: 写组件 `sankey.tsx`**

`"use client"`；`<svg>` 渲染：links 先画（描边 ribbon，stroke=tone/`var(--primary)`，stroke-opacity=linkOpacity 默认 0.35，hover 提至 0.6），nodes 后画（rect + label）。hover 用本地 state + 复用 `Tooltip`（或受控 popover）；`onNodeClick/onLinkClick` 透传。容器宽用 ref 测量（ResizeObserver）+ 默认 height=320。`prefers-reduced-motion` 不影响（静态）。color 全走 token，per-node/link tone 覆盖。

- [ ] **Step 7: 写组件测试 `sankey.test.tsx`**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sankey } from "./sankey";

const nodes = [{ id: "a", label: "源" }, { id: "b", label: "汇" }];
const links = [{ source: "a", target: "b", value: 5 }];

describe("Sankey", () => {
  it("渲染节点 label", () => {
    render(<Sankey nodes={nodes} links={links} height={200} />);
    expect(screen.getByText("源")).toBeInTheDocument();
    expect(screen.getByText("汇")).toBeInTheDocument();
  });
  it("点击节点回调", () => {
    const onNodeClick = vi.fn();
    render(<Sankey nodes={nodes} links={links} height={200} onNodeClick={onNodeClick} />);
    fireEvent.click(screen.getByText("源"));
    expect(onNodeClick).toHaveBeenCalled();
  });
});
```
> 注：组件依赖容器宽度测量，测试里给固定 height 并断言 label 文本即可（jsdom 下 width 可能为 0，几何用兜底宽度 600，组件实现需对 width<=0 用 fallback）。

- [ ] **Step 8: 写 showcase `sankey.showcase.tsx`** — 一个三层调度流向示例（任务类型→路由器→执行器池），controls 控制 `nodeWidth`/`linkOpacity`，states 含「调度流向」「预算分配」两例。导出 `sankeyShowcase`。

- [ ] **Step 9: barrel `index.ts`** — 导出 `Sankey`、`computeSankeyLayout`/`assignLayers`、所有类型。

- [ ] **Step 10: 接入 4 处** — `src/index.ts` 加 `export * from "./sankey";`；`showcase.ts` 加 `export { sankeyShowcase } from "./sankey/sankey.showcase";`；`manifest.ts` 加条目（group: "collection"，description 写「库内首个桑基图 · 多层流向/分配比例 · 零依赖 SVG ribbon · 拓扑自动分层 + 流宽按 value · hover tooltip + 点击下钻」）；`registry.tsx` import + map 加 `sankey: sankeyShowcase`。

- [ ] **Step 11: 全库测试 + 提交**

```bash
pnpm --filter @hulian/ui test
git add packages/ui/src/sankey apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git apply --cached <(git diff packages/ui/src/index.ts packages/ui/src/showcase.ts)  # 仅暂存本组件相关 hunk（若共享文件含他人 WIP）
git commit -m "feat(ui): 新增 Sankey 桑基图(库内首个 · 拓扑分层 + 流宽按 value + ribbon 几何纯函数)"
```
> 若 `src/index.ts`/`showcase.ts` 干净（无他人 WIP）可直接 `git add` 这两文件。

---

## Task 2: Sparkline 组件（高频通用 · 内联趋势）

**Files:** `packages/ui/src/sparkline/`（`sparkline-geometry.ts`+test、`sparkline.tsx`、`sparkline.showcase.tsx`、`sparkline.test.tsx`、`index.ts`）+ 4 接入点。

- [ ] **Step 1: 失败测试 `sparkline-geometry.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { normalize, linePath, areaPath, barRects } from "./sparkline-geometry";

describe("normalize", () => {
  it("把数据映射到 [0,h]，最大值在顶（y 小）", () => {
    const pts = normalize([0, 5, 10], { w: 100, h: 20 });
    expect(pts[0].y).toBeCloseTo(20);   // 最小 → 底
    expect(pts[2].y).toBeCloseTo(0);    // 最大 → 顶
    expect(pts[2].x).toBeCloseTo(100);
  });
  it("常量数据居中不除零", () => {
    const pts = normalize([3, 3, 3], { w: 100, h: 20 });
    expect(pts.every((p) => Number.isFinite(p.y))).toBe(true);
  });
});
describe("paths", () => {
  it("linePath 以 M 开头", () => {
    expect(linePath([1, 2, 3], { w: 60, h: 20 })).toMatch(/^M/);
  });
  it("areaPath 闭合（含 Z）", () => {
    expect(areaPath([1, 2, 3], { w: 60, h: 20 })).toMatch(/Z$/);
  });
  it("barRects 数量等于数据点", () => {
    expect(barRects([1, 2, 3, 4], { w: 60, h: 20 }).length).toBe(4);
  });
  it("空数据返回空 path/空数组", () => {
    expect(linePath([], { w: 60, h: 20 })).toBe("");
    expect(barRects([], { w: 60, h: 20 })).toEqual([]);
  });
});
```

- [ ] **Step 2: 确认失败** — `pnpm --filter @hulian/ui test sparkline-geometry` → FAIL。
- [ ] **Step 3: 写 `sparkline-geometry.ts`** — `normalize(data, {w,h,min?,max?})` 支持 `number[]` 与 `{x,y}[]`（内部归一为 y 数组 + 均匀 x）；`linePath`/`areaPath`/`barRects`。常量数据 y 居中（range=0 时取 h/2）。
- [ ] **Step 4: 确认通过** → PASS。
- [ ] **Step 5: 写 `sparkline.tsx`** — `"use client"` 非必需（纯 SVG 可 RSC 安全，但 tooltip 交互需 client；默认做成无交互 RSC 安全，`renderTooltip` 时才 client）。props 见 spec 4.2。`highlightLast` 画末点圆点；tone 默认 `var(--primary)`。
- [ ] **Step 6: 写 `sparkline.test.tsx`** — 渲染含 svg；`variant="bar"` 渲染 N 个 rect；`highlightLast` 渲染末点 circle。
- [ ] **Step 7: showcase** — states：line/area/bar 三态 + 表格内联示例。导出 `sparklineShowcase`。
- [ ] **Step 8: barrel + 4 接入点**（manifest group: "info"，description「极简内联趋势迷你图 · 无轴无网格 · line/area/bar · 表格/KPI 卡内联 · 纯 SVG 零依赖」）。
- [ ] **Step 9: 测试 + 提交** — `feat(ui): 新增 Sparkline 内联趋势迷你图(line/area/bar · 几何纯函数 · 零依赖)`。

---

## Task 3: Funnel 组件（任务漏斗）

**Files:** `packages/ui/src/funnel/`（`funnel-geometry.ts`+test、`funnel.tsx`、`funnel.showcase.tsx`、`funnel.test.tsx`、`index.ts`）+ 4 接入点。

- [ ] **Step 1: 失败测试 `funnel-geometry.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { computeFunnel } from "./funnel-geometry";

describe("computeFunnel", () => {
  const r = computeFunnel([
    { id: "in", label: "涌入", value: 1000 },
    { id: "route", label: "路由", value: 800 },
    { id: "done", label: "完成", value: 600 },
  ]);
  it("首级宽度比为 1", () => {
    expect(r[0].widthRatio).toBe(1);
  });
  it("宽度比 = value / 最大值", () => {
    expect(r[1].widthRatio).toBeCloseTo(0.8);
    expect(r[2].widthRatio).toBeCloseTo(0.6);
  });
  it("首级转化率为 null（无上一级）", () => {
    expect(r[0].conversion).toBeNull();
  });
  it("级间转化率 = 本级/上一级", () => {
    expect(r[1].conversion).toBeCloseTo(0.8);   // 800/1000
    expect(r[2].conversion).toBeCloseTo(0.75);  // 600/800
  });
  it("上一级为 0 时转化率为 null 不除零", () => {
    const z = computeFunnel([{ id: "a", label: "a", value: 0 }, { id: "b", label: "b", value: 0 }]);
    expect(z[1].conversion).toBeNull();
    expect(z.every((s) => Number.isFinite(s.widthRatio))).toBe(true);
  });
});
```

- [ ] **Step 2: 确认失败** → FAIL。
- [ ] **Step 3: 写 `funnel-geometry.ts`** — `computeFunnel(stages)` → `{ ...stage, widthRatio, conversion }[]`；max=0 时所有 widthRatio=0（不除零）。
- [ ] **Step 4: 确认通过** → PASS。
- [ ] **Step 5: 写 `funnel.tsx`** — 每级一行（vertical），居中梯形条用宽度比（百分比），级间显转化率徽标；horizontal 变体按高度比。token 配色 + per-stage tone。`onStageClick`。
- [ ] **Step 6: `funnel.test.tsx`** — 渲染各级 label + value；点击级回调；showConversion 时显转化率文本。
- [ ] **Step 7: showcase** — states：任务漏斗 vertical + 转化漏斗 horizontal。导出 `funnelShowcase`。
- [ ] **Step 8: barrel + 4 接入点**（group: "collection"，description「阶段漏斗 + 级间转化率 · 宽度按 value 比例 · 纵/横向 · 任务/转化/留存可视化 · 零依赖」）。
- [ ] **Step 9: 测试 + 提交** — `feat(ui): 新增 Funnel 漏斗图(阶段宽度按 value + 级间转化率纯函数 · 零依赖)`。

---

## Task 4: QueueLane 组件（优先级泳道队列板）

**Files:** `packages/ui/src/queue-lane/`（`queue-lane.types.ts`、`queue-lane-utils.ts`+test、`queue-lane.tsx`、`queue-lane.showcase.tsx`、`queue-lane.test.tsx`、`index.ts`）+ 4 接入点。

- [ ] **Step 1: 类型 `queue-lane.types.ts`**

```ts
import type { ReactNode } from "react";
export interface QueueLaneDef { id: string; label: ReactNode; tone?: string; meta?: ReactNode; }
export interface QueueItem { id: string; laneId: string; [k: string]: unknown; }
export interface QueueLaneGroup<T extends QueueItem = QueueItem> { lane: QueueLaneDef; items: T[]; }
export interface QueueLaneProps<T extends QueueItem = QueueItem> {
  lanes: QueueLaneDef[];
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  renderLaneHeader?: (lane: QueueLaneDef, items: T[]) => ReactNode;
  maxVisible?: number;
  orientation?: "horizontal" | "vertical";
  onItemClick?: (item: T) => void;
  className?: string;
}
```

- [ ] **Step 2: 失败测试 `queue-lane-utils.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { groupByLane } from "./queue-lane-utils";

const lanes = [{ id: "p0", label: "P0" }, { id: "p1", label: "P1" }];
const items = [
  { id: "1", laneId: "p0" }, { id: "2", laneId: "p1" }, { id: "3", laneId: "p0" },
];

describe("groupByLane", () => {
  it("按 lane 分组并保序", () => {
    const g = groupByLane(items, lanes);
    expect(g.map((x) => x.lane.id)).toEqual(["p0", "p1"]);
    expect(g[0].items.map((i) => i.id)).toEqual(["1", "3"]);
  });
  it("空道返回空 items 数组", () => {
    const g = groupByLane([{ id: "x", laneId: "p0" }], lanes);
    expect(g[1].items).toEqual([]);
  });
  it("未知 laneId 的 item 被丢弃（不崩）", () => {
    const g = groupByLane([{ id: "y", laneId: "zzz" }], lanes);
    expect(g.flatMap((x) => x.items)).toEqual([]);
  });
});
```

- [ ] **Step 3: 确认失败** → FAIL。
- [ ] **Step 4: 写 `queue-lane-utils.ts`** — `groupByLane(items, lanes)` 保序分组，未知 laneId 丢弃。
- [ ] **Step 5: 确认通过** → PASS。
- [ ] **Step 6: 写 `queue-lane.tsx`** — horizontal：泳道横向并列（flex），每道竖向 ScrollArea 排队；道头默认显条数 + `renderLaneHeader`/`meta`；超 `maxVisible` 折叠为「还有 N 条」；tone 染道头左边色条。卡片 `renderItem`，`onItemClick`。**与 Kanban 区别写进文件顶注释**（只读队列监视器 vs 拖拽工作流）。
- [ ] **Step 7: `queue-lane.test.tsx`** — 渲染各道 label + 卡；maxVisible 折叠显「还有」；点卡回调。
- [ ] **Step 8: showcase** — states：优先级队列（P0-P3）+ 分类队列。导出 `queueLaneShowcase`。
- [ ] **Step 9: barrel + 4 接入点**（group: "collection"，description「优先级泳道队列板 · 横向泳道 + 道头队列指标(深度/等待/吞吐) · 只读队列监视器(区别 Kanban 拖拽工作流) · maxVisible 折叠 · 零依赖」）。
- [ ] **Step 10: 测试 + 提交** — `feat(ui): 新增 QueueLane 优先级泳道队列板(只读队列监视器 · 道头聚合指标 · 区别 Kanban 工作流)`。

---

## Task 5: Demo 数据层 + `_lib` 调度引擎纯函数

**Files:**
- Create: `apps/www/app/demos/hanhelm/_data/types.ts`、`executors.ts`、`tasks.ts`、`routing-rules.ts`、`metrics.ts`、`alerts.ts`、`members.ts`
- Create: `apps/www/app/demos/hanhelm/_lib/routing.ts`、`sla.ts`、`failover.ts`、`use-dispatch-run.ts`
- Test: `apps/www/app/demos/hanhelm/_lib/routing.test.ts`、`sla.test.ts`、`failover.test.ts`

> demo 内 `_lib` 测试是否纳入 vitest 范围视 `apps/www` 是否有 test runner；若 www 无 test，则把这 3 个纯函数测试以 `.test.ts` 形式放在文件旁，至少保证可被未来引入。**优先**：若 www 不跑 vitest，纯函数仍按可测结构写（无副作用、纯输入输出），并在 PR 里手动 node 验证一次。

- [ ] **Step 1: 写 `types.ts`** — 定义：
  - `Capability`（"text"|"code"|"image"|"translate"|"rag"|"extract"|"moderate"|"orchestrate"）
  - `Priority`（"P0"|"P1"|"P2"|"P3"）
  - `Executor`（id/name/kind:"agent"|"model"/capabilities/pricePer1kIn/pricePer1kOut/latencyMs/maxConcurrency/load(0-1)/health:"healthy"|"degraded"|"offline"/fallbackChain:string[]）
  - `SubTask`（id/title/capability/executorId/status:"pending"|"running"|"done"|"failed"|"failover"/deps:string[]/durationMs/costYuan）
  - `Task`（id/title/type/capabilities/priority/slaMs/budgetYuan/status/createdAt/waitedMs/assignedExecutorId/subtasks:SubTask[]/edges:{source;target}[]/frames:RunFrame[]/routing:RoutingDecision）
  - `RoutingDecision`（taskId/candidates:{executorId;scores:{capability;cost;latency;load;priority;sla};total;eliminated?:string}[]/chosenId/reason/failovers:{from;to;reason}[]）
  - `RunFrame`（kind:"tool"|"thinking"|"stream"|"event"/text/at）
  - `SixWeights`（capability/cost/latency/load/priority/sla 各 number）
  - `AlertRule` / `AlertEvent` / `MetricSeries` / `Member`

- [ ] **Step 2: 写 `executors.ts`** — 8-10 个执行器：模型（Haiku4.5/Sonnet4.6/Opus4.7/DeepSeekV4，价位 grounded）+ agent（检索Agent/审核Agent/编排Agent/抽取Agent），各带能力/延迟/并发/负载/健康/降级链。价位：Haiku $1/$5、Sonnet $3/$15、Opus $5/$25、DeepSeek $0.55/$2.2（折人民币展示）。

- [ ] **Step 3: 写失败测试 `routing.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { scoreExecutors, DEFAULT_WEIGHTS } from "./routing";
import type { Executor, Task } from "../_data/types";

const execs: Executor[] = [
  { id: "haiku", name: "Haiku", kind: "model", capabilities: ["text", "translate"], pricePer1kIn: 0.007, pricePer1kOut: 0.035, latencyMs: 400, maxConcurrency: 50, load: 0.2, health: "healthy", fallbackChain: ["sonnet"] },
  { id: "opus", name: "Opus", kind: "model", capabilities: ["text", "code", "orchestrate"], pricePer1kIn: 0.035, pricePer1kOut: 0.175, latencyMs: 1800, maxConcurrency: 10, load: 0.6, health: "healthy", fallbackChain: ["sonnet"] },
];
const task: Task = {
  id: "t1", title: "翻译", type: "翻译", capabilities: ["translate"], priority: "P2",
  slaMs: 5000, budgetYuan: 0.5, status: "queued", createdAt: 0, waitedMs: 0,
  subtasks: [], edges: [], frames: [], routing: {} as never,
};

describe("scoreExecutors", () => {
  it("能力不匹配被淘汰", () => {
    const r = scoreExecutors(task, execs, DEFAULT_WEIGHTS);
    const opus = r.candidates.find((c) => c.executorId === "opus")!;
    expect(opus.eliminated).toBeTruthy();   // opus 不含 translate
  });
  it("选中能力匹配且综合分最高者", () => {
    const r = scoreExecutors(task, execs, DEFAULT_WEIGHTS);
    expect(r.chosenId).toBe("haiku");
  });
  it("提高成本权重时仍偏好便宜模型", () => {
    const r = scoreExecutors({ ...task, capabilities: ["text"] }, execs, { ...DEFAULT_WEIGHTS, cost: 0.9 });
    expect(r.chosenId).toBe("haiku");
  });
  it("无可用候选时 chosenId 为 null", () => {
    const r = scoreExecutors({ ...task, capabilities: ["image"] }, execs, DEFAULT_WEIGHTS);
    expect(r.chosenId).toBeNull();
  });
});
```

- [ ] **Step 4: 确认失败** → FAIL。
- [ ] **Step 5: 写 `routing.ts`** — `DEFAULT_WEIGHTS`（六维各 ~1/6）；`scoreExecutors(task, executors, weights)`：能力子集不满足 → `eliminated`；其余按归一化六维（成本/延迟/负载越低分越高，能力覆盖度/优先级匹配/SLA 余量越高分越高）加权 `total`，选 max；返回 `RoutingDecision`（含 candidates 分项、chosenId、reason）。
- [ ] **Step 6: 确认通过** → PASS。
- [ ] **Step 7: 写 `sla.ts` + `sla.test.ts`** — `evaluateSla(latencyMs, slaMs)` → `"met"|"at-risk"|"violated"`（met<80%、at-risk 80-100%、violated>100%）+ 余量；`percentile(samples, p)`。测：边界 + 空样本。失败→实现→通过。
- [ ] **Step 8: 写 `failover.ts` + `failover.test.ts`** — `nextFallback(chain, failedId, healthMap)` → 链中 failedId 之后第一个 healthy 的 id，否则 null。测：正常降级 / 链尽 / 全不健康。失败→实现→通过。
- [ ] **Step 9: 写 `tasks.ts`** — 12-16 个异构任务，覆盖 8 种能力、4 个优先级、各种状态（排队/执行中/完成/失败/临期）；其中 2-3 个带完整 DAG（subtasks+edges）+ frames（tool/thinking/stream/event）+ routing（六维打分 + failover 记录）。用 `routing.ts` 预算 routing 或手写一致数据。
- [ ] **Step 10: 写 `routing-rules.ts`、`metrics.ts`、`alerts.ts`、`members.ts`** — 路由规则列表；吞吐/延迟/队列深度/成本时序（供 Funnel/Sparkline/Chart/Sankey）；告警规则 + 事件；成员。
- [ ] **Step 11: 写 `use-dispatch-run.ts`** — `"use client"` hook：给定 task，拓扑序逐 subtask 推进（pending→running→done），按 seed 在某节点触发 failover（failed→failover→done），流式吐 frames + 进度 + 当前节点；mulberry32 seed 确定性，无 `Math.random`/`Date.now`（用传入基准时间）。
- [ ] **Step 12: 测试 + 提交**

```bash
pnpm --filter @hulian/ui test   # 确保库测仍绿
git add apps/www/app/demos/hanhelm/_data apps/www/app/demos/hanhelm/_lib
git commit -m "feat(www): 瀚舵 demo 数据层 + 六维路由/SLA/failover 调度引擎纯函数 + 单测"
```

---

## Task 6: HelmShell 外壳 + nav + login + route group 空页 + demos.ts 登记

**Files:**
- Create: `apps/www/app/demos/hanhelm/_components/nav-config.ts`、`helm-shell.tsx`
- Create: `apps/www/app/demos/hanhelm/(app)/layout.tsx`、`page.tsx`(占位)、`queue/page.tsx`(占位)、`queue/[id]/page.tsx`(占位)、`routing/page.tsx`(占位)、`agents/page.tsx`(占位)、`alerts/page.tsx`(占位)、`settings/page.tsx`(占位)
- Create: `apps/www/app/demos/hanhelm/login/page.tsx`
- Modify: `apps/www/app/demos/lib/demos.ts`

- [ ] **Step 1: `nav-config.ts`** — 7 项导航（图标 + label + href）：调度总览/任务队列/智能路由/执行器池/SLA 告警/设置（任务详情不进侧栏）。参考 `ai-workflow/_components/nav-config.ts`。
- [ ] **Step 2: `helm-shell.tsx`** — `"use client"`；封 `AdminLayout`（参考其 showcase/types 与 projects/crm 外壳），侧栏 nav + 顶栏（品牌「瀚舵 HanHelm」+ 用户/主题）+ 多页签 keep-alive。
- [ ] **Step 3: `(app)/layout.tsx`** — 用 HelmShell 包 children。
- [ ] **Step 4: 7 个占位页** — 每个 `export default function X(){ return <div>…标题…</div> }`，详情页拆 server（`generateStaticParams` 返回 tasks 的 id）+ client 子件占位。
- [ ] **Step 5: `login/page.tsx`** — dogfood `LoginForm`，跳 `(app)`（参考 ai-workflow/login）。
- [ ] **Step 6: `demos.ts` 登记** — 在 `demos` 数组加：

```ts
{
  slug: "hanhelm",
  title: "瀚舵 HanHelm 智能体任务调度平台",
  description:
    "异构 AI 任务涌入任务总线 → 智能路由按「能力+成本+延迟+负载+优先级+SLA」六维打分派给 agent/模型池 → 多 agent 编排 + 降级/failover + 全链路可观测 —— 100% 由 @hulian/ui 搭建的调度控制台。调度总览(任务漏斗)、优先级泳道队列、任务详情多 agent 编排 DAG、智能路由桑基流向 + 六维决策回放、执行器池负载、SLA 告警模拟，dogfood 全新 Sankey/Sparkline/Funnel/QueueLane 4 组件。",
  href: "/demos/hanhelm",
  category: "AI 应用",
  status: "wip",
  tags: ["Sankey", "QueueLane", "Funnel", "Flow", "智能路由", "多 agent 编排"],
},
```

- [ ] **Step 7: 起 dev 验证空壳可达** — `pnpm --filter www dev`，访问 `/demos/hanhelm` 与 `/demos/hanhelm/login` 不报错。
- [ ] **Step 8: 提交** — `git add apps/www/app/demos/hanhelm/_components apps/www/app/demos/hanhelm/(app) apps/www/app/demos/hanhelm/login`；`demos.ts` 用 hunk 级暂存（共享文件）。`feat(www): 瀚舵 demo 外壳 + 导航 + 登录 + route group 空页 + demos.ts 登记`。

---

## Task 7: 七页 dogfood（可并行派 subagent）

每页 100% `@hulian/ui`，禁 CSS 补丁/hack；缺能力回库（罕见，组件已就位）。参考 spec §3。详情页 client 子件用 `use-dispatch-run`。

- [ ] **Step 1: 调度总览 `page.tsx`** — KPI(Stat+NumberTicker) + Funnel 任务漏斗 + 执行器负载(ScoreRing 软依赖/meter 兜底)+Sparkline 群 + 实时任务流 List + 告警 Banner。
- [ ] **Step 2: 任务队列 `queue/page.tsx`** — QueueLane 优先级泳道 ⇄ ProTable（Segmented 切换）+ 查询区 + 顶部分段。
- [ ] **Step 3: 任务详情 `queue/[id]/`** — server(`generateStaticParams`) + client 子件：SLA banner + Flow 只读 DAG + 右栏过程(agent-plan/thinking-block/tool-call/streaming-text) + Timeline + use-dispatch-run 推进 + failover。
- [ ] **Step 4: 智能路由 `routing/page.tsx`** — Sankey 流向 + 路由规则(Choicebox/List) + 六维权重 Slider + 决策回放(Table+Tag+Sparkline) + 成本/延迟散点(Chart)。
- [ ] **Step 5: 执行器池 `agents/page.tsx`** — 执行器卡(能力 Tag/价位/负载 ScoreRing/健康 StatusDot/Sparkline) + 降级链 + 启停限流(Switch+NumberField)。
- [ ] **Step 6: SLA 告警 `alerts/page.tsx`** — P50/P95 vs SLA(Table+Sparkline) + 告警规则(Switch+Choicebox) + 告警模拟器(Slider 重算) + 事件流(Timeline)。
- [ ] **Step 7: 设置 `settings/page.tsx`** — 接入(SecretField) + 成员(List+Avatar+Tag) + 全局策略(NumberField+Choicebox) + 通知(Switch)。
- [ ] **Step 8: 各页落地后逐一提交** — `git add` 仅该页文件 + 用到的子组件。`feat(www): 瀚舵 <页名> dogfood`。

---

## Task 8: 实机自证 + 覆盖率 + 收尾

- [ ] **Step 1: 起预览** — `pnpm --filter www dev`（**勿用根 `pnpm dev`**，会误杀 5514）。
- [ ] **Step 2: CDP 隔离 Chrome-for-Testing 截图** — 启独立 chromium（`executablePath` 指 Chrome-for-Testing，避 MCP 争用 + 钥匙串弹窗复用已开实例），逐页截 7 页 + login，断言**零 console error**。
- [ ] **Step 3: 关键交互自证** — Sankey hover/点击下钻、QueueLane 泳道、任务详情 DAG + failover 过程帧推进、路由六维回放、告警滑块模拟、Funnel；FitScreen/transform 下点击用 `dispatchEvent`（见 dashboard demo 坑）。
- [ ] **Step 4: 4 组件 doc 页自证** — 访问 `/components/sankey`(等) doc 页零 error。
- [ ] **Step 5: 覆盖率** — `node apps/www/scripts/demos-coverage.mjs`（或对应命令），确认 4 新组件点亮计入、覆盖率上升。
- [ ] **Step 6: demos.ts 状态改 done** — hunk 级暂存提交。
- [ ] **Step 7: 全库测试终检** — `pnpm --filter @hulian/ui test` 全绿。
- [ ] **Step 8: 最终提交** — 残余文件（共享文件 hunk 级），不 push。
- [ ] **Step 9: 更新 memory** — 写 `hulian-demo-hanhelm.md` + MEMORY.md 指针（含命名/4 组件/坑）。

---

## Self-Review（计划 vs spec）

- **Spec §3 七页** → Task 6（空页）+ Task 7（dogfood）逐页覆盖 ✓
- **Spec §4 四组件** → Task 1-4 各含几何纯函数 TDD + 四件套 + 10 接入点 ✓
- **Spec §5 数据+引擎** → Task 5 覆盖 routing/sla/failover/use-dispatch-run + _data ✓
- **Spec §6 验证** → Task 8 覆盖组件测/画廊/CDP/覆盖率 ✓
- **ScoreRing 软依赖** → Task 7 Step 1/5 明确「ScoreRing 软依赖/meter 兜底」✓
- **Flow 复用** → Task 7 Step 3 详情页 DAG 复用既有 Flow ✓
- **output:export 拆 server/client** → Task 6 Step 4 + Task 7 Step 3 ✓
- **类型一致性**：`scoreExecutors`/`DEFAULT_WEIGHTS`/`evaluateSla`/`nextFallback`/`groupByLane`/`computeSankeyLayout`/`computeFunnel`/`sparklinePath` 跨任务命名一致 ✓
- **并行会话 git 卫生** → 各 Task 提交步骤用「只 add 自己文件 / 共享文件 hunk 级 git apply --cached」✓
- **占位符扫描**：无 TBD/TODO；每个纯函数任务含完整测试码与实现说明 ✓
