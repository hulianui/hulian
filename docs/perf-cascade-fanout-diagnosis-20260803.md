# cascade-fanout 24 条违规的根因分类（2026-08-03）

**结论先行**：24 条里 **0 条是组件写错了**。旧 `cascade-fanout` 指标测的不是「级联」，
而是**组件树的嵌套深度**（相关系数 r≈0.94）。真正藏在数据里的信号是另一回事：
**打开任何一个 Base UI 浮层要走 8–11 次 commit**，这个信号被绝对值阈值 30 完全掩盖了。

本文数字可复算，脚本在 `.hulian-scan/reports/fanout-scripts/`，数据源是
`.hulian-scan/baseline-run/`（gitRevision `b980dea`）。每节都给了复算命令。

> **复算前提**：`.hulian-scan/` 整个目录是 gitignored 的（原始数据 230MB+），脚本与数据
> 都不在仓库里。从仓库 clone 下来的人跑不了这些命令，需先自行重跑一次全量扫描
> （约 50 分钟）再复算。下文的复算命令是给**当时那台机器上的产物**用的，
> 不是给 CI 或新 clone 用的。

> ⚠️ 读本文前必须知道：诊断期间 `apps/perf-lab/app/window-api.ts` 已被并行 agent 改成
> **按 step 求和**。我离线复算了新定义（§5），与其实测逐样本完全一致，可直接用作定阈值输入。
> 下文凡说「旧定义」= 按单个 commit 取最大值，即 findings.json 里那 24 条的来源。

---

## 0. 复算前提

所有分析读 `.hulian-scan/baseline-run/raw/<场景>.json`。该文件的 `events` 是 5 个样本
首尾相接的完整 fiber 事件流，含 `name` / `ownerName` / `depth` / `commitId` / `stepId`，
足以离线重建每次 commit 渲染了哪棵子树。切样本的方法：以 `stepId === "mount"` 的
首个事件为界（脚本里的 `split()`）。

校验该切法正确：对 `hover-card/basic` 离线重算新定义，得 `470,375,386,351,373`，
与扫描器实测逐个相等（`node .hulian-scan/reports/fanout-scripts/newdef.mjs --verify`）。

---

## 1. 问题一：24 条能分成几类根因？

分**两类**，不是按组件分，是按「峰值出现在哪个 step」分。

### 判据

perf-lab 的 generic 场景有 6 个 step，其中 3 个是**合成 step**（不对应任何用户行为，
是 harness 自己造的父级重渲染）：

| step | 来源 | 是否真实用户行为 |
|---|---|---|
| `stable-parent-update` | `generic.tsx:147` 父组件 `setState` 打 tick | ❌ 合成 |
| `props-update` | `generic.tsx:156` 换掉一个根 prop | ❌ 合成 |
| `stress` | `generic.tsx:177` **连做 10 轮**根 prop 翻转 | ❌ 合成 |
| `interaction` | `generic.tsx:167` 点第一个可交互元素 | ✅ 真实 |
| `mount` / `unmount` | — | 已被指标排除 |

合成 step 改的是**根 prop**。React 在根 prop 变化时会重渲染整棵未 memo 的子树 —— 这是
框架的正确行为，不是浪费。所以合成 step 的读数 ≈ **组件的 fiber 总数**。

### 分类结果

复算：`node .hulian-scan/reports/fanout-scripts/batch.mjs`

**全部 24 条的峰值 commit 都落在合成 step 上，无一例外。**（全库 360 个场景里 181 个峰值在
`stress`、130 个在 `stop`，只有 5 个在 `interaction`。）

再把「合成 step 峰值」和「真实交互峰值」分开统计：

| 类别 | 成员 | 真实交互峰值 |
|---|---|---|
| **A 类：只有合成 step 超标**（16 条） | Glimpse 30 / CountrySelect 29 / Menu 29 / Drawer 28 / HoverCard 27 / RegionCascader 27 / Cascader 26 / DatePicker 26 / DateTimePicker 25 / EditableTable 25 / TimePicker 24 / **TreeSelect 24** / AdminLayout 19 / PasswordGenerator 0 / SearchForm 0 / Video 0 | **全部 ≤ 30，即真实交互下全部达标** |
| **B 类：真实交互也 > 30**（8 条） | NavigationMenu 50 / Menubar 46 / Popover 44 / Popconfirm 36 / Combobox 34 / ModalForm 33 / RouteTabs 32 / DateRangePicker 31 | 超标幅度 1%–67% |

后三个（PasswordGenerator / SearchForm / Video）真实交互峰值为 0，是因为 `firstInteractive`
没点开任何东西 —— 它们**从未被真实交互触碰过**，全部读数来自合成 step。

**A 类 16 条是纯指标产物**：用户实际操作这些组件时，读数在预算内。

---

## 2. 问题二：几十个 fiber 里多少是 Base UI 固有、多少是瑚琏加的？

### 2.1 先纠正一个命名误导：这不是「扇出」，是「深链」

复算：`node .hulian-scan/reports/fanout-scripts/shape.mjs`

把峰值 commit 的 fiber 按 `depth` 排开：

| | 深度跨度中位 | 最宽一层 | 每层平均宽度 |
|---|---|---|---|
| 24 条违规组 | **32 层** | 2–6 | 1.27 |
| 未违规组 | 8 层（p90=16） | — | 1.00 |

违规组每层平均只有 1.27 个 fiber。**它们是一根垂直的链，不是一把展开的扇子。**

峰值 `cascadeFanout` 与树深度跨度的皮尔逊相关系数 **r ≈ 0.94**，
即指标约 **89% 的方差由嵌套深度解释**。叫 `cascadeFanout` 但量的是 depth。

> 这个数复核过一次，过程记在这里免得下次再查：`control.mjs` **不产出**这个数
> （它输出的是另一个变量 —— 与「场景内存活 fiber 总数」的 r = 0.547），原始 0.938
> 的计算代码没留在脚本里。后来用独立脚本重算（n=284 个有 depth 数据的场景），
> 得 **r = 0.945 / r² = 89.3%**，与原值吻合，结论成立。
> 若要再复核，取每个场景峰值 commit 的 fiber 数与该 commit 的 `max(depth)-min(depth)`
> 求皮尔逊相关即可。

### 2.2 最干净的样本：HoverCard 的 32 个 fiber 逐个点名

复算：`node .hulian-scan/reports/fanout-scripts/analyze.mjs .hulian-scan/baseline-run/raw/hover-card__basic.json --tree`

```
 0 Anonymous            ┐
 1  ErrorBoundary       │ perf-lab harness 与 showcase 包裹层：5 个
 2   GenericFixture     │ 每个场景固定支出，组件还没开始渲染
 3    div               │ 就已经吃掉预算 30 的 17%
 4     Demo             ┘
 5      HoverCard              ← 瑚琏
 6       Anonymous
 7        PopoverRoot
 8         FloatingTree
 9          Anonymous
10           PopoverRootComponent
11            Anonymous
12             Anonymous
13              HoverCardTrigger     ← 瑚琏
14               PopoverTrigger2
13              HoverCardContent     ← 瑚琏
14               PopoverPortal2
15                Anonymous
16                 FloatingPortal2
17                  Anonymous
18                   Anonymous
19                    PopoverPositioner2
20                     Anonymous
21                      FloatingNode
22                       Anonymous
23                        div
24                         PopoverPopup2
25                          FloatingFocusManager
26                           ClosePartProvider
27                            Anonymous
28                             div
29                              PopoverArrow2
```

深度 0→29 一根链，全程只在 depth 13 分了一次叉（Trigger / Content）。

**归属**：harness 5 · 瑚琏 3（`HoverCard` / `HoverCardTrigger` / `HoverCardContent`）·
Base UI + floating-ui 24。**瑚琏自有占 9%。**

### 2.3 24 条全量归属

复算：`node .hulian-scan/reports/fanout-scripts/attrib.mjs`

峰值 commit 合计 1047 个 fiber：

| 归属 | 数量 | 占比 |
|---|---|---|
| Base UI / floating-ui 原语（含其内部 `Anonymous` 渲染包装） | 618 | **59%** |
| 裸 DOM 元素（div/span/li/ul/label/button…） | 234 | 22% |
| perf-lab harness | 88 | 8% |
| 瑚琏自有组件 | 107 | 10% |

那 10% 还是**高估**：我的分类器把 framer-motion 的 `LazyMotion` / `LazyMotionProvider` /
`motion.button`（Popover / Popconfirm / Drawer 里每个 Button 3 个）也算进了「瑚琏自有」。
扣掉后瑚琏实际占比在 5% 上下。

**结论：团队 lead 的猜测成立，且比猜测更极端** —— 违规读数的四分之三来自 Base UI 浮层原语
栈和它渲染出的裸 DOM，瑚琏自己的包装层只有 1–3 层。逐个改组件改不动这个数。

一个附带发现：**harness 对每个场景固定贡献 3–4 个 fiber**（`ErrorBoundary` +
`GenericFixture` + 包裹 div + `Demo`）。standard 预算 30 里有 13% 从不属于被测组件。

---

## 3. 问题三：TreeSelect 的 53 —— 「一棵树展开是否本就要 53 个 fiber」

**答案：这个问题问错了对象。53 跟树展开无关。**

### 判据一：同库真的展开一棵 100 节点的树，读数是 8

`tree/stress` 场景的 step 就叫 `expand-100-node-branch` / `collapse-100-node-branch`，
它的 `cascadeFanout` 样本是 `8,8,8,11,10`，中位 **8** —— 未违规，离阈值 30 有 3.75 倍余量。

```
tree/stress   按 step 峰值: expand-100-node-branch=8  collapse-100-node-branch=11
tree-select/basic  按 step 峰值: props-update=5  interaction=24  stress=62
```

展开 100 个节点花 8 个 fiber；TreeSelect 的 53/62 来自别处。

### 判据二：TreeSelect 的峰值在合成 step，真实交互只有 24

上表已列：`interaction=24`（点开下拉），`stress=62`。62 出现在 `stress:multiple` ——
harness 翻转 `multiple` 这个根 prop，`TreeSelect` 虽然已经 `memo`（`tree-select.tsx:213`），
但 prop 真的变了，memo 正确地不拦截，于是整棵含展开浮层的树重渲染一次。

### 判据三：62 的构成

复算：`node .hulian-scan/reports/fanout-scripts/analyze.mjs .hulian-scan/baseline-run/raw/tree-select__basic.json --tree`

| 深度 | 内容 | 数量 |
|---|---|---|
| 0–4 | harness + showcase 的 `<div className="w-72">` | 5 |
| 5 | `TreeSelectImpl` | 1 |
| 6–26 | Base UI popover 栈（`PopoverRoot`→…→`ClosePartProvider`） | 22 |
| 27+ | `Tree` 及其渲染出的行 | 34 |

那 34 里，每一行可勾选节点固定 8 个 fiber：
`li > div > span > CheckboxImpl > CheckboxRoot2 > Anonymous > span > CheckboxIndicator2`
—— 其中 5 个是 Base UI 的 Checkbox。showcase 的数据是 3 根 + 8 分支 + 14 叶，
峰值时只展开了 4–5 行。**行本身不贵，贵的是每行摊 5 个 Base UI Checkbox fiber。**

### 判据四：把大小归一化后，TreeSelect 在浮层族里毫不突出

见 §4 的表：单次真实点击下 TreeSelect 的「每 fiber 渲染次数」是 5.07，
Menubar 5.36、Combobox 4.89、HoverCard 4.86 —— 完全在同族区间内，且 TreeSelect 的
参与 fiber 数 26 是全组**最少**的。

**判断：TreeSelect 不需要改。** 我拥有 `packages/ui/src/tree-select/` 的写权限，
但检查后没有动任何源码 —— 没有可归因于该组件的缺陷。

---

## 4. 数据里真正的信号（旧指标把它盖住了）

上面证明了绝对值没意义。那把它**按组件大小归一化**，看「一次逻辑更新里，每个参与的
fiber 平均渲染几次」。=1.00 是理论下限（一次更新每个 fiber 恰好渲一次），>1 才是级联。

只取 `interaction` step（恰好一次点击 = 一次逻辑更新，无重复次数歧义）：

复算：`node .hulian-scan/reports/fanout-scripts/ratio2.mjs`

| 比值 | commit 数 | 场景 |
|---|---|---|
| 5.36 | 9 | menubar/basic |
| 5.07 | 10 | tree-select/basic |
| 4.89 | 10 | combobox/basic |
| 4.86 | 10 | hover-card/basic |
| 4.60 | 9 | region-cascader/basic |
| … | 8–10 | 其余 15 个浮层件，3.28–4.43 |
| **1.00** | **1** | admin-layout / editable-table / route-tabs |

全库 52 个带 interaction 的场景，该比值 **p50 = 1.00**。

**结论：非浮层组件是完美的 1.00 / 1 个 commit；打开任意一个 Base UI 浮层要走 8–11 次
commit，整条浮层链被反复渲染 3.3–5.4 遍。** 这是一个真实、分界清晰、与组件大小无关的信号
（Base UI 的 open→portal 挂载→positioner 测量→floating-ui 重定位→focus manager→
transition 状态 的顺序流程）。它属于上游 Base UI，不属于瑚琏，但它是这批数据里唯一
经得起推敲的性能事实。

顺带证明绝对值阈值的形状是错的：`alert-dialog/basic` 比值 3.75，与被抓的浮层同级，
但因为组件小，绝对值没过 30，**门禁放行了**。同一个行为，大组件红、小组件绿。

---

## 5. 新定义（按 step 求和）下的读数 —— 给重定阈值用

并行 agent 已把 `computeMetrics` 改为按 step 求和。我离线复算了全库 360 个场景
（`node .hulian-scan/reports/fanout-scripts/newdef.mjs`，与实测校验一致）。

### 5.1 新旧定义对「谁更严重」几乎没有共识

复算：`node .hulian-scan/reports/fanout-scripts/rank.mjs`

- 全 360 场景 Spearman 秩相关 **ρ = 0.972**（两套定义都在跟随「组件大小」，人群不变）
- **但 24 条违规组内部 ρ = 0.237** —— 头部排序几乎完全重排

最刺眼的一对：

| 场景 | 旧定义 | 旧排名 | 新定义 | 新排名 |
|---|---|---|---|---|
| TreeSelect | 53 | 第 2 严重 | 135 | **第 24（最轻）** |
| HoverCard | 32 | 第 22 | 445 | 第 11 |

原因：旧定义取单次 commit 峰值，TreeSelect 的 62 是**一次性**的全树重渲染；
新定义求和，而 `stress` step 跑 10 轮，于是「每轮都重渲染一点」的 HoverCard 累加到 445。

**所以：旧定义时代的任何按组件阈值都不能平移过来，包括「给浮层族单开一档」这种想法 ——
在新定义下浮层族内部的相对严重程度已经变了。**

### 5.2 新定义全量分布

```
p50=26  p75=67  p90=169  p95=389  p99=508  max=922
```

| 阈值 | 违规数 / 360 |
|---|---|
| 30 | 177 |
| 50 | 129 |
| 100 | 63 |
| 150 | 46 |
| 200 | 32 |
| 250 | 25 |
| 300 | 19 |
| 400 | 18 |

新定义下最重的三个是 `infinite-menu/frame-budget` 922、`menubar/basic` 766、
`region-cascader/basic` 525 —— 注意第一名旧定义只有 12，是**旧门禁完全漏掉的动画场景**
（`sample-frames` step 持续跑帧，求和自然巨大）。

### 5.3 新定义的机器稳定性：确实改善了

同机对比空载基线 vs 4 个 agent 争 CPU 时的复现（`interaction` step 总渲染数）：

| | 基线（空载） | 复现（4 agent 争 CPU） |
|---|---|---|
| hover-card | 136 / 154 / 160 / 134 / 149 | 153 / 150 / 140 / 140 / 165 |
| tree-select | 119 / 135 / 131 / 142 / 151 | 142 / 137 / 95 / 116 / 125 |

commit 数在两种负载下都是 8–11，总量重叠 —— 求和确实抹掉了切片抖动。
但样本内 ±20% 的波动仍在，`tree-select` 甚至有 95↔151（±32%）。**阈值要留够余量。**

---

## 6. 最终结论：哪些改组件、哪些调预算、哪些等指标定义

### 6.1 该改组件的：**0 条**

24 条里没有一条能归因到瑚琏的组件代码。不建议为这批 finding 改任何组件。
`packages/ui/src/tree-select/` 我有写权限也没动。

（唯一算得上「瑚琏自有」的成本是 Popover / Popconfirm / Drawer 里每个 Button 摊
3 个 framer-motion fiber（`LazyMotionProvider` + `LazyMotion` + `motion.button`），
Popconfirm 4 个 Button = 12 个。这跟 `pnpm size` 那条「domAnimation 静态占 Button 首屏
四分之三」是同一个根 —— 值得单独立项，但它是**包体积**问题，不是 fanout 问题，
不要挂在这 24 条下面解决。）

### 6.2 该调预算的：全部 24 条 —— 但不是调数字，是**换指标形状**

**不建议**「给 overlay 族单开一档更大的绝对值预算」。理由：

1. 绝对值指标测的是深度和组件大小（r≈0.94），换个数字只是把「多大算大」的武断
   门槛挪个位置，仍然是大组件红、小组件绿（§4 的 alert-dialog 反例）。
2. 新定义下浮层族内部排序已重排（ρ=0.237），按旧数据划的族界在新定义下不成立。

**建议改成按组件大小归一化的比值指标**：

```
fanoutRatio = 一个 step 内的更新渲染总数 / 该 step 参与的不同 fiber 数 / 该 step 的逻辑更新次数
```

- 无量纲，与组件大小无关，与 commit 切片无关（求和），跨机器可比
- 物理含义明确：**1.0 = 一次更新每个 fiber 恰好渲一次**，是理论下限而非「好成绩」
- 实测分界极干净：非浮层 = 1.00，浮层 = 3.3–5.4，全库 p50 = 1.00

建议阈值（基于 §4 实测分布）：

| 类别 | 建议 `maxFanoutRatio` | 依据 |
|---|---|---|
| standard | **1.5** | 全库 p50=1.00、p90=4.43；1.5 给足抖动余量又能抓住任何 >1.5 倍的重复渲染 |
| overlay（新增分类） | **6.0** | 现状 3.3–5.4，6.0 是**冻结现状不再恶化**的护栏，不是达标线 |
| animation | 不适用 | `sample-frames` 类 step 没有「逻辑更新次数」可归一化，应排除 |

**前置依赖（挡路项）**：比值的分母需要「该 step 有几次逻辑更新」。现在这个数
藏在场景实现里（`generic.tsx:181` 硬编码 `for (let index = 0; index < 10; ...)`），
指标层看不见。必须在 `PerformanceScenario` 的 step 契约里加一个显式的
`repeats: number`（默认 1，generic 的 stress 填 10）。**这是这项改造的第一步，
在它落地前任何按 step 求和的阈值都只是在量 harness 的循环次数，不是在量组件。**

### 6.3 该等指标定义改造后重评的

- **§5.2 的全部新读数**：在 `repeats` 契约落地前，`stress`（×10）和 `sample-frames`
  （×N 帧）两类 step 的求和值互相之间、与其他 step 之间都不可比。新定义下的 top 3 里
  两个是 `frame-budget` 动画场景，纯属循环次数多，不宜据此定阈值。
- **3 个从未被真实交互触碰的场景**（PasswordGenerator / SearchForm / Video）：
  `firstInteractive` 点不开它们，全部读数来自合成 step。它们缺的是**场景**不是预算，
  应补 specialized 场景后再评。
- **harness 固定 3–4 fiber 的地板**：绝对值指标下它占 standard 预算 13%。若最终仍保留
  任何绝对值指标，应在 `computeMetrics` 里按 `depth <= 2` 剔除 harness 层。改用比值
  指标则此项自动消失（harness 的 3 个 fiber 也只渲一次，不影响比值）。

### 6.4 独立于本次改造、值得单独立项的

**打开一个 Base UI 浮层要 8–11 次 commit**（§4）。这是数据里唯一的真实性能事实，
但它在上游 Base UI，且当前绝对代价可接受（hover-card 全场景 `commitDurationMs`
中位 6.8ms）。建议**只做基线冻结**（用比值指标的 overlay 档 6.0 兜住不再恶化），
不在本轮投入优化。

---

## 7. 同批的 34 条 `avoidable-render`：memo 不是解药（实测，已回滚）

本文主体讲 24 条 `cascade-fanout`。同一次全量扫描还产出 **34 条 `avoidable-render`**，
证据形如 `GenericFixture -> Alert in stable-parent-update`。直觉修法是给组件加
`React.memo` —— 0.22.0 给 MathText 加 memo 就是这么修的。

**这批试过了，34 个组件全部加上 memo，实测一条都没降，已全部回滚。**

### 7.1 实测数据

改完后复验 6 个覆盖大小值的代表性场景（`--diagnose-findings` 复验模式）：

| 场景 | 首轮 | 加 memo 后 |
|---|---|---|
| alert/basic | 5 | 5 |
| tag/basic | 3 | 3 |
| color-field/basic | 20 | 20 |
| snippet/basic | 31 | 31 |
| file-tree/basic | 38 | 38 |
| live-player/basic | 42 | 42 |

一个数字都没动。

### 7.2 先排除「扫描没读到新代码」

数值一个不差地相同，第一嫌疑是缓存。已排除：在 `tag.tsx` 里插入一个可识别的探针组件
`ZZProbeMarker` 后重扫，**探针出现在扫描原始数据里**（`.hulian-scan/reports/tag-exp2/raw/`），
证明 perf-lab 经 workspace 软链直接消费 `packages/ui/src/index.ts` 源码，读的就是最新代码。

同一实验里，加了 memo 的 Tag 读数仍是 3。**所以是 memo 真的没消除这条 finding，不是缓存。**

### 7.3 机制：部分解释清楚了，还有一层没查到底

`isAvoidable`（`packages/hulian-scan/src/analyzer/budgets.ts`）判一次渲染「可避免」的条件是：
由父组件重渲染触发（`change.parent`），且 props / state / context / hooks 的前后值
**深比较相等**（`compareValues`，`maxDepth: 6`）。而 `React.memo` 的默认比较是 `Object.is`
浅比较 —— 两者对「值相同但引用不同」的判断正好相反：判据说可避免，memo 说变了要重渲染。

harness 恰好每次都造新引用：`GenericFixture` 的渲染体是

```tsx
{visible ? (usesControlledPreview ? showcase.renderWithProps(props) : initialRender()) : null}
```

`initialRender()` 是**函数调用**，父组件每 tick 一次就重新构造整棵 element 树。
**这解释了 props 含非原始值（对象 / 数组 / 回调 / JSX children）的那些组件** —— 浅比较必然失败。

**但它解释不了全部**，两个反例必须记下来，免得下次有人照着这段推错：

- `Tag` 的 props 是 `{tone, children:"处理中"}`，**全是原始值**，浅比较本该成功，实测仍报 3。
  `ConfigProvider` 的 context value 是模块级常量，引用稳定，也不是 context 的原因。
  剩下的怀疑方向是 **react-scan 在 memo bail-out 时可能仍记录该 fiber 的渲染事件**
  （`bailoutOnAlreadyFinishedWork` 路径下 fiber 仍被访问）—— **此项未验证**，
  要下结论需读 react-scan 的 fiber hook 实现。
- 反向反例：**MathText 加 memo 后该场景 0 findings**（0.22.0 的改动，实测复验过）。
  所以 memo 并非一概无效，存在生效的情况，只是判据与生效条件不重合。

**能确定的事实就是这一条：给这 34 个组件加 memo，一条 finding 都没消除。**
两条理论上的出路都不可取：给 memo 传自定义深比较函数（每次渲染做深比较，成本可能高于
重渲染本身），或让调用方保证引用稳定（调用方是 harness / 用户代码，库控制不了）。

### 7.4 这不等于 memo 无用，也不等于规则无用

- **memo 在真实使用中仍有价值**：调用方传稳定 props 时它确实能挡住重渲染。只是它挡不住
  「每次新建 props」这一类，而合成 step 制造的正是这一类。
- **规则本身指向的现象是真的**：值没变却重渲染了。但在真实应用里，消除它的责任在**调用方**
  （稳定引用），不在组件。当前把它记在组件头上，等于要求组件为调用方的写法负责。
- 因此这 34 条与 §1 的 24 条同源：**都是合成 step 的产物，不是组件缺陷**。
  §6.2 建议的归一化比值指标同样适用于这里 —— 按「每 fiber 每次逻辑更新渲染几次」度量，
  harness 重建 element 树带来的那一次渲染是分子分母同增，不会虚报。

### 7.5 给下一个接手的人

不要再对这批 finding 加 memo。要动它，先解决 §6.2 的 `repeats` 契约与指标形状问题；
或者改造 harness，让合成 step 复用同一棵 element 树（那会改变 `stable-parent-update`
这个 step 的语义，需要单独评估它还测不测得到真实的父级重渲染场景）。

### 7.6 落地（2026-08-04）：走了第三条路 —— 收紧判据

上面两条出路都没走。真正做的是**把判据改成与 React 一致**：
`isStableReferenceChange` 从「`same-reference` **或** `equal-by-value`」收紧为只认
`same-reference`（`packages/hulian-scan/src/analyzer/budgets.ts`）。

理由就是 §7.3 那条已经查清的机制：`React.memo` 与 fiber bailout 走的都是 `Object.is`，
把「值同引用不同」也算作「没变」，报出来的渲染 React 根本避免不了 —— finding 不可执行，
§7.1 的实测（34 个组件加 memo 一条没降）就是证据。

**触发这次改动的是一条偶发红**：CI 报 `avoidable-render:Button current=2`，而上一次 CI
扫了同一场景是绿的，rerun 又绿。判定「是不是回归」的方法记在这里 ——
**看上一次成功 CI 的 `--scenario` 列表里有没有同一场景**（有且绿 → 新出现；没有 → 只是首次被扫到）。

收紧后的双向验证：

| 验证 | 结果 |
|---|---|
| 单测：值同引用不同 | 不再报（新增用例锁住） |
| 单测：引用相同 | 仍报（新增用例锁住） |
| `fixture/known-bad`（模块级常量传无 memo 子组件） | 仍报 `avoidable-render` 25 条 —— **防线没丢** |
| `fixture/known-good` | 无 finding |
| CI 那 14 个 packed-consumer 场景 | `avoidable-render` **归零** |

**代价**：漏掉「调用方传新引用但值相同」这类浪费。但那类的修复对象是调用方而非组件，
记在组件头上本来就错位（§7.4 已论证），而 `GenericFixture` 每次父级渲染都重新调用
`initialRender()` 造新 element 树，等于规则一直在测 harness 的写法。

**未做**：全量 373 场景的复验（只跑了 CI 的 14 个）。§7.1 那 34 条按机制应当同批归零，
但没有实测数字，下次全量扫描时顺带确认。

---

## 附：本文用到的脚本

全部在 `.hulian-scan/reports/fanout-scripts/`，只读 `.hulian-scan/baseline-run/`，
不需要起浏览器，在仓库根目录执行：

| 脚本 | 回答 |
|---|---|
| `batch.mjs` | 24 条各自的峰值落在哪个 step、峰值构成 |
| `shape.mjs` | 峰值是深链还是扇出 |
| `control.mjs` | 全库对照组、fanout 与深度的相关系数 |
| `attrib.mjs` | 归属（harness / Base UI / 裸 DOM / 瑚琏） |
| `analyze.mjs <raw.json> [--tree]` | 单场景峰值 commit 的完整 fiber 树 |
| `newdef.mjs [--verify]` | 新定义（按 step 求和）离线复算 + 自校验 |
| `rank.mjs` | 新旧定义的秩相关 |
| `ratio2.mjs` | 归一化比值（每 fiber 每次更新渲染几次） |
