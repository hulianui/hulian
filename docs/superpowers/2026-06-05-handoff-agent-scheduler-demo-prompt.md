# Handoff Prompt —— 智能体任务调度平台 demo（交另一会话建）

> 用法：新开一个 /clear 会话，**整段粘贴下面 `---` 之间的内容**作为首条消息即可。
> 它是瀚审 HanReview（代码质检 demo，本会话在建）拆出的姊妹 demo，承接「LLM 任务分发智能路由」的深度部分。

---

在 hulian 组件库仓库（`/Users/zhangzhiwei/Desktop/code/hulian`）里新建一个内置 demo：**智能体任务调度平台**。

## 目的（务必先读）

这个 demo 的根本目的是**用真实场景驱动 @hulianui/ui 组件库成长**——demo 是寻求真实场景拓展 UI 库的载体，不是做着玩。
- 没组件就去 @hulianui/ui 加组件；组件有问题就去 @hulianui/ui 修组件、丰富组件。
- **100% 用 @hulianui/ui 组件实现，禁止在 demo 里打 CSS 补丁 / 行为 hack**——demo 里需要 override 或 hack 才好用 = 组件有缺口，回库修组件，别在 demo 打补丁。
- 不要担心引入新组件，允许 web search 找真实业界形态。

## 产品概念

**智能体任务调度中枢**：异构 AI 任务（翻译 / 摘要 / 抽取 / 分类 / 生图 / RAG / 代码审查……）涌入一个任务总线，
一个**智能路由/调度器**按「能力匹配 + 成本 + 延迟 + 当前负载 + 优先级 + SLA」把每个任务（或拆解后的子任务）
派给 agent/模型池里最合适的执行者；带多 agent 编排、降级/failover、可观测（路由决策、队列深度、吞吐、成本、成功率）。

它与已有 demo 的边界：
- 区别于 **瀚审 HanReview**（代码质检，已在建）：本 demo 任务**不限于代码**，核心是**调度/分发/编排**本身。
- 区别于已搁置的 **瀚枢 HanHub**（纯 API 中转网关 + 计费）：本 demo 核心是**任务级智能调度与多 agent 编排**，不是 API 代理计费。

承袭 `瀚X` 品牌族（瀚云/瀚付/瀚选/瀚库/瀚审）。建议名 **瀚舵 HanHelm**（舵=掌舵/调度枢纽；「枢」已被 HanHub 占）——你也可另提，先 brainstorm 定。

## 工作流要求（硬性）

1. **先走 superpowers brainstorming skill**：探索现有 demo 与组件库 → 一次问清定位/范围 → 提方案 → 出设计 → 写 spec
   到 `docs/superpowers/specs/YYYY-MM-DD-demos-<slug>-design.md` 并提交 → 用户 review → 再 writing-plans 出实现计划。
   **不要跳过 brainstorming 直接写码。**
2. 参考本会话刚落的姊妹 spec：`docs/superpowers/specs/2026-06-05-demos-hanreview-code-review-design.md`（结构/约束/验证策略照搬）。
3. 沿用既有 demo 范式（强烈建议先读 `app/demos/ai-workflow/`：AdminLayout 外壳 +（app）多页签 + `_components`/`_data`/`_lib` 分层 + 全 mock + login 页）。

## 项目铁律（继承自 CLAUDE.md + 既有 demo 惯例）

- 全 mock 内存态；`output: export` 静态导出 → 动态路由 `[id]` 必须 `generateStaticParams` 且拆 server page + client 子件。
- 所有面向交付输出**中文**。
- 新组件标配：源码 + `.showcase.tsx`（进画廊）+ `.test.tsx` + `index.ts` barrel + `lib/manifest.ts` 登记 + `lib/registry.tsx`（画廊需要时）。零依赖优先、token 驱动配色、纯几何/逻辑抽纯函数可单测、尽量 RSC 安全。
- demo 注册进 `app/demos/lib/demos.ts`；跑 `demos-coverage.mjs` 让新组件点亮计入覆盖率。
- 验证：`pnpm --filter @hulianui/ui test` 全绿 + 画廊 doc 页零 console error + **CDP 隔离 Chrome-for-Testing 实机逐页截图自证**（别反复起新 Chrome profile，会连环弹钥匙串——复用单实例或用 executablePath 起独立 chromium）。
- **并行会话 git 卫生**：本仓常有多会话未提交 WIP，`git add -A` 会卷走别人的暂存。**只 add 自己改的具体文件**，或用 hunk 级 `git apply --cached` 只暂存自己改动。commit 不 push（本仓无 remote 惯例）。
- 起 www 预览用 `pnpm --filter www dev`（根 `pnpm dev` 的 kill:stale 会误杀别的桌面 app）。
- Next dev 下 headless CLI 截图可能全空白——视觉验证走真实浏览器 / Playwright MCP / curl SSR HTML。

## 信息架构种子（最终以你 brainstorm 为准）

AdminLayout 外壳 + 多页签：
1. **调度总览**：实时吞吐 / 队列深度 / 成功率 / 成本 KPI、各 agent 负载、SLA 达成、分发流向缩略（Sankey）。
2. **任务队列**：实时任务流（ProTable + 优先级泳道）：类型、优先级、SLA 倒计时、状态、派给哪个 agent、耗时、成本、重试。
3. **任务详情（旗舰）**：DAG 分解（复用既有 **Flow** 组件）子任务派给不同 agent；执行时间线（复用 Gantt/Timeline）；每步 tool-call/输出（复用 agent-plan/tool-call/streaming-text）；**路由决策回放**：为什么这个子任务给这个 agent（命中规则 + 成本/延迟权衡）。
4. **智能路由**：路由策略（能力匹配/成本/延迟/负载/优先级权重，纯函数驱动可测）；**Sankey 分发流向（旗舰可视化）**；成本 vs 延迟权衡散点（复用 Chart）；A/B 策略对比；降级/failover 规则。
5. **Agent 池**：worker/模型注册——能力标、并发上限、当前负载、健康（复用 StatusDot）、价位、本期处理量趋势（Sparkline）；扩缩容操作。
6. **SLA & 告警**：SLA 规则、违约统计、熔断/限流（复用 Switch/NumberField/Banner）。
7. **设置**：接入、团队成员、预算。
- **login** 独立登录页。

## 候选新组件（强候选缺口，最终由你 brainstorm 定；**刻意避开瀚审正在加的 4 个**）

> 瀚审 HanReview 并行会话正在新增：**CodeReviewThread / Heatmap / DiffStat / ScoreRing**，并增强 `code-diff`。
> 你的 demo **不要重复造这 4 个**；负载/SLA 仪表盘类**直接复用瀚审加的 ScoreRing**（若已落地），分发流向**复用既有 Flow**。
> 下面是与之不重叠的新缺口候选：

1. **Sankey（旗舰）** —— 多级比例流向图（任务源 → 路由器 → agent 池），连线宽度按流量占比。库里只有 Flow（等宽节点连线），**无比例流图**，是调度分发的招牌可视化。category `data-display`/`collection`，几何抽纯函数可测。
2. **Sparkline** —— 内联微型趋势（折线/柱，无坐标轴），嵌表格/卡片显每个 agent 吞吐/延迟趋势。库里只有重型 Chart，**无轻量 sparkline**，复用面极广。category `data-display`/`info`。
3. **Funnel** —— 任务漏斗（收到 → 路由 → 执行中 → 完成 / 失败），分段比例 + 转化率。库内无漏斗图。category `data-display`/`collection`。
4. **（待定第 4 个）** 例如 **QueueLane**（优先级泳道实时队列板，区别于拖拽式 Kanban：自动流动 + SLA 倒计时 + 优先级分层）——或你 brainstorm 出更贴的缺口。**别和 Kanban 重复**（Kanban 是手动拖列）。

每个新组件遵循库标准（showcase/test/barrel/manifest/registry），先造再 dogfood。

## 非目标（YAGNI）

- 不接真实 LLM / 真实任务执行（全 mock，模拟流式 + 拓扑推进）。
- 不做真实鉴权 / 真实计费扣款。
- 不做 i18n / 多主题切换（吃库默认 token 主题）。
- 代码质检细节归瀚审，本 demo 代码审查只作「任务类型之一」轻量出现，不重做行内批注。

---

（以上即可作为新会话首条消息。）
