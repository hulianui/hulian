# AnimatedShinyText Layout Contract Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Issue #322 so `AnimatedShinyText` no longer centers or width-limits itself when used as a flex item.

**Architecture:** Keep the component API and shiny-text rendering unchanged. Add a real-Chromium geometry regression around the consumer's flex-column scenario, then remove only the two component-owned layout utilities and document that width/alignment belong to the consumer.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vitest Browser Mode, Testing Library, Playwright Chromium, Changesets

**Spec:** https://github.com/hulianui/hulian/issues/322

## Global Constraints

- `AnimatedShinyText` must not add `mx-auto` or `max-w-md` by default.
- The parent layout must control width and alignment.
- Existing text color, background clipping, gradient, animation, reduced-motion behavior, style merging, props, and `className` passthrough must remain unchanged.
- The fix must ship as a patch change for `@hulianui/ui`.

---

### Task 1: Reproduce the flex-item layout regression in Chromium

**Files:**
- Create: `packages/ui/src/animated-shiny-text/animated-shiny-text.browser.test.tsx`

**Interfaces:**
- Consumes: `AnimatedShinyText(props: AnimatedShinyTextProps): JSX.Element`
- Produces: a browser regression proving the component starts at its sibling's left edge and is not capped at 448px inside a 900px flex column

- [ ] **Step 1: Write the failing browser test**

```tsx
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AnimatedShinyText } from "./animated-shiny-text";

afterEach(cleanup);

describe("AnimatedShinyText flex item layout (#322)", () => {
  it("leaves horizontal alignment and width to its flex-column parent", () => {
    render(
      <div style={{ display: "flex", flexDirection: "column", width: 900 }}>
        <div data-testid="sibling">Concurrent query</div>
        <AnimatedShinyText data-testid="shiny">
          This status message is intentionally long enough to exceed the old 448px max width.
        </AnimatedShinyText>
      </div>,
    );

    const sibling = screen.getByTestId("sibling").getBoundingClientRect();
    const shiny = screen.getByTestId("shiny").getBoundingClientRect();
    expect(shiny.left).toBe(sibling.left);
    expect(shiny.width).toBeGreaterThan(448);
  });
});
```

- [ ] **Step 2: Run the browser test to verify it fails**

Run: `pnpm --filter @hulianui/ui exec vitest run --project browser src/animated-shiny-text/animated-shiny-text.browser.test.tsx`

Expected: FAIL because the existing `mx-auto max-w-md` classes offset the flex item and cap its width at 448px.

### Task 2: Remove component-owned layout and document the contract

**Files:**
- Modify: `packages/ui/src/animated-shiny-text/animated-shiny-text.tsx`
- Modify: `packages/ui/src/animated-shiny-text/animated-shiny-text.md`
- Modify: `packages/ui/src/animated-shiny-text/animated-shiny-text.en.md`
- Create: `.changeset/animated-shiny-text-layout.md`

**Interfaces:**
- Consumes: the browser regression from Task 1
- Produces: an unchanged public API whose default classes style only the shiny-text effect

- [ ] **Step 1: Implement the minimal production fix**

Change the first default class group from:

```tsx
"mx-auto max-w-md text-muted-foreground"
```

to:

```tsx
"text-muted-foreground"
```

- [ ] **Step 2: Document layout ownership in both languages**

Add guidance that the component does not impose width or centering and that consumers can opt in through their parent layout or `className`.

- [ ] **Step 3: Add the patch changeset**

```md
---
"@hulianui/ui": patch
---

修复 AnimatedShinyText 在 flex 容器中默认居中并限制为 448px 的布局问题，宽度与对齐重新交由消费方控制。
```

- [ ] **Step 4: Run focused verification**

Run:

```bash
pnpm --filter @hulianui/ui exec vitest run --project browser src/animated-shiny-text/animated-shiny-text.browser.test.tsx
pnpm --filter @hulianui/ui exec vitest run --project unit src/animated-shiny-text/animated-shiny-text.test.tsx
pnpm --filter @hulianui/ui typecheck
```

Expected: browser regression passes, four existing unit tests pass, and UI typecheck exits 0.

### Task 3: Regenerate required artifacts and run repository gates

**Files:**
- Modify: `apps/www/public/llms-full.txt`
- Modify: `packages/guard/conventions.json`
- Modify: `packages/ui/conventions.json`
- Verify only: generated `/r` and `/d` endpoint files remain Git-ignored.

**Interfaces:**
- Consumes: completed implementation and documentation
- Produces: fresh evidence that the focused fix does not regress the monorepo

- [ ] **Step 1: Generate required CI inputs**

Run: `pnpm llms-registry && pnpm conventions`

- [ ] **Step 2: Run the full verification gates**

Run:

```bash
pnpm test
pnpm typecheck
pnpm test:scripts
pnpm size
```

Expected: every command exits 0.

- [ ] **Step 3: Review and commit the exact Issue #322 diff**

Run:

```bash
git diff --check
git status --short
git diff -- packages/ui/src/animated-shiny-text .changeset/animated-shiny-text-layout.md apps/www/public/llms-full.txt packages/guard/conventions.json packages/ui/conventions.json docs/superpowers/plans/2026-08-24-issue-322-animated-shiny-text-layout.md
git add packages/ui/src/animated-shiny-text .changeset/animated-shiny-text-layout.md apps/www/public/llms-full.txt packages/guard/conventions.json packages/ui/conventions.json docs/superpowers/plans/2026-08-24-issue-322-animated-shiny-text-layout.md
git commit -m "fix(ui): leave shiny text layout to consumers (#322)"
```

Expected: one atomic commit containing only the regression test, minimal component fix, bilingual documentation, deterministic generated documentation/conventions, patch changeset, and implementation plan.
