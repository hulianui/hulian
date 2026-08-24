# Issue #324 StackItem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a polymorphic `StackItem` that expresses flex growth, shrink protection, and `min-width: 0` without consumer utility classes.

**Architecture:** Keep `StackItem` in the existing Stack module and reuse its polymorphic prop helper and `cn`. It is a context-free wrapper: omitted props emit no flex-child sizing classes, while explicit props map to a fixed class vocabulary.

**Tech Stack:** React 19, TypeScript, Tailwind CSS utilities, Vitest, Testing Library, Hulian registry/docs generators.

**Spec:** `docs/superpowers/specs/2026-08-24-consumer-gap-issues-323-328-design.md`

## Global Constraints

- Use Node `22.22.3` from `.nvmrc` and pnpm `8.15.5`.
- `grow={true}` maps only to `flex-1`; false/undefined adds no growth class.
- `shrink={false}` maps only to `shrink-0`; true/undefined preserves browser defaults.
- `minWidth={0}` maps only to `min-w-0`; no `"auto"` enum is added.
- `StackItem` defaults to `div` and preserves polymorphic `as` prop/ref inference.
- Follow red → green → refactor and perform a mutation check before committing.
- Do not change existing `Stack` behavior.

---

### Task 1: Add the public StackItem contract and red tests

**Files:**
- Modify: `packages/ui/src/stack/stack.types.ts`
- Modify: `packages/ui/src/stack/stack.test.tsx`

**Interfaces:**
- Consumes: `PolymorphicProps<E, OwnProps>` from `packages/ui/src/lib/polymorphic.ts`.
- Produces: `StackItemOwnProps` and `StackItemProps<E extends ElementType = "div">`.

- [ ] **Step 1: Add the exact public types**

```ts
export interface StackItemOwnProps {
  /** 占用主轴剩余空间。true -> flex-1。 */
  grow?: boolean;
  /** 是否允许收缩。false -> shrink-0；true/undefined 保持浏览器默认。 */
  shrink?: boolean;
  /** 允许 flex 子项内容收缩。0 -> min-w-0。 */
  minWidth?: 0;
  children?: ReactNode;
  className?: string;
}

export type StackItemProps<E extends ElementType = "div"> =
  PolymorphicProps<E, StackItemOwnProps>;
```

- [ ] **Step 2: Write runtime tests that import the not-yet-created component**

Add `StackItem` to the local import and add:

```tsx
describe("StackItem (#324)", () => {
  it("默认只渲染 div，不添加 flex 子项尺寸类", () => {
    const { container } = render(<StackItem>正文</StackItem>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el.className).not.toContain("flex-1");
    expect(el.className).not.toContain("shrink-0");
    expect(el.className).not.toContain("min-w-0");
  });

  it("把 grow / shrink=false / minWidth=0 映射为固定类", () => {
    const { container } = render(<StackItem grow shrink={false} minWidth={0} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("flex-1");
    expect(el.className).toContain("shrink-0");
    expect(el.className).toContain("min-w-0");
  });

  it("显式默认值不添加尺寸类，且 className 透传", () => {
    const { container } = render(<StackItem grow={false} shrink className="consumer-item" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toBe("consumer-item");
  });

  it("as 透传渲染标签", () => {
    const { container } = render(<StackItem as="section" />);
    expect(container.firstElementChild?.tagName).toBe("SECTION");
  });
});
```

- [ ] **Step 3: Add compile-time polymorphic assertions**

```tsx
function _typeCheckStackItemAsButton() {
  return (
    <StackItem
      as="button"
      type="button"
      onClick={(event) => {
        const button: HTMLButtonElement = event.currentTarget;
        void button.form;
      }}
    />
  );
}
void _typeCheckStackItemAsButton;
```

- [ ] **Step 4: Run the focused test and verify red**

Run:

```bash
source /Users/zhangzhiwei/.nvm/nvm.sh
nvm use --silent
pnpm --filter @hulianui/ui exec vitest run src/stack/stack.test.tsx --project unit
```

Expected: FAIL because `StackItem` is not exported from `./stack`.

### Task 2: Implement the minimal StackItem

**Files:**
- Modify: `packages/ui/src/stack/stack.tsx`

**Interfaces:**
- Consumes: `StackItemProps<E>` from Task 1 and `cn`.
- Produces: named React component `StackItem`.

- [ ] **Step 1: Import `StackItemProps` and add the implementation**

```tsx
export function StackItem<E extends ElementType = "div">({
  grow,
  shrink,
  minWidth,
  as,
  className,
  ...props
}: StackItemProps<E>) {
  const Comp = (as ?? "div") as ElementType;
  return (
    <Comp
      className={cn(grow && "flex-1", shrink === false && "shrink-0", minWidth === 0 && "min-w-0", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Run the focused test and typecheck**

```bash
pnpm --filter @hulianui/ui exec vitest run src/stack/stack.test.tsx --project unit
pnpm --filter @hulianui/ui typecheck
```

Expected: all Stack tests PASS and TypeScript accepts the button-specific assertion.

- [ ] **Step 3: Perform the mutation check**

Temporarily change `grow && "flex-1"` to `grow && "grow"`, rerun the focused test, and confirm the mapping test fails on missing `flex-1`. Restore the implementation and rerun to PASS.

### Task 3: Export and document StackItem

**Files:**
- Modify: `packages/ui/src/stack/index.ts`
- Modify: `packages/ui/src/stack/stack.md`
- Modify: `packages/ui/src/stack/stack.en.md`
- Modify: `packages/ui/src/stack/stack.showcase.tsx`

**Interfaces:**
- Consumes: `StackItem`, `StackItemProps`, `StackItemOwnProps` from Tasks 1–2.
- Produces: package-root exports through the existing `export * from "./stack"` in `packages/ui/src/index.ts`.

- [ ] **Step 1: Extend the module exports**

```ts
export { Stack, StackItem } from "./stack";
export type {
  StackProps,
  StackItemProps,
  StackItemOwnProps,
  StackAlign,
  StackJustify,
} from "./stack.types";
```

- [ ] **Step 2: Add the documented consumer example in both locales**

```tsx
<Stack direction="row" align="center" gap={3}>
  <StackItem grow minWidth={0}>
    <Text truncate>一段需要为右侧操作让出空间的长标题</Text>
  </StackItem>
  <StackItem shrink={false}>
    <Button>操作</Button>
  </StackItem>
</Stack>
```

The English page uses equivalent English prose and the same API. Add prop-table rows with the exact defaults and class semantics from the spec.

- [ ] **Step 3: Add a visible showcase section**

Use the same two-column example with a long title, a growing/min-width-zero content item, and a non-shrinking action. Import `StackItem` from the local module rather than reproducing its classes in the showcase.

- [ ] **Step 4: Regenerate registry/LLM data and run focused verification**

```bash
pnpm llms-registry
pnpm conventions
pnpm --filter @hulianui/ui exec vitest run src/stack/stack.test.tsx --project unit
pnpm --filter @hulianui/ui typecheck
git diff --check
```

Expected: generators exit 0, focused tests/typecheck pass, and no whitespace errors are reported.

- [ ] **Step 5: Review and commit only Issue #324 files**

```bash
git status --short
git diff -- packages/ui/src/stack
git add packages/ui/src/stack
git diff --cached --check
git commit -m "feat(ui): add StackItem flex sizing (#324)"
```

Expected: one commit containing only Stack source, tests, docs, showcase, and module exports. Generated ignored artifacts remain unstaged.
