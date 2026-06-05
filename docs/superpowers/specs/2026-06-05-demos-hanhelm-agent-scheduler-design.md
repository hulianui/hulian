# 瀚舵 HanHelm —— 智能体任务调度平台 · 设计 spec

- 日期：2026-06-05
- 类型：内置 demo（新增）+ 4 个新库组件
- 定位：异构 AI 任务的智能调度中枢（任务涌入 → 六维打分智能路由 → 多 agent 编排 + 降级/failover → 全链路可观测）
- 状态：已用户 review（"做吧 做完再通知我" 授权自主推进）

## 1. 背景与目标

库已 215+ 组件、15+ demo。本 demo 的拓库价值锚在 **任务级智能调度与多 agent 编排** 这个尚未覆盖的真实场景。
承接原始需求里被拆出的「LLM 任务分发智能路由 Agent」深度部分，与瀚审（代码质检）形成姊妹 demo。

**产品本质**：异构 AI 任务涌入**任务总线** → **智能路由**按「能力 + 成本 + 延迟 + 负载 + 优先级 + SLA」六维打分，派给 **agent/模型池** → **多 agent 编排**（复杂任务分解为子任务 DAG）+ **降级/failover** → **全链路可观测**（队列/负载/延迟/SLA/成本）。

**与姊妹 demo 的边界**
- 区别 **瀚审 HanReview**（代码质检）：任务**不限代码**，核心是**调度本身**（打分/派发/编排/降级），不是审查代码。
- 区别 **瀚枢 HanHub**（API 网关）：网关核心是请求转发/配额/限流；本 demo 核心是**任务级智能调度与多 agent 编排**。

**硬约束（来自用户指令 + CLAUDE.md）**
- 100% 由 `@hulianui/ui` 搭建，**禁止在 demo 里打 CSS 补丁 / 行为 hack**；缺能力 → 回库修组件 / 造组件，不怕引入新组件，可 web search。
- demo 是「寻求真实场景拓展 UI 库」的载体；全 mock 内存态，`output: export` 静态导出（动态路由拆 server/client）。
- 所有面向交付的输出中文。
- 新组件标配：源码 + `.showcase.tsx` + `.test.tsx` + `index.ts` barrel + `manifest.ts` 登记 + `registry.tsx`。
- 并行会话只 `git add` 自己的文件（别 `git add -A`），共享文件用 hunk 级 `git apply --cached` 暂存避卷他人 WIP。

## 2. 产品命名与信息架构

**瀚舵 HanHelm** —— 智能体任务调度平台（「舵」= 掌舵 / 调度，为 agent/模型舰队掌舵；承袭 瀚云/瀚付/瀚选/瀚库/瀚枢/瀚审 品牌族）。

**category**：`AI 应用`（同 ai-workflow）。

### 目录结构（沿用 ai-workflow / hanreview demo 范式）

```
app/demos/hanhelm/
  (app)/                         ← AdminLayout 外壳 + 多页签 keep-alive
    layout.tsx                   ← HelmShell（AdminLayout 骨架：侧栏导航 + 顶栏 + 多页签）
    page.tsx                     ← 1 调度总览 Dashboard
    queue/page.tsx               ← 2 任务队列（QueueLane 旗舰 ⇄ ProTable 切换）
    queue/[id]/page.tsx          ← 3 任务详情（旗舰；DAG 复用 Flow；server + generateStaticParams + client 子件）
    routing/page.tsx             ← 4 智能路由（Sankey 旗舰）
    agents/page.tsx              ← 5 执行器池
    alerts/page.tsx              ← 6 SLA 告警
    settings/page.tsx            ← 7 设置
  login/page.tsx                 ← 独立登录页（LoginForm，同其它 demo）
  _components/
    nav-config.ts                ← 侧栏/页签配置
    helm-shell.tsx               ← AdminLayout 外壳封装
    ...（各页拆出的子组件）
  _data/                         ← 全 mock
    tasks.ts                     ← 异构任务（能力需求/优先级/SLA/成本预算/DAG 子任务/过程帧/路由决策）
    executors.ts                 ← 执行器池（agent + 模型：能力/价位/延迟特征/并发上限/负载/健康/降级链）
    routing-rules.ts             ← 路由策略规则 + 六维权重
    metrics.ts                   ← 吞吐/延迟/队列深度/成本时序（供 Funnel/Sparkline/Chart/Sankey）
    alerts.ts                    ← 告警规则 + 告警事件
    members.ts                   ← 团队成员
    types.ts
  _lib/
    routing.ts                   ← 六维打分纯函数：能力匹配+成本+延迟+负载+优先级+SLA 加权 → 选中+理由+分项明细（可测）
    sla.ts                       ← SLA 判定纯函数：延迟 vs 阈值 → 达成/违约+余量；P50/P95 分位（可测）
    failover.ts                  ← 降级链纯函数：失败/超载 → 按降级链选下一个 + 终止条件（可测）
    use-dispatch-run.ts          ← mock 调度执行流：入总线→路由→DAG 拓扑推进→模拟失败触发 failover→完成，流式过程帧
```

## 3. 七个页面

### 1 调度总览 Dashboard（`page.tsx`）
- 顶部 KPI 卡：在途任务 / 吞吐 QPS / 平均延迟 / SLA 达成率 / 失败率 / 本时成本（Stat + NumberTicker）。
- **任务漏斗 Funnel**（新组件）：涌入 → 路由 → 执行 → 完成（失败分流），级间转化率。
- 各执行器负载：**ScoreRing**（瀚审件，软依赖）或 `meter` 兜底 + **Sparkline**（新组件）负载趋势。
- 队列深度 / 延迟 / 成本时序：**Sparkline 群** 内联趋势 + 主图 Chart。
- 实时任务流：精简任务条（List），点跳详情；失败/违约红色高亮。
- SLA / 预算告警 Banner（接近上限时）。

### 2 任务队列 Queue（`queue/page.tsx`）
- **QueueLane 旗舰用法**（新组件）：优先级泳道（P0/P1/P2/P3）队列板，道头显队列指标（深度/平均等待/吞吐），卡片显任务类型/能力 Tag/SLA 倒计时/派给谁/等待时长；⇄ **ProTable** 视图切换（Segmented）。
- 查询区：任务类型、能力、优先级、状态、SLA、时间范围（SearchForm + Segmented）。
- 行/卡操作：查看详情、提优先级、取消。
- 顶部分段：全部 / 排队中 / 执行中 / 临期 / 失败（Segmented）。

### 3 任务详情 Task Detail（`queue/[id]/page.tsx`）—— 旗舰页（DAG 复用 Flow）
- **顶部任务元信息**：类型 / 能力 Tag / 优先级 / 成本预算 + **SLA banner**（达成绿 / 临期黄 / 违约红 + 剩余时间倒计时 + 重派/取消按钮）。
- **三栏布局**：
  - **左栏**：任务概要 + 子任务清单（List + StatusDot）+ 成本/耗时汇总。
  - **中栏（主体）**：**多 agent 编排 DAG**（`Flow` 只读快照）—— 复杂任务分解为子任务节点（检索/生成/校验/汇总…），依赖连边；每节点显执行器（agent/模型）+ 状态 + 耗时 + 成本；失败节点红、降级节点黄。
  - **右栏**：**执行过程**复用 `agent-plan / thinking-block / tool-call / streaming-text`——「路由打分 → 派发 → 各步执行 → **failover 事件** → 汇总」；底部成本汇总。
- **底部**：**Timeline** 全链路事件（入队/路由/各子任务起止/降级/完成）。
- 加载/执行中：`use-dispatch-run.ts` 拓扑推进，逐步点亮各节点 + 右栏过程帧；模拟某节点失败触发 failover 重派（Spin / Skeleton）。

### 4 智能路由 Routing（`routing/page.tsx`）—— 旗舰页（Sankey）
- **Sankey 流向图**（新组件）：任务类型/能力 → 路由器 → 执行器池 三层流向，流宽=派发占比；点节点/连线 → tooltip 占比 + 成本。
- **路由策略规则**（可编辑，纯函数 `routing.ts` 驱动）：如「P0 + 安全敏感 → Opus」「批量低优 → Haiku/DeepSeek」「默认 → Sonnet」「成本上限 ¥X/任务」（Choicebox / List + 可编辑）。
- **六维权重**：能力/成本/延迟/负载/优先级/SLA 权重滑块（Slider），实时影响 Sankey 与决策回放。
- **路由决策回放**：选一任务 → 逐候选执行器展示**六维分项打分**（能力匹配/成本/延迟/负载/优先级/SLA）→ 选中谁 + 理由（Table + Tag + Sparkline 分项条）。
- 成本 vs 延迟散点（Chart）。

### 5 执行器池 Agents（`agents/page.tsx`）
- 执行器卡（agent + 模型池）：能力标（Tag）、价位、延迟特征、并发上限、**当前负载**（ScoreRing 软依赖 / meter 兜底）、健康（StatusDot：健康/降级/离线）、**负载趋势 Sparkline**。
- 降级链配置：每个执行器的 failover chain（List + 可编辑顺序）。
- 启停 / 限流：Switch + NumberField（并发上限）。
- 顶部统计条：池容量 / 平均利用率 / 健康执行器数。

### 6 SLA 告警 Alerts（`alerts/page.tsx`）
- SLA 达成监控：各任务类别的 P50/P95 延迟 vs SLA 阈值（Table + Sparkline + Tag 达标/违约）。
- 告警规则：延迟超标 / 失败率 / 队列积压 / 成本超预算 → 通知渠道（List + Switch + Choicebox）。
- **告警模拟器**：拖动阈值滑块（Slider）→ 实时显示「按当前阈值，最近 N 次会触发 M 次告警」（纯函数 `sla.ts` 重算）。
- 告警事件流：Timeline / List（触发时间 / 级别 / 任务 / 处理状态）。

### 7 设置 Settings（`settings/page.tsx`）
- 接入：任务来源 webhook（**SecretField** 掩码 token）+ 已接来源列表（List + StatusDot）。
- 团队成员：List + Avatar + 角色 Tag（管理员/运维/只读）。
- 全局策略：默认优先级 / 全局成本上限（NumberField）/ 默认降级策略（Choicebox：降级到便宜模型 / 重试 / 暂停）。
- 通知：告警渠道（Switch + Choicebox）。

## 4. 四个新组件（先造，页面再 dogfood）

每个新组件标配：源码 + `.showcase.tsx`（进画廊）+ `.test.tsx` + `index.ts` barrel + `manifest.ts` 登记 + `registry.tsx`。
遵循库现有约定：零依赖优先、token 驱动配色、尽量 RSC 安全、纯几何/逻辑抽纯函数可单测、SVG 圆弧用属性不靠 CSS transform。

### 4.1 Sankey（旗舰 · 库内首个桑基图）
- 路径 `packages/ui/src/sankey/`，category `data-display` / group `collection`。
- 定位：多层流向 / 分配比例图。复用面广（流量来源、预算分配、转化路径、调度流向）。
- Props：
  - `nodes: { id: string; label?: ReactNode; layer?: number; tone?: string }[]`
  - `links: { source: string; target: string; value: number; tone?: string }[]`
  - `height?: number`、`nodeWidth?`（默认 16）、`nodePadding?`（默认 12）、`linkOpacity?`
  - `renderNodeLabel?(node)`、`renderTooltip?(item)`、`onNodeClick?(node)`、`onLinkClick?(link)`、`className`。
- 行为：未给 `layer` 则按 links 拓扑分层（source 层 < target 层）；每层节点按总流量排布 y 与高度；link 渲染为贝塞尔 ribbon，**宽度 = value 占比**；hover 高亮关联链路（复用 tooltip）。
- 实现：纯函数 `computeSankeyLayout(nodes, links, { width, height, nodeWidth, nodePadding })` → 带 `{x,y,height}` 的 nodes + 带 `path/width` 的 links。零依赖（SVG）；色吃 token / per-node/per-link tone。
- 单测：拓扑分层、节点 y/height 按流量、ribbon 路径串、value 守恒（入=出，端层除外）。
- 不做：循环图、可拖排序（只读分层；YAGNI）。

### 4.2 Sparkline（高频通用 · 内联趋势）
- 路径 `packages/ui/src/sparkline/`，category `data-display` / group `info`。
- 定位：无轴无网格的极简内联趋势，区别于重量级 `Chart`（recharts）。
- Props：
  - `data: number[] | { x: number; y: number }[]`
  - `variant?: "line" | "area" | "bar"`（默认 line）、`width?`（默认 80）、`height?`（默认 24）
  - `tone?: string`、`highlightLast?`（默认 false，末点圆点）、`min?`/`max?`（不传从数据推）、`renderTooltip?`、`className`。
- 行为：SVG 极简渲染；line/area 用 polyline/path，bar 用等宽柱；`highlightLast` 在末点画强调圆点。
- 实现：纯函数 `sparklinePath(data, { w, h, variant, min, max })` → SVG path / 柱矩形数组；零依赖。
- 单测：min/max 归一化、line/area/bar 路径、单点与空数据降级。

### 4.3 Funnel（任务漏斗）
- 路径 `packages/ui/src/funnel/`，category `data-display` / group `collection`。
- 定位：阶段漏斗 + 级间转化率。
- Props：
  - `stages: { id: string; label: ReactNode; value: number; tone?: string }[]`
  - `orientation?: "vertical" | "horizontal"`（默认 vertical）、`showConversion?`（默认 true 显级间转化率）
  - `renderStage?(stage, ctx)`、`onStageClick?(stage)`、`className`。
- 行为：每级梯形/条按 `value/max` 缩放宽度（vertical）或高度（horizontal）；级间显转化率 `value[i]/value[i-1]`；色吃 token / per-stage tone。
- 实现：纯函数 `computeFunnel(stages)` → 每级 `{ widthRatio, conversion }`；零依赖（CSS clip-path 或 SVG 梯形）。
- 单测：宽度比、转化率、首级 100%、零值与单级降级。

### 4.4 QueueLane（优先级泳道队列板）
- 路径 `packages/ui/src/queue-lane/`，category `data-display` / group `collection`。
- **与既有 Kanban 的差异化（写进组件文档）**：Kanban = 状态列 + **拖拽工作流**（人移动卡，`onMove` 回吐）；QueueLane = 按优先级/分类的**横向泳道队列监视器**，每道是有序队列（FIFO + aging），道头聚合**队列指标**（深度/平均等待/吞吐），卡片默认**只读**（顺序由调度器决定，非人拖），强调「积压/等待」语义。
- Props：
  - `lanes: { id: string; label: ReactNode; tone?: string; meta?: ReactNode }[]`
  - `items: { id: string; laneId: string; [k: string]: unknown }[]`
  - `renderItem(item, index)`、`renderLaneHeader?(lane, items)`、`maxVisible?`（每道折叠 +「还有 N 条」）
  - `orientation?: "horizontal" | "vertical"`（默认 horizontal：泳道横向并列）、`onItemClick?(item)`、`className`。
- 行为：按 `laneId` 分组，每道竖向排队（FIFO 顺序 = items 给定顺序）；道头默认渲染聚合（条数）+ 自定义 `renderLaneHeader`；超 `maxVisible` 折叠。
- 实现：纯函数 `groupByLane(items, lanes)` → `{ lane, items }[]`（保序、未知 laneId 落 misc 或丢弃）；零依赖。
- 单测：分组保序、空道、maxVisible 折叠计数、未知 laneId 处理。

> **负载仪表**：优先复用瀚审的 **ScoreRing**（若构建时已落库）；否则用既有 `meter`/`progress`/`Chart` 环形兜底，**不阻塞、不重复造件**。
> **流向 DAG 复用既有 `Flow`** 组件（任务详情多 agent 编排），不另造。

## 5. Mock 数据 + 调度引擎纯函数（真实性 + 可测）

- **`routing.ts`（灵魂）**：`scoreExecutors(task, executors, weights)` → 各候选执行器的**六维加权综合分**（能力匹配 / 成本 / 延迟 / 负载 / 优先级 / SLA）+ 选中 + 理由 + 分项明细。能力不匹配直接淘汰；成本/延迟/负载归一化后按权重加权（成本/延迟/负载越低越好，能力/优先级/SLA 余量越高越好）。可单测。
- **`sla.ts`**：`evaluateSla(latency, slaMs)` → 达成/临期/违约 + 余量；`percentile(samples, p)` 计算 P50/P95。可单测。
- **`failover.ts`**：`nextFallback(chain, failedId, healthMap)` → 按降级链选下一个健康执行器 + 终止条件（链尽/全不健康）。可单测。
- **`use-dispatch-run.ts`**：mock 调度执行流（入总线 → 路由 → DAG 拓扑推进各子任务 → 模拟某节点失败触发 failover → 完成），定时推进 + 流式过程帧（确定性，无 `Math.random` 用 mulberry32 seed）。
- **`_data`**：
  - `tasks.ts`：异构任务（文本生成 / 代码 / 图像 / 翻译 / RAG 检索 / 数据抽取 / 内容审核 / 多步编排），各带能力需求、优先级 P0-P3、SLA(ms)、成本预算、DAG 子任务（节点 + 依赖边 + 执行器 + 状态 + 耗时 + 成本）、过程帧（tool-call / thinking / streaming 文本）、路由决策（六维打分 + 选中 + failover 记录）。
  - `executors.ts`：agent（多步编排器）+ 模型（LLM）池，各带能力、价位、延迟特征、并发上限、当前负载、健康状态、降级链。
  - `routing-rules.ts`、`metrics.ts`（吞吐/延迟/队列深度/成本时序）、`alerts.ts`、`members.ts`、`types.ts`。
- 模型价位 grounded 2026：Haiku 4.5 \$1/\$5、Sonnet 4.6 \$3/\$15、Opus 4.7 \$5/\$25、DeepSeek V4 ~\$0.55/\$2.2。

## 6. 验证策略

1. **组件层**：4 新组件各 `.test.tsx`（纯函数 + 渲染 + 交互），`pnpm --filter @hulianui/ui test` 全绿。
2. **画廊层**：4 新组件 showcase 进画廊，doc 页零 console error。
3. **demo 层**：CDP 隔离 Chrome-for-Testing 实机逐页截图（7 页 + login）+ 关键交互
   （Sankey hover/点击下钻、QueueLane 泳道、任务详情 DAG + failover 过程帧推进、路由六维回放、告警滑块模拟、Funnel），
   零 console error。验证用独立 chromium 避 MCP 争用（见 memory：mcp-browser-busy）。
4. **登记**：`demos.ts` 加 hanhelm 条目；`demos-coverage.mjs` 验证新组件点亮计入覆盖率。

## 7. 实现顺序

1. 4 个新组件（Sankey → Sparkline → Funnel → QueueLane）+ 几何纯函数单测 + 画廊登记（manifest/registry/barrel/showcase）。
2. mock 数据 + `_lib` 纯函数（routing / sla / failover / use-dispatch-run）+ 单测。
3. AdminLayout 外壳（HelmShell）+ nav + login + route group 空页占位 + demos.ts 登记。
4. 七页 dogfood（外壳先行再分页；页面间弱耦合，可并行派 subagent）。
5. demos.ts 登记 + 实机像素自证 + 覆盖率验证。
6. commit（不 push，沿用本仓无 remote 惯例；并行会话只 `git add` 自己的文件，共享文件用 hunk 级 `git apply --cached` 暂存避卷他人 WIP）。

## 8. 非目标（YAGNI）

- 不接真实 LLM / 真实任务源（全 mock）。
- Sankey 不做循环图 / 可拖排序（只读分层）。
- QueueLane 不做拖拽改序（队列由调度器定，非人拖）。
- 负载仪表不重复造 ScoreRing（软依赖瀚审件 + meter 兜底）。
- 流向 DAG 复用既有 Flow，不另造。
- 不做 i18n / 多主题切换（吃库默认 token 主题）。
