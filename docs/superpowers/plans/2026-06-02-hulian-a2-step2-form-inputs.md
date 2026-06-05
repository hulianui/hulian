# 瑚琏 A2 Step 2 实施计划 — 表单录入族 Input / Textarea / Field

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 吸取表单录入族 Input·Textarea·Field 三组件，统一成瑚琏 API + 明暗 token 皮肤，a11y 串联交给 Base UI Field 兜底。

**Architecture:** 三组件全建在 Base UI rc.0 `field`/`input` primitive 上。Input = Base UI `Input`(≡`Field.Control`) 内嵌 focus-within 皮肤外壳(承载 border/ring/invalid + 前后缀 slot)；Textarea = `Field.Control render={<textarea/>}` + 同款 token 皮肤 + JS scrollHeight 自适应高度；Field = Props 包装 `Field.Root/Label/Control/Description/Error`，`error` 隐含 invalid，错误文字用 `<Field.Error match={true}>` 强制渲染(规避「框红字没」静默失效)。控件 invalid 经 `Field.Root invalid`(Field 内自动) 或 destructure 后翻译成 `data-invalid`+`aria-invalid`(独立)，外壳 `has-[[data-invalid]]` 统一覆盖。

**Tech Stack:** Next 16 (App Router/SSG) · React 19 · Base UI rc.0 (field/input) · Tailwind v4 (语义 token) · CVA · vitest 3.2 + jsdom + @testing-library/react · pnpm + Turborepo。

**上游 spec:** `docs/superpowers/specs/2026-06-02-hulian-a2-step2-form-inputs-design.md`（本计划覆盖其 §11 的 C1–C4 全部）。

---

## File Structure

**Task C1 — Input**
- Create: `packages/ui/src/input/input.tsx` — focus-within 外壳 + 前后缀 + 内嵌 Base Input + CVA size，invalid 翻译。
- Create: `packages/ui/src/input/input.types.ts` — InputProps。
- Create: `packages/ui/src/input/input.showcase.tsx` — `"use client"` ShowcaseSpec。
- Create: `packages/ui/src/input/input.test.tsx` — 变体 + invalid 翻译 + 前后缀。
- Create: `packages/ui/src/input/index.ts` — 桶导出。
- Modify: `packages/ui/src/index.ts` — `export * from "./input"`。

**Task C2 — Textarea**
- Create: `packages/ui/src/textarea/{textarea.tsx,textarea.types.ts,textarea.showcase.tsx,textarea.test.tsx,index.ts}`
- Modify: `packages/ui/src/index.ts` — `export * from "./textarea"`。

**Task C3 — Field**
- Create: `packages/ui/src/field/{field.tsx,field.types.ts,field.showcase.tsx,field.test.tsx,index.ts}`
- Modify: `packages/ui/src/index.ts` — `export * from "./field"`。

**Task C4 — 接 IA + 验收 + §4 回写**
- Modify: `apps/www/lib/manifest.ts` — 追加 3 条（category `inputs`，status `new`）。
- Modify: `apps/www/lib/registry.tsx` — +3 import 名 + 3 map 行。
- Modify: `docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md` — §4 Input/Field 改判 Base UI Field。

---

## 约定速查（执行者必读）

**可用语义 token（仅这些，无 success/warning）**：`bg-bg` `bg-surface` `bg-surface-hover` `text-foreground` `text-muted` `border-border` `ring-ring` `bg-primary` `text-primary-foreground` `bg-danger` `text-danger-foreground` `text-primary` `text-danger` `border-primary` `border-danger`；因 `--color-danger`/`--color-ring` 已在 `@theme inline` 注册，**`ring-danger`/`border-danger` 等全套自动可用**；圆角 `rounded-[var(--radius)]`。

**import 路径**：组件内 `import { cn } from "../lib/cn"`；Base UI `import { Input as BaseInput } from "@base-ui-components/react/input"`、`import { Field as BaseField } from "@base-ui-components/react/field"`。

**四件套**：`x.tsx` + `x.types.ts` + `x.showcase.tsx`（必 `"use client"`）+ `x.test.tsx` + `index.ts`（桶导出组件/类型/showcase）。三组件本体都用 Base UI(client) → 都加 `"use client"`。

**门禁节奏**（沿用批次一已验证模式）：
- 每个组件 Task 的 TDD 循环：`pnpm --filter @hulianui/ui exec vitest run <名>`（先红后绿）。
- 每个组件 Task commit 前：`pnpm typecheck`（快，守类型/导出）。
- **完整三道门 + 生产 build 只在 C4 跑一次**：`pnpm typecheck && pnpm test && pnpm build --filter=www`（**build 必 `--filter=www`**——全包 `pnpm build` 会因 desktop tauri `beforeBuildCommand` 二次 build www 并发冲突）。组件 Task 不单独 build（www 到 C4 才消费组件，提前 build 无意义且慢）。
- **Playwright 截图实测只在 C4**：每组件明暗两态各一张，存 cwd 根 `/Users/zhangzhiwei/Desktop/code/hulian/*.png`（**不在 .playwright-mcp/**），Read 看像素（不靠 `browser_evaluate` 读 DOM，会漏几何 bug）。

**trunk-based**：直接在 master 小步 commit，无 remote、不 push。

---

## Task 0: 确认绿色基线

**Files:** 无（只读校验）

- [ ] **Step 1: 跑完整三道门，记录基线**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck && pnpm test && pnpm build --filter=www
```
Expected: 全绿（批次一收尾态 `192b4db`）。**若此处已红，先停下报告——是存量问题，不在本计划范围内修。**记录结果作基线。

---

## Task C1: Input（四件套，TDD）

**Files:**
- Create: `packages/ui/src/input/input.test.tsx`
- Create: `packages/ui/src/input/input.tsx`
- Create: `packages/ui/src/input/input.types.ts`
- Create: `packages/ui/src/input/input.showcase.tsx`
- Create: `packages/ui/src/input/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 写 input 测试（先红）**

Create `packages/ui/src/input/input.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { inputShellVariants, Input } from "./input";

describe("inputShellVariants", () => {
  it("默认 md（h-10）", () => {
    expect(inputShellVariants({})).toContain("h-10");
  });
  it("size 变体改高度", () => {
    expect(inputShellVariants({ size: "sm" })).toContain("h-8");
    expect(inputShellVariants({ size: "lg" })).toContain("h-12");
  });
  it("外壳带 invalid/focus-within 钩子", () => {
    const c = inputShellVariants({});
    expect(c).toContain("has-[[data-invalid]]:border-danger");
    expect(c).toContain("focus-within:ring-ring");
  });
});

describe("Input", () => {
  it("invalid 先 destructure 再翻译成 data-invalid + aria-invalid，不裸传 invalid 属性", () => {
    const { container } = render(<Input invalid placeholder="x" />);
    const input = container.querySelector("input")!;
    expect(input.getAttribute("data-invalid")).toBe("");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.hasAttribute("invalid")).toBe(false); // 关键：自定义 invalid 不渲到 DOM
  });
  it("无 invalid 时不加 data-invalid", () => {
    const { container } = render(<Input placeholder="x" />);
    expect(container.querySelector("input")!.hasAttribute("data-invalid")).toBe(false);
  });
  it("渲染前后缀", () => {
    const { getByText } = render(<Input prefix="¥" suffix=".00" />);
    expect(getByText("¥")).toBeTruthy();
    expect(getByText(".00")).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run input`
Expected: FAIL —— `./input` 不存在。

- [ ] **Step 3: 实现 input.types.ts**

Create `packages/ui/src/input/input.types.ts`:
```ts
import type { InputHTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { inputShellVariants } from "./input";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">,
    VariantProps<typeof inputShellVariants> {
  /** 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动，无需重复传。 */
  invalid?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
}
```

- [ ] **Step 4: 实现 input.tsx**

Create `packages/ui/src/input/input.tsx`:
```tsx
"use client";
import { Input as BaseInput } from "@base-ui-components/react/input";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { InputProps } from "./input.types";

// 外壳承载视觉：border/bg/圆角/focus-ring/invalid/disabled。内层 Base Input 透明。
// invalid 两条驱动路统一在 has-[[data-invalid]]：
//   · Field 内 → Field.Root invalid 让控件得 data-invalid
//   · 独立 → 下面把 invalid 翻译成 data-invalid 落到内层 input
export const inputShellVariants = cva(
  [
    "inline-flex w-full items-center gap-2 rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
    "has-[[data-invalid]]:border-danger has-[[data-invalid]]:focus-within:ring-danger",
    "has-[:disabled]:opacity-50 has-[:disabled]:pointer-events-none",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-3.5 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export function Input({ className, size, invalid, prefix, suffix, ...props }: InputProps) {
  return (
    <span className={cn(inputShellVariants({ size }), className)}>
      {prefix != null && <span className="shrink-0 text-muted">{prefix}</span>}
      <BaseInput
        {...props}
        {...(invalid && { "data-invalid": "", "aria-invalid": true })}
        className="w-full bg-transparent text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed"
      />
      {suffix != null && <span className="shrink-0 text-muted">{suffix}</span>}
    </span>
  );
}
```

- [ ] **Step 5: 实现 input.showcase.tsx**

Create `packages/ui/src/input/input.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Input } from "./input";

export const inputShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "placeholder", type: "text", defaultValue: "请输入…", label: "占位符" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "default", render: () => <Input placeholder="请输入…" className="w-64" /> },
    { name: "前后缀", render: () => <Input prefix="¥" suffix=".00" placeholder="0" className="w-64" /> },
    { name: "invalid", render: () => <Input invalid defaultValue="错的值" className="w-64" /> },
    { name: "disabled", render: () => <Input disabled defaultValue="禁用态" className="w-64" /> },
    { name: "sm", render: () => <Input size="sm" placeholder="sm" className="w-64" /> },
    { name: "lg", render: () => <Input size="lg" placeholder="lg" className="w-64" /> },
  ],
  renderWithProps: (p) => (
    <Input
      size={p.size as "sm" | "md" | "lg"}
      placeholder={p.placeholder as string}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      className="w-64"
    />
  ),
  toCode: (p) =>
    `<Input size="${p.size}" placeholder="${p.placeholder}"${p.invalid ? " invalid" : ""}${
      p.disabled ? " disabled" : ""
    } />`,
};
```

- [ ] **Step 6: 实现 index.ts 桶导出**

Create `packages/ui/src/input/index.ts`:
```ts
export { Input, inputShellVariants } from "./input";
export type { InputProps } from "./input.types";
export { inputShowcase } from "./input.showcase";
```

- [ ] **Step 7: 主 index 导出 input**

在 `packages/ui/src/index.ts` 组件区加一行（紧跟 `export * from "./avatar";` 之后）:
```ts
export * from "./input";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run input`
Expected: PASS（全部用例绿，含 `hasAttribute("invalid") === false`）。

- [ ] **Step 9: typecheck + Commit**

Run: `pnpm typecheck`
Expected: 无错。
```bash
git add packages/ui/src/input packages/ui/src/index.ts
git commit -m "feat(ui): Input 组件(Base UI Input + focus-within 外壳 + 前后缀 + invalid 翻译)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task C2: Textarea（四件套 + autoResize，TDD）

**Files:**
- Create: `packages/ui/src/textarea/textarea.test.tsx`
- Create: `packages/ui/src/textarea/textarea.tsx`
- Create: `packages/ui/src/textarea/textarea.types.ts`
- Create: `packages/ui/src/textarea/textarea.showcase.tsx`
- Create: `packages/ui/src/textarea/index.ts`
- Modify: `packages/ui/src/index.ts`

> 工程注记：Textarea 无前后缀槽，故皮肤直接落在 textarea 元素本体（`focus-visible:ring` + `data-[invalid]:`），不套 Input 的 focus-within 外壳——视觉 token 与 Input 一致，结构更简。autoResize 走 JS `scrollHeight`（非 CSS `field-sizing`，WKWebView 不稳）。

- [ ] **Step 1: 写 textarea 测试（先红，含 autoResize 三红线）**

Create `packages/ui/src/textarea/textarea.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { textareaVariants, Textarea } from "./textarea";

describe("textareaVariants", () => {
  it("默认 md + 语义皮肤", () => {
    const c = textareaVariants({});
    expect(c).toContain("border-border");
    expect(c).toContain("data-[invalid]:border-danger");
  });
  it("size 变体改内距/字号", () => {
    expect(textareaVariants({ size: "lg" })).toContain("text-base");
  });
});

describe("Textarea", () => {
  it("invalid 翻译成 data-invalid + aria-invalid，不裸传 invalid/autoResize", () => {
    const { container } = render(<Textarea invalid autoResize defaultValue="x" />);
    const el = container.querySelector("textarea")!;
    expect(el.getAttribute("data-invalid")).toBe("");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.hasAttribute("invalid")).toBe(false);
    expect(el.hasAttribute("autoresize")).toBe(false); // 自定义 prop 不渲到 DOM
  });

  it("autoResize: 测高前先把 height 归零(红线①), 受控值变化重测(红线②)", () => {
    const seen: string[] = [];
    const spy = vi
      .spyOn(HTMLTextAreaElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLTextAreaElement) {
        seen.push(this.style.height); // 读 scrollHeight 时 height 应已是 auto
        return 90;
      });
    const { container, rerender } = render(
      <Textarea autoResize value="a" onChange={() => {}} />,
    );
    const el = container.querySelector("textarea")!;
    expect(seen.at(-1)).toBe("auto"); // 红线①: 测前归零(否则只增不减)
    expect(el.style.height).toBe("90px");
    const calls = seen.length;
    rerender(<Textarea autoResize value="aa" onChange={() => {}} />);
    expect(seen.length).toBeGreaterThan(calls); // 红线②: 受控值变化触发重测
    spy.mockRestore();
  });

  it("autoResize 时 rows 作下限 + 禁手动 resize(红线③)", () => {
    const { container } = render(<Textarea autoResize rows={4} />);
    const el = container.querySelector("textarea")!;
    expect(el.getAttribute("rows")).toBe("4"); // rows 属性=自适应高度的下限锚
    expect(el.className).toContain("overflow-hidden");
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run textarea`
Expected: FAIL —— `./textarea` 不存在。

- [ ] **Step 3: 实现 textarea.types.ts**

Create `packages/ui/src/textarea/textarea.types.ts`:
```ts
import type { TextareaHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { textareaVariants } from "./textarea";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  /** 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动。 */
  invalid?: boolean;
  /** 随内容自适应高度（JS scrollHeight，rows 为下限）。 */
  autoResize?: boolean;
}
```

- [ ] **Step 4: 实现 textarea.tsx**

Create `packages/ui/src/textarea/textarea.tsx`:
```tsx
"use client";
import { useLayoutEffect, useRef } from "react";
import type { FormEvent } from "react";
import { Field as BaseField } from "@base-ui-components/react/field";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { TextareaProps } from "./textarea.types";

export const textareaVariants = cva(
  [
    "w-full rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "outline-none placeholder:text-muted",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "px-2.5 py-1.5 text-sm",
        md: "px-3 py-2 text-sm",
        lg: "px-3.5 py-2.5 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export function Textarea({
  className,
  size,
  invalid,
  autoResize,
  rows = 3,
  onInput,
  ...props
}: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // 红线①: 先 height='auto' 再读 scrollHeight（否则删字后高度不回收，只增不减）。
  // rows 属性在 height='auto' 态下决定最小高度 → 天然作下限(红线③)。
  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // 红线②: 受控 value / rows 变化也要重测，不能只听原生事件。useLayoutEffect 避免闪烁。
  useLayoutEffect(() => {
    if (autoResize) resize();
  }, [autoResize, props.value, rows]);

  // 非受控键入路径：原生 input 事件也触发重测。
  const handleInput = (e: FormEvent<HTMLTextAreaElement>) => {
    if (autoResize) resize();
    onInput?.(e);
  };

  return (
    <BaseField.Control
      ref={ref}
      render={<textarea />}
      rows={rows}
      onInput={handleInput}
      {...props}
      {...(invalid && { "data-invalid": "", "aria-invalid": true })}
      className={cn(
        textareaVariants({ size }),
        autoResize ? "resize-none overflow-hidden" : "resize-y",
        className,
      )}
    />
  );
}
```

- [ ] **Step 5: 实现 textarea.showcase.tsx**

Create `packages/ui/src/textarea/textarea.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Textarea } from "./textarea";

export const textareaShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "placeholder", type: "text", defaultValue: "写点什么…", label: "占位符" },
    { prop: "rows", type: "number", defaultValue: 3, label: "rows" },
    { prop: "autoResize", type: "boolean", defaultValue: false, label: "自适应高度" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "default", render: () => <Textarea placeholder="写点什么…" className="w-64" /> },
    {
      name: "autoResize",
      render: () => (
        <Textarea autoResize defaultValue={"随内容长高\n第二行\n第三行\n第四行"} className="w-64" />
      ),
    },
    { name: "invalid", render: () => <Textarea invalid defaultValue="错的内容" className="w-64" /> },
    { name: "disabled", render: () => <Textarea disabled defaultValue="禁用态" className="w-64" /> },
  ],
  renderWithProps: (p) => (
    <Textarea
      size={p.size as "sm" | "md" | "lg"}
      placeholder={p.placeholder as string}
      rows={p.rows as number}
      autoResize={p.autoResize as boolean}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      className="w-64"
    />
  ),
  toCode: (p) =>
    `<Textarea size="${p.size}" rows={${p.rows}}${p.autoResize ? " autoResize" : ""}${
      p.invalid ? " invalid" : ""
    }${p.disabled ? " disabled" : ""} />`,
};
```

- [ ] **Step 6: 实现 index.ts**

Create `packages/ui/src/textarea/index.ts`:
```ts
export { Textarea, textareaVariants } from "./textarea";
export type { TextareaProps } from "./textarea.types";
export { textareaShowcase } from "./textarea.showcase";
```

- [ ] **Step 7: 主 index 导出 textarea**

在 `packages/ui/src/index.ts` 组件区加（紧跟 `export * from "./input";` 之后）:
```ts
export * from "./textarea";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run textarea`
Expected: PASS（含 autoResize 三红线用例）。

- [ ] **Step 9: typecheck + Commit**

Run: `pnpm typecheck`
Expected: 无错。
```bash
git add packages/ui/src/textarea packages/ui/src/index.ts
git commit -m "feat(ui): Textarea 组件(Field.Control render textarea + JS scrollHeight 自适应高度)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task C3: Field（四件套 + Props 包装 + a11y 串联，TDD）

**Files:**
- Create: `packages/ui/src/field/field.test.tsx`
- Create: `packages/ui/src/field/field.tsx`
- Create: `packages/ui/src/field/field.types.ts`
- Create: `packages/ui/src/field/field.showcase.tsx`
- Create: `packages/ui/src/field/index.ts`
- Modify: `packages/ui/src/index.ts`

> 真坑提醒（spec §5）：错误文字**必须**用 `<BaseField.Error match={true}>{error}</BaseField.Error>`。`match===true` 强制渲染（绕开恒为 null 的 validityData）+ 自动把 error id 串进 `aria-describedby`。若用 Field.Error 默认行为，会「框红了、错误字一个不渲染」。下面四条测试就是守这个。

- [ ] **Step 1: 写 field 测试（先红，守真坑 + a11y 串联）**

Create `packages/ui/src/field/field.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Field } from "./field";
import { Input } from "../input/input";

describe("Field", () => {
  it("真坑回归: error 非空时错误文字真的渲染(不能框红字没)", () => {
    const { getByText } = render(
      <Field label="邮箱" error="邮箱格式不正确">
        <Input />
      </Field>,
    );
    expect(getByText("邮箱格式不正确")).toBeTruthy();
  });

  it("error 隐含 invalid → 控件自动 aria-invalid", () => {
    const { container } = render(
      <Field error="必填">
        <Input />
      </Field>,
    );
    expect(container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
  });

  it("error 的 id 自动串进控件 aria-describedby(a11y 白嫖)", () => {
    const { container, getByText } = render(
      <Field error="必填">
        <Input />
      </Field>,
    );
    const input = container.querySelector("input")!;
    const errorEl = getByText("必填");
    expect((input.getAttribute("aria-describedby") ?? "")).toContain(errorEl.id);
  });

  it("label 经 htmlFor 自动关联控件", () => {
    const { getByText, container } = render(
      <Field label="用户名">
        <Input />
      </Field>,
    );
    const label = getByText("用户名");
    const input = container.querySelector("input")!;
    expect(input.id).toBeTruthy();
    expect(label.getAttribute("for")).toBe(input.id);
  });

  it("无 error 时不渲染错误节点", () => {
    const { queryByText } = render(
      <Field label="邮箱">
        <Input />
      </Field>,
    );
    expect(queryByText("邮箱格式不正确")).toBeNull();
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run field`
Expected: FAIL —— `./field` 不存在。

- [ ] **Step 3: 实现 field.types.ts**

Create `packages/ui/src/field/field.types.ts`:
```ts
import type { ReactNode } from "react";

export interface FieldProps {
  label?: ReactNode;
  description?: ReactNode; // help 文案
  error?: ReactNode; // 非空隐含 invalid，并强制渲染错误
  invalid?: boolean; // 显式覆盖；缺省时由 error 是否非空推导
  disabled?: boolean;
  /** 提交标识，透传 Field.Root（YAGNI 逃生口；validate/validationMode 本批不暴露）。 */
  name?: string;
  className?: string; // 落在 Field.Root（纵向布局容器）
  children: ReactNode; // 控件：hulian Input / Textarea（= Field.Control）
}
```

- [ ] **Step 4: 实现 field.tsx**

Create `packages/ui/src/field/field.tsx`:
```tsx
"use client";
import { Field as BaseField } from "@base-ui-components/react/field";
import { cn } from "../lib/cn";
import type { FieldProps } from "./field.types";

export function Field({
  label,
  description,
  error,
  invalid,
  disabled,
  name,
  className,
  children,
}: FieldProps) {
  const isInvalid = invalid ?? Boolean(error); // error 非空隐含 invalid

  return (
    <BaseField.Root
      name={name}
      invalid={isInvalid}
      disabled={disabled}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {label && (
        <BaseField.Label className="text-sm font-medium text-foreground">{label}</BaseField.Label>
      )}
      {children}
      {description && (
        <BaseField.Description className="text-xs text-muted">{description}</BaseField.Description>
      )}
      {/* match={true} 强制渲染(规避 validityData 恒 null 的静默失效) + 自动串 aria-describedby */}
      {error && (
        <BaseField.Error match={true} className="text-xs text-danger">
          {error}
        </BaseField.Error>
      )}
    </BaseField.Root>
  );
}
```

- [ ] **Step 5: 实现 field.showcase.tsx**

Create `packages/ui/src/field/field.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Field } from "./field";
import { Input } from "../input/input";

export const fieldShowcase: ShowcaseSpec = {
  controls: [
    { prop: "label", type: "text", defaultValue: "邮箱", label: "label" },
    { prop: "description", type: "text", defaultValue: "我们不会公开你的邮箱", label: "help" },
    { prop: "error", type: "text", defaultValue: "", label: "error（非空即标红+显错）" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    {
      name: "default",
      render: () => (
        <Field label="邮箱" className="w-72">
          <Input placeholder="you@work.com" />
        </Field>
      ),
    },
    {
      name: "withHelp",
      render: () => (
        <Field label="邮箱" description="我们不会公开你的邮箱" className="w-72">
          <Input placeholder="you@work.com" />
        </Field>
      ),
    },
    {
      name: "invalid+error",
      render: () => (
        <Field label="邮箱" error="邮箱格式不正确" className="w-72">
          <Input defaultValue="not-an-email" />
        </Field>
      ),
    },
    {
      name: "disabled",
      render: () => (
        <Field label="邮箱" disabled className="w-72">
          <Input placeholder="you@work.com" />
        </Field>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Field
      label={p.label as string}
      description={(p.description as string) || undefined}
      error={(p.error as string) || undefined}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      className="w-72"
    >
      <Input placeholder="you@work.com" />
    </Field>
  ),
  toCode: (p) =>
    `<Field label="${p.label}"${p.description ? ` description="${p.description}"` : ""}${
      p.error ? ` error="${p.error}"` : ""
    }${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""}>\n  <Input placeholder="you@work.com" />\n</Field>`,
};
```

- [ ] **Step 6: 实现 index.ts**

Create `packages/ui/src/field/index.ts`:
```ts
export { Field } from "./field";
export type { FieldProps } from "./field.types";
export { fieldShowcase } from "./field.showcase";
```

- [ ] **Step 7: 主 index 导出 field**

在 `packages/ui/src/index.ts` 组件区加（紧跟 `export * from "./textarea";` 之后）:
```ts
export * from "./field";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run field`
Expected: PASS（五条用例全绿，尤其「error 文字真渲染」+「aria-describedby 串 error id」）。

- [ ] **Step 9: typecheck + Commit**

Run: `pnpm typecheck`
Expected: 无错。
```bash
git add packages/ui/src/field packages/ui/src/index.ts
git commit -m "feat(ui): Field 组件(Props 包装 Base UI Field + error 隐含 invalid + match=true 强制显错)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task C4: 接 IA + Step 2 验收 + 主 spec §4 回写

**Files:**
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`
- Modify: `docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md`

- [ ] **Step 1: manifest 追加 3 条**

在 `apps/www/lib/manifest.ts` 的 `manifest` 数组里、`avatar` 条目后追加（均 `category:"inputs"`,`status:"new"`）:
```ts
  { slug: "input", name: "Input", description: "输入框 · Base UI Field + 前后缀 + invalid", category: "inputs", status: "new" },
  { slug: "textarea", name: "Textarea", description: "多行输入 · 自适应高度", category: "inputs", status: "new" },
  { slug: "field", name: "Field", description: "字段包装 · label/help/error a11y 串联", category: "inputs", status: "new" },
```

- [ ] **Step 2: registry 追加 3 import + 3 map**

修改 `apps/www/lib/registry.tsx`——在 import 块加 3 个名、map 加 3 行:
```tsx
import {
  buttonShowcase,
  switchShowcase,
  dialogShowcase,
  badgeShowcase,
  cardShowcase,
  skeletonShowcase,
  avatarShowcase,
  inputShowcase,
  textareaShowcase,
  fieldShowcase,
} from "@hulianui/ui";

export const specBySlug: Record<string, ShowcaseSpec> = {
  button: buttonShowcase,
  switch: switchShowcase,
  dialog: dialogShowcase,
  badge: badgeShowcase,
  card: cardShowcase,
  skeleton: skeletonShowcase,
  avatar: avatarShowcase,
  input: inputShowcase,
  textarea: textareaShowcase,
  field: fieldShowcase,
};
```

- [ ] **Step 3: 跑契约测试（验证 manifest↔registry 一致）**

Run: `pnpm --filter www exec vitest run manifest`
Expected: PASS —— 10 个 slug 双边齐全、无孤儿/缺失。

- [ ] **Step 4: 跑完整三道门**

Run: `pnpm typecheck && pnpm test && pnpm build --filter=www`
Expected: 全绿；SSG 生成 `/components` + 10 个 `/components/[slug]`（含 input/textarea/field）。

- [ ] **Step 5: 浏览器实测 Step 2（Playwright 截图明暗两态 + 像素 Read）**

Run: `pnpm dev`（www 起于 5512）。用 Playwright 逐个访问 `http://localhost:5512/components/{input,textarea,field}`，每个**明暗两态各截一张**，存到 `/Users/zhangzhiwei/Desktop/code/hulian/`（如 `step2-input-light.png`/`step2-input-dark.png`），并 **Read 每张图看像素**逐项确认：
- 左树「表单录入」分组新增 Input/Textarea/Field（带 `new` 标记）；
- **Input**：focus 点击后外壳 ring 出现；前后缀 `¥`/`.00` 与输入文字基线对齐、不溢出外壳；invalid 态外壳描边变 danger；disabled 态整体变暗；sm/md/lg 高度递增；placeholder 在明暗下都可读（`text-muted` 对比足够）。
- **Textarea**：autoResize 态多行内容把高度撑开、无内部滚动条；invalid 描边 danger；disabled 变暗。
- **Field**：`invalid+error` 态——**输入框描边红 且 「邮箱格式不正确」文字可见**（真坑修复的像素自证）；withHelp 态 help 文字在控件下方 `text-muted`；label 在控件上方。
- 全程右上明暗开关切换，三组件同步换肤、无白闪。
- 桌面 app(5514)：另开终端 `pnpm app`，确认壳内加载新组件正常。

> **若 invalid 红态/ring-danger 异常**（透明/不显色）：回查 `ring-danger`/`border-danger` 是否生成——`grep -rn "color-danger" packages/tokens/src/preset.css` 应命中 `--color-danger` 注册；若 token 在但类不生成，临时回退 `ring-ring`+`border-danger` 组合并记录。

- [ ] **Step 6: 主 spec §4 回写 + grep 自证（spec §10，套 docs-pr-verification 纪律）**

Edit `docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md`：把 §4 第一批清单表里 **Input** 行与 **Field** 行的「选源（修正后）」列改判为 Base UI Field：
- Input 行「选源」由 `原生 <input> + HeroUI/shadcn 皮肤 + CVA` 改为 `Base UI Input(≡Field.Control) + 瑚琏外壳皮肤 + CVA`；
- Field 行「选源」由 `自造组合` 改为 `Base UI Field(Root/Label/Control/Description/Error)，a11y 自动串联`；
- 两行「命脉」列末各加 `（详见 Step 2 spec 2026-06-02-hulian-a2-step2-form-inputs-design.md）`。

然后 **grep 自证**:
```bash
grep -n "Base UI Field\|Base UI Input(≡Field.Control)" docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md
grep -n "Step 2 spec" docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md
```
Expected: 第一条命中改后的 Input/Field 行；第二条命中两行的回指。自证结果记入收尾说明。

- [ ] **Step 7: Commit**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md
git commit -m "feat(www): 表单录入族(Input/Textarea/Field)接入 IA + 主 spec §4 改判 Base UI Field，Step 2 收口

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完成标志（本计划 = spec C1–C4）

- 左侧组件树「表单录入」分组新增 Input/Textarea/Field（`new` 标记），各自 `/components/[slug]` 独立 SSG 页。
- 三组件四件套齐、只消费语义 token、明暗自适应、`"use client"` 正确、a11y 串联达标（htmlFor/aria-describedby/aria-invalid 由 Base UI 兜底）。
- **invalid+error 态框红且字出**（真坑修复，Playwright 像素自证）；Input 前后缀对齐不溢出；Textarea autoResize 长高/回收/不破 rows 下限。
- 三道门（typecheck + test + `build --filter=www`）全绿；契约测试 10 slug 双边齐全；桌面 app(5514) 正常。
- 主 spec §4 已回写 Base UI Field 并 grep 自证；`ShowcaseSpec` 类型未动、未引新依赖。

---

## Self-Review（plan 对 spec 的覆盖核查）

**1. Spec coverage**：
- spec §2 四裁决 → Field=BaseUI(C1-C3 全程)、Props 包装(C3 field.tsx)、全量范围(C1 前后缀/C2 autoResize)、错误 match=true(C3 Step4) ✓
- spec §3.1 Input 外壳+前后缀 → C1 ✓；§3.2 Textarea autoResize 三红线 → C2 测试+实现 ✓；§3.3 Field Props 包装+error 隐含 invalid → C3 ✓
- spec §5 真坑(match=true) → C3 注记+测试1 ✓
- spec §6 invalid destructure 翻译 → C1/C2 测试「不裸传」+实现 ✓
- spec §7 showcase 零改动 → 三 showcase 全用现有 control 类型 ✓
- spec §8 token 皮肤 → 约定速查 + 各 variants ✓
- spec §9 四件套+"use client"+IA → 各 Task 桶导出/主 index/C4 ✓
- spec §10 §4 回写+grep 自证 → C4 Step6 ✓
- spec §11 C1–C4 + 三道门 --filter=www + Playwright → 全覆盖 ✓
- spec §12 验收 → 完成标志 ✓；§13 YAGNI(不暴露 validate/不 number-field) → field.types 注记 ✓

**2. Placeholder scan**：无 TBD/TODO；每个 code step 含完整可跑代码。✓

**3. Type consistency**：`inputShellVariants`/`textareaVariants`/`InputProps`/`TextareaProps`/`FieldProps`/`inputShowcase`/`textareaShowcase`/`fieldShowcase` 跨 Task 命名一致；registry import 名与各 index.ts 桶导出名一致；manifest slug(input/textarea/field) 与 registry map key 一致。✓
