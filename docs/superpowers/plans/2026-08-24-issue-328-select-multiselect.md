# Issue #328 Select Multiselect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add selected-first ordering and accessible removable-chip display to multi-select without changing the default text trigger.

**Architecture:** Sort candidate data before Base UI/Combobox receives it, preserving selected-value order and stable unselected order. For chips, keep the real Base UI trigger button as the popup control and render the visual chip layer as its sibling; chip remove buttons are therefore outside the trigger button, while non-remove pointer events fall through to the real trigger.

**Tech Stack:** React 19, TypeScript, Base UI Select/Combobox, Tailwind CSS utilities, Vitest, Testing Library, Vitest browser mode with Chromium.

**Spec:** `docs/superpowers/specs/2026-08-24-consumer-gap-issues-323-328-design.md`

## Global Constraints

- Use Node `22.22.3` from `.nvmrc` and pnpm `8.15.5`.
- `selectedFirst` defaults false and only affects multiple values.
- `display` is exactly `"text" | "chips"`, default `"text"`; `removable` defaults false.
- Search filtering excludes unmatched selected items; sorting never re-inserts them.
- At 100+ searchable items, sorting must occur before virtualization.
- Standard groups preserve group order and move selected items only within their original group.
- Remove controls are real buttons outside the Base Trigger button; nested interactive elements are forbidden.
- `clearable` remains clear-all and can coexist with single-chip removal.
- Default text/no-clearable DOM and behavior must remain byte-for-byte structurally equivalent.
- Follow red → green → refactor and mutation-check ordering plus removal.

---

### Task 1: Define the API and pure selected-first ordering

**Files:**
- Modify: `packages/ui/src/select/select.types.ts`
- Create: `packages/ui/src/select/select-order.ts`
- Create: `packages/ui/src/select/select-order.test.ts`

**Interfaces:**
- Consumes: `SelectItemData`, string-array selected values.
- Produces: `SelectProps.selectedFirst?: boolean`, `SelectTriggerProps.display/removable`, and `orderSelectedFirst<T>()`.

- [ ] **Step 1: Extend the public prop types**

```ts
export interface SelectProps {
  /** 多选时将当前已选项排在未选项之前。@default false */
  selectedFirst?: boolean;
}

export interface SelectTriggerProps {
  /** 多选值展示方式。@default "text" */
  display?: "text" | "chips";
  /** chips 模式下是否显示单项删除按钮。@default false */
  removable?: boolean;
}
```

Insert these fields into the existing interfaces rather than redeclaring them.

- [ ] **Step 2: Write pure ordering tests**

```ts
import { describe, expect, it } from "vitest";
import { orderSelectedFirst } from "./select-order";

const list = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
  { value: "d", label: "D" },
];

describe("orderSelectedFirst (#328)", () => {
  it("按 value 数组排列已选项，未选项保持原始相对顺序", () => {
    expect(orderSelectedFirst(list, ["d", "b"]).map((item) => item.value))
      .toEqual(["d", "b", "a", "c"]);
  });

  it("忽略 stale value，不制造候选项", () => {
    expect(orderSelectedFirst(list, ["ghost", "c"]).map((item) => item.value))
      .toEqual(["c", "a", "b", "d"]);
  });

  it("不修改调用方数组", () => {
    const input = [...list];
    const before = [...input];
    orderSelectedFirst(input, ["b"]);
    expect(input).toEqual(before);
  });

  it("无选中值时返回保持输入顺序的新数组", () => {
    const result = orderSelectedFirst(list, []);
    expect(result.map((item) => item.value)).toEqual(["a", "b", "c", "d"]);
    expect(result).not.toBe(list);
  });
});
```

- [ ] **Step 3: Run the pure test and verify red**

```bash
source /Users/zhangzhiwei/.nvm/nvm.sh
nvm use --silent
pnpm --filter @hulianui/ui exec vitest run src/select/select-order.test.ts --project unit
```

Expected: FAIL because `select-order.ts` does not exist.

- [ ] **Step 4: Implement the stable pure function**

```ts
export function orderSelectedFirst<T extends { value: string | null }>(
  items: ReadonlyArray<T>,
  selectedValues: ReadonlyArray<string>,
): T[] {
  const byValue = new Map(
    items.flatMap((item) => (item.value == null ? [] : [[item.value, item] as const])),
  );
  const selected = new Set(selectedValues);
  const emitted = new Set<string>();
  return [
    ...selectedValues.flatMap((value) => {
      const item = byValue.get(value);
      if (!item || emitted.has(value)) return [];
      emitted.add(value);
      return [item];
    }),
    ...items.filter((item) => !selected.has(item.value)),
  ];
}
```

- [ ] **Step 5: Run the pure test and mutation check**

```bash
pnpm --filter @hulianui/ui exec vitest run src/select/select-order.test.ts --project unit
```

Expected: PASS. Then temporarily replace the selected-value iteration with original-item filtering; confirm the `["d", "b"]` test fails because it produces `b,d`, restore, and rerun to PASS.

### Task 2: Integrate selected-first into standard, grouped, searchable, and virtualized data

**Files:**
- Modify: `packages/ui/src/select/select.tsx`
- Modify: `packages/ui/src/select/select.test.tsx`

**Interfaces:**
- Consumes: `orderSelectedFirst<T>()` from Task 1.
- Produces: `SelectMeta.selectedFirst`, `SelectMeta.currentValue`, ordered `searchItems`, and ordered standard children.

- [ ] **Step 1: Add standard/searchable red tests**

Add helpers/tests that assert actual role-option order:

```tsx
it("selectedFirst 按 value 顺序置顶，未选项保持原顺序", () => {
  render(
    <Select items={items} multiple selectedFirst defaultValue={["mono", "sans"]} open>
      <SelectTrigger />
      <SelectContent>
        {items.map((it) => <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>)}
      </SelectContent>
    </Select>,
  );
  expect(optionTexts()).toEqual(["等宽", "无衬线", "衬线"]);
});

it("分组时只在组内置顶，组顺序不变", () => {
  render(
    <Select items={items} multiple selectedFirst defaultValue={["serif", "mono"]} open>
      <SelectTrigger />
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>西文</SelectGroupLabel>
          <SelectItem value="sans">无衬线</SelectItem>
          <SelectItem value="serif">衬线</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectGroupLabel>代码</SelectGroupLabel>
          <SelectItem value="mono">等宽</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>,
  );
  expect(optionTexts()).toEqual(["衬线", "无衬线", "等宽"]);
});

it("searchable 先过滤，未命中的已选项不被强插", () => {
  render(
    <Select items={items} multiple searchable selectedFirst defaultValue={["mono", "sans"]} open>
      <SelectTrigger />
      <SelectContent>
        {items.map((it) => <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>)}
      </SelectContent>
    </Select>,
  );
  fireEvent.change(getSearchInput(), { target: { value: "衬线" } });
  expect(optionTexts()).toEqual(["无衬线", "衬线"]);
});
```

- [ ] **Step 2: Run Select unit tests and verify red**

```bash
pnpm --filter @hulianui/ui exec vitest run src/select/select.test.tsx --project unit
```

Expected: FAIL because option order remains the original input order.

- [ ] **Step 3: Carry current string values through SelectMeta**

Add:

```ts
interface SelectMeta {
  selectedFirst?: boolean;
  currentValue?: string | string[] | null;
}
```

Destructure `selectedFirst = false` from `Select`, derive:

```ts
const selectedValues = multiple && Array.isArray(current) ? current : [];
```

Include `selectedFirst`, `currentValue: current`, and their dependencies in the memoized meta.

- [ ] **Step 4: Sort searchable candidates before Combobox/virtualization**

Build the unsorted filtered/mapped list first, then:

```ts
return selectedFirst && multiple
  ? orderSelectedFirst(mapped, selectedValues)
  : mapped;
```

Include `selectedFirst`, `multiple`, and `selectedValues` in the memo dependencies. Stabilize `selectedValues` with a memo keyed by `current` rather than allocating a new empty array every render.

- [ ] **Step 5: Reorder standard children without crossing groups**

Add `cloneElement` to the React import and add these helpers in `select.tsx`:

```tsx
function isSelectItemNode(node: ReactNode): node is ReactElement<SelectItemProps> {
  return isValidElement(node) && node.type === SelectItem && typeof node.props.value === "string";
}

function orderStandardChildren(children: ReactNode, selectedValues: readonly string[]): ReactNode[] {
  const nodes = Children.toArray(children);
  const orderedItems = orderSelectedFirst(
    nodes.filter(isSelectItemNode).map((node) => ({ value: node.props.value, node })),
    selectedValues,
  ).map((entry) => entry.node);
  let itemIndex = 0;

  return nodes.map((node) => {
    if (isSelectItemNode(node)) return orderedItems[itemIndex++]!;
    if (
      isValidElement<{ children?: ReactNode }>(node) &&
      (node.type === SelectGroup || node.type === Fragment)
    ) {
      return cloneElement(
        node,
        undefined,
        orderStandardChildren(node.props.children, selectedValues),
      );
    }
    return node;
  });
}
```

The helper reorders only item slots at the same level. It recursively clones `SelectGroup` and `Fragment`, so items never cross a group label/container.

Apply the same `orderSelectedFirst` result to the standard `items` array passed to `BaseSelect.Root`; DOM order and Base UI's keyboard/data order must agree. Placeholder injection remains first only for single-select, where `selectedFirst` is inactive.

- [ ] **Step 6: Run unit tests and mutation check**

```bash
pnpm --filter @hulianui/ui exec vitest run src/select/select-order.test.ts src/select/select.test.tsx --project unit
```

Expected: PASS. Temporarily bypass ordering in the searchable `items` path and confirm the filtered selected-first test fails; restore and rerun to PASS.

### Task 3: Add chips value modeling and accessible removal state

**Files:**
- Modify: `packages/ui/src/select/select.tsx`
- Modify: `packages/ui/src/select/select.test.tsx`
- Modify: `packages/ui/src/config/locale.ts`

**Interfaces:**
- Consumes: `currentValue`, `items`, `handleValueChange`, locale copy.
- Produces: `SelectMeta.onRemoveValue(value: string)`, localized `remove(label)` copy, chip view models.

- [ ] **Step 1: Extend locale copy with a remove function**

Change the optional select dictionary type to:

```ts
select?: {
  search: string;
  empty: string;
  loading: string;
  separator: string;
  clear: string;
  /** Optional so existing custom locale dictionaries remain source-compatible. */
  remove?: (label: string) => string;
};
```

Add built-ins:

```ts
// zh
remove: (label) => `移除 ${label}`,

// en
remove: (label) => `Remove ${label}`,
```

Every local fallback object in `select.tsx` must include the same function. Resolve it once per Trigger:

```ts
const removeLabel = copy.remove ?? ((label: string) => `${copy.clear}: ${label}`);
```

The compatibility fallback derives from the custom dictionary's existing `clear` copy, so it does not hardcode Chinese into generic interaction code.

- [ ] **Step 2: Write red chips/removal tests**

```tsx
it("chips 渲染可见 label 与 +N，默认没有删除按钮", () => {
  render(<Multi defaultValue={["sans", "serif", "mono"]} maxDisplay={2} display="chips" />);
  expect(document.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2);
  expect(getTrigger().textContent).toContain("无衬线");
  expect(getTrigger().textContent).toContain("衬线");
  expect(screen.getByText("+1")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "移除 无衬线" })).toBeNull();
});

it("removable 按当前顺序删除单项，按钮不嵌套在 trigger", () => {
  const onValueChange = vi.fn();
  render(
    <Select items={items} multiple defaultValue={["sans", "serif"]} onValueChange={onValueChange}>
      <SelectTrigger display="chips" removable />
    </Select>,
  );
  const remove = screen.getByRole("button", { name: "移除 无衬线" });
  expect(remove.closest('button[role="combobox"]')).toBeNull();
  fireEvent.click(remove);
  expect(onValueChange.mock.calls[0][0]).toEqual(["serif"]);
});

it("受控值未回传时视觉不自行删除", () => {
  const onValueChange = vi.fn();
  render(
    <Select items={items} multiple value={["sans", "serif"]} onValueChange={onValueChange}>
      <SelectTrigger display="chips" removable />
    </Select>,
  );
  fireEvent.click(screen.getByRole("button", { name: "移除 无衬线" }));
  expect(onValueChange).toHaveBeenCalledWith(["serif"], expect.anything());
  expect(screen.getByRole("button", { name: "移除 无衬线" })).toBeTruthy();
});

it("复杂 label 的删除名称回退 value", () => {
  const complex = [{ value: "status", label: <strong>运行中</strong> }];
  render(
    <Select items={complex} multiple defaultValue={["status"]}>
      <SelectTrigger display="chips" removable />
    </Select>,
  );
  expect(screen.getByRole("button", { name: "移除 status" })).toBeTruthy();
});
```

Update the local `Multi` helper type and Trigger exactly as follows:

```tsx
function Multi(props: {
  defaultValue?: string[];
  maxDisplay?: number;
  open?: boolean;
  display?: "text" | "chips";
  removable?: boolean;
}) {
  return (
    <Select items={items} placeholder="请选择字体" multiple defaultValue={props.defaultValue} open={props.open}>
      <SelectTrigger
        maxDisplay={props.maxDisplay}
        display={props.display}
        removable={props.removable}
      />
      <SelectContent>
        {items.map((it) => <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
```

Add `useState` to the React import in the test file for the controlled coexistence fixture.

- [ ] **Step 3: Run Select tests and verify red**

```bash
pnpm --filter @hulianui/ui exec vitest run src/select/select.test.tsx --project unit
```

Expected: FAIL because chips and localized remove controls do not exist.

- [ ] **Step 4: Add removal to the existing value channel**

Add to `SelectMeta`:

```ts
disabled?: boolean;
readOnly?: boolean;
onRemoveValue?: (value: string, eventDetails?: unknown) => void;
```

Destructure `disabled` and `readOnly` from Select and pass them explicitly into both root-prop objects. Implement:

```ts
const handleRemoveValue = useCallback(
  (value: string, eventDetails?: unknown) => {
    if (!multiple || disabled || readOnly || !Array.isArray(current)) return;
    handleValueChange(current.filter((item) => item !== value), eventDetails);
  },
  [current, disabled, handleValueChange, multiple, readOnly],
);
```

Include it and the disabled/readOnly flags in meta.

For standard non-clearable multiple Select, pass `value: current` instead of leaving Base UI uncontrolled, because external chip removal must update the same root state. Keep single-select ownership unchanged. Existing default multiple tests must stay green, proving this internal ownership change preserves public behavior.

- [ ] **Step 5: Build stable chip view models**

Add a helper returning `{ value, label, accessibleLabel }[]` from the current string/object values. `label` uses `items` when present and raw value otherwise; `accessibleLabel` uses the string label only, otherwise raw value. Slice it by `Math.max(0, maxDisplay)` and compute `extra` from the full selected count.

- [ ] **Step 6: Run unit tests and mutation-check removal**

```bash
pnpm --filter @hulianui/ui exec vitest run src/select/select.test.tsx --project unit
```

Expected: state/model tests pass once Task 4 rendering is complete; before that, model-specific tests may remain red. After rendering exists, temporarily change the filter predicate to `item === value`, confirm the callback test fails, restore, and rerun to PASS.

### Task 4: Render chip visuals as siblings of the real trigger

**Files:**
- Modify: `packages/ui/src/select/select.tsx`
- Modify: `packages/ui/src/select/select.test.tsx`

**Interfaces:**
- Consumes: chip models and `onRemoveValue` from Task 3.
- Produces: valid trigger/chip DOM, complete accessible trigger name, isolated remove interaction.

- [ ] **Step 1: Preserve the exact default branch**

Destructure `display = "text"` and `removable = false` in `SelectTrigger`. Keep the current `trigger` construction and this return unchanged for the default:

```tsx
if (!clearable && !(multiple && display === "chips")) return trigger;
```

This is the structural compatibility gate for text/no-clearable consumers.

For chips mode, compute a complete accessible string from all selected models, not only the visible `maxDisplay` slice:

```ts
const accessibleValue =
  chipModels.length > 0
    ? chipModels.map((chip) => chip.accessibleLabel).join(copy.separator)
    : typeof placeholder === "string"
      ? placeholder
      : "";
```

In both Base Select and searchable Combobox trigger branches, replace only the multiple value renderer when `display === "chips"`:

```tsx
<span className="sr-only">{accessibleValue}</span>
```

The text branch continues to call the existing `renderMultipleValue` unchanged. Add a test using `screen.getByRole("combobox", { name: "无衬线、衬线、等宽" })` with `maxDisplay={2}` to prove the accessible name includes the hidden third value.

- [ ] **Step 2: Add a chips-only visual overlay outside the trigger button**

For `multiple && display === "chips"`, the Base Trigger value renders a complete `sr-only` label string for its accessible name. Return this structure:

```tsx
<span className="group relative block w-full">
  {trigger}
  <span
    data-slot="select-chip-layer"
    aria-hidden="true"
    className="pointer-events-none absolute inset-y-0 left-0 right-8 flex items-center gap-1 overflow-hidden px-3"
  >
    {visibleChips.map((chip) => (
      <span
        key={chip.value}
        data-slot="select-chip"
        className="pointer-events-none inline-flex min-w-0 shrink-0 items-center gap-1 rounded bg-surface-raised px-1.5 py-0.5 text-xs"
      >
        <span className="max-w-28 truncate">{chip.label}</span>
      </span>
    ))}
    {extra > 0 && <span className="shrink-0 text-xs text-muted-foreground">+{extra}</span>}
  </span>
  {removable && !disabled && !readOnly && !loading && (
    <span className="pointer-events-none absolute inset-y-0 left-0 right-8 flex items-center gap-1 overflow-hidden px-3">
      {visibleChips.map((chip) => (
        <span key={chip.value} className="pointer-events-none inline-flex shrink-0 items-center">
          <span className="invisible max-w-28 truncate px-1.5 py-0.5 text-xs">{chip.label}</span>
          <button
            type="button"
            aria-label={removeLabel(chip.accessibleLabel)}
            className="pointer-events-auto -ml-5 inline-flex size-4 items-center justify-center rounded hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onRemoveValue?.(chip.value, event);
            }}
          >
            <ClearIcon />
          </button>
        </span>
      ))}
    </span>
  )}
  {clearAllButton}
</span>
```

Extract these exact shared constants so the visible and interactive overlays remain pixel-aligned:

```ts
const chipLayerClass =
  "absolute inset-y-0 left-0 right-8 flex items-center gap-1 overflow-hidden px-3";
const chipVisualClass =
  "inline-flex min-w-0 shrink-0 items-center gap-1 rounded bg-surface-raised px-1.5 py-0.5 text-xs";
const chipLabelClass = "max-w-28 truncate";
```

Both overlays use `chipLayerClass`; the visual and control overlays each add `pointer-events-none`, and every remove button adds `pointer-events-auto`. The overlay stays outside `trigger`.

- [ ] **Step 3: Keep clear-all behavior in the same wrapper**

Extract the current clear button into this local node, preserving the current classes and event behavior:

```tsx
const clearAllButton = showClear ? (
  <button
    type="button"
    aria-label={copy.clear}
    onPointerDown={(event) => event.stopPropagation()}
    onClick={(event) => {
      event.stopPropagation();
      onClear?.();
    }}
    className={cn(
      "absolute top-1/2 hidden -translate-y-1/2 cursor-pointer items-center text-muted-foreground transition-colors",
      "hover:text-foreground focus-visible:outline-none focus-visible:text-foreground",
      "group-hover:flex group-focus-within:flex",
      size === "lg" ? "right-3.5" : size === "sm" ? "right-2.5" : "right-3",
    )}
  >
    <ClearIcon />
  </button>
) : null;
```

In text mode its DOM/classes remain unchanged. In chips mode it remains the rightmost sibling control; both chip overlays stop at `right-8`, leaving its hit target unobstructed.

- [ ] **Step 4: Add event and DOM regressions**

```tsx
it("chip 的非删除视觉层不截获指针，底层真实 trigger 仍可命中", () => {
  render(<Multi defaultValue={["sans"]} display="chips" />);
  const layer = document.querySelector('[data-slot="select-chip-layer"]')!;
  expect(layer.className).toContain("pointer-events-none");
  expect(document.querySelector('button[role="combobox"] button')).toBeNull();
});

it("removable 与 clearable 共存：单删一个，clear-all 清空剩余项", () => {
  const spy = vi.fn();
  function Fixture() {
    const [value, setValue] = useState(["sans", "serif"]);
    return (
      <Select
        items={items}
        multiple
        clearable
        value={value}
        onValueChange={(next) => {
          spy(next);
          setValue(next as string[]);
        }}
      >
        <SelectTrigger display="chips" removable />
      </Select>
    );
  }
  render(<Fixture />);
  fireEvent.click(screen.getByRole("button", { name: "移除 无衬线" }));
  expect(spy.mock.calls[0][0]).toEqual(["serif"]);
  fireEvent.click(screen.getByRole("button", { name: "清除" }));
  expect(spy.mock.calls[1][0]).toEqual([]);
});
```

Use a stateful uncontrolled fixture or rerendering controlled fixture so the second click operates on the updated value.

- [ ] **Step 5: Run focused tests and validate HTML**

```bash
pnpm --filter @hulianui/ui exec vitest run src/select/select-order.test.ts src/select/select.test.tsx --project unit
pnpm --filter @hulianui/ui typecheck
```

Expected: PASS and no React `validateDOMNesting` warnings. Assert `document.querySelector('button[role="combobox"] button')` is null.

### Task 5: Add real-browser keyboard, search, and virtualization coverage

**Files:**
- Create: `packages/ui/src/select/select.browser.test.tsx`

**Interfaces:**
- Consumes: public Select API from Tasks 1–4.
- Produces: Chromium evidence for popup behavior, keyboard removal, filtering, and 100+ virtualization.

- [ ] **Step 1: Add a controlled browser fixture**

Start the new file with the concrete browser imports, cleanup, and controlled fixture so browser actions exercise the real Base UI state channel:

```tsx
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@vitest/browser/context";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./select";

afterEach(cleanup);

const browserItems = [
  { value: "sans", label: "无衬线" },
  { value: "serif", label: "衬线" },
  { value: "mono", label: "等宽" },
];

function ControlledFixture({
  initialValue,
  searchable = false,
}: {
  initialValue: string[];
  searchable?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <Select
      items={browserItems}
      multiple
      selectedFirst
      searchable={searchable}
      value={value}
      onValueChange={(next) => setValue(next as string[])}
    >
      <SelectTrigger display="chips" removable />
      <SelectContent>
        {browserItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 2: Test keyboard removal without popup toggling**

```tsx
it("Tab 到 remove 后按 Enter 只删除该项，不改变 popup 状态", async () => {
  render(<ControlledFixture initialValue={["sans", "serif"]} />);
  const trigger = screen.getByRole("combobox");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  const remove = screen.getByRole("button", { name: "移除 无衬线" });
  remove.focus();
  await userEvent.keyboard("{Enter}");
  expect(screen.queryByRole("button", { name: "移除 无衬线" })).toBeNull();
  expect(screen.getByRole("button", { name: "移除 衬线" })).toBeTruthy();
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});
```

Add this real pointer test; Chromium honors `pointer-events: none` and proves the click falls through to the underlying Base Trigger:

```tsx
it("点击 chip 非删除区域会打开 popup", async () => {
  render(<ControlledFixture initialValue={["sans"]} />);
  const chipLabel = document.querySelector<HTMLElement>('[data-slot="select-chip"] > span')!;
  await userEvent.click(chipLabel);
  expect(screen.getByRole("combobox").getAttribute("aria-expanded")).toBe("true");
});
```

Use the Vitest browser user-event API already established in repository browser tests; if the import differs, follow the existing local pattern without replacing keyboard actions with jsdom `fireEvent`.

- [ ] **Step 3: Test searchable filtering plus selected-first**

```tsx
it("searchable 过滤不强插未命中的已选项", async () => {
  render(<ControlledFixture initialValue={["mono", "sans"]} searchable />);
  await userEvent.click(screen.getByRole("combobox"));
  await userEvent.fill(screen.getByPlaceholderText("搜索"), "衬线");
  const labels = screen.getAllByRole("option").map((option) => option.textContent);
  expect(labels).toEqual(["无衬线", "衬线"]);
  expect(labels).not.toContain("等宽");
});
```

- [ ] **Step 4: Test automatic virtualization with 120 items**

Create values `item-0` through `item-119`, select `item-119`, omit `virtualized`, open the popup, and assert:

```ts
expect(document.querySelector("[data-hulian-virtual-count]")).not.toBeNull();
expect(screen.getAllByRole("option")[0]?.textContent).toContain("Item 119");
```

This proves sorting happened before the virtual window was calculated.

- [ ] **Step 5: Run browser tests and mutation check**

```bash
pnpm --filter @hulianui/ui exec vitest run src/select/select.browser.test.tsx --project browser
```

Expected: PASS in Chromium. Temporarily remove `event.stopPropagation()` from the chip remove click and confirm the keyboard/popup test or an explicit click-popup assertion fails; restore it and rerun to PASS.

### Task 6: Document, showcase, and commit Issue #328

**Files:**
- Modify: `packages/ui/src/select/select.md`
- Modify: `packages/ui/src/select/select.en.md`
- Modify: `packages/ui/src/select/select.showcase.tsx`

**Interfaces:**
- Consumes: all new Select props and behavior.
- Produces: bilingual public docs/showcase and final self-contained Issue commit.

- [ ] **Step 1: Update prop tables and behavior notes in both locales**

Document `selectedFirst`, `display`, and `removable`, including these exact rules:

```txt
selectedFirst only affects multiple mode.
Search filters first; unmatched selected values are not forced into results.
Groups keep their order and reorder only within each group.
removable requires display="chips"; clearable still clears all values.
```

- [ ] **Step 2: Add the canonical example in both locales**

```tsx
<Select
  items={cities}
  multiple
  searchable
  selectedFirst
  defaultValue={["shanghai", "beijing"]}
>
  <SelectTrigger display="chips" removable maxDisplay={3} />
  <SelectContent>
    {cities.map((city) => (
      <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

- [ ] **Step 3: Add showcase scenarios**

Show standard chips/removal, searchable selected-first, and a 120-item virtualized list. Keep data deterministic and avoid timer/network dependencies.

- [ ] **Step 4: Verify generators, focused suites, typecheck, and formatting**

```bash
pnpm llms-registry
pnpm conventions
pnpm --filter @hulianui/ui exec vitest run src/select/select-order.test.ts src/select/select.test.tsx --project unit
pnpm --filter @hulianui/ui exec vitest run src/select/select.browser.test.tsx --project browser
pnpm --filter @hulianui/ui typecheck
git diff --check
```

Expected: all commands exit 0 with no React DOM nesting or act warnings.

- [ ] **Step 5: Commit only Issue #328 files**

```bash
git add \
  packages/ui/src/select \
  packages/ui/src/config/locale.ts
git diff --cached --check
git commit -m "feat(ui): improve Select multiselect workflows (#328)"
```

Expected: one self-contained Select commit; `.changeset` is intentionally handled by the batch integration plan.
