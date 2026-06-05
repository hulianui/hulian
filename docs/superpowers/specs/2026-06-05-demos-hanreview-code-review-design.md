# 瀚审 HanReview —— AI 代码审查质检平台 · 设计 spec

- 日期：2026-06-05
- 类型：内置 demo（新增）+ 4 个新库组件 + 1 个既有组件增强
- 定位：研发团队的 AI 代码质量中枢（PR/提交进来 → AI 审查员逐文件审 → 行内批注 + 质量分 + 门禁）
- 状态：待用户 review

## 1. 背景与目标

库已 215 组件、15 个 demo。本 demo 的拓库价值锚在 **AI 代码审查 / 质量门禁** 这个尚未覆盖的真实场景。
用户原始需求是「代码质检 + LLM 任务分发智能路由 Agent」，经对齐拆为两个独立 demo：

- **本 demo（瀚审 HanReview）**：主线 = 代码质检；智能选模型路由作**中等占位**（专门一页可视化）。
- **另一 demo（智能体任务调度平台）**：另出 prompt 交他会话建，本 spec 不含。

与已规划但未建的「瀚枢 HanHub 网关」无关，HanHub spec/plan 暂搁置。

**硬约束（来自用户指令 + CLAUDE.md）**
- 100% 由 `@hulianui/ui` 搭建，**禁止在 demo 里打 CSS 补丁 / 行为 hack**；缺能力 → 回库修组件 / 造组件。
- demo 是「寻求真实场景拓展 UI 库」的载体，不是做着玩；不怕引入新组件。
- 全 mock 内存态，`output: export` 静态导出。
- 所有面向交付的输出中文。

## 2. 产品命名与信息架构

**瀚审 HanReview** —— AI 代码审查质检平台（「审」= code review / 审查，承袭瀚云/瀚付/瀚选/瀚库/瀚枢品牌族）。

**一句话**：把"资深 reviewer 的眼睛"规模化。每个 PR/提交进来，AI 审查员（带智能选模型）逐文件审查，
行内批注问题、给质量分、跑质量门禁，决定能否合并。

### 目录结构（沿用 ai-workflow demo 范式）

```
app/demos/hanreview/
  (app)/                         ← AdminLayout 外壳 + 多页签 keep-alive
    layout.tsx                   ← AdminLayout 骨架（侧栏导航 + 顶栏 + 多页签）
    page.tsx                     ← 1 概览 Dashboard
    reviews/page.tsx             ← 2 审查队列
    reviews/[id]/page.tsx        ← 3 审查详情（旗舰；server + generateStaticParams + client 子件）
    findings/page.tsx            ← 4 问题中心
    gates/page.tsx               ← 5 质量门禁
    routing/page.tsx             ← 6 智能路由（中等占位）
    settings/page.tsx            ← 7 设置
  login/page.tsx                 ← 独立登录页（同其它 demo）
  _components/
    nav-config.ts                ← 侧栏/页签配置
    review-shell.tsx             ← AdminLayout 外壳封装
    ...（各页拆出的子组件）
  _data/                         ← 全 mock
    repos.ts                     ← 仓库 + 分支
    reviews.ts                   ← 审查记录（含改动文件 + diff 文本 + AI 批注 + 质量分 + 门禁结果 + 路由决策）
    findings.ts                  ← 问题清单（severity/type/rule/file/line/状态）
    rules.ts                     ← 规则集 + 门禁阈值 + 模型策略
    models.ts                    ← 审查模型池（名称/价位/能力/适配场景）
    metrics.ts                   ← 趋势 / 热点 / 覆盖率时序（供 Chart + Heatmap）
    members.ts                   ← 团队成员
    types.ts
  _lib/
    quality-score.ts             ← 质量分纯函数：按问题严重度加权扣分 → 0-100 + 等级 A-F（可测）
    routing.ts                   ← 选模型纯函数：按文件语言/复杂度/安全敏感 + 成本上限 → 选定模型 + 理由（可测）
    gate.ts                      ← 门禁判定纯函数：分数/严重问题数/覆盖率阈值 → pass/block + 阻断原因（可测）
    use-review-run.ts            ← mock AI 审查流程：拓扑推进（拉取→选模型→静态检查→AI 逐文件→汇总），流式结论
```

## 3. 七个页面

### 1 概览 Dashboard（`page.tsx`）
- 顶部 KPI 卡：本周审查数 / 平均质量分 / 待处理问题 / 门禁通过率（Stat + NumberTicker + ScoreRing 迷你态）。
- 质量分趋势：近 30 日平均质量分折线（Chart）。
- 问题严重度分布：critical/major/minor/info 堆叠柱或环形（Chart）。
- **代码热点 Heatmap**（新组件）：按模块×周的问题密度热力图，色深=问题多。
- 审查成本卡：本月 AI 审查 token 花费 + 各模型占比（List + meter）。
- 最近审查流：精简审查条（List），点跳详情；门禁阻断的红色高亮。
- 余额/预算告警 Banner（AI 预算接近上限时）。

### 2 审查队列 Reviews（`reviews/page.tsx`）
- ProTable：仓库、分支、标题、作者(Avatar)、**改动规模 DiffStat 条**（新组件）、AI 状态(StatusDot：排队/审查中/完成/失败)、
  质量分(ScoreRing 迷你)、问题数(Tag 按 severity)、门禁结果(Tag pass/block)、审它的模型 + 成本。
- 查询区：仓库、分支、作者、状态、门禁结果、时间范围（SearchForm + Segmented）。
- 行操作：查看详情、重新审查、忽略。
- 顶部分段：全部 / 待我处理 / 阻断 / 已通过（Segmented）。

### 3 审查详情 Review Detail（`reviews/[id]/page.tsx`）—— 旗舰页
- **顶部门禁 banner**：通过(绿)/阻断(红) + 阻断原因（"3 个严重问题未解决 / 质量分 62 低于门禁 70"）+ 重新审查 / 强制合并按钮。
- **三栏布局**：
  - **左栏**：改动文件树（FileTree）+ 每文件 DiffStat 条；点文件滚到对应 diff。
  - **中栏**（主体）：逐文件 **Diff 视图（增强后的 code-diff，带 gutter severity 标记 + 行锚定批注槽）**，
    行内嵌 **CodeReviewThread**（新组件）：AI/人类作者头像、severity tone、问题描述、**建议修改块(suggestion diff)**、回复、标记已解决/误报。
  - **右栏**：**AI 审查过程**（复用 agent-plan / thinking-block / tool-call / streaming-text）：
    "选模型 → 跑 eslint(tool-call) → 跑测试(tool-call) → 逐文件推理(thinking-block) → 汇总结论(streaming)"；
    底部 **质量分环 ScoreRing**（大）+ 问题汇总(按 severity 分组 List) + 本次审查的模型 + token 成本。
- 加载/审查中：use-review-run 拓扑推进，逐步点亮右栏过程帧（Spin / Skeleton）。

### 4 问题中心 Findings（`findings/page.tsx`）
- ProTable：severity(StatusDot/Tag)、类型(bug/安全/性能/风格/复杂度)、规则、文件:行、所属审查、状态(待处理/已修/忽略/误报)、首次出现。
- 查询区：severity / 类型 / 规则 / 仓库 / 状态过滤。
- 行点开 Drawer：问题描述 + **问题代码片段(code-block 带行高亮)** + 规则说明 + 建议修复(code-diff suggestion) + 处理动作。
- 批量：选中→批量忽略 / 标误报 / 指派。
- 顶部统计条：各 severity 计数 + 趋势迷你折线。

### 5 质量门禁 Gates（`gates/page.tsx`）
- 门禁规则卡（按仓库/分支）：最低质量分(NumberField + ScoreRing 预览)、最高严重问题数、最低覆盖率、必过规则集开关。
- 规则集开关：安全 / 性能 / 风格 / 复杂度 / 测试覆盖（Switch + 描述）。
- 门禁模拟器：拖动阈值滑块(Slider) → 实时显示"按当前阈值，最近 N 次审查会有 M 次被阻断"（纯函数 gate.ts 重算）。
- 新建/编辑门禁 FormDialog。

### 6 智能路由 Routing（`routing/page.tsx`）—— 中等占位
- **模型池**：审查用模型卡（Haiku/Sonnet/Opus/DeepSeek 等），各自价位、能力标、适配场景、本月调用占比（Grid + meter）。
- **路由策略**：规则列表（"测试/配置文件 → Haiku"、"安全敏感目录 → Opus"、"默认 → Sonnet"、"成本上限 ¥X/审查"）——
  Choicebox / List + 可编辑，纯函数 routing.ts 驱动。
- **分发流向可视化**（复用既有 **Flow** 组件）：文件类型节点 → 路由器节点 → 模型节点，连线带占比；只读拓扑。
- **路由决策回放**：选一次审查，逐文件展示"这个文件 → 命中哪条规则 → 派给哪个模型 → 成本/预计质量"（Table + Tag），
  成本 vs 质量散点（Chart）。

### 7 设置 Settings（`settings/page.tsx`）
- 接入仓库：GitHub/GitLab webhook URL（复用 **SecretField** 掩码 token）+ 已接仓库列表(List + StatusDot)。
- 团队成员：List + Avatar + 角色 Tag（管理员/审查者/只读）。
- 通知：门禁阻断 / 严重问题 通知渠道（Switch + Choicebox）。
- AI 预算：月度预算 NumberField + 当前消耗 meter + 超额策略（降级到便宜模型 / 暂停）。

## 4. 组件改动总览（先造/先改，页面再 dogfood）

每个新组件标配：源码 + `.showcase.tsx`（进画廊）+ `.test.tsx` + `index.ts` barrel + `manifest.ts` 登记 + `registry.tsx`。
遵循库现有约定：零依赖优先、token 驱动配色、尽量 RSC 安全、纯几何/逻辑抽纯函数可单测。

### 4.0 增强既有 code-diff（修组件，不在 demo 打补丁）
当前 `code-diff` 仅纯 diff 渲染（oldText/newText/unified|split/行号）。为承载行内 AI 批注：
- 新增 `annotations?: { side?: "old"|"new"; line: number; gutter?: ReactNode; content: ReactNode }[]`：
  - `gutter` —— 该行行号槽旁的标记（severity 圆点/图标）。
  - `content` —— 在该 diff 行**下方**插入的整宽槽（放 CodeReviewThread）。
- 向后兼容：不传 `annotations` 行为不变。
- 内部把"行 → 渲染位置"映射抽函数，annotations 按 (side,line) 匹配插入。

### 4.1 CodeReviewThread（旗舰新组件）
- 路径 `packages/ui/src/code-review-thread/`，category `data-display` / group `collection`。
- 定位：diff/代码上的行锚定审查评论线程卡。可塞进 code-diff 的 `annotations.content`，也可独立列用。
- Props：
  - `comments: { id; author: { name; avatar?; kind: "ai"|"human" }; severity?: "critical"|"major"|"minor"|"info"; body: ReactNode; time?: ReactNode; suggestion?: { oldText?: string; newText: string } }[]`
  - `status?: "open"|"resolved"|"wontfix"`、`onStatusChange?`、`onReply?(text)`、`replyable?`（默认 true）。
  - `collapsed?` 受控折叠 + `defaultCollapsed?`；`className`。
- 行为：顶部首条评论 + severity tone 边色；AI 作者带机器人标；`suggestion` 渲染为内嵌建议 diff（复用 code-diff）+「采纳」按钮；
  回复输入框（复用 textarea/button）；标记已解决/误报（复用 button + tag）；可折叠为单行摘要。
- 实现：复用 avatar / tag / button / textarea / code-diff；severity→tone 映射纯函数可测。
- 不做：真实提交（mock 回调）；@提及（YAGNI，comment 组件另有）。

### 4.2 DiffStat（新组件）
- 路径 `packages/ui/src/diff-stat/`，category `data-display` / group `info`。
- 定位：文件/PR 改动规模统计条。
- Props：
  - `additions: number`、`deletions: number`、`status?: "added"|"modified"|"deleted"|"renamed"`。
  - `blocks?: number`（默认 5）—— 绿红格子条总格数；`showCounts?`（默认 true）显 `+N −M`。
  - `size?`、`className`。
- 行为：`+N`(绿) `−M`(红) 数字 + 按比例填色的格子条 + 可选 A/M/D/R 状态徽标。
- 实现：纯函数 `splitBlocks(additions, deletions, blocks)` → 绿/红/空格子数，可单测；零依赖。

### 4.3 Heatmap（新组件，库内首个热力图）
- 路径 `packages/ui/src/heatmap/`，category `data-display` / group `collection`。
- 定位：通用网格/日历热力图（代码热点、贡献活动、覆盖率）。库内完全无热力图，通用价值高。
- Props：
  - `data: { x: string|number; y: string|number; value: number }[]`（稀疏点集）。
  - `xLabels?: (string|number)[]`、`yLabels?: (string|number)[]`（不传则从 data 推导并排序）。
  - `colorScale?: number`（色阶档数，默认 5，吃语义 token 由浅到深）；`max?`（不传取数据最大）。
  - `cellSize?`、`gap?`、`renderTooltip?(cell)`、`onCellClick?(cell)`、`className`。
- 行为：行列网格，每格按 value/max 映射到色阶；hover 显 tooltip（复用 tooltip）；可选行列标签轴。
- 实现：纯函数 `buildMatrix(data, xLabels, yLabels)` + `bucketize(value, max, scale)`，可单测；零依赖（CSS grid）。
- 不做：日历布局的复杂周月对齐（先做规整网格 + 简单标签；日历变体 YAGNI 留后）。

### 4.4 ScoreRing（新组件）
- 路径 `packages/ui/src/score-ring/`，category `data-display` / group `info`。
- 定位：带等级带的半径仪表评分环，区别于线性 `meter`/`progress`。
- Props：
  - `value: number`、`max?`（默认 100）。
  - `grades?: { min: number; label: string; tone?: string }[]`（默认 A≥90 / B≥80 / C≥70 / D≥60 / F<60，tone 由 token 映射）。
  - `size?`、`thickness?`、`label?: ReactNode`（环心标签，默认显数值 + 等级）；`showGrade?`（默认 true）；`className`。
- 行为：SVG 圆环按 value/max 填充（圆环用 SVG 属性 stroke-dasharray，**不靠 CSS transform** —— 见库内 svg-circular-progress-ring 约定）；
  环心显分值 + 等级字；颜色按命中的 grade tone。
- 实现：纯函数 `resolveGrade(value, max, grades)` + 弧长计算，可单测；零依赖。

> 4 新组件中 **CodeReviewThread + Heatmap** 是真缺口、复用面广；**DiffStat + ScoreRing** 偏代码/质量专用但场景刚需。
> 路由分发流向**复用既有 Flow**，不额外造件。

## 5. Mock 数据要点（真实性）

- **审查记录**：每条带真实感 diff 文本（一段有 bug 的 TS/JS/Py 代码片段）、AI 批注（锚定到具体行 + severity + suggestion）、
  质量分、门禁结果、路由决策（哪个文件→哪个模型→成本）、AI 过程帧（tool-call: eslint/jest 结果 + thinking 文本）。
- **质量分纯函数** `quality-score.ts`：`score = 100 − Σ(severity 权重 × 计数)`，clamp 0-100，映射等级 A-F。可单测。
- **选模型纯函数** `routing.ts`：输入文件特征(语言/行数/是否安全敏感/是否测试配置) + 成本上限 → 命中规则 → 选定模型 + 理由 + 预估成本。可单测。
- **门禁纯函数** `gate.ts`：阈值(最低分/最高严重数/最低覆盖率) vs 审查指标 → pass/block + 阻断原因数组。可单测。
- 模型池价位 grounded 2026：Haiku 4.5 \$1/\$5、Sonnet 4.6 \$3/\$15、Opus 4.7 \$5/\$25、DeepSeek V4 ~\$0.55/\$2.2。

## 6. 验证策略

1. **组件层**：4 新组件 + code-diff 增强各自 `.test.tsx`（纯函数 + 渲染 + 交互），`pnpm --filter @hulianui/ui test` 全绿。
   code-diff 增强需补 annotations 渲染测，保证向后兼容旧测不挂。
2. **画廊层**：4 新组件 showcase 进画廊，doc 页零 console error。
3. **demo 层**：CDP 隔离 Chrome-for-Testing 实机逐页截图（7 页 + login）+ 关键交互
   （审查详情行内批注展开/采纳建议、审查中过程帧推进、门禁滑块模拟、路由决策回放、Heatmap hover、ScoreRing 等级），
   零 console error。验证用独立 chromium 避 MCP 争用（见 memory：mcp-browser-busy）。
4. **登记**：`demos.ts` 加 hanreview 条目；`demos-coverage.mjs` 验证新组件点亮计入覆盖率。

## 7. 实现顺序

1. 增强 code-diff（annotations 槽）+ 补测，保证旧测绿。
2. 4 个新组件（CodeReviewThread → DiffStat → Heatmap → ScoreRing）+ 测试 + 画廊登记。
3. mock 数据 + _lib 纯函数（quality-score / routing / gate / use-review-run）+ 单测。
4. 7 页（AdminLayout 外壳先行，再分页 dogfood；页面间弱耦合，可并行派 subagent）。
5. demos.ts 登记 + 实机像素自证 + 覆盖率验证。
6. commit（不 push，沿用本仓无 remote 惯例；共享文件用 hunk 级 git apply 暂存避卷他人 WIP）。

## 8. 非目标（YAGNI）

- 不接真实 LLM / 真实 git webhook（全 mock）。
- CodeReviewThread 不做真实提交 / @提及。
- Heatmap 不做日历周月对齐变体（先规整网格）。
- 深度任务调度 / 多 agent 编排 → 拆给「智能体任务调度平台」另一 demo。
- 不做 i18n / 多主题切换（吃库默认 token 主题）。

## 9. 配套交付：智能体任务调度平台 prompt

本 session 额外产出一份「智能体任务调度平台」demo 的独立 prompt（交用户转派他会话），
承接原始需求里被拆出的「LLM 任务分发智能路由」深度部分，与瀚审形成姊妹 demo。prompt 单独成文。
