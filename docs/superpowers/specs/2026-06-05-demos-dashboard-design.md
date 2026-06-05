# 数据可视化大屏 demo（`/demos/dashboard`）设计

> 日期：2026-06-05 · 类型：新建内置 demo（第 10 个）+ 反哺 2 件组件库改动
> 配套铁律：`apps/www/app/demos/README.md`

## 1. 目标与定位

补齐 9 个 demo 里唯一缺的门面级品类「数据可视化大屏」（`demos.ts` 的 category 注释自己把它当例子却没填）。

核心是 **dogfood 点亮全库唯一且零使用的 `WorldMap`**：用真实「全球调度指挥中心」场景反哺组件库——给 WorldMap 补独立节点 / 标签 / 可点击下钻能力，并新增大屏品类必备的 `FitScreen`（16:9 等比缩放铺满）组件。

**题材**：复用既有「瀚云 HanCloud」品牌 →「**瀚云全球调度指挥中心**」（全球 CDN / 跨境流量调度大屏）。

**第一性约束（来自用户）**：缺组件/组件有问题一律回 `@hulianui/ui` 加/修，绝不在 demo 里打 CSS 补丁，100% 用 `@hulianui/ui` 组件实现。demo 是用真实场景拓展 UI 库的载体。

## 2. 组件库改动（反哺，共 2 件）

### 2.1 WorldMap 扩展（`packages/ui/src/world-map/`）

现状：`dots: {start,end,color?}[]` 飞线（二次贝塞尔 + pathLength 画入循环 + 端点脉冲），走 token 吃明暗主题。
缺口：① 只有飞线起止点才有圆点，无法画「不在飞线上的独立节点」；② `label` 字段存在但不渲染；③ SVG `aria-hidden` 纯装饰，不可点击下钻。

**新增类型**（`world-map.types.ts`）：

```ts
export interface WorldMapNode extends WorldMapPoint {
  id?: string;
  /** 驱动节点半径(流量/负载)，在组件内按 value 范围 clamp 到 [rMin, rMax]。不传用基准半径。 */
  value?: number;
  /** 节点色，默认 chart token。 */
  color?: string;
}
```

**`WorldMapProps` 新增**（全部可选，向后兼容，旧飞线 showcase/测试零改动）：

```ts
points?: WorldMapNode[];                              // 独立节点，不依赖飞线也能画
showLabels?: boolean;                                 // 渲染节点标签文字(默认 false=旧行为)
onPointClick?: (node: WorldMapNode, index: number) => void;  // 点节点下钻
```

**渲染**：
- 节点 = 实心圆（半径按 value 在 [rMin,rMax] 线性插值；无 value 用基准）+ 脉冲环，复用现有端点画法。颜色 `node.color ?? var(--color-chart-1)`。
- `showLabels` 时点旁画 `<text>`（font-size 走固定 viewBox 比例、fill 用 `--color-muted-foreground` token），`pointer-events:none` 防挡点击。
- 节点与飞线端点都去重（同坐标只画一个），节点优先级高于飞线端点配色。

**可交互无障碍**：
- 传 `onPointClick` 时：节点 `<g>` 加 `role="button"`、`tabIndex={0}`、`onClick`、`onKeyDown`(Enter|Space 触发)、`cursor:pointer`、`aria-label`(用 label 或 `节点 N`)；并把该模式下 `<svg>` 的 `aria-hidden` 放开（纯展示态——无 onPointClick——仍保持 `aria-hidden`）。
- 尊重既有 `prefers-reduced-motion`：节点脉冲环同飞线一样在 reduced 下静默。

**测试**（扩 `world-map.test.tsx`，旧断言不动）：
- `points` 渲染对应数量的节点圆。
- `showLabels` 渲染 `<text>` 标签。
- `onPointClick` 在点击 / 键盘 Enter 时按正确 `(node,index)` 触发。
- 无 `onPointClick` 时 svg 保持 `aria-hidden`；有则放开。

**manifest 描述更新**：`world-map` 条目补「独立节点(value 分大小)/标签/可点击下钻」。

### 2.2 新增 FitScreen（`packages/ui/src/fit-screen/`）

大屏品类刚需：把固定设计尺寸（默认 1920×1080）等比缩放铺满父容器，居中。

```ts
export interface FitScreenProps {
  children: React.ReactNode;
  /** 设计稿宽，默认 1920 */
  designWidth?: number;
  /** 设计稿高，默认 1080 */
  designHeight?: number;
  /** fit=取min(等比不裁切·默认) · cover=取max(铺满可裁切) · stretch=非等比拉满 */
  mode?: "fit" | "cover" | "stretch";
  className?: string;
}
```

**行为**：
- 纯函数 `computeFit({ outerW, outerH, designW, designH, mode })` → `{ scale | scaleX, scaleY }`，可单测。
- 外层 `position:relative; overflow:hidden`；内层固定 `width=designWidth height=designHeight`，`transform: translate(-50%,-50%) scale(...)` 居中。
- `ResizeObserver` 监听外层尺寸变化重算（SSR 安全：首帧 scale=1，挂载后测量）。
- `tags: ["new"]`，`category: "layout"`，`group: "container"`。

**测试**（`fit-screen.test.tsx`）：纯函数 `computeFit` 各 mode 的数学；ResizeObserver mock 下挂载渲染不报错。

**接入**：`packages/ui/src/index.ts` 导出 + `showcase.ts` 注册 + `lib/manifest.ts` 加条目 + `lib/registry.tsx` 注册 showcase。

> 共享文件（index.ts/showcase.ts/manifest.ts/registry.tsx）落盘用 hunk 级 `git apply --cached`，不卷他人 WIP。

### 2.3 不需要改动的组件（已核实齐全）

`Marquee` `Statistic` `NumberTicker` `Meter` `Drawer` `Alert` `Popconfirm` `Tooltip` `Toast` 均已存在；
`Chart` 已含 `AreaChart/BarChart/LineChart/PieChart(donut 环形)/RadarChart/RadialChart`，折线/柱状/环形/面积堆叠全覆盖，无缺口。

## 3. demo 目录结构（镜像 `projects/` 范式）

```
demos/dashboard/
  (app)/layout.tsx        // 深色优先大屏外壳 + FitScreen 缩放铺满
  (app)/page.tsx          // 大屏主页(client)
  _components/
    dashboard-shell.tsx   // 主编排(状态/刷新/下钻)
    header-bar.tsx        // 标题 + 实时钟 + 数据源切换 + 明暗 + 刷新 + 全屏(纯图标钮带 Tooltip)
    alert-ticker.tsx      // 顶部 Marquee 告警/事件流(按级别 chart token 着色)
    kpi-rail.tsx          // 左:Statistic×4 + NumberTicker 跳数 + Meter 全局负载
    globe-panel.tsx       // 中:WorldMap(节点+飞线)，点节点 → 下钻
    chart-stack.tsx       // 右/下:折线 QPS / 柱状区域对比 / 环形流量占比 / 面积堆叠带宽
    region-meters.tsx     // 底部:区域负载 Meter 条 × N
    node-drawer.tsx       // 点节点 → Drawer 下钻详情(迷你 Chart + 状态 Timeline)
  _data/
    types.ts              // 节点/序列/事件类型
    seed.ts               // mulberry32 确定性种子(零外链·零不可控随机·SSR 安全)
    nodes.ts geo.ts series.ts events.ts
  _lib/
    use-live.ts           // 实时刷新 hook(setInterval 抖数 → NumberTicker/Chart 更新)
```

## 4. 布局（单页 16:9 大屏，深色优先、跟随全局明暗 token）

```
┌──────────────────────────────────────────────────────────────┐
│ 瀚云全球调度指挥中心   [实时钟] [数据源:正常▾] [明暗] [刷新] [全屏]│
│ ▸▸ Marquee 告警流: [严重]东京节点丢包率↑ [提示]新加坡扩容完成 …  │
├───────────────┬─────────────────────────────┬────────────────┤
│ KPI 轨(左)     │   WorldMap 全球节点+飞线(中)   │  图表栈(右)      │
│ 在线节点 1,284 │   ● 节点(大小=负载) 点击下钻   │ 环形:流量占比    │
│ 实时带宽 ⬆跳数 │   ⤳ 飞线(跨境调度)            │ 折线:24h QPS    │
│ 请求/秒 ⬆跳数  │                             │ 柱状:区域对比    │
│ Meter:全局负载 │   ▼ 面积堆叠:各大区带宽趋势    │                │
├───────────────┴─────────────────────────────┴────────────────┤
│ FOOTER: 区域负载 Meter 条 × 6 (亚太/北美/欧洲/中东/南美/非洲)   │
└──────────────────────────────────────────────────────────────┘
```

整屏被 `FitScreen`（设计尺寸 1920×1080，mode=fit）包裹，等比缩放铺满浏览器视口。颜色全走语义 / chart token，跟随站点全局明暗切换，深色为默认观感。

## 5. 交互生命周期（大屏适配，非 CRUD）

任务明确：大屏按「实时刷新 loading → 数据源异常 Alert+重试 → 下钻 Drawer」适配铁律二的生命周期链，不强凑增删改。

| 铁律链环 | 大屏落地 |
|---|---|
| 加载 | `useMockData` 延迟 → 每面板 Skeleton/Spinner（首屏 ≥300ms 肉眼可见）|
| 空/异常+重试 | Header「数据源」可切到「异常」→ 该面板 `Alert` + 重试按钮（`failOnce`）|
| 操作 | 手动刷新 / 切数据源 / 点节点下钻 / 停止实时刷新 |
| 反馈 | 每次刷新/切换 `toast({ title, tone })`；纯图标钮(刷新/明暗/全屏)全 `Tooltip` |
| 危险确认 | 「停止实时刷新」用 `Popconfirm` 二次确认 |
| 实时 | `use-live` 每 ~3s 抖数 → `NumberTicker` 跳、Chart 滚动、Marquee 进新事件；刷新帧有 loading shimmer |
| 下钻 | 点 WorldMap 节点 → `Drawer` 该节点详情(迷你 Chart + 状态 Timeline) |

## 6. 数据（全程序化，零外链）

- `seed.ts`：mulberry32 确定性 PRNG（不依赖 `Date.now`/`Math.random` 不可控源，SSR 与静态导出安全）。
- 全球节点：~12 个真实城市经纬度（北京/上海/东京/新加坡/法兰克福/伦敦/纽约/旧金山/悉尼/圣保罗/迪拜/孟买），每节点带 value(负载)、status。
- 飞线：跨境调度链路若干（按节点对生成）。
- 序列：24h QPS 折线、区域柱状、流量占比环形、各大区带宽面积堆叠——程序化生成。
- 事件流：告警/事件文案数组，按级别着色滚动。

## 7. SSoT / 接入清单

- `demos/lib/demos.ts` 加：`{ slug:"dashboard", title:"瀚云全球调度指挥中心", description:..., href:"/demos/dashboard", category:"数据可视化", status:"done", tags:["WorldMap","FitScreen","实时大屏","飞线"] }`。
- 组件库：`world-map` 扩展 + 新增 `fit-screen`（index/showcase/manifest/registry 全接入）。

## 8. 验收（DoD）

- `pnpm --filter www demos:coverage`：WorldMap 从未覆盖→覆盖，覆盖率只升不降；远程外链门禁 0。
- README §2 强制交互态清单逐条过（加载帧/toast/危险确认/图标钮 Tooltip/Empty+Alert 重试/高频件/零外链）。
- 真实浏览器（非 headless CLI，记忆 `www-msw-gate-blanks-headless-screenshots`）实机截图自证：亮 + 暗、飞线动画、刷新 loading 态、节点下钻 Drawer、数据源异常 Alert——零 console error。
- 起预览用 `pnpm --filter www dev`（非根 `pnpm dev`，记忆 `hulian-pnpm-dev-killstale-kills-5514`）。
- `pnpm --filter @hulianui/ui test` 全绿（含 world-map 扩展 + fit-screen 新测）。
- 本地 commit（message 引用本 demo）。

## 9. 风险与缓解

- **WorldMap 可交互改动破坏旧飞线**：所有新 props 可选、默认关；旧 showcase/测试不动，新增测试单独覆盖新能力。
- **FitScreen scale 与内部 hover/点击坐标错位**：transform scale 下浏览器自动换算指针坐标，节点点击走 React 合成事件不受影响；ResizeObserver 重算无需手动换算。
- **实时刷新与 React 渲染抖动**：`use-live` 用稳定 interval + 函数式 setState，NumberTicker 自带 tween，避免高频 setState 卡顿（参考记忆 `react-high-freq-event-state-effect-fanout-jitter`）。
- **headless 截图全白**：验证一律真实浏览器 / 独立 Chrome-for-Testing CDP（记忆 `mcp-browser-busy-launch-isolated-chromium-via-executablepath`）。
