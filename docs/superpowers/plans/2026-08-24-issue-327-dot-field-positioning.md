# Issue #327 DotField Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make DotField an absolute decoration layer that fills a content-sized positioned parent without affecting layout or losing pointer interaction.

**Architecture:** Change only the root positioning contract; keep the canvas renderer and interaction lifecycle intact. Add a jsdom class regression and a real Chromium geometry regression, then audit peer decoration/backdrop components before deciding whether any share the exact contradiction.

**Tech Stack:** React 19, TypeScript, Canvas 2D, Motion reduced-motion hook, Tailwind CSS utilities, Vitest browser mode, Chromium.

**Spec:** `docs/superpowers/specs/2026-08-24-consumer-gap-issues-323-328-design.md`

## Global Constraints

- Use Node `22.22.3` from `.nvmrc` and pnpm `8.15.5`.
- DotField root changes from `relative h-full w-full` to `absolute inset-0`.
- Preserve `pointer-events-auto`, `overflow-hidden`, canvas structure, reduced-motion behavior, and all drawing logic.
- Parent containers are responsible for a positioning context; document `relative` explicitly.
- Do not blanket-edit other decorative components based only on `h-full w-full`.
- Follow red → green → refactor and mutation-check the geometry contract.

---

### Task 1: Write the red class and browser geometry regressions

**Files:**
- Modify: `packages/ui/src/dot-field/dot-field.test.tsx`
- Create: `packages/ui/src/dot-field/dot-field.browser.test.tsx`

**Interfaces:**
- Consumes: existing `DotField` DOM contract and Vitest browser project.
- Produces: regression coverage for class semantics, content-driven parent height, layer bounds, and pointer hit testing.

- [ ] **Step 1: Replace the old root-class assertion with the new contract**

```tsx
it("根容器是绝对覆盖装饰层，且保留指针交互", () => {
  const { container } = render(<DotField />);
  const root = container.firstElementChild as HTMLElement;
  expect(root.getAttribute("aria-hidden")).toBe("true");
  expect(root.className).toContain("absolute");
  expect(root.className).toContain("inset-0");
  expect(root.className).toContain("overflow-hidden");
  expect(root.className).toContain("pointer-events-auto");
  expect(root.className).not.toContain("relative");
  expect(root.className).not.toContain("h-full");
  expect(root.className).not.toContain("w-full");
});
```

- [ ] **Step 2: Create a real-browser geometry test**

```tsx
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { DotField } from "./dot-field";

afterEach(cleanup);

describe("DotField positioning (#327)", () => {
  it("填满由正文撑高的父容器且不参与文档流", () => {
    const { container } = render(
      <div
        data-testid="host"
        style={{ position: "relative", width: 320, padding: "24px 16px" }}
      >
        <div data-testid="content" style={{ height: 96 }}>正文</div>
        <DotField data-testid="field" />
      </div>,
    );
    const host = container.querySelector<HTMLElement>('[data-testid="host"]')!;
    const content = container.querySelector<HTMLElement>('[data-testid="content"]')!;
    const field = container.querySelector<HTMLElement>('[data-testid="field"]')!;
    const canvas = field.querySelector("canvas")!;

    expect(host.offsetHeight).toBe(content.offsetHeight + 48);
    expect(field.getBoundingClientRect()).toEqual(host.getBoundingClientRect());
    expect(canvas.getBoundingClientRect()).toEqual(field.getBoundingClientRect());
    expect(getComputedStyle(field).pointerEvents).toBe("auto");
  });
});
```

If DOMRect object equality includes browser-specific non-enumerable fields, compare `left`, `top`, `width`, and `height` individually with `toBeCloseTo`; do not weaken the geometric requirement.

- [ ] **Step 3: Run both focused tests and verify red**

```bash
source /Users/zhangzhiwei/.nvm/nvm.sh
nvm use --silent
pnpm --filter @hulianui/ui exec vitest run src/dot-field/dot-field.test.tsx --project unit
pnpm --filter @hulianui/ui exec vitest run src/dot-field/dot-field.browser.test.tsx --project browser
```

Expected: unit test FAILS on missing `absolute inset-0`; browser test FAILS because the current relative root participates in layout and does not overlay the host.

### Task 2: Implement the minimal positioning fix

**Files:**
- Modify: `packages/ui/src/dot-field/dot-field.tsx`

**Interfaces:**
- Consumes: unchanged `DotFieldProps`.
- Produces: absolute root layer with unchanged canvas/interaction implementation.

- [ ] **Step 1: Change only the fixed root classes**

At the returned root element, replace:

```tsx
"pointer-events-auto relative h-full w-full overflow-hidden"
```

with:

```tsx
"pointer-events-auto absolute inset-0 overflow-hidden"
```

Do not alter the canvas class, effect dependencies, listeners, ResizeObserver, or draw functions.

- [ ] **Step 2: Run focused unit and browser tests**

```bash
pnpm --filter @hulianui/ui exec vitest run src/dot-field/dot-field.test.tsx --project unit
pnpm --filter @hulianui/ui exec vitest run src/dot-field/dot-field.browser.test.tsx --project browser
```

Expected: both test files PASS in their assigned projects.

- [ ] **Step 3: Perform the mutation check**

Temporarily restore `relative h-full w-full`, rerun the browser test, and confirm it fails because host height or layer bounds differ. Restore `absolute inset-0` and rerun both tests to PASS.

### Task 3: Confirm the same-domain audit boundary

**Files:**
- Inspect: `packages/ui/src/*/*.tsx`
- No planned modifications outside `packages/ui/src/dot-field`.

**Interfaces:**
- Consumes: documented component contract, root positioning implementation, repository call sites.
- Produces: a reproducible PR conclusion that no second confirmed contradiction was found.

- [ ] **Step 1: Reproduce the candidate list with read-only searches**

```bash
rg -l 'h-full w-full|w-full h-full' packages/ui/src --glob '*.tsx' \
  | rg '(background|field|grid|dots|beam|aurora|spotlight|noise|pattern|backdrop)'
rg -n 'absolute inset-0|relative h-full w-full|pointer-events' packages/ui/src \
  --glob '*.tsx' --glob '*.md'
```

- [ ] **Step 2: Confirm the pre-plan audit result**

The pre-plan scan found DotField as the only decoration/backdrop candidate whose root is `relative h-full w-full`; other matches are full widgets/cursors rather than documented background overlays, while Crosshair and pattern/background peers already use `absolute inset-0`. Record this exact table in the PR body:

```txt
Component | docs promise overlay? | root participates in flow? | call sites provide positioned host? | action
DotField  | yes                   | yes                        | yes                                 | fix #327
Peers     | no second yes/yes/yes candidate                                                        | no change
```

- [ ] **Step 3: Keep the audit scoped**

Do not edit Android, ASCIIText, BlobCursor, galleries, ClickSpark, DesignCanvas, FitScreen, Flow, GradualBlur, ImageTrail, PreviewSandbox, ScrollStack, TextCursor, or TextPressure: their root owns a full widget/cursor surface and does not share DotField's background-layer contract. If the repeated scan differs because master changed, pause #327 and update the approved design/plan before touching the newly appearing component.

- [ ] **Step 4: Run DotField focused tests**

```bash
pnpm --filter @hulianui/ui exec vitest run src/dot-field/dot-field.test.tsx --project unit
pnpm --filter @hulianui/ui exec vitest run src/dot-field/dot-field.browser.test.tsx --project browser
```

Expected: both commands exit 0 and no peer files appear in `git status --short`.

### Task 4: Update the positioning documentation and showcase

**Files:**
- Modify: `packages/ui/src/dot-field/dot-field.md`
- Modify: `packages/ui/src/dot-field/dot-field.en.md`
- Modify: `packages/ui/src/dot-field/dot-field.showcase.tsx`

**Interfaces:**
- Consumes: absolute-layer behavior from Task 2.
- Produces: accurate bilingual consumer contract and a content-driven visual example.

- [ ] **Step 1: Use the exact documented wrapper in both locales**

```tsx
<div className="relative overflow-hidden rounded-xl p-8">
  <DotField />
  <div className="relative z-10">由正文决定容器高度的前景内容</div>
</div>
```

The English page uses equivalent English content and explicitly says the host must establish positioning with `relative` or another non-static position.

- [ ] **Step 2: Make showcase height content-driven**

Remove any fixed height used solely to make DotField visible. Render padded foreground copy above the absolute layer and keep foreground content at `relative z-10`.

- [ ] **Step 3: Regenerate and verify**

```bash
pnpm llms-registry
pnpm conventions
pnpm --filter @hulianui/ui exec vitest run src/dot-field/dot-field.test.tsx --project unit
pnpm --filter @hulianui/ui exec vitest run src/dot-field/dot-field.browser.test.tsx --project browser
pnpm --filter @hulianui/ui typecheck
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 4: Commit only Issue #327 files**

```bash
git add packages/ui/src/dot-field
git diff --cached --check
git commit -m "fix(ui): make DotField fill positioned parents (#327)"
```

If a peer component was proven and fixed, add only its source/test/docs files to this same commit and name it in the commit body.
