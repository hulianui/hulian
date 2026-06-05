# Scheduler 组件 + /demos/scheduler 诊所预约台 设计

> 日期：2026-06-05
> 目标：新建库首个事件日历/排班组件 `Scheduler`，并以「瀚约 诊所预约管理台」demo 点亮目前覆盖率为 0 的日期时间族（Calendar / DatePicker / DateTimePicker / TimeField）。

## 0. 背景与第一性判断

- 库的 `Calendar` 是 **MUI DateCalendar 单选月面板**（date picker），挂不了事件标记——它是「选一天」，不是「事件日历」。
- datetime 组现有 5 件全是日期/时间**选择器**（Calendar / DatePicker / DateTimePicker / TimeField / DateRangePicker），库里**没有任何 event-calendar / scheduler / 时间轴网格**。
- 「周/日时间轴网格 + 资源排班网格」是每个预约/中后台/诊所产品都要的**高频 archetype**。按 demo 铁律一（撞缺口修库，不在 demo 打 CSS 补丁），决策为**回 `@hulian/ui` 补一个全功能 `Scheduler`**（用户已确认扩库 + 全交互档）。

## 1. 组件 `Scheduler`（@hulian/ui）

定位 data-display / collection，照 **Flow / Gantt / Kanban 受控范式**：受控数据 + 消费者接交互。零依赖原生 PointerEvents；日期数学复用库内 dayjs（`lib/date`）。

### 1.1 受控 API（`scheduler.types.ts`）

```ts
export type SchedulerView = "month" | "week" | "day" | "resource";
export type SchedulerTone =
  | "primary" | "info" | "success" | "warning" | "danger" | "neutral";

export interface SchedulerEvent {
  id: string;
  title: string;
  start: string;        // ISO datetime
  end: string;          // ISO datetime
  resourceId?: string;  // resource 视图归列
  tone?: SchedulerTone; // 事件块配色（token 驱动），默认 primary
  subtitle?: string;    // 副标题（如患者/号别）
}

export interface SchedulerResource {
  id: string;
  title: string;
  subtitle?: string;
}

export interface SchedulerSlot {
  start: string;        // ISO datetime
  end: string;          // ISO datetime
  resourceId?: string;
}

export interface SchedulerProps {
  events: SchedulerEvent[];
  view: SchedulerView;
  date: string;                 // ISO，焦点日（决定哪周/哪天/哪月）
  resources?: SchedulerResource[];   // resource 视图必填
  onViewChange?: (v: SchedulerView) => void;
  onDateChange?: (iso: string) => void;
  /** 拖移 / 拖改时长提交（回吐整组新 events，照 Kanban 受控范式） */
  onEventsChange?: (events: SchedulerEvent[]) => void;
  /** 空白竖拖创建（拖出一段时间） */
  onSlotDragCreate?: (slot: SchedulerSlot) => void;
  /** 点空白格（无拖动）创建 */
  onSlotClick?: (slot: SchedulerSlot) => void;
  /** 点事件块 */
  onEventClick?: (event: SchedulerEvent) => void;
  dayStartHour?: number;        // 默认 8
  dayEndHour?: number;          // 默认 20
  slotMinutes?: number;         // 默认 30，吸附粒度
  /** 内置头部工具条（标题 + 前/今/后 + Segmented 视图切换）。默认 true。 */
  toolbar?: boolean;
  /** 自定义事件块渲染（外框/定位/拖拽手柄由组件负责）。 */
  renderEvent?: (event: SchedulerEvent) => ReactNode;
  className?: string;
}
```

view/date 受控：消费者持有，侧栏 mini-Calendar / Segmented / 内置 toolbar 都改它。events 受控：拖移/拖改时长经 `onEventsChange` 回写。

### 1.2 文件结构

```
packages/ui/src/scheduler/
  scheduler.tsx              编排：toolbar + 视图分发 + 全局 pointer 拖拽状态机
  scheduler-time-grid.tsx    周/日/资源共用时间轴网格（列模型统一）
  scheduler-month.tsx        月总览 6×7 格 + 事件 chip
  scheduler-geometry.ts      纯函数：时间↔分钟/px、重叠并排 layout、月周矩阵、snap、列模型
  scheduler.types.ts
  scheduler-geometry.test.ts 纯函数单测（TDD）
  scheduler.test.tsx         组件渲染/交互回调测试
  scheduler.showcase.tsx
  index.ts
```

### 1.3 几何（纯函数，TDD）

- `minutesOfDay(iso)`：ISO → 距当日 0 点分钟数。
- `clampMinutes / snap(minutes, step)`：吸附到 slotMinutes 网格。
- `eventRect(event, dayStartMin, pxPerMin)` → `{ top, height }`（按分钟数线性映射）。
- `layoutColumns(events)`：同一列内重叠事件并排分列 → 每事件 `{ col, cols }`（贪心扫描线：按 start 排序，分配到首个不冲突的列；连通簇内 cols = 簇最大并发数）。
- `monthMatrix(focalISO)` → `Date[][]`（6×7，含上/下月补位；ISO 周一起）。
- `weekColumns(focalISO)` → 7 个 `{ key, dateISO, weekdayLabel, dayLabel, isToday }`。
- `dayColumns(focalISO)` → 单列。
- `resourceColumns(resources)` → N 列（每列绑 resourceId + 当日 date）。
- `yToMinutes(offsetY, gridHeight, dayStartMin, dayEndMin)` + `minutesToISO(dateISO, minutes)`：pointer 落点 → 时间。

所有日期数学走 dayjs（库 SSoT），不手搓时区。time-grid 用「当日本地时」做分钟映射（诊所同时区，避开 UTC 跨日；与 Gantt 仅日期用 UTC 是不同场景）。

### 1.4 time-grid pointer 状态机（硬骨头）

三态，全 snap 到 slotMinutes，window 监听用稳定 handlers + latest-state ref（避过期闭包，照 Flow + 记忆 `react-high-freq-event-state-effect-fanout-jitter`）：

1. **空白竖拖建**：pointerdown 落在空白格 → 记起点分钟；move 扩展；up 若拖出 ≥1 slot → `onSlotDragCreate`，否则视为点选 → `onSlotClick`。
2. **拖事件体改期**：pointerdown 落在事件块体 → 记抓取偏移；move 整块平移（跨列改 resourceId/日期）；up → `onEventsChange`。
3. **下缘手柄拖改时长**：pointerdown 落在事件块底部 resize 手柄 → move 改 end（≥1 slot）；up → `onEventsChange`。

拖拽中显示「幽灵块」预览；释放才提交受控回写。月视图为总览：事件 chip + 点格 `onSlotClick` / 点 chip `onEventClick`（不在月视图做拖拽）。

### 1.5 样式

token 驱动（tailwind + CSS var），tone → 配色映射（`bg-primary/15 text-primary` 一类，照库内既有 tone 用法）。今日列高亮、当前时间红线、整点横线、纯图标导航钮。

### 1.6 接库四处布线

- `scheduler/index.ts` 导出组件 + 类型 + 纯函数。
- `src/index.ts` `export * from "./scheduler"`。
- `src/showcase.ts` `export { schedulerShowcase }`。
- `apps/www/lib/registry.tsx` 注册 `scheduler: schedulerShowcase`。
- `apps/www/lib/manifest.ts` 新增 datetime 组（或 collection）条目 `slug: "scheduler"`。

## 2. Demo `/demos/scheduler` — 瀚约 诊所预约管理台

```
apps/www/app/demos/scheduler/
  (app)/layout.tsx
  (app)/page.tsx
  _components/scheduler-shell.tsx      主排班台（client）
  _components/appointment-form.tsx     ModalForm 建/改预约
  _components/leave-form.tsx           DateRangePicker 请假/停诊登记
  _data/{doctors,rooms,patients,appointments,types}.ts   内存 mock
```

单页排班主台，走完整交互生命周期：

- **侧栏**：既有 `Calendar` mini 月历导航（选日跳转）+ `DatePicker` 快速跳转输入（敲日期直跳 day 视图，与 mini 月历互补）+ 医生筛选(`Checkbox`)+ `DateRangePicker` 请假/停诊登记 + 号源利用率 `Stat`。
- **主区**：`Segmented` 月/周/日/资源 → `Scheduler`（用内置 toolbar 前/今/后导航）。
- **建预约**：点空格 / 拖建 → `ModalForm`（患者 `Combobox` + `DateTimePicker` 起诊 + `TimeField` 时长 + 医生/诊室 `Select` + tone）→ 提交 → `toast({title, tone:"info"})`。
- **改期**：拖事件块 → `onEventsChange` → `toast`。
- **取消**：点事件 → 详情 `Popover` → `Popconfirm` 二确认 → `toast({tone:"danger"})`。
- **态清单**：首屏 `useMockData` Skeleton（≥300ms 可见）；`failOnce` → `Alert` + 重试；某医生某天筛空 → `Empty`；纯图标钮 → `Tooltip`。
- **资源全本地化**：患者头像走 `Avatar` fallback 首字母，零外链（铁律四）。

### DoD 点亮映射

| 组件 | 真实落点 |
|---|---|
| Calendar（未覆盖→覆盖） | 侧栏 mini 月历导航器 |
| DatePicker（未覆盖→覆盖） | 侧栏快速跳转到某日 |
| DateTimePicker（未覆盖→覆盖） | 建预约选起诊时刻 |
| TimeField（未覆盖→覆盖） | 建预约填时长 |
| DateRangePicker（已露过，再获用例） | 请假/停诊区间 |
| Scheduler（全新） | 月/周/日/资源主排班网格 |

## 3. 流程与验证

1. TDD `scheduler-geometry`（纯函数全测绿）。
2. 实现 Scheduler（time-grid + month + 拖拽状态机 + toolbar）+ 组件测试。
3. 接库四处布线，`pnpm --filter @hulian/ui test` 全绿。
4. 建 demo，接 `lib/demos.ts`。
5. `pnpm --filter www demos:coverage`：四件从未覆盖变覆盖，覆盖率只升不降，外链门禁 0。
6. **实机自证**（真浏览器，非 headless——记忆 `www-msw-gate-blanks-headless-screenshots`；MCP 占用起隔离 Chrome-for-Testing——记忆 `mcp-browser-busy-launch-isolated-chromium-via-executablepath`）：月/周/日/资源视图 + 建预约弹层 + 拖拽改期 + 取消确认，console 零 error。预览 `pnpm --filter www dev`（非根目录，记忆 `hulian-pnpm-dev-killstale-kills-5514`）。
7. 本地 commit（hunk 级暂存自己改动，避卷他人 WIP）。

## 4. 取舍与风险

- **为何 view/date 受控而非内部态**：侧栏 mini-Calendar、Segmented、内置 toolbar 三处都要改焦点日/视图，单一真源在消费者手里最干净，照 Flow 受控范式。
- **为何拖拽提交才回写**：拖拽中高频，逐帧回写受控会抖；拖中用本地幽灵态，up 才 `onEventsChange`（照 Gantt 注释提的「拖拽改期需受控回写+吸附+撤销」复杂度，这里一次做对）。
- **重叠 layout 取舍**：贪心扫描线分列（非最优装箱，但稳定、可测、视觉够用），连通簇 cols = 簇最大并发。
- **风险**：组件大（拖拽状态机 + 四视图）。缓解：geometry 全纯函数 TDD 把数学先锁死；time-grid 列模型统一让周/日/资源复用同一渲染与交互；月视图只读总览不引入拖拽分支。
