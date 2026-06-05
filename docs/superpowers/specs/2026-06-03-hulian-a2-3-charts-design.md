# 瑚琏 A2.3 数据展示 — Charts/KPI 设计

> 状态：设计已定（brainstorm 完成）。日期 2026-06-03。
> 上游：`2026-06-02-hulian-a2-absorption-batch-design.md` §10 / `…-absorption-model-v3.md` §3「Charts/KPI（数据可视化空白）」。
> 同批前序：A2.3 Table（已落，`…-a2-3-table-design.md`）。本 spec 续做数据展示批的图表部分。

## 1. 本质与边界

数据后台缺「指标卡 + 趋势/对比图」。难点不在皮肤，在**图表引擎**（坐标系/比例尺/路径/响应式测量）。瑚琏的价值是给引擎一层**只消费语义 token、明暗自适应**的皮肤——与 Table 选 TanStack headless 同一「吸取引擎 + 瑚琏皮肤」哲学。

**MVP = 三件**：
1. **Stat**（KPI 指标卡）——label + 大数值 + 可选 delta（升/降，tone 派生）。**纯瑚琏皮肤，不引图表库**。
2. **AreaChart**（趋势面积图，多序列）——recharts 薄裹 + token 皮肤。
3. **BarChart**（分类柱图，多序列）——同 recharts 基座 + token 皮肤。

## 2. ⚠️ 关键裁决：引 `recharts`，**否决 spec §10 原写的 Tremor**

spec §10 原计划 Charts=Tremor（`@tremor/react`）。brainstorm 实证后**改判 recharts 直裹**，理由（已核实）：

- **`@tremor/react@3.18.7` 停在 Tailwind v3 时代**（最后大版本 ~2025-01），需 `tailwind.config.js` 颜色 preset + `safelist` + 自带命名调色板（"blue"/"emerald"→TW 类）。**瑚琏是 Tailwind v4 + CSS-first + 只消费语义 token** → Tremor 的 config preset 机制与自带调色板**与瑚琏红线正面冲突**；Tremor next-gen（TW v4/React 19）仍 beta。来源：npmjs `@tremor/react`、tremor X 公告 next-gen beta、npm.tremor.so。
- **Tremor 本身就是裹 `recharts`**。直接用 recharts = 去掉中间不兼容层，`stroke`/`fill` 直接吃 CSS 变量 `var(--color-chart-1)` → **天然明暗自适应**（data-theme 切 CSS 变量即换色）、TW v4 干净（零 config preset）、引擎本身活跃维护、React 19 兼容（recharts ≥2.15）。
- **依赖**：`recharts` 进 `@hulianui/ui` 的 **`dependencies`**。装：`pnpm --filter @hulianui/ui add recharts`。lockfile 随实现 commit。
- Stat 不引任何图表库（纯 Card/Badge 气质皮肤）。

> 这是对主 spec §10 的实质偏离。落地后需回写主 spec §10：「Charts = recharts 直裹 + 瑚琏 token 皮肤（否决 Tremor，因 TW v4 不兼容 + 调色板打架 token）」。

## 3. Token 层新增：图表分类调色板 `--color-chart-1..4`

多序列图表需分类色序，而瑚琏语义层目前只有 primary/danger（danger=红=坏，不能当中性序列色）。按 **shadcn `--chart-1..5` 先例**，在 `packages/tokens/src/semantic.css` 新增 4 个图表语义 token（明暗各值，图表色在暗态需提亮以保可见对比）：

```css
:root {
  /* 图表分类色板（数据序列用，组件只消费这一层） */
  --color-chart-1: oklch(0.62 0.19 255); /* 蓝（同 brand 气质） */
  --color-chart-2: oklch(0.70 0.16 155); /* 绿 */
  --color-chart-3: oklch(0.75 0.15 70);  /* 琥珀 */
  --color-chart-4: oklch(0.62 0.19 300); /* 紫 */
}
[data-theme="dark"] {
  --color-chart-1: oklch(0.70 0.17 255);
  --color-chart-2: oklch(0.76 0.16 155);
  --color-chart-3: oklch(0.80 0.15 70);
  --color-chart-4: oklch(0.72 0.18 300);
}
```

- **纯增量**（无既有消费者受影响），是数据可视化批应有的 token 基建，**不破「只消费语义 token」——而是补齐 token**。
- **图表 SVG 经 `var(--color-chart-N)` 直接消费**（recharts `fill`/`stroke` 吃 CSS 变量）→ 颜色随 `[data-theme]` 切换天然明暗自适应（套 [[tailwind-v4-shadcn-dark-variant-data-theme-bridge]]），**绝不写死 hex**。
- ⚠️ **token→工具类机制实证**：`preset.css` 用 `@theme inline { --color-X: var(--color-X); }` **逐条显式映射**才生成 `bg-X`/`text-X` 工具类。图表走 `var()` **不需要工具类**，故 chart token 只需进 `semantic.css`；但为正规化（未来 legend 色块可用 `bg-chart-1`）**顺带在 preset.css 的 `@theme inline` 注册 `--color-chart-1..4`**。
- ⚠️ **不加 `--color-success`**（用户硬约束：语义 token 集无 success）。Stat 升降趋势色见 §5.1。

## 4. faker 扩时间序列工厂（spec §10 授权「faker 扩时间序列工厂」）

`packages/mocks/src/factories.ts` 加（**纯增量，不动 makeUsers**）：

```ts
export interface DemoSeriesPoint {
  month: string;   // "1月".."12月"
  revenue: number; // 千元级
  orders: number;  // 百级
}
export function makeTimeseries(count = 12, seed = 7): DemoSeriesPoint[] {
  faker.seed(seed);
  const months = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  return Array.from({ length: count }, (_, i) => ({
    month: months[i % 12],
    revenue: faker.number.int({ min: 20, max: 120 }),
    orders: faker.number.int({ min: 50, max: 400 }),
  }));
}
```
确定性种子防 hydration mismatch。`@hulianui/mocks` 已是 ui 的 devDep（Table 批已接），showcase 直接 import。

## 5. 组件 API 与皮肤

### 5.1 Stat（KPI 卡，纯皮肤·无图表库）

```ts
export interface StatProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  label: ReactNode;               // 指标名
  value: ReactNode;               // 大数值（已格式化）
  delta?: number;                 // 环比，正=升/负=降；不传则不渲染趋势
  deltaLabel?: ReactNode;         // 趋势旁注（如「较上月」）
  icon?: ReactNode;               // 可选前置图标
}
```
- 皮肤：`Card` 气质（`rounded-[var(--radius)] border border-border bg-surface p-5`）；label `text-sm text-muted`；value `text-2xl font-semibold text-foreground`；delta 用小行——**升 `text-primary` + lucide `TrendingUp` / 降 `text-danger` + `TrendingDown`**（用户硬约束：无 success，升用 primary 降用 danger）。
- 纯静态 → **Stat 本体不加 "use client"**（同 Alert/Badge/Card 纪律），仅 showcase 加。

### 5.2 AreaChart / BarChart（recharts 薄裹 + token 皮肤）

```ts
export interface ChartSeries { key: string; label?: string; color?: string; } // color 缺省按 index 取 chart-1..4
export interface ChartProps<TDatum = Record<string, unknown>> {
  data: TDatum[];
  series: ChartSeries[];          // 一条或多条
  xKey: string;                   // 横轴字段（如 "month"）
  height?: number;                // 默认 280；SSR 安全（见 §6）
  className?: string;
}
```
- 共享基座 `chart-theme.ts`（**纯函数 + 常量**）：`chartColor(i|token)` → `var(--color-chart-N)`；瑚琏化的 `CartesianGrid`(stroke `var(--color-border)`)、`XAxis`/`YAxis`(tick `var(--color-muted)`, 无轴线/细线)、`Tooltip`(瑚琏 `bg-surface border-border` 卡片 content)。
- **逻辑/皮肤分离**：recharts 组件树（ResponsiveContainer + AreaChart/BarChart + 每序列一个 Area/Bar，color 来自 token）= 引擎；axis/grid/tooltip 的 token 化样式 = 皮肤。
- 组件 **必 "use client"**（recharts 用 DOM 测量 + ResponsiveContainer）。
- 多序列：`series.map` 渲 `<Area dataKey=key stroke/fill=color>` / `<Bar dataKey=key fill=color>`；Area 用半透明填充（`fillOpacity`）。

## 6. ⚠️ recharts × Next SSG/jsdom 两道坎

1. **ResponsiveContainer SSR/构建**：`next build` 预渲染（及 jsdom）下容器宽高为 0，recharts 仅警告不报错，客户端 hydrate 后测量出图。组件 **必 "use client"**；给 `height` 显式值（默认 280），宽走 ResponsiveContainer 100%。SSG 页面只要不抛错即可（图在浏览器出）。
2. **jsdom 测不出 SVG 几何**：ResponsiveContainer 在 jsdom 宽 0 → 子图不渲染路径。**单测策略**：① **Stat 全行为单测**（纯皮肤）；② Chart 单测 **mock `recharts` 的 `ResponsiveContainer` 为固定尺寸 div**（`vi.mock`）使子树渲染，断言 smoke（渲染不抛 + 每序列产出 recharts 类节点）+ 测 `chartColor` 纯函数；③ **图表视觉正确性交 Playwright 明暗截图**（套 [[ui-layout-verify-needs-screenshot-not-dom-eval]]）。

## 7. 四件套 + showcase（不改 ShowcaseSpec）

- 目录 `packages/ui/src/stat/`（Stat 四件套）+ `packages/ui/src/chart/`（AreaChart/BarChart/chart-theme，共用一套四件套：`chart.tsx`/`chart.types.ts`/`chart.showcase.tsx`/`chart.test.tsx`/`index.ts`）。
- **2 个 manifest slug**：`stat`（KPI 卡）、`chart`（图表页，showcase 含 Area + Bar 两态，类比 Tabs 一页展 underline/solid）。均 `data-display`/`new`。
- showcase 用 `makeTimeseries()` 承载数据（states：Area 多序列 / Bar 多序列 / Stat 升降两态），`ShowcaseSpec` 零改。
- 桶导出 → 主 `index.ts` `export * from "./stat"` + `export * from "./chart"` → www `registry.tsx` import+map `statShowcase`/`chartShowcase` → manifest +2。

## 8. 测试

- **Stat**：label/value 渲染；`delta>=0`→`text-primary`+TrendingUp+正号、`delta<0`→`text-danger`+TrendingDown、无 delta 不渲染趋势行（无 svg）。
- **Chart**（mock ResponsiveContainer）：AreaChart/BarChart 渲染不抛；多序列各产出节点；`chartColor(0)`==`var(--color-chart-1)`、越界回绕。
- **chart-theme 纯函数**：`chartColor` 索引/token 名两种入参。

## 9. 验收（done 的标志）

1. Stat + Chart(Area+Bar) 四件套齐 + 主 barrel 导出 + manifest/registry 双文件各 +2；token 层加 `--color-chart-1..4`（明暗 semantic.css + preset.css @theme inline 注册）。**不加 success**。
2. 三道门 `--force` 全绿：typecheck + 自己 vitest + `build --filter=www --force`（recharts 进 bundle + SSG 不抛 + 新依赖 lockfile 一并 commit）。
3. Playwright/隔离 chromium 截图**明暗两态**存 cwd 根 Read 看像素：Stat 卡（数值/升降色）、AreaChart（多序列填充 + 轴/网格 token 色 + tooltip）、BarChart（柱 + 间距），验**明暗两态序列色都可见可读**、坐标轴/网格不刺眼、图不溢出卡片。端口 5512/5514（桌面 app 跑 5514 则用 5514）。
4. 桌面 app 加载 stat/chart 页正常（recharts 在 WKWebView 出图）。
5. 不触碰他人 untracked WIP（drawer/select 等并行族）。

## 10. 不做（YAGNI 边界）

LineChart（Area 已覆盖趋势，line 是变体）/ DonutChart·PieChart / Sparkline / 多 Y 轴 / brush·缩放 / 自定义 legend 交互 / 实时流 / 导出图片 —— 全部推迟到图表批后续阶段，按需加 recharts 组件 + 复用 chart-theme 基座，皮肤零重构。
