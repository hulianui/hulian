# Issue #325 Card Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add coherent `sm`/`md` Card density and let CardBody typography inherit from its content context.

**Architecture:** Keep Card server-compatible and propagate size from the root with direct-child `data-slot` selectors, matching the existing `divided` design. Header, Body, and Footer remain context-free; nested cards are isolated by the direct-child combinator.

**Tech Stack:** React 19, TypeScript, class-variance-authority, Tailwind CSS utilities, Vitest, Testing Library, Chromium browser tests.

**Spec:** `docs/superpowers/specs/2026-08-24-consumer-gap-issues-323-328-design.md`

## Global Constraints

- Use Node `22.22.3` from `.nvmrc` and pnpm `8.15.5`.
- `size` is exactly `"sm" | "md"` with default `"md"`.
- `md` preserves current spacing: Header/Footer `px-5 py-3`, Body `px-5 py-4`.
- `sm` uses Header/Footer `px-4 py-2.5`, Body `px-4 py-3`.
- CardBody must not emit `text-sm`; Header title/description and Footer typography remain unchanged.
- Do not introduce React context or a client boundary.
- Follow red → green → refactor and mutation-check the selector mapping.

---

### Task 1: Define CardSize and write red density tests

**Files:**
- Modify: `packages/ui/src/card/card.types.ts`
- Modify: `packages/ui/src/card/card.test.tsx`

**Interfaces:**
- Consumes: existing `CardProps`, `CardHeader`, `CardBody`, `CardFooter`.
- Produces: public `CardSize` and `CardProps.size?: CardSize`.

- [ ] **Step 1: Add the exact type contract**

```ts
export type CardSize = "sm" | "md";

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** 整卡密度。@default "md" */
  size?: CardSize;
  // Keep the existing documented divided?: boolean field unchanged below this addition.
}
```

Add `CardSize` above the existing interface and insert `size` before the existing fully documented `divided` field; do not replace or shorten the `divided` documentation.

- [ ] **Step 2: Add direct-child selector tests**

```tsx
describe("Card size (#325)", () => {
  const renderCard = (size?: "sm" | "md") =>
    render(
      <Card size={size}>
        <CardHeader>标题</CardHeader>
        <CardBody>正文</CardBody>
        <CardFooter>页脚</CardFooter>
      </Card>,
    );

  it("默认 md 保持三个分区现有 padding", () => {
    const { container } = renderCard();
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("[&>[data-slot=card-header]]:px-5");
    expect(root.className).toContain("[&>[data-slot=card-body]]:py-4");
    expect(root.className).toContain("[&>[data-slot=card-footer]]:px-5");
  });

  it("sm 同时收紧 header/body/footer", () => {
    const { container } = renderCard("sm");
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain("[&>[data-slot=card-header]]:px-4");
    expect(cls).toContain("[&>[data-slot=card-header]]:py-2.5");
    expect(cls).toContain("[&>[data-slot=card-body]]:px-4");
    expect(cls).toContain("[&>[data-slot=card-body]]:py-3");
    expect(cls).toContain("[&>[data-slot=card-footer]]:px-4");
    expect(cls).toContain("[&>[data-slot=card-footer]]:py-2.5");
  });

  it("CardBody 不再强制 text-sm", () => {
    const { container } = render(<CardBody className="text-lg">正文</CardBody>);
    const body = container.firstElementChild as HTMLElement;
    expect(body.className).not.toContain("text-sm");
    expect(body.className).toContain("text-lg");
  });

  it("size 不透传为 DOM attribute", () => {
    const { container } = render(<Card size="sm" />);
    expect((container.firstElementChild as HTMLElement).hasAttribute("size")).toBe(false);
  });
});
```

Update the existing “className 与分隔线口径不受影响” test to render `CardHeader` inside `Card`: assert the Header still has `border-b` and `my-header`, and assert the Card root contains `[&>[data-slot=card-header]]:px-5`. Remove its obsolete assertion that Header itself owns `px-5`.

- [ ] **Step 3: Run the focused test and verify red**

```bash
source /Users/zhangzhiwei/.nvm/nvm.sh
nvm use --silent
pnpm --filter @hulianui/ui exec vitest run src/card/card.test.tsx --project unit
```

Expected: FAIL because `size` selectors are absent and CardBody still contains `text-sm`.

### Task 2: Implement server-safe root density selectors

**Files:**
- Modify: `packages/ui/src/card/card.tsx`

**Interfaces:**
- Consumes: `CardSize`, existing data-slot names, and the existing `divided` behavior.
- Produces: `cardVariants({ variant, size, divided })` with isolated, conflict-free direct-child padding.

- [ ] **Step 1: Add size/divided variants to `cardVariants`**

Add these siblings to the existing `variant` entry. Size owns horizontal padding and Body vertical padding; compound variants own Header/Footer vertical padding so `divided=false` never competes with a `py-*` shorthand:

```ts
size: {
  md:
    "[&>[data-slot=card-header]]:px-5 " +
    "[&>[data-slot=card-body]]:px-5 [&>[data-slot=card-body]]:py-4 " +
    "[&>[data-slot=card-footer]]:px-5",
  sm:
    "[&>[data-slot=card-header]]:px-4 " +
    "[&>[data-slot=card-body]]:px-4 [&>[data-slot=card-body]]:py-3 " +
    "[&>[data-slot=card-footer]]:px-4",
},
divided: {
  true: "",
  false:
    "[&>[data-slot=card-header]]:border-b-0 " +
    "[&>[data-slot=card-footer]]:border-t-0",
},
```

Add these exact compound variants:

```ts
compoundVariants: [
  {
    size: "md",
    divided: true,
    class:
      "[&>[data-slot=card-header]]:py-3 [&>[data-slot=card-footer]]:py-3",
  },
  {
    size: "md",
    divided: false,
    class:
      "[&>[data-slot=card-header]]:pt-3 [&>[data-slot=card-header]]:pb-2 " +
      "[&>[data-slot=card-footer]]:pt-2 [&>[data-slot=card-footer]]:pb-3",
  },
  {
    size: "sm",
    divided: true,
    class:
      "[&>[data-slot=card-header]]:py-2.5 [&>[data-slot=card-footer]]:py-2.5",
  },
  {
    size: "sm",
    divided: false,
    class:
      "[&>[data-slot=card-header]]:pt-2.5 [&>[data-slot=card-header]]:pb-2 " +
      "[&>[data-slot=card-footer]]:pt-2 [&>[data-slot=card-footer]]:pb-2.5",
  },
],
defaultVariants: { variant: "outline", size: "md", divided: true },
```

Remove `undividedSlots`; its semantics now live in the `divided` variant/compounds with no padding shorthand conflict.

- [ ] **Step 2: Consume size at the Card root**

```tsx
export function Card({ className, variant, size, divided, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, size, divided }), className)}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Remove section-owned padding and CardBody typography**

Keep only structural/typographic classes on the section components:

```tsx
// Header base starts with:
"border-b border-border"

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-body" className={cn(className)} {...props} />;
}

// Footer base starts with:
"border-t border-border text-sm text-muted-foreground"
```

- [ ] **Step 4: Run focused tests**

```bash
pnpm --filter @hulianui/ui exec vitest run src/card/card.test.tsx --project unit
pnpm --filter @hulianui/ui typecheck
```

Expected: Card unit tests PASS, including all pre-existing `divided` and CardHeader tests.

- [ ] **Step 5: Add and run isolation plus divided-combination browser assertions**

Append to `packages/ui/src/card/card.browser.test.tsx`:

```tsx
it("外层 sm 的 direct-child selector 不改变内层 md Card 的正文 padding", () => {
  render(
    <Card size="sm">
      <CardBody>
        <Card>
          <CardBody data-testid="inner-body">内层</CardBody>
        </Card>
      </CardBody>
    </Card>,
  );
  const inner = screen.getByTestId("inner-body");
  expect(getComputedStyle(inner).paddingLeft).toBe("20px");
  expect(getComputedStyle(inner).paddingTop).toBe("16px");
});

it("sm + divided=false 保留紧凑外侧 padding，只收分隔线相邻侧", () => {
  render(
    <Card size="sm" divided={false}>
      <CardHeader data-testid="header">标题</CardHeader>
      <CardBody>正文</CardBody>
      <CardFooter data-testid="footer">页脚</CardFooter>
    </Card>,
  );
  const header = getComputedStyle(screen.getByTestId("header"));
  const footer = getComputedStyle(screen.getByTestId("footer"));
  expect(header.paddingTop).toBe("10px");
  expect(header.paddingBottom).toBe("8px");
  expect(footer.paddingTop).toBe("8px");
  expect(footer.paddingBottom).toBe("10px");
});
```

Run:

```bash
pnpm --filter @hulianui/ui exec vitest run src/card/card.browser.test.tsx --project browser
```

Expected: PASS in Chromium.

- [ ] **Step 6: Perform the mutation check**

Temporarily replace the `sm` Body `py-3` selector with `py-4`, rerun the focused unit test, and confirm the `sm` test fails. Restore `py-3` and rerun to PASS.

### Task 3: Export and document the density contract

**Files:**
- Modify: `packages/ui/src/card/index.ts`
- Modify: `packages/ui/src/card/card.md`
- Modify: `packages/ui/src/card/card.en.md`
- Modify: `packages/ui/src/card/card.showcase.tsx`

**Interfaces:**
- Consumes: `CardSize`, `Card size` implementation.
- Produces: package export and consumer documentation.

- [ ] **Step 1: Export `CardSize`**

```ts
export type { CardProps, CardHeaderProps, CardSize } from "./card.types";
```

- [ ] **Step 2: Add compact and inherited-typography examples in both locales**

```tsx
<Card size="sm">
  <CardHeader title="运行指标" />
  <CardBody>
    <Text size="lg">98.7%</Text>
  </CardBody>
  <CardFooter>最近 5 分钟</CardFooter>
</Card>
```

Document that `md` is the default and that CardBody no longer assigns a font size. The English page must state the same migration note.

- [ ] **Step 3: Update showcase with side-by-side `md` and `sm` cards**

Use identical content in both cards so the spacing difference is inspectable. Use `Text size` inside CardBody to demonstrate typography ownership.

- [ ] **Step 4: Run generators and verification**

```bash
pnpm llms-registry
pnpm conventions
pnpm --filter @hulianui/ui exec vitest run src/card/card.test.tsx --project unit
pnpm --filter @hulianui/ui exec vitest run src/card/card.browser.test.tsx --project browser
pnpm --filter @hulianui/ui typecheck
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit only Issue #325 files**

```bash
git add packages/ui/src/card
git diff --cached --check
git commit -m "feat(ui): add compact Card density (#325)"
```

Expected: one self-contained Card commit; no Stack or later Issue files are staged.
