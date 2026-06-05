# 瑚琏 A2.3 起步 — 数据展示族 Table 设计

> 状态：设计已定（brainstorm 完成）。日期 2026-06-03。
> 上游：`2026-06-02-hulian-a2-absorption-batch-design.md` §10「A2.3 — 数据可视化：Table（TanStack headless + 瑚琏皮肤）」。
> 本 spec 仅覆盖 **Table 起步**（数据展示批的地基）。Charts/KPI（Tremor）另开 spec。

## 1. 本质与边界

**要解决的真问题**：瑚琏目前 18 个组件无一个「表格」。表格是数据后台的骨干结构，但它的难点不在皮肤，在**行/列/排序/选择/分页的状态机**——这正是 `@tanstack/react-table` 已经把「headless 逻辑」做到极致的领域。瑚琏的价值是给它**一层只消费语义 token 的皮肤**，而不是重写一套表格引擎。

**本 spec 的 Table = headless `@tanstack/react-table` + 瑚琏皮肤**，MVP 只做两件事：

1. **基础列渲染**：数据驱动 `<Table columns data />`，内部 `useReactTable` + `getCoreRowModel`。
2. **列排序**：点表头切换 升序→降序→无序，表头带方向箭头指示。`getSortedRowModel`。

### 破「零新依赖」红线（A2.3 授权）

A2 批次一 spec §1/§9 明列「Table（TanStack）」推迟到 A2.3，A2.3 预告（§10）明确**允许引入 TanStack**。本 spec 据此引入：

- `@tanstack/react-table`（runtime 逻辑库，进 `@hulianui/ui` 的 **`dependencies`**）。
- 安装：`pnpm --filter @hulianui/ui add @tanstack/react-table`；**lockfile 变更随实现 commit 一起提**。

## 2. MVP scope 裁决（YAGNI）

| 能力 | 本批 | 理由 |
|------|------|------|
| 基础列渲染（data + columns） | ✅ | 地基 |
| 列排序（点表头 + 箭头指示） | ✅ | 表格最高频交互；TanStack `getSortedRowModel` 零成本 |
| 空数据态（「暂无数据」整行） | ✅ | 自诊断 UX，顺手且必要 |
| 斑马纹 / 行 hover | ✅ | 纯皮肤，可读性刚需 |
| 分页 | ❌ 推迟 | 站级已有 `AsyncUsers`(MSW 分页) demo 承载分页观感；表格内建分页另阶段 |
| 列筛选 / 全局搜索 | ❌ 推迟 | 下一阶段 |
| 列宽调整 / 虚拟滚动 | ❌ 推迟 | 大数据量优化，YAGNI |
| 行选择（checkbox 列） | ❌ 推迟 | 需与 Checkbox 组合，独立阶段 |

> 推迟项均为 TanStack 原生能力，后续阶段加 row model / state 即可增量接入，**皮肤层不需重构** —— 这是选 headless 的核心收益。

## 3. 组件 API（列定义直接复用 TanStack，不另起平行 API）

**裁决：数据驱动单组件 `<Table>`，不暴露 `<TableRoot><Thead>…` 复合原子**。理由：MVP 是「给定 columns+data 画一张可排序表」，复合原子会把 `flexRender`/`headerGroup` 的样板推给消费者；数据驱动 API 让 showcase 用 faker 数据一行点亮，且**列定义直接用 TanStack 的 `ColumnDef`**（不发明瑚琏自己的列描述格式 → 零学习成本、可直接抄 TanStack 文档）。

```ts
// table.types.ts
import type { ColumnDef, SortingState, OnChangeFn } from "@tanstack/react-table";
export type { ColumnDef, SortingState } from "@tanstack/react-table"; // 透传给消费者

export interface TableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  /** 默认 true；false 则表头不可点、不渲染排序箭头 */
  enableSorting?: boolean;
  /** 受控排序态（可选）；不传则组件内部用非受控 useState */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  /** 默认 true：偶数行斑马纹 */
  striped?: boolean;
  /** 行稳定 key；默认用行 index */
  getRowId?: (row: TData, index: number) => string;
  className?: string;
}
```

- **受控/非受控对称**（家风同 Tabs/Slider）：传 `sorting`+`onSortingChange` 即受控，否则内部 `useState<SortingState>([])`。
- **泛型 `<TData>`**：消费者 `ColumnDef<DemoUser>[]` 类型安全。
- 组件文件 **必须 `"use client"`**（`useReactTable` 是 hook）——showcase 本就 client，主 barrel 直接 re-export 不受影响（RSC 岛在 www 的 ComponentDoc，已 client）。

## 4. headless 逻辑 / 皮肤 分离

**逻辑（headless，文件顶部）**：
```
const table = useReactTable({
  data, columns,
  state: { sorting },
  onSortingChange,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  enableSorting,
  getRowId,
});
```
**皮肤（render，文件下半）**：只消费语义 token，几何由 `<table>` 原生排版，瑚琏只给颜色/间距/圆角/箭头。

| 部位 | 皮肤（只语义 token） |
|------|---------------------|
| 外壳 | `overflow-x-auto rounded-[var(--radius)] border border-border`（圆角裁切 + 横向滚动防长内容溢出） |
| `<table>` | `w-full border-collapse text-sm` |
| `<thead>` 行 | `text-muted` + 底边 `border-b border-border` |
| 表头 `<th>` | `px-3 py-2 text-left font-medium`；可排序时整 cell 是 `<button>` `inline-flex items-center gap-1 hover:text-foreground`，禁用排序则纯文本 |
| 排序箭头 | lucide `ChevronUp`/`ChevronDown`（按 `column.getIsSorted()`）/ `ChevronsUpDown`（未排序，`opacity-50`）；`size-3.5` |
| `<tbody>` 行 | `border-b border-border last:border-0`；`hover:bg-surface-hover`；斑马纹 `even:bg-surface-hover/40`（striped 时） |
| `<td>` | `px-3 py-2 align-middle` |
| 空态 | 单 `<td colSpan>` `py-10 text-center text-muted`「暂无数据」 |

- **几何禁区**：不写死列宽（`<th>`/`<td>` 不设 width）；长内容靠外壳 `overflow-x-auto` + 自然换行，不用 `whitespace-nowrap` 撑爆（参考 `html-input-size-table-column-blowup` 教训：固定尺寸子元素会撑爆列宽）。
- **明暗**：`surface-hover` 在 semantic.css 明暗各有值；`/40` 透明度斑马纹两态都可读（同 Alert `/12` 自证套路，截图验）。

## 5. faker 样例数据（复用，不另起）

复用 `@hulianui/mocks` 的 `makeUsers(count, seed)` → `DemoUser[]`（`{id,name,email,role,avatar}`，确定性种子防 hydration mismatch）。**不扩工厂、不另写第二套** —— 任务硬约束。

- **依赖接线**：`@hulianui/mocks` 加为 `@hulianui/ui` 的 **devDependency**（`workspace:*`）。showcase 是 dev 产物，www 已 bundle mocks，pnpm 符号链接 + `moduleResolution:Bundler` 解析无虞；不污染 ui 的运行时 `dependencies`（faker 不进组件库 runtime）。
- showcase 列定义（`ColumnDef<DemoUser>[]`）：姓名（带 avatar）/ 邮箱 / 角色，三列均可排序。排序 demo 用字符串排序（姓名 A→Z）即清晰，无需给 DemoUser 加数字列。

## 6. 四件套 + showcase（不改 ShowcaseSpec 类型）

表格是复合结构，沿用 §A2「不改 `ShowcaseSpec`，用 showcase 写法承载」：

- **states**（faker 预置 demo 承载数据/列定义）：① 默认可排序表（8 行）② 不可排序（`enableSorting=false`）③ 空数据（`data=[]` → 空态）。
- **controls**：`enableSorting`(boolean, 默认 true)、`striped`(boolean, 默认 true) —— 两个布尔即可，复杂数据不进 control。
- **renderWithProps**：渲染默认表，响应上面两 boolean。
- **toCode**：输出 `<Table columns={columns} data={users} />` 片段。

四件套：`table.tsx`(必 `"use client"`) / `table.types.ts` / `table.showcase.tsx`(必 `"use client"`) / `table.test.tsx` / `index.ts` 桶导出 → 主 `index.ts` 加 `export * from "./table"` → www `registry.tsx` 加 `tableShowcase` import+map → `manifest.ts` 加一行（`data-display`/`new`）。

## 7. 测试（vitest，jsdom）

- 渲染默认表：`getByRole("table")`，表头 3 个 `columnheader`，数据行数 = 数据条数。
- 排序：点姓名表头 → 行顺序按姓名升序；再点 → 降序；表头 `aria-sort` 反映状态（TanStack/原生 `<th>` 需我们落 `aria-sort`）。
- `enableSorting=false`：表头非 button、无箭头、点击不改序。
- 空数据：`data=[]` → 渲染「暂无数据」，无数据行。
- 皮肤钩子防漂移：外壳含 `overflow-x-auto`+`rounded`；行含 `hover:bg-surface-hover`；striped 行含 `even:bg-surface-hover/40`。
- `aria-sort`：可排序且已排序列 `<th aria-sort="ascending|descending">`，未排序 `"none"`（a11y 必备，TanStack 不自动给，皮肤层补）。

## 8. 验收（done 的标志）

1. 四件套齐 + 主 barrel 导出 + registry/manifest 双文件各 +1。
2. 三道门 `--force` 全绿：`pnpm typecheck` + 自己 vitest + `pnpm build --filter=www --force`（新依赖装好 lockfile 一并 commit）。
3. Playwright/chrome-devtools 截图**明暗两态**存 cwd 根、Read 看像素：验表头/行对齐、斑马纹、hover、排序箭头随状态、长邮箱不溢出（横向滚动或换行不破版）、空态居中。端口 5512/5514（桌面 app 已跑 5514 则用 5514）。
4. 桌面 app 加载 Table 页正常。
5. 不触碰他人 untracked WIP（当前根目录的 `*.png`/`.playwright-mcp`/`cdp-shot.mjs` 是并行 session 产物，不删不改）。

## 9. 不做（YAGNI 边界）

分页 / 筛选 / 全局搜索 / 列宽调整 / 虚拟滚动 / 行选择 / 列固定 / 展开行 / 列可见性切换 —— 全部推迟到数据展示批后续阶段，按需增量接 TanStack row model。本批不引入。
