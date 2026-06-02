# 瑚琏 A2.2 Combobox 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地 Combobox（文本输入 + 实时过滤 listbox 的 typeahead 单选自动补全），接入文档站 IA。

**Architecture:** Base UI rc.0 `combobox` 薄包 facade（`Combobox`/`ComboboxInput`/`ComboboxContent`/`ComboboxItem`），内置过滤（默认 contains），输入外壳气质抄 Input（焦点环 `focus-within`），overlay 承载（Portal>Positioner>Popup + Empty 空态）抄 Select。

**Tech Stack:** `@base-ui-components/react/combobox` · CVA · Tailwind v4 语义 token · motion-token CSS 镜像 · vitest · Next 16 www doc 站。

参照 spec：`docs/superpowers/specs/2026-06-03-hulian-a2-2-overlay-combobox-design.md`。

---

## File Structure

库内 `packages/ui/src/combobox/`：
- `combobox.types.ts` — 4 组件 props 类型（Root facade extends `BaseCombobox.Root.Props<ComboboxItemData,false>`）。
- `combobox.tsx` — `"use client"`；4 组件 + 输入外壳 CVA + 图标。
- `combobox.showcase.tsx` — `"use client"`；`ShowcaseSpec`（FRUITS 静态数组，闭合态承载）。
- `combobox.test.tsx` — vitest 6 用例。
- `index.ts` — 桶导出。

修改：
- `packages/ui/src/index.ts` — 加 `export * from "./combobox"`。
- `apps/www/lib/manifest.ts` — COMPONENTS 数组 +1（inputs）。
- `apps/www/lib/registry.tsx` — import + map +1。

---

## Task 1: 类型定义

**Files:**
- Create: `packages/ui/src/combobox/combobox.types.ts`

- [ ] **Step 1: 写类型文件**

```ts
import type { ReactNode } from "react";
import type { Combobox as BaseCombobox } from "@base-ui-components/react/combobox";

export type ComboboxSize = "sm" | "md" | "lg";

/** 选项数据：{value,label}。Base UI 自动用 label 显示、value 提交（无需 itemToString）。 */
export interface ComboboxItemData {
  value: string;
  label: ReactNode;
}

// 透明转发 Combobox.Root（单选，Multiple 固定 false）。
// 用 BaseCombobox.Root.Props<Value,Multiple> 显式钉死泛型（Root 是泛型函数，ComponentProps 推不准）。
export type ComboboxProps = Omit<BaseCombobox.Root.Props<ComboboxItemData, false>, "multiple"> & {
  children?: ReactNode;
};

export interface ComboboxInputProps {
  size?: ComboboxSize;
  placeholder?: string;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  /** 渲染清除按钮（Combobox.Clear，有值时显示）。 */
  clearable?: boolean;
  className?: string;
}

export interface ComboboxContentProps {
  /** render fn：List 自动遍历已过滤项调用。 */
  children: (item: ComboboxItemData, index: number) => ReactNode;
  emptyMessage?: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export interface ComboboxItemProps {
  /** 选项值（{value,label} 对象，Base UI 自动派生 label/value）。 */
  value: ComboboxItemData;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}
```

- [ ] **Step 2: 验证类型可解析**

Run: `cd packages/ui && npx tsc --noEmit 2>&1 | grep combobox.types || echo "types OK"`
Expected: `types OK`（若 `BaseCombobox.Root.Props` 不可达则报错 → 回退方案：改用 `ComponentProps<typeof BaseCombobox.Root>` 或手列 props，见下方 Note）。

> **Note（typecheck 回退）**：若 `BaseCombobox.Root.Props<ComboboxItemData,false>` 命名空间不可达，改 `ComboboxProps = { items?: readonly ComboboxItemData[]; value?: ComboboxItemData | null; defaultValue?: ComboboxItemData | null; onValueChange?: (v: ComboboxItemData | null, d?: unknown) => void; filter?: ((v: unknown, q: string) => boolean) | null; disabled?: boolean; name?: string; required?: boolean; readOnly?: boolean; open?: boolean; defaultOpen?: boolean; children?: ReactNode }`，组件内 `<BaseCombobox.Root {...(props as any)}>` 钉死。先试命名空间式（最干净）。

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/combobox/combobox.types.ts
git commit -m "feat(ui): Combobox 类型定义 — 4 组件 facade props + ComboboxItemData"
```

---

## Task 2: 组件本体（TDD 红→绿）

**Files:**
- Create: `packages/ui/src/combobox/combobox.test.tsx`
- Create: `packages/ui/src/combobox/combobox.tsx`

- [ ] **Step 1: 写失败测试**

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxItem } from "./combobox";

afterEach(cleanup);

const FRUITS = [
  { value: "apple", label: "苹果 Apple" },
  { value: "banana", label: "香蕉 Banana" },
  { value: "cherry", label: "樱桃 Cherry" },
];

function Demo(props: { defaultOpen?: boolean; invalid?: boolean; defaultValue?: (typeof FRUITS)[number] }) {
  return (
    <Combobox items={FRUITS} defaultOpen={props.defaultOpen} defaultValue={props.defaultValue}>
      <ComboboxInput placeholder="搜索水果…" invalid={props.invalid} clearable />
      <ComboboxContent>
        {(item) => (
          <ComboboxItem key={item.value} value={item} disabled={item.value === "cherry"}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>
  );
}

describe("Combobox", () => {
  it("渲染输入框 + placeholder", () => {
    render(<Demo />);
    const input = screen.getByPlaceholderText("搜索水果…");
    expect(input.tagName).toBe("INPUT");
  });

  it("默认闭合：未展开时选项不在 DOM", () => {
    render(<Demo />);
    expect(screen.queryByText("苹果 Apple")).toBeNull();
  });

  it("defaultOpen 展开后渲染全部候选项", () => {
    render(<Demo defaultOpen />);
    expect(screen.getByText("苹果 Apple")).toBeTruthy();
    expect(screen.getByText("香蕉 Banana")).toBeTruthy();
    expect(screen.getByText("樱桃 Cherry")).toBeTruthy();
  });

  it("disabled item 落 data-disabled + 皮肤钩子类齐备", () => {
    render(<Demo defaultOpen />);
    const cherry = screen.getByText("樱桃 Cherry").closest("[role='option']") as HTMLElement;
    expect(cherry.getAttribute("data-disabled")).not.toBeNull();
    expect(cherry.className).toContain("data-[highlighted]:bg-muted/15");
  });

  it("invalid → input 落 data-invalid/aria-invalid，外壳 has-[[data-invalid]] 钩子", () => {
    render(<Demo invalid />);
    const input = screen.getByPlaceholderText("搜索水果…");
    expect(input.getAttribute("data-invalid")).not.toBeNull();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const shell = input.parentElement as HTMLElement;
    expect(shell.className).toContain("has-[[data-invalid]]:border-danger");
  });

  it("defaultValue → input 显示对应 label", () => {
    render(<Demo defaultValue={FRUITS[1]} />);
    const input = screen.getByDisplayValue("香蕉 Banana");
    expect(input).toBeTruthy();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd packages/ui && npx vitest run src/combobox/combobox.test.tsx`
Expected: FAIL（`combobox.tsx` 不存在 / import 报错）。

- [ ] **Step 3: 写组件实现**

```tsx
"use client";
import { Combobox as BaseCombobox } from "@base-ui-components/react/combobox";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  ComboboxContentProps,
  ComboboxInputProps,
  ComboboxItemProps,
  ComboboxProps,
} from "./combobox.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 的 CSS 镜像驱动 Base UI 原生过渡（同 Select/Dialog）。
const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 输入外壳：抄 Input 外壳气质；焦点环落外壳 focus-within（内层 input 自身受焦点，异于 Select.Trigger 的 button focus-visible）。
export const comboboxInputShellVariants = cva(
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

export function Combobox({ children, ...props }: ComboboxProps) {
  return <BaseCombobox.Root {...props}>{children}</BaseCombobox.Root>;
}

export function ComboboxInput({ size, placeholder, invalid, clearable, className }: ComboboxInputProps) {
  return (
    <span className={cn(comboboxInputShellVariants({ size }), className)}>
      <BaseCombobox.Input
        placeholder={placeholder}
        {...(invalid && { "data-invalid": "", "aria-invalid": true })}
        className="w-full bg-transparent text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed"
      />
      {clearable && (
        <BaseCombobox.Clear
          className="flex shrink-0 cursor-pointer items-center text-muted transition-colors hover:text-foreground"
          aria-label="清除"
        >
          <ClearIcon />
        </BaseCombobox.Clear>
      )}
      <BaseCombobox.Icon className="flex shrink-0 items-center text-muted">
        <ChevronDownIcon />
      </BaseCombobox.Icon>
    </span>
  );
}

export function ComboboxContent({
  children,
  emptyMessage = "无匹配项",
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
}: ComboboxContentProps) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BaseCombobox.Popup
          className={cn(
            "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-[var(--radius)] border border-border bg-surface p-1 text-foreground shadow-xl outline-none",
            "transition-[opacity,transform] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          <BaseCombobox.Empty className="px-2 py-6 text-center text-sm text-muted">
            {emptyMessage}
          </BaseCombobox.Empty>
          <BaseCombobox.List>{children}</BaseCombobox.List>
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

export function ComboboxItem({ value, disabled, children, className }: ComboboxItemProps) {
  return (
    <BaseCombobox.Item
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-[calc(var(--radius)-0.25rem)] py-1.5 pl-2 pr-8 text-sm outline-none",
        "data-[highlighted]:bg-muted/15 data-[highlighted]:text-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
    >
      {children}
      <BaseCombobox.ItemIndicator className="absolute right-2 flex items-center text-foreground">
        <CheckIcon />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}
```

> **Note（实测验证项，截图阶段确认）**：
> - 开合 affordance：Base UI Combobox 默认聚焦/输入即开。若点击输入框/chevron 不开，把 `ComboboxInput` 的 `Combobox.Icon` 改包 `Combobox.Trigger`（读 `trigger/ComboboxTrigger.d.ts` 确认 props）。
> - 测试 #4 用 `role='option'` 取 item 容器；若 Base UI Item 的 role 非 `option`，改用 `screen.getByText("樱桃 Cherry").closest("div[data-disabled]")` 或读 Item state 的实际 role。
> - 测试 #6 `getByDisplayValue` 依赖「选中值回填 input.value」；若 rc.0 不回填，降级为断言 input 非空 / 改 Playwright 验证。

- [ ] **Step 4: 运行测试确认通过**

Run: `cd packages/ui && npx vitest run src/combobox/combobox.test.tsx`
Expected: PASS（6 passed）。若某用例因 jsdom/role 差异红，按 Step 3 Note 调整断言（不放宽核心行为）。

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/combobox/combobox.tsx packages/ui/src/combobox/combobox.test.tsx
git commit -m "feat(ui): Combobox 组件 — 内置过滤 typeahead 单选 + Input 外壳焦点环 + Empty 空态 + TDD 6 用例"
```

---

## Task 3: showcase + 桶导出 + 主 barrel

**Files:**
- Create: `packages/ui/src/combobox/combobox.showcase.tsx`
- Create: `packages/ui/src/combobox/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 写 showcase**

```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxItem } from "./combobox";
import type { ComboboxItemData } from "./combobox.types";

type Size = "sm" | "md" | "lg";

const FRUITS: ComboboxItemData[] = [
  { value: "apple", label: "苹果 Apple" },
  { value: "banana", label: "香蕉 Banana" },
  { value: "cherry", label: "樱桃 Cherry" },
  { value: "durian", label: "榴莲 Durian" },
  { value: "grape", label: "葡萄 Grape" },
  { value: "lemon", label: "柠檬 Lemon" },
  { value: "mango", label: "芒果 Mango" },
  { value: "orange", label: "橙子 Orange" },
];

function Demo({
  placeholder = "搜索水果…",
  size = "md",
  disabled = false,
  invalid = false,
  defaultValue,
}: {
  placeholder?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  defaultValue?: ComboboxItemData;
}) {
  return (
    <div className="w-60">
      <Combobox items={FRUITS} defaultValue={defaultValue} disabled={disabled}>
        <ComboboxInput size={size} placeholder={placeholder} invalid={invalid} clearable />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export const comboboxShowcase: ShowcaseSpec = {
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "搜索水果…", label: "占位文案" },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "无效态" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "已选值", render: () => <Demo defaultValue={FRUITS[2]} /> },
    { name: "禁用", render: () => <Demo disabled defaultValue={FRUITS[0]} /> },
    { name: "无效态", render: () => <Demo invalid /> },
    { name: "small", render: () => <Demo size="sm" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      placeholder={p.placeholder as string}
      size={p.size as Size}
      disabled={p.disabled as boolean}
      invalid={p.invalid as boolean}
    />
  ),
  toCode: (p) =>
    `<Combobox items={items} defaultValue={items[0]}>\n  <ComboboxInput size="${p.size}" placeholder="${p.placeholder}" clearable />\n  <ComboboxContent emptyMessage="无匹配项">\n    {(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}\n  </ComboboxContent>\n</Combobox>`,
};
```

- [ ] **Step 2: 写桶导出 index.ts**

```ts
export { Combobox, ComboboxInput, ComboboxContent, ComboboxItem } from "./combobox";
export type {
  ComboboxProps,
  ComboboxInputProps,
  ComboboxContentProps,
  ComboboxItemProps,
  ComboboxItemData,
  ComboboxSize,
} from "./combobox.types";
export { comboboxShowcase } from "./combobox.showcase";
```

- [ ] **Step 3: 主 barrel 加 export**

在 `packages/ui/src/index.ts` 的 `export * from "./select";` 行后加一行：

```ts
export * from "./combobox";
```

- [ ] **Step 4: 全门禁（自己跑，别信 turbo cache）**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck && pnpm --filter @hulian/ui exec vitest run src/combobox && pnpm build --filter=www --force
```
Expected: typecheck 0 error（若全量红是并行 session WIP → isolate 不碰，确认 combobox 自身绿即可）；combobox 6 测试 PASS；build www SSG 成功（组件页 +1）。

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/combobox/combobox.showcase.tsx packages/ui/src/combobox/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): Combobox showcase(FRUITS 闭合态承载) + 桶导出 + 主 barrel export"
```

---

## Task 4: 接入文档站 IA（幂等 python 插入）

**Files:**
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`

- [ ] **Step 1: 幂等插入 manifest（检测 slug 存在则跳过）**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
python3 - <<'PY'
import re, pathlib
f = pathlib.Path("apps/www/lib/manifest.ts")
s = f.read_text(encoding="utf-8")
if '"combobox"' in s:
    print("manifest: combobox 已存在，跳过")
else:
    entry = '  { slug: "combobox", name: "Combobox", description: "自动补全 · Base UI overlay 文本输入 + 实时过滤 typeahead", category: "inputs", status: "new" },\n'
    # 在 select 行后插入（select 是 inputs 最近兄弟）
    anchor = '  { slug: "select",'
    idx = s.index(anchor)
    end = s.index("\n", idx) + 1
    s = s[:end] + entry + s[end:]
    f.write_text(s, encoding="utf-8")
    print("manifest: combobox 已插入")
PY
```

- [ ] **Step 2: 幂等插入 registry（import + map）**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
python3 - <<'PY'
import pathlib
f = pathlib.Path("apps/www/lib/registry.tsx")
s = f.read_text(encoding="utf-8")
changed = False
if "comboboxShowcase" not in s:
    # import：在 selectShowcase, 后加
    s = s.replace("  selectShowcase,\n", "  selectShowcase,\n  comboboxShowcase,\n", 1)
    changed = True
if "combobox: comboboxShowcase" not in s:
    # map：在 select: selectShowcase, 后加
    s = s.replace("  select: selectShowcase,\n", "  select: selectShowcase,\n  combobox: comboboxShowcase,\n", 1)
    changed = True
f.write_text(s, encoding="utf-8")
print("registry: 已更新" if changed else "registry: 已存在，跳过")
PY
```

> **Note**：若 registry 里 `select: selectShowcase,` 行不存在（select map 尚未被并行 session 落），脚本的 map replace 不命中 → 手工在 `specBySlug` 对象末尾加 `combobox: comboboxShowcase,`，import 同理在 import 块末尾加。grep 确认两处都落。

- [ ] **Step 3: 验证 IA 插入 + 全门禁**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
grep -c '"combobox"' apps/www/lib/manifest.ts
grep -c "comboboxShowcase" apps/www/lib/registry.tsx
pnpm build --filter=www --force 2>&1 | tail -5
```
Expected: manifest grep =1，registry grep =2（import + map）；build SSG 成功，组件页含 `/components/combobox`。

- [ ] **Step 4: Commit**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): Combobox 接入 IA(inputs 分组) — manifest + registry 双文件 SSOT"
```

---

## Task 5: 截图明暗两态（隔离 chromium · 先触发再截）

**Files:** 无（验证产出截图存 cwd 根）。

- [ ] **Step 1: 自起隔离 chromium CDP 截图（明暗两态）**

复用既有 CDP 脚本范式（`mcp-browser-busy-launch-isolated-chromium-via-executablepath`）：
1. `executablePath` 指 ms-playwright 缓存 chromium；独立 `--user-data-dir` + `--remote-debugging-port`。
2. `addInitScript`/origin 注入 `localStorage hulian-theme=light/dark`，导航 `http://localhost:5514/components/combobox`（桌面 app www 实例已跑 5514）。
3. 轮询 `body.innerText` 含 "搜索水果" 确认 hydration 后。
4. **先触发再截**：CDP `.click()` 聚焦输入框 → 输入 "a" 触发过滤 → 等 listbox role 出现 → `Page.captureScreenshot` 存 `combobox-light.png`。再切 dark 重复存 `combobox-dark.png`。
5. （可选）截一张输入无匹配 query（如 "zzz"）验 Empty「无匹配项」空态。

- [ ] **Step 2: Read 截图看像素**

Read `combobox-light.png` + `combobox-dark.png`，核验：
- 输入框外壳 + chevron + clearable 清除按钮布局对。
- 弹层定位（贴输入框下方）+ 过滤后候选缩小 + `data-highlighted` 高亮项底色。
- 选中项打勾（ItemIndicator）。
- **焦点环**：聚焦输入框时外壳 `focus-within` ring 出现（验证 spec 的 `focus-within` 假设；若没出，回 Task 2 调整为 `focus-visible` 或 `has-[:focus-visible]`）。
- 空态「无匹配项」（若截了）。
- 明暗两态 token 翻转正确（surface/border/text 对比足）。

- [ ] **Step 3:（无 commit，截图是验证产物，不入库）**

截图问题 → 回对应 Task 修复重跑门禁。全绿且像素自证后进入收尾。

---

## Task 6: 收尾

- [ ] **Step 1: 更新项目记忆** `hulian-phase-status.md` 加 Combobox 条目（API 实证裁决 + 焦点环实测结论 + 固化坑）。
- [ ] **Step 2: claudeception** 评估是否沉淀新 skill（如 Combobox 内置过滤/List render fn/焦点环差异有非显然踩坑）。
- [ ] **Step 3: finishing-a-development-branch** 决定整合（本地 master trunk-based 直接 commit 已完成；确认工作树干净）。

---

## Self-Review（plan 对 spec）

- **spec §2 实证裁决** → Task 1/2 类型与组件全覆盖（items/filter/render fn/Empty/data 钩子/焦点环）。✅
- **spec §3 4 组件 facade** → Task 2 组件本体逐一实现。✅
- **spec §4 测试策略 6 用例** → Task 2 Step 1 含 6 用例（结构/闭合/展开/disabled/invalid/defaultValue）；过滤交互 → Task 5 截图。✅
- **spec §5 承载** → Task 3 showcase 闭合态触发器 + 截图先触发再截。✅
- **spec §6 落地清单（四件套+IA+门禁+并发）** → Task 3（四件套+barrel+门禁）+ Task 4（幂等 python IA）。✅
- **类型一致性**：`ComboboxItemData`/`comboboxInputShellVariants`/`comboboxShowcase` 命名跨 Task 一致。✅
- **占位扫描**：无 TBD/TODO；每个改代码步骤含完整代码 + 实测回退 Note。✅
