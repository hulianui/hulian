# Issue #326 Text Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `Text` express sans/mono family and tabular numeric glyphs through stable semantic props.

**Architecture:** Extend the existing static class-map pipeline with a `TextFamily` map and one conditional numeric class. Omitted family emits no class so typography continues to inherit; memoization, RSC compatibility, polymorphism, and className ordering stay unchanged.

**Tech Stack:** React 19, TypeScript, Tailwind CSS utilities, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-24-consumer-gap-issues-323-328-design.md`

## Global Constraints

- Use Node `22.22.3` from `.nvmrc` and pnpm `8.15.5`.
- `family` is exactly `"sans" | "mono"`; undefined must inherit and emit no font-family class.
- `numeric={true}` maps to `tabular-nums`; false/undefined emits no numeric class.
- Preserve default `<p>`, size/tone/weight defaults, lineClamp precedence, memoization, and RSC compatibility.
- Follow red → green → refactor and mutation-check both mappings.

---

### Task 1: Add typography types and red tests

**Files:**
- Modify: `packages/ui/src/text/text.types.ts`
- Modify: `packages/ui/src/text/text.test.tsx`

**Interfaces:**
- Consumes: existing `TextOwnProps` and polymorphic `TextProps`.
- Produces: public `TextFamily`, `family?: TextFamily`, `numeric?: boolean`.

- [ ] **Step 1: Extend the public types**

```ts
export type TextFamily = "sans" | "mono";

export interface TextOwnProps {
  className?: string;
  size?: TextSize;
  tone?: TextTone;
  weight?: TextWeight;
  /** 字族；不传时继承。 */
  family?: TextFamily;
  /** 使用等宽数字。@default false */
  numeric?: boolean;
  truncate?: boolean;
  lineClamp?: number;
  children?: ReactNode;
}
```

- [ ] **Step 2: Add exact behavior tests**

```tsx
describe("Text typography (#326)", () => {
  it("family 映射 sans 与 mono", () => {
    render(
      <>
        <Text family="sans">正文</Text>
        <Text family="mono">代码</Text>
      </>,
    );
    expect(screen.getByText("正文").className).toContain("font-sans");
    expect(screen.getByText("代码").className).toContain("font-mono");
  });

  it("family 缺省时不抢祖先字族", () => {
    render(<Text>继承</Text>);
    const cls = screen.getByText("继承").className;
    expect(cls).not.toContain("font-sans");
    expect(cls).not.toContain("font-mono");
  });

  it("numeric 只在 true 时添加 tabular-nums", () => {
    const { rerender } = render(<Text numeric>1024.50</Text>);
    expect(screen.getByText("1024.50").className).toContain("tabular-nums");
    rerender(<Text numeric={false}>1024.50</Text>);
    expect(screen.getByText("1024.50").className).not.toContain("tabular-nums");
  });

  it("family/numeric 与现有排版 prop 可组合", () => {
    render(<Text family="mono" numeric size="sm" weight="semibold">42</Text>);
    const cls = screen.getByText("42").className;
    expect(cls).toContain("font-mono");
    expect(cls).toContain("tabular-nums");
    expect(cls).toContain("text-sm");
    expect(cls).toContain("font-semibold");
  });
});
```

Add `screen` to the existing Testing Library import.

- [ ] **Step 3: Run focused tests and verify red**

```bash
source /Users/zhangzhiwei/.nvm/nvm.sh
nvm use --silent
pnpm --filter @hulianui/ui exec vitest run src/text/text.test.tsx --project unit
```

Expected: FAIL because the new props are not consumed and expected classes are absent.

### Task 2: Implement the static mappings

**Files:**
- Modify: `packages/ui/src/text/text.tsx`

**Interfaces:**
- Consumes: `TextFamily` and new props from Task 1.
- Produces: `font-sans`, `font-mono`, and `tabular-nums` class output.

- [ ] **Step 1: Import `TextFamily` and define the map**

```ts
const FAMILY: Record<TextFamily, string> = {
  sans: "font-sans",
  mono: "font-mono",
};
```

- [ ] **Step 2: Consume the props without adding defaults**

Add `family` and `numeric = false` to `TextImpl` destructuring, then extend `cn` between weight and truncation:

```tsx
className={cn(
  SIZE[size],
  TONE[tone],
  WEIGHT[weight],
  family && FAMILY[family],
  numeric && "tabular-nums",
  truncate && !lineClamp && "truncate",
  className,
)}
```

- [ ] **Step 3: Run focused tests and typecheck**

```bash
pnpm --filter @hulianui/ui exec vitest run src/text/text.test.tsx --project unit
pnpm --filter @hulianui/ui typecheck
```

Expected: all Text tests PASS, including the existing memo and no-`use client` assertions.

- [ ] **Step 4: Perform both mutation checks**

First temporarily map `mono` to `font-sans`; confirm the family test fails, then restore. Next temporarily remove `numeric && "tabular-nums"`; confirm the numeric test fails, restore, and rerun to PASS.

### Task 3: Export and document typography semantics

**Files:**
- Modify: `packages/ui/src/text/index.ts`
- Modify: `packages/ui/src/text/text.md`
- Modify: `packages/ui/src/text/text.en.md`
- Modify: `packages/ui/src/text/text.showcase.tsx`

**Interfaces:**
- Consumes: `TextFamily` and implemented props.
- Produces: package-root type export, bilingual API docs, visual examples.

- [ ] **Step 1: Export `TextFamily`**

```ts
export type { TextProps, TextSize, TextTone, TextWeight, TextFamily } from "./text.types";
```

- [ ] **Step 2: Add exact examples and prop-table entries in both locales**

```tsx
<Text family="mono">pnpm add @hulianui/ui</Text>
<Text numeric>12,345.67</Text>
<Text family="mono" numeric>2026-08-24 09:30</Text>
```

State explicitly that omitting `family` inherits the surrounding font. The English page uses the same API and equivalent English descriptions.

- [ ] **Step 3: Add a showcase comparison**

Show sans and mono labels plus two rows of changing-width numbers with and without `numeric`, using only `Text` props for the new semantics.

- [ ] **Step 4: Regenerate and verify**

```bash
pnpm llms-registry
pnpm conventions
pnpm --filter @hulianui/ui exec vitest run src/text/text.test.tsx --project unit
pnpm --filter @hulianui/ui typecheck
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit only Issue #326 files**

```bash
git add packages/ui/src/text
git diff --cached --check
git commit -m "feat(ui): add Text typography semantics (#326)"
```

Expected: one self-contained Text commit.
