# TaskRunner 设计 + AgentPlan 增强

> 日期：2026-06-04 · 状态：已批准设计，待写实现计划
> 触发：用户给的 "Sandbox 执行步骤卡" 参考图（带实时状态的步骤列表 + 顶部进度 + 头部状态徽标 + 底部累计耗时）

## 背景与目标

参考图是一张 **任务运行卡 / Sandbox 执行器**：
- Header：`Sandbox` 标题 + `node26` 灰胶囊标签 + `Running ●` 状态徽标
- 顶部进度条（绿色，部分填充）
- 步骤列表：每步 = 状态图标（勾/转圈/空心环/叉）+ 步骤名 + 右侧耗时（`180ms` / 进行中显 `...`），running 行浅色高亮
- Footer：累计耗时 `3.12s` + 状态文字 `Executing...`

现状评估：核心步骤列表由现有 `AgentPlan` 覆盖 ~70%，但缺①每步右侧 trailing meta（耗时）②running 行高亮③pending 空心环；整卡外壳（头部徽标 / 顶部进度 / 底部累计耗时）无现成件。

**目标**：
1. 小补 `AgentPlan`，补齐缺口并支持内嵌复用。
2. 新增 `TaskRunner` 高层展示件，内部 dogfood 增强后的 `AgentPlan` + `Progress` + `Tag` + `Dot`，开箱画出参考图。

**非目标（YAGNI）**：
- core 不带运行驱动 / 计时 / 拓扑推进逻辑（保持库纯皮肤哲学，和 `AgentPlan`/`ToolCall` 一致）。
- 计时演示靠画廊 doc 页里的示例 `useTaskRun` hook，不进库 core。

## 设计哲学一致性

- 纯展示、数据驱动（对齐 `Steps` items / `Timeline` items / `AgentPlan` tasks）。
- 状态驱动样式（对齐 `ToolCall`：running 行高亮由 `status` 派生，不引入额外开关 prop）。
- dogfood 自家件：`TaskRunner` 复用 `AgentPlan`/`Progress`/`Tag`/`Dot`，增强不是为图硬塞而是真复用。
- running 行的转圈、进度条不定态等都是纯 CSS 动画，组件可保持 RSC 友好（`AgentPlan` 现为 RSC）。

---

## ① AgentPlan 增强（向后兼容）

文件：`packages/ui/src/agent-plan/agent-plan.tsx` + `agent-plan.types.ts`

| 增项 | 行为 | 兼容性 |
|---|---|---|
| `AgentTask.meta?: ReactNode` | 每行右侧 trailing 槽，右对齐、弱化（`text-xs text-muted`）。放耗时/小 badge。行布局改为 `flex` 两端：左 = 图标+标题块，右 = meta。 | 新增可选字段，旧用法不传即不渲染。 |
| running 行自动高亮 | `status==="running"` 的 `<li>` 加浅底色块（`bg-surface-hover` 或 `bg-muted/40`），靠负 margin + padding 撑满整行视觉。 | 纯视觉，状态驱动，无新 prop。 |
| pending 空心环 | `StatusIcon` 的 `pending` 分支从实心 `<Dot>` 改为**描边空心圈**（`size-3.5 rounded-full border-2 border-border`）。匹配参考图 hollow ring。 | `Dot` 组件本身不动；仅 AgentPlan 内联渲染方式变化。 |
| `AgentPlan` 加 `bare?: boolean` | `true` 时去掉外层 `border / bg-surface / p-3`（仅保留列表），供 `TaskRunner` 内嵌不双层边框。`title` 仍可传 null 隐藏。 | 默认 `false`，现有用法不变。 |

`StatusIcon` 映射（保持）：running→`<Spinner>`、done→`<Check class=text-success>`、error→`<X class=text-danger>`、pending→空心环。

### 增强后类型

```ts
export type AgentTaskStatus = "pending" | "running" | "done" | "error";

export interface AgentTask {
  title: ReactNode;
  status?: AgentTaskStatus;   // @default "pending"
  detail?: ReactNode;         // 标题下方弱化次要描述（保留）
  meta?: ReactNode;           // 新增：右侧 trailing（耗时/小标）
}

export interface AgentPlanProps {
  tasks: AgentTask[];
  title?: ReactNode;          // @default "执行计划"；null 隐藏
  bare?: boolean;             // 新增：去外框，供内嵌
  className?: string;
}
```

---

## ② TaskRunner（新件）

文件：`packages/ui/src/task-runner/{task-runner.tsx, task-runner.types.ts, task-runner.test.tsx, task-runner.showcase.tsx}`
分类：manifest `category: "ai"`, `group: "agent"`（紧挨 `agent-plan` / `tool-call`）。

> 命名说明：参考图是 code sandbox runner，偏 devtools；但执行计划族（AgentPlan/ToolCall）同属 ai/agent，归此组让 dogfood 复用关系清晰。组件本身语义通用（CI/build/agent 执行皆可用）。

### API

```ts
export type TaskRunStatus = "idle" | "running" | "success" | "error";

export interface TaskRunnerProps {
  title: ReactNode;            // "Sandbox"
  tag?: ReactNode;             // "node26" → 渲染为 <Tag variant="soft" tone="neutral">
  status?: TaskRunStatus;      // 驱动头部徽标色 + 进度条 tone。@default "idle"
  statusLabel?: ReactNode;     // 徽标文字覆盖；省略时按 status 派生
  steps: AgentTask[];          // 复用 AgentTask（title/status/detail/meta）
  progress?: number;           // 0-100 顶部进度条；省略 → 按 steps 完成比派生
  elapsed?: ReactNode;         // "3.12s"（footer 左）
  footerStatus?: ReactNode;    // "Executing..."（footer 右）
  headerExtra?: ReactNode;     // 递进送掣：头部右侧追加（按钮/菜单）
  footerExtra?: ReactNode;     // 递进送掣：footer 右侧替换/追加
  className?: string;
}
```

### 渲染分区（对照参考图）

| 区 | 实现 |
|---|---|
| Header | `flex items-center justify-between`。左：`title`（`font-semibold`）+ `tag`→`<Tag variant="soft" tone="neutral">`。右：`<Dot tone={statusTone} pulse={status==="running"}>` + `statusLabel`（同色文字）+ `headerExtra`。 |
| 进度条 | dogfood `<Progress variant="linear" tone={progressTone} value={resolvedProgress}>` 细条。`running` → `tone="primary"`，`success` → `tone="success"`，`error` → `tone="danger"`。 |
| 步骤区 | `<AgentPlan bare title={null} tasks={steps} />`。耗时走 `meta`，running 行自动高亮，pending 空心环——全由增强后的 AgentPlan 提供。 |
| Footer | `border-t border-border`，`flex justify-between`，弱化（`text-xs text-muted`）。左 `elapsed`，右 `footerStatus`（`footerExtra` 存在则用它替换右侧）。 |

### 派生逻辑

- `statusTone`/`statusLabel` 派生表：

  | status | Dot tone | 默认 label |
  |---|---|---|
  | idle | neutral | （无 / "Idle"） |
  | running | brand | "Running" |
  | success | success | "Done" |
  | error | danger | "Failed" |

  `statusLabel` 传入则覆盖默认。

- `resolvedProgress = progress ?? round(done 数 / steps.length * 100)`（`steps.length===0` → 0）。显式 `progress` 优先（参考图进度条与完成比不完全一致，需可覆盖）。

- 纯函数抽出便于单测：`resolveProgress(steps, progress)`、`statusMeta(status)`。

### 边界与依赖

- **做什么**：把"标题+标签+状态徽标 / 进度 / 步骤 / 累计耗时"组成一张运行卡，纯展示。
- **怎么用**：传 `title`+`steps`(+`status`/`elapsed`/`progress`)，开箱即图；需头部按钮等用 `headerExtra`/`footerExtra` 送掣。
- **依赖**：`AgentPlan`(bare) / `Progress` / `Tag` / `Dot` / `cn`。无第三方。
- 因 `Progress` 等可能含 client 行为，`TaskRunner` 标 `"use client"` 与否以实现时实测为准（优先 RSC，能 RSC 则不加）。

---

## 测试计划

`agent-plan.test.tsx`（在现有基础上补）：
- `meta` 渲染在行右侧
- `status="running"` 行带高亮 class
- `bare` 时无外层 border/bg
- pending 渲染空心环（非实心 Dot）

`task-runner.test.tsx`（新）：
- `resolveProgress`：显式 `progress` 优先；省略时按 done 比派生；空 steps→0
- `statusMeta`：四态 tone/label 映射；`statusLabel` 覆盖
- steps 透传到内嵌 AgentPlan（含 meta 耗时）
- `headerExtra` / `footerExtra` 送掣渲染

## 落地清单

1. 增强 `agent-plan.tsx` + `agent-plan.types.ts` + 补 `agent-plan.test.tsx`
2. 新建 `task-runner/` 四文件
3. `packages/ui/src/index.ts` 导出 `TaskRunner` + 类型
4. `packages/ui/src/showcase.ts` 注册 showcase
5. `apps/www/lib/manifest.ts` 加条目（ai/agent）
6. 画廊 doc 页（含纯展示示例 + `useTaskRun` 驱动示例 hook）
7. `npm`/`pnpm` 测试全绿 + 画廊页实机自证（CDP 隔离 Chrome 截图，对照参考图）

## 验收标准

- TaskRunner 默认 props 渲染出与参考图一致的布局（四态步骤 + 进度 + 头部徽标 + 底部累计耗时）。
- AgentPlan 旧用法零回归（现有测试 + demo 不变）。
- 全程 dogfood，无 demo/页面侧 CSS override（撞缺口已在组件内补齐）。
- ui 包测试全绿。
