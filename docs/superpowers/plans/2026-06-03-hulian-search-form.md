# SearchForm 查询筛选表单 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 自研零依赖 SearchForm（中后台列表页顶部查询筛选条件区），dogfood 瑚琏 Grid/Field/Input/Select/Button，固定列栅格 + 一行折叠 + 受控 values + onSearch/onReset。

**Architecture:** 单组件 `SearchForm`（`"use client"`，渲染原生 `<form>` + inline grid）+ 一个零 React 纯函数 `planLayout`（算折叠可见字段集与操作区起列，独立可单测，同 pagination.range 家风）。内置控件类型 input/select/date/date-range 全基于瑚琏组件 + 原生 `<input type=date>`（核心零 MUI），复杂控件走 `render` 逃生舱。

**Tech Stack:** React 19 + TypeScript + Tailwind v4 + Base UI (经瑚琏 Input/Select 间接) + vitest(jsdom, 无 jest-dom)。

**Spec:** `docs/superpowers/specs/2026-06-03-hulian-search-form-design.md`

**约定（必读）：**
- 工作目录 `packages/ui/src/search-form/`（待建）。
- 三道门 `--force`：`pnpm typecheck && pnpm test && pnpm build --filter=www`（build 必 `--filter=www`）。
- **无 jest-dom**：断言用 `el.getAttribute()`/`el.textContent`/`toBeTruthy()`/`toBeNull()`，禁 `toHaveAttribute`/`toBeInTheDocument`。
- **并发纪律**：master 有大量并行 session WIP。全程**精确 `git add <具体路径>`**，禁 `-A`；commit 用 `git commit -m "..." -- <pathspec>`（`-m` 必在 `--` 之前）。共享文件（主 barrel/manifest/registry）commit 前 `git diff HEAD -- <file>` 确认只含自己增量。

---

### Task 1: 类型定义 search-form.types.ts

**Files:**
- Create: `packages/ui/src/search-form/search-form.types.ts`

- [ ] **Step 1: 写类型文件**

```ts
import type { ReactNode } from "react";

/** render 逃生舱回调上下文。 */
export interface SearchFieldRenderCtx {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

interface SearchFieldBase {
  /** 值的 key（提交时 values[name]）。 */
  name: string;
  /** 字段标签。 */
  label: ReactNode;
  /** 占位文本。 */
  placeholder?: string;
  /** 跨列数（默认 1，渲染时封顶 columns）。 */
  colSpan?: number;
  /** 非受控时的初始值（受控时由 values 提供）。 */
  defaultValue?: unknown;
}

/** 字段配置（按 type / render 区分；缺省即 input）。 */
export type SearchField =
  | (SearchFieldBase & { type?: "input"; inputType?: string; options?: never; render?: never })
  | (SearchFieldBase & {
      type: "select";
      options: { value: string; label: ReactNode }[];
      inputType?: never;
      render?: never;
    })
  | (SearchFieldBase & { type: "date"; inputType?: never; options?: never; render?: never })
  | (SearchFieldBase & { type: "date-range"; inputType?: never; options?: never; render?: never })
  | (SearchFieldBase & {
      type?: never;
      inputType?: never;
      options?: never;
      render: (ctx: SearchFieldRenderCtx) => ReactNode;
    });

export interface SearchFormProps {
  /** 字段配置数组。 */
  fields: SearchField[];
  /** 受控值；缺省走内部 state（受控/非受控对称）。 */
  values?: Record<string, unknown>;
  /** 任一字段编辑时触发（受控回填）。 */
  onChange?: (values: Record<string, unknown>) => void;
  /** 查询 / 回车提交。 */
  onSearch: (values: Record<string, unknown>) => void;
  /** 重置（values = 各字段 default 后的值）。 */
  onReset?: (values: Record<string, unknown>) => void;
  /** 桌面列数。@default 3 */
  columns?: number;
  /** 行列间距（× 0.25rem）。@default 4 */
  gap?: number;
  /** 字段填不满一行时自动失效。@default true */
  collapsible?: boolean;
  /** 初始折叠。@default true */
  defaultCollapsed?: boolean;
  /** 主按钮文案。@default "查询" */
  submitText?: ReactNode;
  /** 重置按钮文案。@default "重置" */
  resetText?: ReactNode;
  /** 查询按钮 loading 态。@default false */
  loading?: boolean;
  className?: string;
}
```

- [ ] **Step 2: typecheck 这个文件能编译**

Run: `pnpm --filter @hulianui/ui exec tsc --noEmit`
Expected: PASS（仅类型文件，无引用错误；其它并行 WIP 报错按 isolate 处理，只要无 `search-form.types.ts` 相关错误即可）

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/search-form/search-form.types.ts
git commit -m "feat(ui): SearchForm 类型定义" -- packages/ui/src/search-form/search-form.types.ts
```

---

### Task 2: 布局纯函数 search-form.layout.ts（TDD）

**Files:**
- Test: `packages/ui/src/search-form/search-form.layout.test.ts`
- Create: `packages/ui/src/search-form/search-form.layout.ts`

- [ ] **Step 1: 写失败测试**

```ts
import { describe, it, expect } from "vitest";
import { planLayout, canCollapse, totalSpan } from "./search-form.layout";
import type { SearchField } from "./search-form.types";

const f = (name: string, colSpan?: number): SearchField => ({ name, label: name, colSpan });

describe("totalSpan", () => {
  it("累加每字段 span（缺省 1）", () => {
    expect(totalSpan([f("a"), f("b"), f("c")], 3)).toBe(3);
  });
  it("colSpan 封顶 columns", () => {
    expect(totalSpan([f("a", 5)], 3)).toBe(3);
  });
});

describe("canCollapse", () => {
  it("累计跨度 > columns-1 才需折叠", () => {
    expect(canCollapse([f("a"), f("b"), f("c"), f("d"), f("e")], 3)).toBe(true);
  });
  it("填不满(留得下操作区一格)不折叠", () => {
    expect(canCollapse([f("a"), f("b")], 3)).toBe(false);
  });
});

describe("planLayout", () => {
  it("折叠：贪心取到 columns-1 跨度，操作区落末格", () => {
    const r = planLayout([f("a"), f("b"), f("c"), f("d"), f("e")], 3, true);
    expect(r.visible.map((x) => x.name)).toEqual(["a", "b"]);
    expect(r.actionStart).toBe(3);
    expect(r.actionFullRow).toBe(false);
  });
  it("展开：全字段，操作区落最后一行剩余格", () => {
    const r = planLayout([f("a"), f("b"), f("c"), f("d"), f("e")], 3, false);
    expect(r.visible.length).toBe(5);
    expect(r.actionStart).toBe(3); // used=5, rem=2 → start=3
  });
  it("整行满：操作区另起一行(start=1, fullRow)", () => {
    const r = planLayout([f("a"), f("b"), f("c")], 3, false);
    expect(r.actionStart).toBe(1);
    expect(r.actionFullRow).toBe(true);
  });
  it("折叠 + colSpan：宽字段占满后停", () => {
    const r = planLayout([f("a", 2), f("b"), f("c")], 3, true);
    expect(r.visible.map((x) => x.name)).toEqual(["a"]); // a 占 2，再加 b 超 columns-1=2
    expect(r.actionStart).toBe(3);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run src/search-form/search-form.layout.test.ts`
Expected: FAIL（`planLayout`/`canCollapse`/`totalSpan` 未定义，Cannot find module）

- [ ] **Step 3: 写最小实现**

```ts
import type { SearchField } from "./search-form.types";

export interface LayoutPlan {
  /** 折叠时实际渲染的字段子集（展开时即全部）。 */
  visible: SearchField[];
  /** 操作区 grid 起列（1-based；end 恒 -1）。 */
  actionStart: number;
  /** 字段恰好填满整行 → 操作区另起一行右对齐。 */
  actionFullRow: boolean;
}

const spanOf = (f: SearchField, columns: number) => Math.min(f.colSpan ?? 1, columns);

/** 字段累计跨度（每字段 span 封顶 columns）。 */
export function totalSpan(fields: SearchField[], columns: number): number {
  return fields.reduce((sum, f) => sum + spanOf(f, columns), 0);
}

/** 是否需要折叠：操作区恒占 ≥1 格，字段累计跨度 > columns-1 才折。 */
export function canCollapse(fields: SearchField[], columns: number): boolean {
  return totalSpan(fields, columns) > columns - 1;
}

/** 算折叠可见字段集 + 操作区起列。纯函数（零 React），jsdom 无关可单测。 */
export function planLayout(fields: SearchField[], columns: number, collapsed: boolean): LayoutPlan {
  let visible = fields;
  if (collapsed) {
    const picked: SearchField[] = [];
    let used = 0;
    for (const f of fields) {
      const s = spanOf(f, columns);
      if (used + s > columns - 1) break; // 留 ≥1 格给操作区
      picked.push(f);
      used += s;
    }
    visible = picked;
  }
  let used = 0;
  for (const f of visible) used += spanOf(f, columns);
  const rem = used % columns;
  const actionFullRow = rem === 0 && visible.length > 0;
  const actionStart = actionFullRow ? 1 : rem + 1;
  return { visible, actionStart, actionFullRow };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run src/search-form/search-form.layout.test.ts`
Expected: PASS（8 测试全绿）

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/search-form/search-form.layout.ts packages/ui/src/search-form/search-form.layout.test.ts
git commit -m "feat(ui): SearchForm 布局纯函数 planLayout(TDD)" -- packages/ui/src/search-form/search-form.layout.ts packages/ui/src/search-form/search-form.layout.test.ts
```

---

### Task 3: 组件 search-form.tsx

**Files:**
- Create: `packages/ui/src/search-form/search-form.tsx`

- [ ] **Step 1: 写组件**

```tsx
"use client";
import { useState, type FormEvent } from "react";
import { cn } from "../lib/cn";
import { Button } from "../button";
import { Field } from "../field";
import { Input } from "../input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";
import { canCollapse, planLayout } from "./search-form.layout";
import type { SearchField, SearchFormProps } from "./search-form.types";

const ChevronDown = ({ className }: { className?: string }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 非受控初始值：date-range → ["",""]，其余 → ""（或字段 defaultValue）。 */
function seedDefaults(fields: SearchField[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    out[f.name] = f.defaultValue ?? (f.type === "date-range" ? ["", ""] : "");
  }
  return out;
}

function renderControl(
  field: SearchField,
  value: unknown,
  setValue: (name: string, v: unknown) => void,
): React.ReactNode {
  const onChange = (v: unknown) => setValue(field.name, v);

  if (field.render) return field.render({ name: field.name, value, onChange });

  if (field.type === "select") {
    const v = (value as string) ?? "";
    return (
      <Select
        items={field.options}
        placeholder={field.placeholder ?? "请选择"}
        value={v === "" ? null : v}
        onValueChange={(val: unknown) => onChange(val == null ? "" : String(val))}
      >
        <SelectTrigger />
        <SelectContent>
          {field.options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "date-range") {
    const arr = Array.isArray(value) ? value : ["", ""];
    const start = String(arr[0] ?? "");
    const end = String(arr[1] ?? "");
    return (
      <div className="flex items-center gap-2">
        <Input type="date" value={start} onChange={(e) => onChange([e.target.value, end])} className="flex-1" />
        <span className="shrink-0 text-muted">~</span>
        <Input type="date" value={end} onChange={(e) => onChange([start, e.target.value])} className="flex-1" />
      </div>
    );
  }

  const type = field.type === "date" ? "date" : (field.inputType ?? "text");
  return (
    <Input
      type={type}
      value={String(value ?? "")}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function SearchForm({
  fields,
  values,
  onChange,
  onSearch,
  onReset,
  columns = 3,
  gap = 4,
  collapsible = true,
  defaultCollapsed = true,
  submitText = "查询",
  resetText = "重置",
  loading = false,
  className,
}: SearchFormProps) {
  const isControlled = values !== undefined;
  const [internal, setInternal] = useState<Record<string, unknown>>(() => seedDefaults(fields));
  const current = isControlled ? values : internal;

  const setValue = (name: string, v: unknown) => {
    const next = { ...current, [name]: v };
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const collapsibleActive = collapsible && canCollapse(fields, columns);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const isCollapsed = collapsibleActive && collapsed;

  const { visible, actionStart } = planLayout(fields, columns, isCollapsed);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(current);
  };

  const handleReset = () => {
    const defaults = seedDefaults(fields);
    if (!isControlled) setInternal(defaults);
    onChange?.(defaults);
    onReset?.(defaults);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("rounded-[var(--radius)] border border-border bg-surface p-4", className)}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: `${gap * 0.25}rem` }}
      >
        {visible.map((field) => (
          <div
            key={field.name}
            style={
              field.colSpan ? { gridColumn: `span ${Math.min(field.colSpan, columns)}` } : undefined
            }
          >
            <Field label={field.label}>{renderControl(field, current[field.name], setValue)}</Field>
          </div>
        ))}
        <div className="flex items-end justify-end gap-2" style={{ gridColumn: `${actionStart} / -1` }}>
          <Button type="submit" loading={loading}>
            {submitText}
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            {resetText}
          </Button>
          {collapsibleActive && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
            >
              {collapsed ? "展开" : "收起"}
              <ChevronDown className={cn("transition-transform", !collapsed && "rotate-180")} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: typecheck**

Run: `pnpm --filter @hulianui/ui exec tsc --noEmit`
Expected: PASS（无 search-form 相关类型错误；并行 WIP 错误 isolate）

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/search-form/search-form.tsx
git commit -m "feat(ui): SearchForm 组件(受控对称+内置控件+render逃生舱+一行折叠)" -- packages/ui/src/search-form/search-form.tsx
```

---

### Task 4: 组件测试 search-form.test.tsx

**Files:**
- Create: `packages/ui/src/search-form/search-form.test.tsx`

注意：vitest 无 jest-dom。断言用 DOM 原生 API + `toBeTruthy/toBe/toBeNull`。

- [ ] **Step 1: 写测试**

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SearchForm } from "./search-form";
import type { SearchField } from "./search-form.types";

afterEach(cleanup);

const baseFields: SearchField[] = [
  { name: "keyword", label: "关键词", placeholder: "kw" },
  { name: "owner", label: "负责人", placeholder: "owner" },
];

describe("SearchForm", () => {
  it("渲染所有可见字段标签 + 查询/重置按钮", () => {
    render(<SearchForm fields={baseFields} onSearch={() => {}} />);
    expect(screen.getByText("关键词")).toBeTruthy();
    expect(screen.getByText("负责人")).toBeTruthy();
    expect(screen.getByText("查询")).toBeTruthy();
    expect(screen.getByText("重置")).toBeTruthy();
  });

  it("编辑 input 触发 onChange 带更新值（非受控）", () => {
    const onChange = vi.fn();
    const { container } = render(<SearchForm fields={baseFields} onChange={onChange} onSearch={() => {}} />);
    const input = container.querySelector('input[placeholder="kw"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: "hello" });
  });

  it("点查询触发 onSearch 带当前 values", () => {
    const onSearch = vi.fn();
    const { container } = render(<SearchForm fields={baseFields} onSearch={onSearch} />);
    const input = container.querySelector('input[placeholder="kw"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.click(screen.getByText("查询"));
    expect(onSearch).toHaveBeenCalled();
    expect(onSearch.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: "abc" });
  });

  it("点重置触发 onReset 带 defaults", () => {
    const onReset = vi.fn();
    const { container } = render(<SearchForm fields={baseFields} onReset={onReset} onSearch={() => {}} />);
    const input = container.querySelector('input[placeholder="kw"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "xyz" } });
    fireEvent.click(screen.getByText("重置"));
    expect(onReset).toHaveBeenCalled();
    expect(onReset.mock.calls.at(-1)?.[0]).toMatchObject({ keyword: "", owner: "" });
  });

  it("render 逃生舱被调用并渲染自定义控件", () => {
    const fields: SearchField[] = [
      { name: "custom", label: "自定义", render: (ctx) => <input data-testid="custom" value={String(ctx.value ?? "")} onChange={(e) => ctx.onChange(e.target.value)} /> },
    ];
    const { container } = render(<SearchForm fields={fields} onSearch={() => {}} />);
    expect(container.querySelector('[data-testid="custom"]')).toBeTruthy();
  });

  it("折叠默认只显示一行字段，展开后显示全部", () => {
    const many: SearchField[] = Array.from({ length: 5 }, (_, i) => ({
      name: `f${i}`,
      label: `字段${i}`,
      placeholder: `p${i}`,
    }));
    const { container } = render(<SearchForm fields={many} columns={3} onSearch={() => {}} />);
    // 折叠：columns-1 = 2 个 input
    expect(container.querySelectorAll("input").length).toBe(2);
    fireEvent.click(screen.getByText("展开"));
    expect(container.querySelectorAll("input").length).toBe(5);
    expect(screen.getByText("收起")).toBeTruthy();
  });

  it("select 字段渲染 combobox 触发器", () => {
    const fields: SearchField[] = [
      { name: "status", label: "状态", type: "select", placeholder: "全部", options: [{ value: "a", label: "A" }] },
    ];
    const { container } = render(<SearchForm fields={fields} onSearch={() => {}} />);
    expect(container.querySelector('[role="combobox"]')).toBeTruthy();
  });

  it("字段填不满一行时不渲染折叠按钮", () => {
    render(<SearchForm fields={baseFields} columns={3} onSearch={() => {}} />);
    expect(screen.queryByText("展开")).toBeNull();
    expect(screen.queryByText("收起")).toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run src/search-form/search-form.test.tsx`
Expected: PASS（8 测试全绿）。若 select 测试因 Base UI Select portal/jsdom 报错，降级断言为 `container.querySelector("button")` 存在。

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/search-form/search-form.test.tsx
git commit -m "test(ui): SearchForm 组件测试(受控回填/提交/重置/逃生舱/折叠)" -- packages/ui/src/search-form/search-form.test.tsx
```

---

### Task 5: showcase + 桶导出 index.ts

**Files:**
- Create: `packages/ui/src/search-form/search-form.showcase.tsx`
- Create: `packages/ui/src/search-form/index.ts`

- [ ] **Step 1: 写 showcase**

注意：gallery 居中 flex 会让 `w-full` 缩成内容宽 → 给**显式像素宽** `w-[44rem] max-w-full`（同 recharts 修复，见 skill `recharts-responsive-container-needs-explicit-width-in-shrink-flex`）。

```tsx
"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { SearchForm } from "./search-form";
import type { SearchField } from "./search-form.types";

const fields: SearchField[] = [
  { name: "keyword", label: "关键词", placeholder: "订单号 / 客户名" },
  {
    name: "status",
    label: "状态",
    type: "select",
    placeholder: "全部",
    options: [
      { value: "pending", label: "待处理" },
      { value: "done", label: "已完成" },
      { value: "canceled", label: "已取消" },
    ],
  },
  {
    name: "channel",
    label: "渠道",
    type: "select",
    placeholder: "全部",
    options: [
      { value: "app", label: "APP" },
      { value: "web", label: "网页" },
      { value: "wechat", label: "微信" },
    ],
  },
  { name: "range", label: "创建时间", type: "date-range", colSpan: 2 },
  { name: "owner", label: "负责人", placeholder: "姓名" },
  { name: "city", label: "城市", placeholder: "城市" },
];

function Demo({ collapsible = true }: { collapsible?: boolean }) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [searched, setSearched] = useState<string | null>(null);
  return (
    <div className="w-[44rem] max-w-full space-y-3">
      <SearchForm
        fields={collapsible ? fields : fields.slice(0, 3)}
        values={values}
        onChange={setValues}
        onSearch={(v) => setSearched(JSON.stringify(v))}
        onReset={() => setSearched(null)}
        collapsible={collapsible}
      />
      {searched && <p className="text-xs text-muted">查询参数：{searched}</p>}
    </div>
  );
}

export const searchFormShowcase: ShowcaseSpec = {
  controls: [{ prop: "collapsible", type: "boolean", defaultValue: true }],
  states: [
    { name: "默认折叠", render: () => <Demo /> },
    { name: "少字段(不可折叠)", render: () => <Demo collapsible={false} /> },
  ],
  renderWithProps: (p) => <Demo collapsible={Boolean(p.collapsible)} />,
  toCode: () =>
    `<SearchForm\n  fields={fields}\n  values={values}\n  onChange={setValues}\n  onSearch={(v) => console.log(v)}\n  onReset={() => {}}\n/>`,
};
```

- [ ] **Step 2: 写桶导出 index.ts**

```ts
export { SearchForm } from "./search-form";
export type { SearchFormProps, SearchField, SearchFieldRenderCtx } from "./search-form.types";
export { planLayout, canCollapse, totalSpan } from "./search-form.layout";
export type { LayoutPlan } from "./search-form.layout";
export { searchFormShowcase } from "./search-form.showcase";
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/search-form/search-form.showcase.tsx packages/ui/src/search-form/index.ts
git commit -m "feat(ui): SearchForm showcase + 桶导出" -- packages/ui/src/search-form/search-form.showcase.tsx packages/ui/src/search-form/index.ts
```

---

### Task 6: 接线（主 barrel + manifest + registry）

**Files:**
- Modify: `packages/ui/src/index.ts`（主 barrel，追加一行 export）
- Modify: `apps/www/lib/manifest.ts`（追加一条 ComponentMeta）
- Modify: `apps/www/lib/registry.tsx`（import + map）

**并发注意**：这三个文件被并行 session 高频写入。每次 Edit 前 `git diff HEAD -- <file>` 看当前 HEAD 状态；commit 前确认 `git diff HEAD -- <file>` 只含自己增量（他人未提交行若混入，用 `git diff HEAD` 核对后只 `git add` 自己的；必要时临时移除他人行→commit→复原，见 plan 顶部并发纪律）。

- [ ] **Step 1: 主 barrel 追加 export**

在 `packages/ui/src/index.ts` 末尾（或 inputs 邻近组件后）追加：

```ts
export * from "./search-form";
```

- [ ] **Step 2: manifest 追加条目**

在 `apps/www/lib/manifest.ts` 的 `COMPONENTS` 数组末尾追加（`]` 之前）：

```ts
  { slug: "search-form", name: "SearchForm", description: "查询筛选表单 · 中后台列表页顶部条件区 · fields 配置 + 固定列栅格 + 一行折叠 + 查询/重置(dogfood Grid/Field/Input/Select/Button·零依赖)", category: "inputs", status: "new" },
```

- [ ] **Step 3: registry import + map**

在 `apps/www/lib/registry.tsx` 的 import 块追加 `searchFormShowcase,`（与其它 showcase import 并列），并在 map 对象追加：

```ts
  "search-form": searchFormShowcase,
```

- [ ] **Step 4: 核对仅自己增量**

Run: `git diff HEAD -- packages/ui/src/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx`
Expected: 仅含 search-form 相关 3 处新增行（若混入他人未提交行，按并发纪律隔离）

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): SearchForm 接入 IA(inputs 分类)" -- packages/ui/src/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx
```

---

### Task 7: 三道门 + 截图验证

- [ ] **Step 1: typecheck**

Run: `pnpm typecheck`
Expected: PASS（ui + www）。并行 WIP 致红 → 确认非 search-form，isolate（见 skill `turbo-test-red-isolate-untracked-wip-not-your-regression`），用 `--force` 或直跑 vitest 拿真实态。

- [ ] **Step 2: 全量测试（--force 拿真实态）**

Run: `pnpm test -- --force` 或 `pnpm --filter @hulianui/ui exec vitest run`
Expected: PASS（含 search-form layout 8 + 组件 8 = 16 新测试）。他人 untracked WIP 红 → isolate 不碰。

- [ ] **Step 3: build www**

Run: `pnpm build --filter=www`
Expected: PASS，SSG 产出含 `/components/search-form` 页。

- [ ] **Step 4: 截图明暗两态（隔离 chromium）**

参考 skill `mcp-browser-busy-launch-isolated-chromium-via-executablepath`：若 MCP 浏览器被并行 session 占用，自起 ms-playwright 缓存里的 chromium / chrome-headless-shell，CDP 注入 `localStorage hulian-theme=light/dark` 后导航 `/components/search-form`，轮询 hydration（页面含「查询」文案）后截图。验证：①折叠态操作区与字段同一行右对齐；②点「展开」后字段铺满多行、操作区吸右；③点「查询」showcase 显示查询参数 JSON；④暗色 token 翻转正确。截图存 cwd 根用 Read 看像素（skill `ui-layout-verify-needs-screenshot-not-dom-eval`）。

- [ ] **Step 5: 若截图发现布局/对齐问题**

按需修 `search-form.tsx` 的 grid/flex 类，重跑 Step 1-4，精确 pathspec commit 修复。

---

## Self-Review 记录

- **Spec coverage**：fields 配置(Task1 类型 + Task3 renderControl)✓ · 响应式多列栅格(Task3 Grid inline)✓ · 查询/重置操作区(Task3)✓ · 展开/收起折叠(Task2 planLayout + Task3)✓ · 受控 values + onSearch/onReset(Task3)✓ · dogfood Input/Select/date/Button/Field(Task3)✓ · render 逃生舱(Task1/3/4)✓ · 五件套+接线+三道门(Task5/6/7)✓。
- **类型一致性**：`planLayout/canCollapse/totalSpan` 签名 Task2 定义、Task3 消费一致；`SearchField`/`SearchFormProps` Task1 定义、Task3/4/5 消费一致；`SearchFieldRenderCtx.{name,value,onChange}` Task1 定义、Task3 renderControl 构造、Task4 测试消费一致。
- **无 jest-dom**：所有组件测试断言用 `getAttribute`/`querySelector`/`toBeTruthy`/`toBeNull`/`toMatchObject`，无 `toHaveAttribute`/`toBeInTheDocument`。
- **YAGNI**：未引入 validate/字段联动/inline 标签/多行折叠/弹日历（按 spec §7 推迟）。
