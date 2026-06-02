# 瑚琏 A2 Step 3 实施计划 — 表单选择族 Checkbox / Radio

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 吸取表单选择族 Checkbox（三态含 indeterminate）+ Radio（RadioGroup 单选组 + 键盘方向键）两组件，统一成瑚琏 API + 明暗 token 皮肤，a11y / 表单态串联交给 Base UI primitive 兜底。

**Architecture:** 两组件全建在 Base UI rc.0 `checkbox` / `radio` / `radio-group` primitive 上，复用 Switch 的选中态皮肤配方（`data-[checked]` 驱动 + `focus-visible:ring` + 语义 token）。Checkbox = 方盒 + `indeterminate` 三态（勾/横线靠 `Indicator` 的 `render={(props,state)=>…}` 按 `state.indeterminate` 分支）；Radio = RadioGroup 容器（方向键由 Base UI 内置）+ 单颗 Radio（圈 + 中心点 Indicator）。两者各带可选 inline `label`，并能嵌进瑚琏 Field 做 group-level label/error 串联（零 Field 改动）。**关键差异：Checkbox.Root/Radio.Root 渲染 `<span>`（非 Switch 的 button），disabled 用 `data-[disabled]` 而非 `:disabled` 伪类。**

**Tech Stack:** Next 16 (App Router/SSG) · React 19 · Base UI rc.0 (checkbox/radio/radio-group) · Tailwind v4 (语义 token) · vitest 3.2 + jsdom + @testing-library/react · pnpm + Turborepo。

**上游 spec:** `docs/superpowers/specs/2026-06-02-hulian-a2-step3-form-selection-design.md`（本计划覆盖其全部 §4/§5/§8/§9）。

---

## File Structure

**Task D1 — Checkbox**
- Create: `packages/ui/src/checkbox/checkbox.tsx` — 方盒皮肤 + 三态 + 勾/横线 Indicator + inline label。
- Create: `packages/ui/src/checkbox/checkbox.types.ts` — CheckboxProps。
- Create: `packages/ui/src/checkbox/checkbox.showcase.tsx` — `"use client"` ShowcaseSpec（select 表达三态）。
- Create: `packages/ui/src/checkbox/checkbox.test.tsx` — 三态/data-disabled/无泄漏/label/Field 串联。
- Create: `packages/ui/src/checkbox/index.ts` — 桶导出。
- Modify: `packages/ui/src/index.ts` — `export * from "./checkbox"`。

**Task D2 — Radio + RadioGroup**
- Create: `packages/ui/src/radio/radio.tsx` — RadioGroup（布局+方向键）+ Radio（圈+中心点+label）。
- Create: `packages/ui/src/radio/radio.types.ts` — RadioGroupProps + RadioProps。
- Create: `packages/ui/src/radio/radio.showcase.tsx` — `"use client"` ShowcaseSpec。
- Create: `packages/ui/src/radio/radio.test.tsx` — 互斥/受控/value/中心点/orientation/disabled/Field 串联。
- Create: `packages/ui/src/radio/index.ts` — 桶导出。
- Modify: `packages/ui/src/index.ts` — `export * from "./radio"`。

**Task D3 — 接 IA + 验收**
- Modify: `apps/www/lib/manifest.ts` — 追加 2 条（checkbox / radio，category `inputs`，status `new`）。
- Modify: `apps/www/lib/registry.tsx` — +2 import 名 + 2 map 行。

---

## 约定速查（执行者必读）

**可用语义 token（仅这些，无 success/warning）**：`bg-bg` `bg-surface` `bg-surface-hover` `text-foreground` `text-muted` `border-border` `ring-ring` `bg-primary` `text-primary-foreground` `border-primary` `border-danger` `ring-danger` `text-danger`；圆角 `rounded-[var(--radius)]`（radio 用 `rounded-full`）。禁裸值。

**import 路径**：组件内 `import { cn } from "../lib/cn"`；showcase `import type { ShowcaseSpec } from "../showcase/types"`；Base UI `import { Checkbox as BaseCheckbox } from "@base-ui-components/react/checkbox"`、`import { RadioGroup as BaseRadioGroup } from "@base-ui-components/react/radio-group"`、`import { Radio as BaseRadio } from "@base-ui-components/react/radio"`；测试里跨组件 `import { Field } from "../field/field"`（与 Step 2 field.test 引 input 同例）。

**Base UI API（实测确认，spec §3）**：
- `Checkbox.Root`（渲染 `<span>`+隐藏 input，`extends FieldRoot.State`）props：`checked?`/`defaultChecked?`/`onCheckedChange?(checked,ev)`/`indeterminate?`/`disabled?`/`required?`/`name?`/`value?`/`id?`；data-* = `data-checked`/`data-unchecked`/`data-indeterminate`/`data-disabled`/`data-invalid`(Field 内)。`Checkbox.Indicator`：`render={(props,state)=>…}`，`state.indeterminate` 可读，默认未选卸载。
- `RadioGroup`（具名导出自 `radio-group`，渲染 `<div>`，`extends FieldRoot.State`，内置方向键）props：`value?:unknown`/`defaultValue?:unknown`/`onValueChange?(value:unknown,ev)`/`disabled?`/`required?`/`name?`。
- `Radio.Root`（渲染 `<span role="radio"`+隐藏 input）props：`value:any`(必填)/`disabled?`/`id?`；data-* = `data-checked`/`data-unchecked`/`data-disabled`。`Radio.Indicator`：默认未选卸载。
- ⚠️ **disabled 用 `data-[disabled]`**（span 非 button，`:disabled` 伪类不命中）。

**四件套**：`x.tsx`+`x.types.ts`+`x.showcase.tsx`(必 `"use client"`)+`x.test.tsx`+`index.ts`（桶导出组件/类型/showcase）。两组件本体都用 Base UI(client) → 都加 `"use client"`。

**门禁节奏**（沿用 Step 2 已验证模式）：
- 每个组件 Task 的 TDD 循环：`pnpm --filter @hulian/ui exec vitest run <名>`（先红后绿）。
- 每个组件 Task commit 前：`pnpm typecheck`（快，守类型/导出）。
- **完整三道门 + 生产 build 只在 D3 跑一次**：`pnpm typecheck && pnpm test && pnpm build --filter=www`（**build 必 `--filter=www`**——全包 build 撞 desktop tauri `beforeBuildCommand` 二次 build www 并发冲突，skill `turbo-monorepo-desktop-shell-beforebuild-double-builds-frontend`）。组件 Task 不单独 build。
- **Playwright 截图实测只在 D3**：每组件明暗两态各一张，存 cwd 根 `/Users/zhangzhiwei/Desktop/code/hulian/*.png`（**不在 .playwright-mcp/**），Read 看像素（不靠 `browser_evaluate` 读 DOM，会漏几何/显色 bug）。

**trunk-based**：直接在 master 小步 commit，无 remote、不 push。

---

## Task 0: 确认绿色基线

**Files:** 无（只读校验）

- [ ] **Step 1: 跑完整三道门，记录基线**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck && pnpm test && pnpm build --filter=www
```
Expected: 全绿（Step 2 收尾态 `4e974dc`）。**注意 lib 里已有 slider/alert 组件但未接 IA（后续批次存量）——若此处已红，先停下报告，是存量问题，不在本计划范围内修。** 记录结果作基线。

---

## Task D1: Checkbox（四件套，TDD）

**Files:**
- Create: `packages/ui/src/checkbox/checkbox.test.tsx`
- Create: `packages/ui/src/checkbox/checkbox.tsx`
- Create: `packages/ui/src/checkbox/checkbox.types.ts`
- Create: `packages/ui/src/checkbox/checkbox.showcase.tsx`
- Create: `packages/ui/src/checkbox/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 写 checkbox 测试（先红，守三态 + data-disabled + Field 串联）**

Create `packages/ui/src/checkbox/checkbox.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Checkbox } from "./checkbox";
import { Field } from "../field/field";

describe("Checkbox", () => {
  it("checked: 盒得 data-checked + 渲染勾(check)，不渲染横线", () => {
    const { container } = render(<Checkbox defaultChecked aria-label="c" />);
    expect(container.querySelector("[data-checked]")).toBeTruthy();
    expect(container.querySelector('[data-icon="check"]')).toBeTruthy();
    expect(container.querySelector('[data-icon="dash"]')).toBeNull();
  });

  it("indeterminate: data-indeterminate(不出 data-checked) + 隐藏 input.indeterminate=true + 渲染横线(dash)", () => {
    const { container } = render(<Checkbox indeterminate aria-label="c" />);
    expect(container.querySelector("[data-indeterminate]")).toBeTruthy();
    expect(container.querySelector("[data-checked]")).toBeNull();
    expect((container.querySelector("input") as HTMLInputElement).indeterminate).toBe(true);
    expect(container.querySelector('[data-icon="dash"]')).toBeTruthy();
    expect(container.querySelector('[data-icon="check"]')).toBeNull();
  });

  it("unchecked: data-unchecked + indicator 默认卸载(无 data-icon)", () => {
    const { container } = render(<Checkbox aria-label="c" />);
    expect(container.querySelector("[data-unchecked]")).toBeTruthy();
    expect(container.querySelector("[data-icon]")).toBeNull();
  });

  it("disabled 落 data-disabled(span 非 :disabled)，自定义 label 不泄漏成裸属性", () => {
    const { container, getByText } = render(<Checkbox disabled defaultChecked label="同意条款" />);
    const box = container.querySelector("[data-checked]")!;
    expect(box.getAttribute("data-disabled")).toBe("");
    expect(box.hasAttribute("label")).toBe(false);
    expect(getByText("同意条款")).toBeTruthy();
  });

  it("有 label 时外层 <label> 包裹，input 在 label 内（原生关联）", () => {
    const { container } = render(<Checkbox label="记住我" />);
    const labelEl = container.querySelector("label")!;
    expect(labelEl).toBeTruthy();
    expect(labelEl.textContent).toContain("记住我");
    expect(labelEl.querySelector("input")).toBeTruthy();
  });

  it("Field 串联: 嵌进 <Field error> → 盒得 data-invalid + error 文字真渲染", () => {
    const { container, getByText } = render(
      <Field error="必须勾选">
        <Checkbox label="同意" />
      </Field>,
    );
    expect(container.querySelector("[data-invalid]")).toBeTruthy();
    expect(getByText("必须勾选")).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulian/ui exec vitest run checkbox`
Expected: FAIL —— `./checkbox` 不存在。

- [ ] **Step 3: 实现 checkbox.types.ts**

Create `packages/ui/src/checkbox/checkbox.types.ts`:
```ts
import type { ReactNode } from "react";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** 第三态：半选（Base UI 原生 indeterminate）。 */
  indeterminate?: boolean;
  /** 瑚琏收敛签名（丢 Base UI 的 eventDetails，同 Switch 风格）。 */
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  /** 可选 inline label（盒右，<label> 原生关联）。 */
  label?: ReactNode;
  /** 落在盒子 Checkbox.Root。 */
  className?: string;
  "aria-label"?: string;
}
```

- [ ] **Step 4: 实现 checkbox.tsx**

Create `packages/ui/src/checkbox/checkbox.tsx`:
```tsx
"use client";
import { Checkbox as BaseCheckbox } from "@base-ui-components/react/checkbox";
import { cn } from "../lib/cn";
import type { CheckboxProps } from "./checkbox.types";

// 方盒皮肤：复用 Switch 配方（data-[checked] 驱动 + focus-visible:ring + 语义 token）。
// disabled 用 data-[disabled]（Root 是 span，不是 button → :disabled 伪类不命中）。
const boxClass = cn(
  "size-5 shrink-0 grid place-items-center rounded-[var(--radius)] border border-border bg-surface text-primary-foreground transition-colors outline-none",
  "data-[checked]:bg-primary data-[checked]:border-primary",
  "data-[indeterminate]:bg-primary data-[indeterminate]:border-primary",
  "data-[invalid]:border-danger",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
);

function CheckIcon() {
  return (
    <svg data-icon="check" viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DashIcon() {
  return (
    <svg data-icon="dash" viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5">
      <path d="M3.5 8h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Checkbox({ className, label, disabled, ...props }: CheckboxProps) {
  const box = (
    <BaseCheckbox.Root disabled={disabled} {...props} className={cn(boxClass, className)}>
      <BaseCheckbox.Indicator
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>{state.indeterminate ? <DashIcon /> : <CheckIcon />}</span>
        )}
      />
    </BaseCheckbox.Root>
  );

  if (!label) return box;

  return (
    <label className="inline-flex items-center gap-2">
      {box}
      <span className={cn("text-sm text-foreground select-none", disabled && "opacity-50")}>{label}</span>
    </label>
  );
}
```

> 若 `render={(indicatorProps, state) => <span {...indicatorProps}>…}` typecheck 报 props 类型不兼容：把 `indicatorProps` 断言 `as React.HTMLAttributes<HTMLSpanElement>` 再 spread（Base UI RenderFunctionProps 偏宽）。

- [ ] **Step 5: 实现 checkbox.showcase.tsx**

Create `packages/ui/src/checkbox/checkbox.showcase.tsx`:
```tsx
"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Checkbox } from "./checkbox";
import { Field } from "../field/field";

const STATE_MAP: Record<string, { checked: boolean; indeterminate: boolean }> = {
  未选: { checked: false, indeterminate: false },
  已选: { checked: true, indeterminate: false },
  半选: { checked: false, indeterminate: true },
};

function CheckboxPlayground(p: Record<string, unknown>) {
  const init = STATE_MAP[(p.state as string) ?? "未选"] ?? STATE_MAP["未选"];
  const [checked, setChecked] = useState(init.checked);
  const [indeterminate, setIndeterminate] = useState(init.indeterminate);
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={(c) => {
        setChecked(c);
        setIndeterminate(false); // 半选点一下消解为确定态
      }}
      disabled={p.disabled as boolean}
      label={p.label as string}
    />
  );
}

export const checkboxShowcase: ShowcaseSpec = {
  controls: [
    { prop: "state", type: "select", options: ["未选", "已选", "半选"], defaultValue: "未选", label: "初始态" },
    { prop: "label", type: "text", defaultValue: "同意条款", label: "label" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "unchecked", render: () => <Checkbox aria-label="unchecked" /> },
    { name: "checked", render: () => <Checkbox defaultChecked aria-label="checked" /> },
    { name: "indeterminate", render: () => <Checkbox indeterminate aria-label="indeterminate" /> },
    { name: "with-label", render: () => <Checkbox defaultChecked label="记住我" /> },
    { name: "disabled", render: () => <Checkbox disabled label="禁用" /> },
    { name: "disabled-checked", render: () => <Checkbox disabled defaultChecked label="禁用已选" /> },
    {
      name: "in-field",
      render: () => (
        <Field label="服务条款" error="必须勾选才能继续" className="w-72">
          <Checkbox label="我已阅读并同意" />
        </Field>
      ),
    },
  ],
  // key=state → select 改变时 remount 重置初始态；label/disabled 经 props 即时生效。
  renderWithProps: (p) => <CheckboxPlayground key={p.state as string} {...p} />,
  toCode: (p) => {
    const s = p.state as string;
    const tri = s === "已选" ? " defaultChecked" : s === "半选" ? " indeterminate" : "";
    return `<Checkbox${tri}${p.disabled ? " disabled" : ""} label="${p.label}" />`;
  },
};
```

- [ ] **Step 6: 实现 index.ts 桶导出**

Create `packages/ui/src/checkbox/index.ts`:
```ts
export { Checkbox } from "./checkbox";
export type { CheckboxProps } from "./checkbox.types";
export { checkboxShowcase } from "./checkbox.showcase";
```

- [ ] **Step 7: 主 index 导出 checkbox**

在 `packages/ui/src/index.ts` 组件区 `export * from "./field";`（第 11 行）之后加一行:
```ts
export * from "./checkbox";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulian/ui exec vitest run checkbox`
Expected: PASS（六条用例全绿，尤其 `input.indeterminate===true` + `data-icon` 勾/横线分支 + Field `data-invalid`）。

- [ ] **Step 9: typecheck + Commit**

Run: `pnpm typecheck`
Expected: 无错。
```bash
git add packages/ui/src/checkbox packages/ui/src/index.ts
git commit -m "feat(ui): Checkbox 组件(Base UI 三态 + indeterminate render 分支勾/横线 + inline label + Field 串联)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task D2: Radio + RadioGroup（四件套，TDD）

**Files:**
- Create: `packages/ui/src/radio/radio.test.tsx`
- Create: `packages/ui/src/radio/radio.tsx`
- Create: `packages/ui/src/radio/radio.types.ts`
- Create: `packages/ui/src/radio/radio.showcase.tsx`
- Create: `packages/ui/src/radio/index.ts`
- Modify: `packages/ui/src/index.ts`

> 工程注记：单颗 Radio 离不开 RadioGroup（共一张文档页/一个 slug），故同文件夹双导出。方向键导航由 Base UI RadioGroup 内置，不手写。受控 `onValueChange` 用 `(v) => onValueChange(v as string)` 包一层（Base UI 签名是 `(value: unknown, ev)`，strictFunctionTypes 下不可直接把 `(v:string)=>void` 赋给 `unknown` 形参）。

- [ ] **Step 1: 写 radio 测试（先红，守互斥/受控/中心点/orientation/Field 串联）**

Create `packages/ui/src/radio/radio.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { RadioGroup, Radio } from "./radio";
import { Field } from "../field/field";

describe("RadioGroup / Radio", () => {
  it("单选互斥: defaultValue 选中项 data-checked，其余 data-unchecked", () => {
    const { container } = render(
      <RadioGroup defaultValue="b" aria-label="g">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    const radios = container.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(2);
    expect(radios[0].getAttribute("data-checked")).toBeNull();
    expect(radios[0].getAttribute("data-unchecked")).toBe("");
    expect(radios[1].getAttribute("data-checked")).toBe("");
  });

  it("受控 onValueChange: 点击未选项回调新值", () => {
    const seen: string[] = [];
    const { container } = render(
      <RadioGroup value="a" onValueChange={(v) => seen.push(v)} aria-label="g">
        <Radio value="a" label="甲" />
        <Radio value="b" label="乙" />
      </RadioGroup>,
    );
    const radios = container.querySelectorAll('[role="radio"]');
    fireEvent.click(radios[1]);
    expect(seen).toContain("b");
  });

  it("仅选中项渲染中心点(indicator 默认未选卸载)", () => {
    const { container } = render(
      <RadioGroup defaultValue="a" aria-label="g">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    expect(container.querySelectorAll('[data-icon="dot"]').length).toBe(1);
  });

  it("orientation=horizontal 用横向布局类", () => {
    const { container } = render(
      <RadioGroup orientation="horizontal" aria-label="g">
        <Radio value="a" label="A" />
      </RadioGroup>,
    );
    expect((container.firstElementChild as HTMLElement).className).toContain("flex-row");
  });

  it("RadioGroup disabled 下发子 Radio → data-disabled", () => {
    const { container } = render(
      <RadioGroup disabled defaultValue="a" aria-label="g">
        <Radio value="a" label="A" />
      </RadioGroup>,
    );
    expect(container.querySelector('[role="radio"][data-disabled]')).toBeTruthy();
  });

  it("Field 串联: RadioGroup 嵌 <Field error> → 得 data-invalid + error 文字真渲染", () => {
    const { container, getByText } = render(
      <Field label="性别" error="请选择一项">
        <RadioGroup defaultValue="m">
          <Radio value="m" label="男" />
          <Radio value="f" label="女" />
        </RadioGroup>
      </Field>,
    );
    expect(container.querySelector("[data-invalid]")).toBeTruthy();
    expect(getByText("请选择一项")).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulian/ui exec vitest run radio`
Expected: FAIL —— `./radio` 不存在。

- [ ] **Step 3: 实现 radio.types.ts**

Create `packages/ui/src/radio/radio.types.ts`:
```ts
import type { ReactNode } from "react";

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  /** 仅控布局，默认 vertical。 */
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

export interface RadioProps {
  /** 必填，标识该选项。 */
  value: string;
  disabled?: boolean;
  /** 可选 inline label（点右，<label> 原生关联）。 */
  label?: ReactNode;
  id?: string;
  /** 落在点 Radio.Root。 */
  className?: string;
}
```

- [ ] **Step 4: 实现 radio.tsx**

Create `packages/ui/src/radio/radio.tsx`:
```tsx
"use client";
import { RadioGroup as BaseRadioGroup } from "@base-ui-components/react/radio-group";
import { Radio as BaseRadio } from "@base-ui-components/react/radio";
import { cn } from "../lib/cn";
import type { RadioGroupProps, RadioProps } from "./radio.types";

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <BaseRadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (v) => onValueChange(v as string) : undefined}
      {...props}
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row flex-wrap gap-4" : "flex-col gap-2",
        className,
      )}
    >
      {children}
    </BaseRadioGroup>
  );
}

// 圈皮肤：复用 Switch 配方。disabled 用 data-[disabled]（Root 是 span）。
const dotClass = cn(
  "size-5 shrink-0 grid place-items-center rounded-full border border-border bg-surface transition-colors outline-none",
  "data-[checked]:border-primary",
  "data-[invalid]:border-danger",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
);

export function Radio({ value, disabled, label, id, className }: RadioProps) {
  const dot = (
    <BaseRadio.Root value={value} disabled={disabled} id={id} className={cn(dotClass, className)}>
      <BaseRadio.Indicator data-icon="dot" className="size-2.5 rounded-full bg-primary" />
    </BaseRadio.Root>
  );

  if (!label) return dot;

  return (
    <label className="inline-flex items-center gap-2">
      {dot}
      <span className={cn("text-sm text-foreground select-none", disabled && "opacity-50")}>{label}</span>
    </label>
  );
}
```

> 若 Step 8 中受控 onValueChange 测试不回调（jsdom 下 `fireEvent.click(role=radio)` 未触发选择）：改点隐藏 input —— `fireEvent.click(container.querySelectorAll('input[type="radio"]')[1])`。先按 role=radio 跑，红了再换。

- [ ] **Step 5: 实现 radio.showcase.tsx**

Create `packages/ui/src/radio/radio.showcase.tsx`:
```tsx
"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { RadioGroup, Radio } from "./radio";
import { Field } from "../field/field";

function RadioPlayground(p: Record<string, unknown>) {
  const [value, setValue] = useState("standard");
  return (
    <RadioGroup
      value={value}
      onValueChange={setValue}
      orientation={p.orientation as "vertical" | "horizontal"}
      disabled={p.disabled as boolean}
      aria-label="plan"
    >
      <Radio value="standard" label="标准" />
      <Radio value="pro" label="专业" />
      <Radio value="max" label="旗舰" />
    </RadioGroup>
  );
}

export const radioShowcase: ShowcaseSpec = {
  controls: [
    { prop: "orientation", type: "select", options: ["vertical", "horizontal"], defaultValue: "vertical", label: "排列" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    {
      name: "vertical",
      render: () => (
        <RadioGroup defaultValue="b" aria-label="v">
          <Radio value="a" label="选项一" />
          <Radio value="b" label="选项二" />
          <Radio value="c" label="选项三(禁用)" disabled />
        </RadioGroup>
      ),
    },
    {
      name: "horizontal",
      render: () => (
        <RadioGroup orientation="horizontal" defaultValue="m" aria-label="h">
          <Radio value="m" label="男" />
          <Radio value="f" label="女" />
        </RadioGroup>
      ),
    },
    {
      name: "in-field",
      render: () => (
        <Field label="套餐" error="请选择一个套餐" className="w-72">
          <RadioGroup defaultValue="">
            <Radio value="basic" label="基础版" />
            <Radio value="plus" label="增强版" />
          </RadioGroup>
        </Field>
      ),
    },
  ],
  renderWithProps: (p) => <RadioPlayground {...p} />,
  toCode: (p) =>
    `<RadioGroup orientation="${p.orientation}"${p.disabled ? " disabled" : ""} defaultValue="standard">\n  <Radio value="standard" label="标准" />\n  <Radio value="pro" label="专业" />\n</RadioGroup>`,
};
```

- [ ] **Step 6: 实现 index.ts**

Create `packages/ui/src/radio/index.ts`:
```ts
export { RadioGroup, Radio } from "./radio";
export type { RadioGroupProps, RadioProps } from "./radio.types";
export { radioShowcase } from "./radio.showcase";
```

- [ ] **Step 7: 主 index 导出 radio**

在 `packages/ui/src/index.ts` 组件区 `export * from "./checkbox";` 之后加一行:
```ts
export * from "./radio";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulian/ui exec vitest run radio`
Expected: PASS（六条用例全绿；若受控点击未回调，按 Step 4 注记换点 input）。

- [ ] **Step 9: typecheck + Commit**

Run: `pnpm typecheck`
Expected: 无错。
```bash
git add packages/ui/src/radio packages/ui/src/index.ts
git commit -m "feat(ui): Radio + RadioGroup 组件(Base UI 单选组 + 键盘方向键 + 中心点 Indicator + inline label + Field 串联)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task D3: 接 IA + 验收（manifest/registry + 三道门 + Playwright）

**Files:**
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`

- [ ] **Step 1: manifest 追加 2 条**

在 `apps/www/lib/manifest.ts` 的 `manifest` 数组里、`field` 条目后追加（均 `category:"inputs"`,`status:"new"`）:
```ts
  { slug: "checkbox", name: "Checkbox", description: "复选框 · 三态(含半选) + Base UI", category: "inputs", status: "new" },
  { slug: "radio", name: "Radio", description: "单选 · RadioGroup 单选组 + 键盘方向键", category: "inputs", status: "new" },
```

- [ ] **Step 2: registry 追加 2 import + 2 map**

修改 `apps/www/lib/registry.tsx`——import 块加 2 个名（紧跟 `fieldShowcase,` 后）、map 加 2 行（紧跟 `field: fieldShowcase,` 后）:
```tsx
  checkboxShowcase,
  radioShowcase,
```
```tsx
  checkbox: checkboxShowcase,
  radio: radioShowcase,
```

- [ ] **Step 3: 跑契约测试（验证 manifest↔registry 一致）**

Run: `pnpm --filter www exec vitest run manifest`
Expected: PASS —— 12 个 slug 双边齐全、无孤儿/缺失。

- [ ] **Step 4: 跑完整三道门**

Run:
```bash
pnpm typecheck && pnpm test && pnpm build --filter=www
```
Expected: 全绿；SSG 生成 `/components` + 12 个 `/components/[slug]`（含 checkbox/radio）。

- [ ] **Step 5: 浏览器实测（Playwright 截图明暗两态 + 像素 Read）**

先确认 dev 实例：若桌面 app 已在 5514 跑（`pnpm app`），直接用 `http://localhost:5514`；否则 `pnpm dev`（www 起于 5512）用 5512（Next 16 按项目目录去重，5514 在跑时别另起 5512，见 skill `nextjs-16-dev-server-dedupes-by-project-dir-not-port`）。

用 Playwright 逐个访问 `/components/checkbox`、`/components/radio`，每个**明暗两态各截一张**，存到 `/Users/zhangzhiwei/Desktop/code/hulian/`（如 `step3-checkbox-light.png`/`step3-checkbox-dark.png`/`step3-radio-light.png`/`step3-radio-dark.png`），**Read 每张图看像素**逐项确认：
- 左树「表单录入」分组新增 Checkbox/Radio（带 `new` 标记）；
- **Checkbox** states gallery：unchecked 空盒（border-border）；checked 盒填 `bg-primary` + 白勾居中；**indeterminate 盒填 `bg-primary` + 白横线居中**（三态像素自证）；with-label 文字基线与盒对齐；disabled 整体变暗；in-field 态 group label「服务条款」在上、错误「必须勾选才能继续」红字在下、盒描边 danger。
- **Radio** states gallery：vertical 三项纵排、选中项主色描边圈 + 主色实心中心点、未选空心圈、disabled 项变暗；horizontal 两项横排；in-field 态 group label「套餐」+ 红错误「请选择一个套餐」。
- **focus ring**：用 Playwright 键盘 `Tab` 聚焦一个 checkbox/radio，截图确认 `ring-ring` 焦点环出现（若 Root span 不接受焦点导致环不显，回退皮肤加 `has-[:focus-visible]:ring-2 …` 兜底，记录）。
- **键盘方向键**：在 radio 组聚焦后按 `ArrowDown`/`ArrowRight`，确认选中项随方向键迁移（Base UI 内置）。
- 全程右上明暗开关切换，两组件同步换肤、无白闪；桌面 app(5514) 加载正常。

> 若 invalid 红态/ring 异常（透明/不显色）：回查 `border-danger`/`ring-ring` 是否生成（`grep -rn "color-danger\|color-ring" packages/tokens/src/preset.css`）；token 在但类不生成则记录并临时回退。

- [ ] **Step 6: Commit**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): 选择族(Checkbox/Radio)接入 IA，Step 3 收口(12 组件)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完成标志（本计划 = spec D1–D3）

- 左侧组件树「表单录入」分组新增 Checkbox/Radio（`new` 标记），各自 `/components/[slug]` 独立 SSG 页。
- Checkbox 四件套齐：三态（unchecked/checked/**indeterminate**）皮肤正确、inline label 原生关联、disabled 经 `data-[disabled]` 暗化、focus ring、Field 内 `data-invalid` 串联 + error 文字出。
- Radio 四件套齐：RadioGroup 单选互斥、**键盘方向键可切**、选中圈+中心点、inline label、disabled 下发、Field 内 group label+error。
- 三道门（typecheck + test + `build --filter=www`）全绿；契约测试 12 slug 双边齐全；桌面 app(5514) 正常。
- Playwright 明暗两态像素实测无异常（indeterminate 横线 / checked 勾 / 单选中心点 / focus ring / 方向键切选）。
- 只消费语义 token、`"use client"` 正确、未引新依赖、未改 `ShowcaseSpec` 类型、未动 Field、未回写主 spec §4（§4 本就 Base UI）。

---

## Self-Review（plan 对 spec 的覆盖核查）

**1. Spec coverage**：
- spec §2 裁决 → 全 Base UI(D1/D2 import)、2 slug radio 文件夹双导出(D2)、复用 Switch 皮肤(boxClass/dotClass)、`data-[disabled]`(boxClass/dotClass)、indeterminate render 分支(D1 Step4)、inline label(D1/D2)、Field 串联(D1/D2 测试+showcase)、select 表达 indeterminate(D1 showcase)、无 §4 回写(D3 无该步) ✓
- spec §3 API 实测 → 约定速查贴全 + 各实现对齐 ✓
- spec §4.1 Checkbox 皮肤/三态/Indicator/label → D1 ✓；§4.2 Radio/RadioGroup → D2 ✓
- spec §5 Field 串联(per-control label + group-level Field + 零改动 + data-invalid 测试) → D1/D2 测试6 + showcase in-field ✓
- spec §6 showcase 不改类型(select 三态 + key 重置) → D1 showcase ✓
- spec §7 token/a11y/data-attr/四件套/端口/data-[disabled] → 约定速查 + 各实现 ✓
- spec §8 接 IA(manifest/registry +2) → D3 Step1/2 ✓
- spec §9 分步 D1/D2/D3 + 三道门 --filter=www + Playwright → 全覆盖 ✓
- spec §10 验收 → 完成标志 ✓；§11 YAGNI(不做 parent/size/ref/类型改/Field 改/§4 回写/图标库/readOnly) → File Structure 限定 + 不出现这些 ✓

**2. Placeholder scan**：无 TBD/TODO；每个 code step 含完整可跑代码；两处「若…则」是带具体命令的回退分支（render 断言 / fireEvent 换 input / focus-visible 兜底），非占位。✓

**3. Type consistency**：`CheckboxProps`/`RadioGroupProps`/`RadioProps`/`checkboxShowcase`/`radioShowcase` 跨 Task 命名一致；registry import 名（checkboxShowcase/radioShowcase）与各 index.ts 桶导出名一致；manifest slug(checkbox/radio) 与 registry map key 一致；`data-icon="check"/"dash"/"dot"` 在实现与测试两侧一致；`onValueChange` 包装签名 `(v)=>onValueChange(v as string)` 与 types 的 `(value:string)=>void` 一致。✓
```
