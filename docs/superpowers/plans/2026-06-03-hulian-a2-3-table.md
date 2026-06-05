# 瑚琏 A2.3 Table 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development 或 executing-plans 逐任务实施。步骤用 `- [ ]` 复选框追踪。

**Goal:** 给瑚琏加一个 headless `@tanstack/react-table` 驱动、只消费语义 token 的 `Table` 组件（MVP = 基础列渲染 + 点表头排序 + 空态），接入文档站 IA。

**Architecture:** 数据驱动单组件 `<Table columns data />`，内部 `useReactTable`（`getCoreRowModel` + `getSortedRowModel`）封装 headless 逻辑；render 段是只消费语义 token 的瑚琏皮肤（外壳圆角+横滚、斑马纹、行 hover、排序箭头）。受控/非受控排序对称（家风同 Tabs/Slider）。列定义直接复用 TanStack `ColumnDef`，不另起 API。

**Tech Stack:** React 19 + TypeScript（strict）+ `@tanstack/react-table`（**新依赖**，进 `@hulianui/ui` 的 `dependencies`）+ Tailwind v4 语义 token + lucide-react 箭头 + vitest/jsdom + `@hulianui/mocks`（faker，加为 ui 的 devDependency）。

**关键约束（继承项目硬规则）：**
- 只消费语义 token（无 success/warning）；明暗自适应。
- 四件套 `*.tsx`(必 `"use client"`)/`*.types.ts`/`*.showcase.tsx`(必 `"use client"`)/`*.test.tsx`/`index.ts` 桶导出 → 主 `index.ts` `export * from "./table"` → www `registry.tsx` import+map → `manifest.ts` +1（`data-display`/`new`）。
- 三道门用 `--force`：`pnpm typecheck` + `pnpm --filter @hulianui/ui test`（自己 scope）+ `pnpm build --filter=www --force`。**别信 turbo cache-hit**（[[turbo-test-red-isolate-untracked-wip-not-your-regression]]）。
- 截图明暗两态存 cwd 根、Read 看像素（[[ui-layout-verify-needs-screenshot-not-dom-eval]]）；端口 5512/5514，桌面 app 已跑 5514 则用 5514。
- **不触碰他人 untracked WIP**：根目录现有 `*.png`/`.playwright-mcp/`/`cdp-shot.mjs` 是并行 session 产物，`git add` 只点名自己的文件，禁 `git add -A`（[[parallel-session-git-add-all-sweeps-your-staged-files]]）。
- 新依赖装好后 **lockfile 变更随实现 commit 一并提**。

**文件结构：**
- 新建 `packages/ui/src/table/table.types.ts` — TableProps<TData> + 透传 ColumnDef/SortingState 类型。
- 新建 `packages/ui/src/table/table.tsx` — Table 组件（headless 逻辑 + 皮肤）。
- 新建 `packages/ui/src/table/table.showcase.tsx` — faker 数据 + ColumnDef demo + ShowcaseSpec。
- 新建 `packages/ui/src/table/table.test.tsx` — vitest。
- 新建 `packages/ui/src/table/index.ts` — 桶导出。
- 改 `packages/ui/package.json` — 加 `@tanstack/react-table` dep + `@hulianui/mocks` devDep。
- 改 `packages/ui/src/index.ts` — `export * from "./table"`。
- 改 `apps/www/lib/manifest.ts` — 加 table 一行。
- 改 `apps/www/lib/registry.tsx` — import + map `tableShowcase`。

---

## Task 1: 装依赖 + 立四件套类型/桶骨架

**Files:**
- Modify: `packages/ui/package.json`
- Create: `packages/ui/src/table/table.types.ts`

- [ ] **Step 1: 装新依赖（lockfile 会变）**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm --filter @hulianui/ui add @tanstack/react-table
pnpm --filter @hulianui/ui add -D @hulianui/mocks@workspace:*
```
Expected: `package.json` 多 `@tanstack/react-table` 进 dependencies、`@hulianui/mocks` 进 devDependencies；`pnpm-lock.yaml` 更新。

- [ ] **Step 2: 写 table.types.ts**

```ts
import type { ColumnDef, SortingState, OnChangeFn } from "@tanstack/react-table";

// 透传给消费者：列定义直接用 TanStack 的 ColumnDef，不发明瑚琏平行 API
export type { ColumnDef, SortingState } from "@tanstack/react-table";

export interface TableProps<TData> {
  /** 列定义，直接用 TanStack ColumnDef（accessorKey/header/cell…） */
  columns: ColumnDef<TData, any>[];
  data: TData[];
  /** 默认 true；false 则表头不可点、不渲染排序箭头、不写 aria-sort */
  enableSorting?: boolean;
  /** 受控排序态；不传则组件内部非受控 useState */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  /** 默认 true：偶数行斑马纹 */
  striped?: boolean;
  /** 行稳定 key；默认按行 index */
  getRowId?: (row: TData, index: number) => string;
  className?: string;
}
```
> 注：`ColumnDef<TData, any>` 是 TanStack 官方对异构列的标准写法，与 `useReactTable` 内部签名一致；`packages/ui` 不经 next eslint，`any` 不触发 no-explicit-any 门禁。

- [ ] **Step 3: typecheck（types 文件先单独过）**

Run: `pnpm --filter @hulianui/ui exec tsc --noEmit`
Expected: PASS（无 table.tsx 时 types 文件自身能解析 `@tanstack/react-table` 类型即可；若报 "Cannot find module" 说明依赖未装好，回 Step 1）。

- [ ] **Step 4: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml packages/ui/src/table/table.types.ts
git commit -m "feat(ui): A2.3 Table 起步 — 装 @tanstack/react-table + TableProps 类型(透传 ColumnDef)"
```

---

## Task 2: Table 组件（TDD：渲染 + 排序 + 空态 + 皮肤钩子）

**Files:**
- Create: `packages/ui/src/table/table.test.tsx`
- Create: `packages/ui/src/table/table.tsx`

- [ ] **Step 1: 写失败测试 table.test.tsx**

```tsx
import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Table } from "./table";
import type { ColumnDef } from "./table.types";

interface Row {
  name: string;
  age: number;
}
const data: Row[] = [
  { name: "Charlie", age: 30 },
  { name: "Alice", age: 25 },
  { name: "Bob", age: 35 },
];
const columns: ColumnDef<Row, any>[] = [
  { accessorKey: "name", header: "姓名" },
  { accessorKey: "age", header: "年龄" },
];

function nameOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("tbody tr td:first-child")).map(
    (td) => td.textContent ?? "",
  );
}

describe("Table 基础渲染", () => {
  it("渲染 table + 2 列表头 + 3 数据行", () => {
    const { getByRole, getAllByRole, container } = render(<Table columns={columns} data={data} />);
    expect(getByRole("table")).toBeTruthy();
    expect(getAllByRole("columnheader").length).toBe(2);
    expect(container.querySelectorAll("tbody tr").length).toBe(3);
  });

  it("默认顺序 = 数据顺序", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    expect(nameOrder(container)).toEqual(["Charlie", "Alice", "Bob"]);
  });
});

describe("排序（点表头切换 + aria-sort）", () => {
  it("点姓名表头 → 升序；再点 → 降序；aria-sort 反映状态", () => {
    const { getByRole, container } = render(<Table columns={columns} data={data} />);
    const th = getByRole("columnheader", { name: /姓名/ });
    expect(th.getAttribute("aria-sort")).toBe("none");

    fireEvent.click(getByRole("button", { name: /姓名/ }));
    expect(nameOrder(container)).toEqual(["Alice", "Bob", "Charlie"]);
    expect(getByRole("columnheader", { name: /姓名/ }).getAttribute("aria-sort")).toBe("ascending");

    fireEvent.click(getByRole("button", { name: /姓名/ }));
    expect(nameOrder(container)).toEqual(["Charlie", "Bob", "Alice"]);
    expect(getByRole("columnheader", { name: /姓名/ }).getAttribute("aria-sort")).toBe("descending");
  });

  it("enableSorting=false：表头非 button、无 aria-sort、点击不改序", () => {
    const { queryByRole, getByRole, getByText, container } = render(
      <Table columns={columns} data={data} enableSorting={false} />,
    );
    expect(queryByRole("button")).toBeNull();
    expect(getByRole("columnheader", { name: /姓名/ }).getAttribute("aria-sort")).toBeNull();
    fireEvent.click(getByText("姓名"));
    expect(nameOrder(container)).toEqual(["Charlie", "Alice", "Bob"]);
  });
});

describe("空态", () => {
  it("data=[] → 渲染「暂无数据」，无数据行", () => {
    const { getByText, container } = render(<Table columns={columns} data={[]} />);
    expect(getByText("暂无数据")).toBeTruthy();
    expect(container.querySelectorAll("tbody tr td:first-child")[0]?.getAttribute("colspan")).toBe("2");
  });
});

describe("皮肤钩子（防漂移）", () => {
  it("外壳含 overflow-x-auto + rounded + border-border；行含 hover/斑马纹", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    const shell = container.firstChild as HTMLElement;
    expect(shell.className).toContain("overflow-x-auto");
    expect(shell.className).toContain("rounded-[var(--radius)]");
    expect(shell.className).toContain("border-border");
    const row = container.querySelector("tbody tr") as HTMLElement;
    expect(row.className).toContain("hover:bg-surface-hover");
    expect(row.className).toContain("even:bg-surface-hover/40");
  });

  it("striped=false：行无斑马纹类", () => {
    const { container } = render(<Table columns={columns} data={data} striped={false} />);
    const row = container.querySelector("tbody tr") as HTMLElement;
    expect(row.className).not.toContain("even:bg-surface-hover/40");
  });
});
```

- [ ] **Step 2: 跑测试验证失败**

Run: `pnpm --filter @hulianui/ui exec vitest run src/table/table.test.tsx`
Expected: FAIL（`./table` 模块不存在 / Table is not defined）。

- [ ] **Step 3: 写 table.tsx 最小实现**

```tsx
"use client";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/cn";
import type { TableProps } from "./table.types";

// headless 逻辑（useReactTable）+ 瑚琏皮肤（render）。逻辑/皮肤同文件但段落分离。
export function Table<TData>({
  columns,
  data,
  enableSorting = true,
  sorting: sortingProp,
  onSortingChange,
  striped = true,
  getRowId,
  className,
}: TableProps<TData>) {
  // 受控/非受控对称：传 sorting+onSortingChange 即受控，否则内部 useState
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = sortingProp ?? internalSorting;

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: onSortingChange ?? setInternalSorting,
    enableSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  });

  const colCount = table.getAllLeafColumns().length;
  const rows = table.getRowModel().rows;

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-[var(--radius)] border border-border",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="text-muted">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border">
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted(); // false | "asc" | "desc"
                return (
                  <th
                    key={header.id}
                    aria-sort={
                      !canSort
                        ? undefined
                        : sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none"
                    }
                    className="px-3 py-2 text-left font-medium"
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === "asc" ? (
                          <ChevronUp className="size-3.5" />
                        ) : sorted === "desc" ? (
                          <ChevronDown className="size-3.5" />
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="py-10 text-center text-muted">
                暂无数据
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border transition-colors last:border-0 hover:bg-surface-hover",
                  striped && "even:bg-surface-hover/40",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `pnpm --filter @hulianui/ui exec vitest run src/table/table.test.tsx`
Expected: PASS（全部 7 用例绿）。

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/table/table.tsx packages/ui/src/table/table.test.tsx
git commit -m "feat(ui): Table 组件 — TanStack headless + 瑚琏皮肤(列渲染/排序/空态) + TDD"
```

---

## Task 3: showcase + 桶导出 + 主 barrel

**Files:**
- Create: `packages/ui/src/table/table.showcase.tsx`
- Create: `packages/ui/src/table/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 写 table.showcase.tsx（faker 数据复用 makeUsers）**

```tsx
"use client";
import { makeUsers, type DemoUser } from "@hulianui/mocks";
import type { ShowcaseSpec } from "../showcase/types";
import { Table } from "./table";
import type { ColumnDef } from "./table.types";

// mock① 真实样例数据：复用项目 faker 工厂（确定性种子，防 SSR/CSR hydration mismatch）
const users = makeUsers(8);

const columns: ColumnDef<DemoUser, any>[] = [
  {
    accessorKey: "name",
    header: "姓名",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={row.original.avatar} alt="" className="size-6 rounded-full bg-surface-hover" />
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "邮箱",
    cell: ({ getValue }) => <span className="text-muted">{getValue() as string}</span>,
  },
  { accessorKey: "role", header: "角色" },
];

function Demo({ enableSorting = true, striped = true }: { enableSorting?: boolean; striped?: boolean }) {
  return <Table columns={columns} data={users} enableSorting={enableSorting} striped={striped} />;
}

export const tableShowcase: ShowcaseSpec = {
  controls: [
    { prop: "enableSorting", type: "boolean", defaultValue: true, label: "可排序" },
    { prop: "striped", type: "boolean", defaultValue: true, label: "斑马纹" },
  ],
  states: [
    { name: "可排序（点表头切换）", render: () => <Demo /> },
    { name: "不可排序", render: () => <Demo enableSorting={false} /> },
    { name: "空数据", render: () => <Table columns={columns} data={[]} /> },
  ],
  renderWithProps: (p) => (
    <Demo enableSorting={p.enableSorting !== false} striped={p.striped !== false} />
  ),
  toCode: (p) =>
    `<Table\n  columns={columns}\n  data={users}\n  enableSorting={${p.enableSorting !== false}}\n  striped={${p.striped !== false}}\n/>`,
};
```

- [ ] **Step 2: 写 table/index.ts 桶导出**

```ts
export { Table } from "./table";
export type { TableProps, ColumnDef, SortingState } from "./table.types";
export { tableShowcase } from "./table.showcase";
```

- [ ] **Step 3: 主 barrel 加 export**

`packages/ui/src/index.ts` 在组件区（`export * from "./accordion";` 之后）加一行：
```ts
export * from "./table";
```

- [ ] **Step 4: typecheck**

Run: `pnpm --filter @hulianui/ui exec tsc --noEmit`
Expected: PASS（`@hulianui/mocks` 经 devDep + workspace 符号链接解析；ShowcaseSpec/ColumnDef 类型对齐）。

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/table/table.showcase.tsx packages/ui/src/table/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): Table showcase(faker 数据复用 makeUsers) + 桶导出 + 主 barrel"
```

---

## Task 4: 接入文档站 IA（manifest + registry）

**Files:**
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`

- [ ] **Step 1: manifest 加一行**

`apps/www/lib/manifest.ts` 的 `manifest` 数组末尾（accordion 之后）加：
```ts
  { slug: "table", name: "Table", description: "表格 · TanStack headless + 列排序 + 空态", category: "data-display", status: "new" },
```

- [ ] **Step 2: registry import + map**

`apps/www/lib/registry.tsx`：在 import 块加 `tableShowcase`（accordionShowcase 之后），在 `specBySlug` map 加 `table: tableShowcase,`（accordion 之后）。
```ts
  accordionShowcase,
  tableShowcase,
} from "@hulianui/ui";
```
```ts
  accordion: accordionShowcase,
  table: tableShowcase,
};
```

- [ ] **Step 3: 三道门 `--force`（全绿基线）**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck
pnpm --filter @hulianui/ui test
pnpm build --filter=www --force
```
Expected: typecheck PASS；ui 测试我 scope 全绿（其余族测试若有他人 untracked WIP 红，按 [[turbo-test-red-isolate-untracked-wip-not-your-regression]] 隔离判定，非我引入）；`build --filter=www` PASS（含新依赖 + faker showcase 在 next build 下不报错，`/components/table` SSG 生成）。

- [ ] **Step 4: Commit**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): Table 接入 IA(data-display 分组) + registry/manifest 双文件 +1"
```

---

## Task 5: 浏览器实测明暗两态（截图 Read 看像素）

**Files:** 无代码改动（验证步）。截图存 cwd 根：`table-light.png` / `table-dark.png`（自己的文件名，commit 时不 add）。

- [ ] **Step 1: 起 www（或复用桌面 app 的 5514 实例）**

先探活：`curl -s -o /dev/null -w "%{http_code}" http://localhost:5514/components/table` 与 `:5512/components/table`。任一 200 即用该端口；都不在则 `pnpm --filter www dev`（5512）后台起。

- [ ] **Step 2: 截明亮态**

用 chrome-devtools-mcp（或 cdp-shot.mjs 同款 Playwright）导航到 `/components/table`，确保 light 主题，截全页存 `table-light.png`。

- [ ] **Step 3: 截暗黑态**

切 dark（点站内明暗开关或注入 `[data-theme="dark"]`），截存 `table-dark.png`。

- [ ] **Step 4: Read 两图看像素**

Read `table-light.png` + `table-dark.png`，逐条核：
1. 表头/数据行左对齐、列纵向对齐。
2. 斑马纹（偶数行底色）在明暗两态都可见且可读。
3. 行 hover（可选验）。
4. 排序箭头：未排序 `ChevronsUpDown` 半透明；点一次变 `ChevronUp`/再点 `ChevronDown`，截带排序态的一张验箭头切换。
5. 长邮箱不溢出破版（外壳横向滚动或自然换行）。
6. 空态「暂无数据」居中、text-muted。
Expected: 全部符合；不符则回 table.tsx 调皮肤，重跑 Task 4 Step 3 三道门 + 重截。

- [ ] **Step 5: 桌面 app 加载验证**

确认桌面 app(5514) `/components/table` 加载正常（左树「数据展示」分组下出现 Table、点开渲染无 RSC/hydration 报错）。

---

## Task 6: 收尾

- [ ] **Step 1: 更新项目记忆**

更新 `~/.claude/projects/-Users-zhangzhiwei-Desktop-code-hulian/memory/hulian-phase-status.md`：追加 A2.3 Table 完成态（引 TanStack 破零依赖、MVP scope、列定义复用 ColumnDef、faker 复用 makeUsers、aria-sort 皮肤层补、组件计数 +1）；更新 MEMORY.md 索引 hook。

- [ ] **Step 2: claudeception 评估**

引入 TanStack + 表格几何 + ui 库依赖 mocks 的接线，很可能产新 skill（如「TanStack headless table 接瑚琏皮肤：aria-sort 皮肤层补 / getCanSort 随 enableSorting」）。跑 claudeception 评估是否沉淀。

---

## Self-Review

**Spec 覆盖核对：**
- §1 引 TanStack + 破零依赖 → Task 1 Step 1 ✅
- §2 MVP scope（列渲染+排序+空态+斑马纹/hover；分页/筛选/列宽/虚拟/行选 推迟）→ Task 2 实现 + showcase；推迟项不写 ✅
- §3 API（数据驱动 + ColumnDef 透传 + 受控对称 + 泛型 + "use client"）→ Task 1 types + Task 2 tsx ✅
- §4 headless/皮肤分离 + 几何禁区 + 皮肤表 → Task 2 Step 3 逐条落 ✅
- §5 faker 复用 makeUsers + mocks 接 devDep → Task 1 Step 1 + Task 3 Step 1 ✅
- §6 四件套 + 不改 ShowcaseSpec + states 承载 → Task 2/3 ✅
- §7 测试（渲染/排序/aria-sort/enableSorting=false/空态/皮肤钩子）→ Task 2 Step 1 七用例 ✅
- §8 验收（四件套+双文件+三道门--force+截图明暗+桌面 app）→ Task 4/5 ✅
- §9 不做项 → 计划内无任何分页/筛选/选择代码 ✅

**Placeholder 扫描：** 无 TBD/TODO；每个代码步给了完整代码。

**类型一致性：** `TableProps`/`ColumnDef<TData, any>`/`SortingState`/`tableShowcase` 在 types→tsx→showcase→index→registry 全程命名一致；测试用 `ColumnDef<Row, any>` 与 prop 类型对齐；`getRowId(row, index)` 签名 types 与 useReactTable 一致。
