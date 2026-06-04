# 内置 Demo · CRM 客户管理后台（slice 2-6）— 设计

> 日期：2026-06-04 · 状态：已与用户确认范围，待用户复核本规格 → writing-plans
> 核心约束：**100% 用 `@hulian/ui` 搭建**。撞到组件缺口/不满足 → 就地扩库或加新组件，禁止在页面手搓本应是组件的 UI。
> 用户拍板：**全交互**（增删改/拖拽/筛选真生效，刷新即还原）；商机看板的跨列拖拽 → **新增 `@hulian/ui` Kanban 组件**。

## 1. 现状与本次范围

slice 1 已完成并 committed：CRM 区外壳（`AdminLayout` + 路由绑定页签/面包屑/`User`/主题切换）、工作台首页（`Stat`/`AreaChart`/`PieChart`/`List`），以及完整的静态 mock 数据层（24 客户 / 16 商机 / 40 订单 / 12 条跟进 / 指标派生函数）+ 状态色映射（`status.ts`）。

本次把 **6 个占位/桩页面**替换为真实页面，并补 1 个库组件：

| # | 路由 | 当前 | 目标 |
|---|---|---|---|
| 2 | `/demos/crm/customers` | `Placeholder` | 客户列表（ProTable 全功能 + 新增/编辑 + 筛选） |
| 3 | `/demos/crm/customers/[id]` | 桩 | 客户详情（Descriptions + Tabs：跟进时间线/关联商机/关联订单） |
| 4 | `/demos/crm/opportunities` | `Placeholder` | 商机看板（**新 Kanban 组件**，跨列拖拽改阶段） |
| 5 | `/demos/crm/orders` | `Placeholder` | 订单管理（ProTable + Drawer 详情 + 状态筛选） |
| 6 | `/demos/crm/settings` | `Placeholder` | 系统设置（Tabs + ProForm 多分区） |
| 7 | `/demos/crm/login` | `Empty` 桩 | 登录页（`LoginForm` 左右分栏品牌版式） |
| L | `packages/ui` | — | **新增 `Kanban` 组件**（dnd-kit 多容器跨列拖拽） |

## 2. 交互与状态模型

**每页本地 `useState`，从 mock 数组种子化，刷新即还原。** 不引全局 store——demo 各页相互独立，跨页同步不在范围内（YAGNI）。

- 客户列表：`useState(customers)`，新增/编辑写入本地数组，`toast` 反馈；筛选/搜索/分页/列设置走 ProTable 真态。
- 商机看板：`useState(opportunities)`，拖拽 `onMove` 改 `item.stage` + 重排，列头实时统计金额/数量。
- 订单：`useState(orders)`，状态筛选/搜索/分页真态；行点击开 Drawer 看详情。
- 详情页：只读，从 `customerById` / `followsByCustomer` / `opportunities.filter` / `orders.filter` 现算。
- 设置：`ProForm` 本地受控，提交 `toast("已保存")`，不持久化。

> 运行时 `Date.now()/Math.random()` 不受限（限制只针对 Workflow 脚本），但 mock 已用固定日期保证 SSR/CSR 一致，新增数据用计数器派生 id（不用随机），避免 hydration 警告。

## 3. 各页组件映射（全部 `@hulian/ui`）

### 3.1 客户列表 `/customers`
- 容器 `ProTable<Customer>`：`search`（SearchForm：关键词 + 状态 Select + 等级 Select + 负责人 Select）、`toolbar`（刷新/密度/列设置/全屏全开）、`toolbarActions`（「新增客户」按钮）、`pagination`（每页 10）。
- 列：客户（`Avatar` + 名称链接到详情 + 公司副标题）、联系人/电话、行业/地区、等级（`Tag` 用 `customerLevelTone`）、状态（`Tag` 用 `customerStatusTone`）、累计成交（`yuan`，右对齐 tabular-nums）、负责人、操作列（编辑 / 删除 `Popconfirm`）。
- 新增/编辑：`ModalForm`（`form-dialog`）+ `useForm`，字段用 `Field`+`Input`/`Select`/`Combobox`。`Drawer` 与 `Modal` 二选一 → 用 `ModalForm`（字段少）。
- 删除：`Popconfirm` 包裹删除按钮，确认后移除本地行 + `toast`。
- 筛选联动：SearchForm 的值进 `useMemo` 过滤 `data` 后传入 ProTable（受控筛选在外层做，ProTable 只管展示/分页/列）。

### 3.2 客户详情 `/customers/[id]`
- 顶部 `PageHeader`（标题=客户名 + 状态 `Tag` + 返回；`extra` 放「编辑」「新建跟进」按钮）。
- `Descriptions`：公司全称 / 联系人 / 电话 / 邮箱 / 行业 / 地区 / 等级 / 负责人 / 累计成交 / 创建时间 / 标签（`Tag` 列）。
- `Tabs`：
  - 跟进记录 → `Timeline`（`followsByCustomer`，每条含类型 `Tag` + 内容 + 负责人 + 时间）；空则 `Empty`。
  - 关联商机 → 小 `Table`（该客户的 opportunities：标题/阶段 Tag/金额/赢率 `Progress`/预计成交）。
  - 关联订单 → 小 `Table`（该客户的 orders：单号/金额/状态 Tag/日期）。
- 顶部 `Stat` 行（可选）：该客户商机数 / 在谈金额 / 历史订单数。
- 不存在的 id → `Result`（404 风格）+ 返回按钮。

### 3.3 商机看板 `/opportunities`（核心 · 用新 Kanban）
- 6 列对应 `OPP_STAGES`（线索→…→赢单/输单），列头：阶段名 + 数量 `Badge` + 列内总金额（`yuan`）。
- 卡片：`Card` 内含 标题 + 客户名 + 金额（醒目）+ 赢率 `Progress` + 负责人 `Avatar` + 预计成交日。
- 拖拽跨列 → `onMove` 改 `stage`，`toast` 提示「{标题} 已移至 {阶段}」。
- 顶部工具行：阶段总览 `Stat` / 负责人筛选 `Select`（过滤卡片）。
- 移动端：列横向滚动（`overflow-x-auto`），单列纵向。

### 3.4 订单管理 `/orders`
- `ProTable<Order>`：search（单号搜索 + 状态 Select + 日期范围 `DateRangePicker`）、列（单号/客户/金额/商品数/状态 Tag/下单日期/操作）、分页（每页 10）。
- 行操作「详情」→ `Drawer`（右侧）展示订单字段 + 客户信息 + 状态步骤（可选 `Steps`）。
- 顶部 `Stat` 汇总（订单总数 / 总金额 / 待处理数）。

### 3.5 系统设置 `/settings`
- `Tabs`：个人资料 / 通知偏好 / 团队成员。
  - 个人资料：`ProForm`（姓名/邮箱/手机/职位 + 头像 `Upload` 或 `Avatar`）。
  - 通知偏好：`Switch` 列表（新线索分配/商机阶段变更/订单状态/周报）+ `Segmented`（推送频率）。
  - 团队成员：小 `Table`（`ownerLeaderboard` → 负责人/累计业绩/客户数），行尾 `Tag` 角色。
- 提交 `toast("设置已保存")`，不持久化。

### 3.6 登录页 `/login`
- 左右分栏：左品牌区（渐变/`AuroraText` 或 `Meteors` 背景 + slogan + 卖点列表），右 `LoginForm`（`onFinish` → `router.push("/demos/crm")`，假登录）。
- 移动端：单栏，仅 `LoginForm`。
- 复用现有 `LoginForm`（账号/密码/记住我已内建），`footer` 放「演示账号自动填充」提示。

## 4. 库改动：新增 `Kanban` 组件

**位置**：`packages/ui/src/kanban/`（`kanban.tsx` / `kanban.types.ts` / `index.ts` / `kanban.showcase.tsx` / `kanban.test.tsx`），导出进 `index.ts`，加进 `showcase.ts` 与 `manifest.ts`（category 归 `data-display` 或 `collection`，与 `sortable` 同族）。

**依赖**：复用已在用的 `@dnd-kit/core` + `@dnd-kit/sortable`（`sortable` 组件已依赖，无需新增 deps）。

**受控 API（提案）**：
```ts
interface KanbanColumn {
  id: string;            // 列标识
  title: ReactNode;      // 列头主标题
  header?: ReactNode;    // 覆盖整列头（含统计），优先于 title
  footer?: ReactNode;
}
interface KanbanProps<T> {
  columns: KanbanColumn[];
  items: T[];
  getId: (item: T) => string;                  // 卡片稳定 id
  getColumnId: (item: T) => string;            // 卡片当前所属列
  /** 拖拽落定：跨列或列内重排都触发。消费者据此改自身状态（如 item.stage=toColumn）。 */
  onMove: (e: { id: string; fromColumn: string; toColumn: string; toIndex: number }) => void;
  renderItem: (item: T, state: { dragging: boolean }) => ReactNode;
  renderColumnHeader?: (column: KanbanColumn, items: T[]) => ReactNode;
  className?: string;
  columnClassName?: string;
}
```
- 内部按 `getColumnId` 把 `items` 分桶到各列，列内顺序 = items 原始顺序。
- dnd-kit 多容器：列是 droppable + SortableContext，卡片是 sortable。`onDragEnd` 解析目标列与目标 index，调 `onMove`（组件**不**直接改 T，避免越界写业务字段）。
- 空列也是合法 drop target（拖入空列）。
- 键盘可达（dnd-kit KeyboardSensor）+ `aria` 标注，对齐 `sortable` 既有无障碍水准。
- DragOverlay 渲染抓起的卡片浮层。

**与 `sortable` 的边界**：`sortable` = 单列重排；`Kanban` = 多列 + 跨列移动。不复用 `Sortable` 包壳（多容器逻辑差异大），但视觉/手柄风格对齐。

## 5. 实现中需现场验证的小缺口（预判：可能补 0-2 处）

- ProTable 的 `search`（SearchForm）字段是否够表达「状态/等级/负责人」三 Select + 关键词 → 读 `search-form.types`；若 SearchForm 仅支持固定字段类型则在外层组合受控筛选（消费侧组合，非缺口）。
- `Descriptions` 是否支持 `column` 列数 + label 宽度 → 读 API，不满足才扩。
- `Timeline` 是否支持每项自定义 dot/颜色（按跟进类型上色）→ 读 API，不满足才扩。
- `Upload` 头像单图模式是否好用 → 不好用则设置页用 `Avatar` + 「更换」按钮降级，不强用。
- 撞到任何「本应是组件却要在页面手搓」→ 停手扩库，回写本节。

## 6. 范围红线（YAGNI）

- 不做真实后端 / 持久化 / 多会话，全本地 state，刷新还原。
- 不做权限 / 多角色 / i18n 切换（外壳已是中文）。
- 不做导出 Excel、批量操作（行选择列可留但操作先只做「编辑/删除」）。
- 登录不做真实校验，任意账号密码进后台。
- Kanban 只做单层列 + 卡片，不做泳道（swimlane）/ WIP 限制。

## 7. 验收

- 6 个页面全部为真实 `@hulian/ui` 页面，无 `Placeholder`/`Empty` 桩残留（空数据态除外）。
- 客户列表：搜索/三筛选/分页/列设置/密度切换真生效；新增客户出现在列表；编辑改值；删除有 `Popconfirm`。
- 详情页：三 Tab 数据正确；不存在 id 显示 `Result`。
- 看板：卡片可跨列拖拽改阶段，列头统计实时更新，`toast` 提示；键盘可拖。
- 订单：状态/日期筛选真态；详情 Drawer 正常。
- 设置：表单可填可提交 toast。
- 登录：分栏版式，提交进后台。
- `Kanban` 组件进 `index.ts` + showcase + manifest + 通过测试；`pnpm --filter @hulian/ui test` 绿。
- 明暗主题切换、移动端断点全页无异常。
- 任何手搓的本应是组件的 UI = 不合格，需回填为 hulian 组件。
