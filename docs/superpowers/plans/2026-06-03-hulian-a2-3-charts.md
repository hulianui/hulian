# 瑚琏 A2.3 Charts/KPI 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development 或 executing-plans 逐任务实施。步骤用 `- [ ]` 复选框追踪。

**Goal:** 给瑚琏补完 A2.3 数据展示——Stat（KPI 指标卡，纯皮肤）+ Chart（AreaChart/BarChart，`recharts` 直裹 + 瑚琏 token 皮肤），接入文档站 IA。

**Architecture:** Stat 是纯 Card 气质皮肤（无图表库），升=`text-primary`/降=`text-danger`。Charts 用 `recharts`（Tremor 的底层引擎，否决 Tremor 因 TW v4 不兼容 + 调色板打架 token）薄裹，SVG `fill/stroke` 直接吃 `var(--color-chart-N)` CSS 变量 → 明暗自适应。多序列调色板在 token 层新增 `--color-chart-1..4`（无 success）。

**Tech Stack:** React 19 + TS strict + `recharts`（新依赖，进 `@hulianui/ui` dependencies）+ Tailwind v4 语义 token + lucide-react + vitest/jsdom（mock ResponsiveContainer）+ `@hulianui/mocks`（faker，已是 ui devDep）。

**关键约束（继承）：** 只消费语义 token（图表色走 `var(--color-chart-N)`，绝不写死 hex；**无 success**）；四件套 + 图表本体必 `"use client"` + showcase 必 `"use client"`；桶导出 + 主 index export + showcase 从主 barrel 导出；三道门 `--force`（[[turbo-test-red-isolate-untracked-wip-not-your-regression]]）；精确 `git add <路径>` 不碰他人 untracked WIP（drawer/select 等，[[parallel-session-git-add-all-sweeps-your-staged-files]]）；截图明暗两态存 cwd 根 Read 看像素（[[ui-layout-verify-needs-screenshot-not-dom-eval]]）；新依赖 lockfile 随 commit。

**文件结构：**
- 改 `packages/tokens/src/semantic.css` — :root + [data-theme=dark] 各加 `--color-chart-1..4`。
- 改 `packages/tokens/src/preset.css` — `@theme inline` 注册 4 个 chart token。
- 改 `packages/ui/package.json` — 加 `recharts` dep。
- 改 `packages/mocks/src/factories.ts` + `index.ts` — 加 `makeTimeseries` + `DemoSeriesPoint`。
- 新建 `packages/ui/src/stat/`：`stat.types.ts`/`stat.tsx`/`stat.test.tsx`/`stat.showcase.tsx`/`index.ts`。
- 新建 `packages/ui/src/chart/`：`chart-theme.ts`（纯）/`chart.types.ts`/`chart.tsx`/`chart.test.tsx`/`chart.showcase.tsx`/`index.ts`。
- 改 `packages/ui/src/index.ts` — `export * from "./stat"` + `export * from "./chart"`。
- 改 `apps/www/lib/manifest.ts` + `apps/www/lib/registry.tsx` — +2（stat/chart）。

---

## Task 1: token 调色板 + 依赖 + faker 工厂

**Files:** `packages/tokens/src/semantic.css`、`packages/tokens/src/preset.css`、`packages/ui/package.json`、`packages/mocks/src/factories.ts`、`packages/mocks/src/index.ts`

- [ ] **Step 1: semantic.css 加 chart token（:root 末尾 `--radius` 后、`}` 前插）**

`:root` 块加：
```css
  --color-chart-1: oklch(0.62 0.19 255);
  --color-chart-2: oklch(0.7 0.16 155);
  --color-chart-3: oklch(0.75 0.15 70);
  --color-chart-4: oklch(0.62 0.19 300);
```
`[data-theme="dark"]` 块加（暗态提亮保可见）：
```css
  --color-chart-1: oklch(0.7 0.17 255);
  --color-chart-2: oklch(0.76 0.16 155);
  --color-chart-3: oklch(0.8 0.15 70);
  --color-chart-4: oklch(0.72 0.18 300);
```

- [ ] **Step 2: preset.css 的 `@theme inline` 注册（`--radius` 行前插 4 行）**

```css
  --color-chart-1: var(--color-chart-1);
  --color-chart-2: var(--color-chart-2);
  --color-chart-3: var(--color-chart-3);
  --color-chart-4: var(--color-chart-4);
```

- [ ] **Step 3: 装 recharts**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm --filter @hulianui/ui add recharts
```
Expected: `package.json` dependencies 多 `recharts`；lockfile 更新。peer 若警告 React 版本（recharts ≥2.15 支持 React 19）只是 warning，可继续；若硬失败则 `pnpm --filter @hulianui/ui add recharts@latest`。

- [ ] **Step 4: mocks 加时间序列工厂（factories.ts 末尾追加）**

```ts
export interface DemoSeriesPoint {
  month: string;
  revenue: number;
  orders: number;
}
export function makeTimeseries(count = 12, seed = 7): DemoSeriesPoint[] {
  faker.seed(seed);
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  return Array.from({ length: count }, (_, i) => ({
    month: months[i % 12],
    revenue: faker.number.int({ min: 20, max: 120 }),
    orders: faker.number.int({ min: 50, max: 400 }),
  }));
}
```
`index.ts` 加：
```ts
export { makeUsers, makeTimeseries } from "./factories";
export type { DemoUser, DemoSeriesPoint } from "./factories";
```
（注意：现有 index.ts 是 `export { makeUsers } from "./factories"; export type { DemoUser } from "./factories";` —— 改成上面两行合并形式。）

- [ ] **Step 5: typecheck mocks + ui**

Run: `pnpm --filter @hulianui/mocks exec tsc --noEmit && pnpm --filter @hulianui/ui exec tsc --noEmit`
Expected: PASS（recharts 类型解析，makeTimeseries 类型对）。

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/src/semantic.css packages/tokens/src/preset.css packages/ui/package.json pnpm-lock.yaml packages/mocks/src/factories.ts packages/mocks/src/index.ts
git commit -m "feat(tokens+mocks): A2.3 Charts 基建 — chart-1..4 调色板 token + recharts 依赖 + makeTimeseries faker 工厂"
```

---

## Task 2: Stat（KPI 卡，TDD，纯皮肤）

**Files:** `packages/ui/src/stat/stat.types.ts`、`stat.test.tsx`、`stat.tsx`

- [ ] **Step 1: stat.types.ts**

```ts
import type { HTMLAttributes, ReactNode } from "react";

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** 环比百分比，>=0 升(text-primary) / <0 降(text-danger)；不传则不渲染趋势 */
  delta?: number;
  deltaLabel?: ReactNode;
  icon?: ReactNode;
}
```

- [ ] **Step 2: stat.test.tsx（失败测试）**

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Stat } from "./stat";

describe("Stat", () => {
  it("渲染 label + value", () => {
    const { getByText } = render(<Stat label="月活" value="12,034" />);
    expect(getByText("月活")).toBeTruthy();
    expect(getByText("12,034")).toBeTruthy();
  });

  it("delta>=0 → text-primary + 上箭头 + 正号", () => {
    const { getByText, container } = render(<Stat label="GMV" value="¥88k" delta={12} />);
    const trend = getByText(/\+12%/).closest("div") as HTMLElement;
    expect(trend.className).toContain("text-primary");
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("delta<0 → text-danger + 负号", () => {
    const { getByText } = render(<Stat label="退款" value="3" delta={-5} />);
    const trend = getByText(/-5%/).closest("div") as HTMLElement;
    expect(trend.className).toContain("text-danger");
  });

  it("无 delta → 不渲染趋势行（无 svg）", () => {
    const { container } = render(<Stat label="x" value="1" />);
    expect(container.querySelector("svg")).toBeNull();
  });
});
```

- [ ] **Step 3: 跑测试验证失败**

Run: `pnpm --filter @hulianui/ui exec vitest run src/stat/stat.test.tsx`
Expected: FAIL（`./stat` 不存在）。

- [ ] **Step 4: stat.tsx 实现**

```tsx
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../lib/cn";
import type { StatProps } from "./stat.types";

export function Stat({ label, value, delta, deltaLabel, icon, className, ...props }: StatProps) {
  const hasDelta = typeof delta === "number";
  const up = hasDelta && (delta as number) >= 0;
  return (
    <div
      className={cn("rounded-[var(--radius)] border border-border bg-surface p-5", className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted">{label}</span>
        {icon ? <span className="text-muted">{icon}</span> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
      {hasDelta ? (
        <div className={cn("mt-1 flex items-center gap-1 text-sm", up ? "text-primary" : "text-danger")}>
          {up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          <span>
            {up ? "+" : ""}
            {delta}%
          </span>
          {deltaLabel ? <span className="text-muted">{deltaLabel}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: 跑测试验证通过**

Run: `pnpm --filter @hulianui/ui exec vitest run src/stat/stat.test.tsx`
Expected: PASS（4 用例绿）。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/stat/stat.types.ts packages/ui/src/stat/stat.tsx packages/ui/src/stat/stat.test.tsx
git commit -m "feat(ui): Stat KPI 指标卡(纯皮肤·升=primary/降=danger) + TDD 4 用例"
```

---

## Task 3: Chart 基座 + AreaChart/BarChart（TDD，recharts + token 皮肤）

**Files:** `packages/ui/src/chart/chart-theme.ts`、`chart.types.ts`、`chart.test.tsx`、`chart.tsx`

- [ ] **Step 1: chart.types.ts**

```ts
export interface ChartSeries {
  key: string;
  label?: string;
  /** 缺省按序列 index 取 var(--color-chart-N)；可传任意 CSS 颜色/变量覆盖 */
  color?: string;
}
export interface ChartProps<TDatum = Record<string, unknown>> {
  data: TDatum[];
  series: ChartSeries[];
  /** 横轴字段名 */
  xKey: string;
  /** 默认 280（SSR 安全：宽走 ResponsiveContainer，高需显式值） */
  height?: number;
  className?: string;
}
```

- [ ] **Step 2: chart-theme.ts（纯函数 + 样式常量）**

```ts
import type { CSSProperties } from "react";

const CHART_TOKENS = ["--color-chart-1", "--color-chart-2", "--color-chart-3", "--color-chart-4"];

/** 序列 index → var(--color-chart-N) CSS 变量；越界回绕 */
export function chartColor(i: number): string {
  const n = CHART_TOKENS.length;
  return `var(${CHART_TOKENS[((i % n) + n) % n]})`;
}

// recharts 子件的瑚琏 token 化样式（坐标轴/网格/tooltip），只走 CSS 变量
export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "var(--color-muted)", fontSize: 12 },
};
export const gridProps = {
  strokeDasharray: "3 3",
  stroke: "var(--color-border)",
  vertical: false,
};
export const tooltipContentStyle: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius)",
  color: "var(--color-foreground)",
  fontSize: 12,
};
export const tooltipLabelStyle: CSSProperties = { color: "var(--color-muted)" };
```

- [ ] **Step 3: chart.test.tsx（失败测试，mock ResponsiveContainer 注入尺寸）**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// jsdom: ResponsiveContainer 测量为 0 → 子图不出。mock 成克隆 child 注入固定尺寸，使 recharts 渲 SVG。
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  const { cloneElement } = await import("react");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: any }) =>
      cloneElement(children, { width: 600, height: 300 }),
  };
});

import { AreaChart, BarChart } from "./chart";
import { chartColor } from "./chart-theme";

const data = [
  { month: "1月", revenue: 30, orders: 120 },
  { month: "2月", revenue: 45, orders: 200 },
  { month: "3月", revenue: 28, orders: 160 },
];
const series = [
  { key: "revenue", label: "营收" },
  { key: "orders", label: "订单" },
];

describe("chartColor", () => {
  it("索引映射 chart token，越界回绕", () => {
    expect(chartColor(0)).toBe("var(--color-chart-1)");
    expect(chartColor(1)).toBe("var(--color-chart-2)");
    expect(chartColor(4)).toBe("var(--color-chart-1)");
  });
});

describe("AreaChart", () => {
  it("多序列渲染不抛 + 产出 svg", () => {
    const { container } = render(<AreaChart data={data} series={series} xKey="month" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("BarChart", () => {
  it("多序列渲染不抛 + 产出 svg", () => {
    const { container } = render(<BarChart data={data} series={series} xKey="month" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
```

- [ ] **Step 4: 跑测试验证失败**

Run: `pnpm --filter @hulianui/ui exec vitest run src/chart/chart.test.tsx`
Expected: FAIL（`./chart` 不存在）。

- [ ] **Step 5: chart.tsx 实现**

```tsx
"use client";
import {
  ResponsiveContainer,
  AreaChart as ReAreaChart,
  BarChart as ReBarChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { cn } from "../lib/cn";
import {
  chartColor,
  axisProps,
  gridProps,
  tooltipContentStyle,
  tooltipLabelStyle,
} from "./chart-theme";
import type { ChartProps } from "./chart.types";

const MARGIN = { top: 8, right: 8, bottom: 0, left: -8 };

export function AreaChart<TDatum extends Record<string, unknown>>({
  data,
  series,
  xKey,
  height = 280,
  className,
}: ChartProps<TDatum>) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReAreaChart data={data} margin={MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
          {series.map((s, i) => {
            const color = s.color ?? chartColor(i);
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            );
          })}
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart<TDatum extends Record<string, unknown>>({
  data,
  series,
  xKey,
  height = 280,
  className,
}: ChartProps<TDatum>) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
            cursor={{ fill: "var(--color-surface-hover)" }}
          />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label ?? s.key}
              fill={s.color ?? chartColor(i)}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 6: 跑测试验证通过**

Run: `pnpm --filter @hulianui/ui exec vitest run src/chart/chart.test.tsx`
Expected: PASS（chartColor 3 断言 + Area/Bar smoke 各 svg 存在）。若 svg 为 null，确认 mock 的 `cloneElement` 注入了 width/height。

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/chart/chart-theme.ts packages/ui/src/chart/chart.types.ts packages/ui/src/chart/chart.tsx packages/ui/src/chart/chart.test.tsx
git commit -m "feat(ui): Chart 基座 + AreaChart/BarChart(recharts 直裹·SVG 走 chart token CSS 变量) + TDD"
```

---

## Task 4: showcase + 桶导出 + 主 barrel

**Files:** `packages/ui/src/stat/stat.showcase.tsx`、`stat/index.ts`、`packages/ui/src/chart/chart.showcase.tsx`、`chart/index.ts`、`packages/ui/src/index.ts`

- [ ] **Step 1: stat.showcase.tsx**

```tsx
"use client";
import { Activity, Users, ShoppingCart } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Stat } from "./stat";

export const statShowcase: ShowcaseSpec = {
  controls: [{ prop: "delta", type: "number", defaultValue: 12, label: "环比 %" }],
  states: [
    {
      name: "上升",
      render: () => (
        <Stat label="本月 GMV" value="¥128,400" delta={12.5} deltaLabel="较上月" icon={<Activity className="size-4" />} className="w-64" />
      ),
    },
    {
      name: "下降",
      render: () => (
        <Stat label="退款率" value="2.3%" delta={-4.1} deltaLabel="较上月" icon={<ShoppingCart className="size-4" />} className="w-64" />
      ),
    },
    {
      name: "无趋势",
      render: () => <Stat label="注册用户" value="8,021" icon={<Users className="size-4" />} className="w-64" />,
    },
  ],
  renderWithProps: (p) => (
    <Stat label="本月 GMV" value="¥128,400" delta={Number(p.delta)} deltaLabel="较上月" className="w-64" />
  ),
  toCode: (p) => `<Stat label="本月 GMV" value="¥128,400" delta={${p.delta}} deltaLabel="较上月" />`,
};
```

- [ ] **Step 2: stat/index.ts**

```ts
export { Stat } from "./stat";
export type { StatProps } from "./stat.types";
export { statShowcase } from "./stat.showcase";
```

- [ ] **Step 3: chart.showcase.tsx**

```tsx
"use client";
import { makeTimeseries } from "@hulianui/mocks";
import type { ShowcaseSpec } from "../showcase/types";
import { AreaChart, BarChart } from "./chart";

// mock① 真实样例：faker 确定性时间序列（防 hydration mismatch）
const data = makeTimeseries(12);
const series = [
  { key: "revenue", label: "营收(千元)" },
  { key: "orders", label: "订单" },
];

export const chartShowcase: ShowcaseSpec = {
  controls: [{ prop: "type", type: "select", options: ["area", "bar"], defaultValue: "area", label: "图表类型" }],
  states: [
    { name: "面积图（多序列）", render: () => <AreaChart data={data} series={series} xKey="month" className="max-w-xl" /> },
    { name: "柱状图（多序列）", render: () => <BarChart data={data} series={series} xKey="month" className="max-w-xl" /> },
    {
      name: "单序列面积",
      render: () => <AreaChart data={data} series={[{ key: "revenue", label: "营收" }]} xKey="month" className="max-w-xl" />,
    },
  ],
  renderWithProps: (p) =>
    p.type === "bar" ? (
      <BarChart data={data} series={series} xKey="month" className="max-w-xl" />
    ) : (
      <AreaChart data={data} series={series} xKey="month" className="max-w-xl" />
    ),
  toCode: (p) =>
    `<${p.type === "bar" ? "BarChart" : "AreaChart"}\n  data={series}\n  series={[{ key: "revenue", label: "营收" }, { key: "orders", label: "订单" }]}\n  xKey="month"\n/>`,
};
```

- [ ] **Step 4: chart/index.ts**

```ts
export { AreaChart, BarChart } from "./chart";
export { chartColor } from "./chart-theme";
export type { ChartProps, ChartSeries } from "./chart.types";
export { chartShowcase } from "./chart.showcase";
```

- [ ] **Step 5: 主 barrel `packages/ui/src/index.ts` 组件区追加**

在最后一个 `export * from "./xxx";` 组件行之后加（用 Edit 锚定当前最后一行组件 export，例如 `export * from "./drawer";` 或 `./table` 之后；若被并行 session 改动则锚定实际最后一行）：
```ts
export * from "./stat";
export * from "./chart";
```

- [ ] **Step 6: typecheck**

Run: `pnpm --filter @hulianui/ui exec tsc --noEmit`
Expected: PASS（makeTimeseries 经 mocks devDep 解析；ShowcaseSpec/Chart 类型对齐）。

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/stat/stat.showcase.tsx packages/ui/src/stat/index.ts packages/ui/src/chart/chart.showcase.tsx packages/ui/src/chart/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): Stat/Chart showcase(faker makeTimeseries) + 桶导出 + 主 barrel"
```

---

## Task 5: 接入文档站 IA（manifest + registry，+2）

**Files:** `apps/www/lib/manifest.ts`、`apps/www/lib/registry.tsx`

> ⚠️ 这两文件被并行 session 高频写入。**用幂等 python 读改写**（检测 slug 已存在则跳过），缩竞争窗口；插入后 git diff 核对仅自己增量再 pathspec commit。

- [ ] **Step 1: manifest 加 2 行（幂等 python）**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
python3 - <<'PY'
p = "apps/www/lib/manifest.ts"
s = open(p, encoding="utf-8").read()
lines = [
  '  { slug: "stat", name: "Stat", description: "指标卡 · KPI 数值/标签/升降趋势(无图表库)", category: "data-display", status: "new" },\n',
  '  { slug: "chart", name: "Chart", description: "图表 · recharts 直裹 + chart token 皮肤(Area/Bar)", category: "data-display", status: "new" },\n',
]
idx = s.rfind("];")
add = "".join(l for l in lines if f'slug: "{l.split(chr(34))[1]}"' not in s)
if add:
    s = s[:idx] + add + s[idx:]
    open(p, "w", encoding="utf-8").write(s)
    print("inserted:", [l.split(chr(34))[1] for l in lines if l in add])
else:
    print("all present, skip")
PY
grep -n 'slug: "stat"\|slug: "chart"' apps/www/lib/manifest.ts
```

- [ ] **Step 2: registry import + map 加 2（幂等 python）**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
python3 - <<'PY'
p = "apps/www/lib/registry.tsx"
s = open(p, encoding="utf-8").read()
# import 块：在 "} from "@hulianui/ui";" 前插
if "statShowcase" not in s:
    s = s.replace("\n} from \"@hulianui/ui\";", "\n  statShowcase,\n  chartShowcase,\n} from \"@hulianui/ui\";", 1)
# map：在最后一个 "};" 前插
    idx = s.rfind("};")
    s = s[:idx] + "  stat: statShowcase,\n  chart: chartShowcase,\n" + s[idx:]
    open(p, "w", encoding="utf-8").write(s)
    print("inserted")
else:
    print("present, skip")
PY
grep -n "statShowcase\|chartShowcase\|stat: \|chart: " apps/www/lib/registry.tsx
```

- [ ] **Step 3: 三道门 `--force`**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck
pnpm --filter @hulianui/ui exec vitest run
pnpm build --filter=www --force
```
Expected: typecheck PASS；ui 我 scope 测试全绿（Stat 4 + Chart 5；他人族测试若因 untracked WIP 红则按 [[turbo-test-red-isolate-untracked-wip-not-your-regression]] 隔离，非我引入）；`build --filter=www` PASS（recharts 进 bundle、`/components/stat` + `/components/chart` SSG 生成、ResponsiveContainer 在预渲染下不抛错）。

- [ ] **Step 4: git diff 核对仅自己增量 + commit**

```bash
git diff apps/www/lib/manifest.ts apps/www/lib/registry.tsx   # 确认仅 stat/chart 4 处增量
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): Stat/Chart 接入 IA(data-display 分组) + registry/manifest 双文件 +2"
```

---

## Task 6: 浏览器实测明暗两态（截图 Read 看像素）

**Files:** 无代码改动。截图存 cwd 根：`stat-light.png`/`stat-dark.png`/`chart-light.png`/`chart-dark.png`（自己文件名，不 commit）。

- [ ] **Step 1: 探活端口**

```bash
for p in 5514 5512; do echo "$p: $(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://localhost:$p/components/chart)"; done
```
任一 200 即用；都不在则 `pnpm --filter www dev` 后台起（5512）。

- [ ] **Step 2: 隔离 chromium 截 4 图（MCP 浏览器可能被并行 session 占用，套 [[mcp-browser-busy-launch-isolated-chromium-via-executablepath]]）**

```bash
mkdir -p /tmp/hlshot-chart && cd /tmp/hlshot-chart && npm init -y >/dev/null 2>&1 && npm i playwright-core >/dev/null 2>&1
cat > /tmp/hlshot-chart/shot.mjs <<'EOF'
import { chromium } from "playwright-core";
const EXEC = "/Users/zhangzhiwei/Library/Caches/ms-playwright/chromium-1124/chrome-mac/Chromium.app/Contents/MacOS/Chromium";
const OUT = "/Users/zhangzhiwei/Desktop/code/hulian";
const PORT = process.env.PORT || "5514";
const browser = await chromium.launch({ executablePath: EXEC, headless: true });
for (const slug of ["stat", "chart"]) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1500 }, deviceScaleFactor: 2 });
    await ctx.addInitScript((t) => { try { localStorage.setItem("hulian-theme", t); } catch {} }, theme);
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${PORT}/components/${slug}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForSelector(slug === "chart" ? "svg" : "text=GMV", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(800); // recharts 动画/测量稳定
    await page.screenshot({ path: `${OUT}/${slug}-${theme}.png`, fullPage: true });
    console.log(`${slug}-${theme}: data-theme=${await page.evaluate(() => document.documentElement.getAttribute("data-theme"))}`);
    await ctx.close();
  }
}
await browser.close();
EOF
PORT=<探活到的端口> node /tmp/hlshot-chart/shot.mjs
```

- [ ] **Step 3: Read 4 图看像素**

Read `stat-light/dark.png` + `chart-light/dark.png`，逐条核：
1. **Stat**：卡片数值大而清、label muted、升趋势 `text-primary`(蓝) + 上箭头、降趋势 `text-danger`(红) + 下箭头、无趋势卡无箭头；明暗两态卡底/边框/文字对比都对。
2. **Chart Area**：多序列面积填充（chart-1 蓝 / chart-2 绿）半透明叠加、折线描边、坐标轴 tick muted 色、网格虚线 border 色淡、**明暗两态序列色都可辨**。
3. **Chart Bar**：柱顶圆角、多序列并列、间距匀、不溢出卡片。
4. 长月份标签不溢出；tooltip（可选 hover 验）瑚琏卡片样式。
Expected: 全符合；不符回 chart.tsx/chart-theme.ts 调，重跑 Task 5 Step 3 + 重截。

- [ ] **Step 4: 桌面 app(5514) 加载验证**

确认 5514 `/components/stat` + `/components/chart` 加载正常（左树「数据展示」组出现 Stat/Chart、recharts 在 WKWebView 出图无报错）。

---

## Task 7: 收尾

- [ ] **Step 1: 回写主 spec §10**

`docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md` §10 的「Charts/KPI（Tremor…）」追注：实际改判 **recharts 直裹 + 瑚琏 token 皮肤**（否决 Tremor：TW v4 不兼容 + 调色板打架 token），见 `…-a2-3-charts-design.md`。

- [ ] **Step 2: 更新项目记忆**

`hulian-phase-status.md` 追加 A2.3 Charts 完成态（recharts 选型 + 否决 Tremor 理由 + chart token 调色板 + Stat 升 primary/降 danger + recharts SSR/jsdom 两坎 + 组件计数 +2=22）；MEMORY.md 索引刷新。

- [ ] **Step 3: claudeception 评估**

recharts 选型（否决 Tremor 的 TW v4 理由）+ SVG 走 CSS 变量明暗自适应 + jsdom mock ResponsiveContainer + chart token 调色板，很可能产新 skill。跑 claudeception 评估沉淀。

---

## Self-Review

**Spec 覆盖：**
- §2 引 recharts 否决 Tremor → Task 1 Step 3 + Task 7 Step 1 回写 ✅
- §3 chart-1..4 token（semantic + preset @theme inline，无 success）→ Task 1 Step 1/2 ✅
- §4 makeTimeseries faker 工厂 → Task 1 Step 4 ✅
- §5.1 Stat（升 primary/降 danger，不加 success，本体无 "use client"）→ Task 2 ✅
- §5.2 Area/Bar（recharts 薄裹 + token 皮肤 + "use client" + 多序列 chartColor）→ Task 3 ✅
- §6 SSR/jsdom 两坎（"use client" + 显式 height + mock ResponsiveContainer）→ Task 3 Step 3/5 + Task 5 Step 3 ✅
- §7 四件套 + 不改 ShowcaseSpec + states 承载 + 2 slug → Task 2/3/4/5 ✅
- §8 测试（Stat 行为 + Chart smoke + chartColor）→ Task 2/3 ✅
- §9 验收（双文件 +2 + 三道门 --force + 截图明暗 + 桌面 app）→ Task 5/6 ✅
- §10 不做项 → 计划内无 Line/Donut/Sparkline 代码 ✅

**Placeholder 扫描：** 无 TBD/TODO；每代码步给完整代码；Task 4 Step 5 主 barrel 锚点说明了并行改动应对。

**类型一致性：** `StatProps`/`ChartProps`/`ChartSeries`/`chartColor`/`statShowcase`/`chartShowcase`/`makeTimeseries`/`DemoSeriesPoint` 在 types→tsx→theme→showcase→index→registry→mocks 全程命名一致；chart token 名 `--color-chart-1..4` 在 semantic.css/preset.css/chart-theme.ts 三处一致；Stat 趋势色 `text-primary`/`text-danger` 与 spec §5.1/§8 一致（无 success）。
