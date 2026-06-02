# 瑚琏 Hulian A2.2 — Select（下拉选择）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `@hulian/ui` 落地全 Base UI 的单选 Select（overlay 录入族），接入 www 文档站 IA。

**Architecture:** 复合组件薄包装 Base UI `@base-ui-components/react/select`（同 Dialog/Tooltip/Popover overlay 引擎）：`Select`(Root 透传) + `SelectTrigger`(button 外壳皮肤 + Value placeholder + Icon chevron) + `SelectContent`(Portal→Positioner→Popup→List) + `SelectItem`(Item + ItemText + ItemIndicator)。过渡用 motion token CSS 镜像，零 motion 运行时。守 overlay 红线、只消费语义 token、a11y 全 Base UI 兜底。

**Tech Stack:** Next.js 16 / React 19 / Base UI rc.0 / Tailwind v4 / CVA / Vitest / pnpm turbo monorepo。

**Spec:** `docs/superpowers/specs/2026-06-03-hulian-a2-overlay-select-design.md`

**全程实证结论（已用 require.resolve + context7 钉死，实现直接用，无需再查）：**
- Select parts 别名：`Root/Trigger/Value/Icon/Portal/Positioner/Popup/List/Item/ItemText/ItemIndicator`（`Backdrop/Arrow/ScrollUp/DownArrow/Group/GroupLabel` 本批不用）。
- **placeholder**：`<Select.Value placeholder={...}>` 有 `placeholder` prop（ReactNode）；配 Root `items={[{value,label}]}` 自动显示选中 label；无值显示 placeholder + 元素带 **`data-placeholder`** 属性。
- **open 态 data 属性**：Trigger/Icon = **`data-popup-open`**（非 data-open）；Popup = `data-open`/`data-closed` + `data-[starting-style]`/`data-[ending-style]`。
- **Item 态**：`data-selected`（选中，**≠ Tabs 的 data-active**）/ `data-highlighted`（键盘/指针高亮）/ `data-disabled`。ItemIndicator 仅 selected 时渲染。
- **Trigger** 渲 `<button>`，继承 `fieldValidityMapping`（Field 内自动 `data-invalid`）；独立使用手动翻译 `data-invalid`/`aria-invalid`。焦点在 Trigger 自身（self `focus-visible:`）。
- **锚宽/可用高 CSS 变量**：`var(--anchor-width)`（列表 ≥ trigger 宽）、`var(--available-height)`（最大高）可用。
- **alignItemWithTrigger**：默认 true（原生覆盖式）→ 本批设 **false**（现代下方弹出）。
- 图标：项目有 `lucide-react` dep，但本 plan 用**内联 SVG**（零版本风险，合 tooltip/popover 自绘家风）。

---

## Task 0: 记录绿色基线（隔离他人 untracked WIP）

**Files:** 无（只跑命令记录）

- [ ] **Step 1: 跑我 scope 之外的当前基线**

Run（**必 `--force`**，别信 turbo cache-hit；套 skill `turbo-test-red-isolate-untracked-wip-not-your-regression`）：
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck 2>&1 | tail -20
pnpm test --force 2>&1 | tail -40
pnpm build --filter=www --force 2>&1 | tail -20
```
Expected: 记录三者结果。**typecheck + build 应绿**；`pnpm test` 若有**他人并行 session 的 untracked WIP**（如 accordion/其它半成品）导致个别红，记录哪些文件红 → 后续判断"非我引入"，**不删改他人文件**（套 `parallel-session-git-add-all-sweeps-your-staged-files`）。

- [ ] **Step 2: 记录基线结论**

把"哪些绿、哪些因他人 WIP 红"写入本会话上下文，供 Task 3 验收对比。无 commit。

---

## Task 1: Select 四件套 + 主 barrel 导出（TDD）

**Files:**
- Create: `packages/ui/src/select/select.types.ts`
- Create: `packages/ui/src/select/select.tsx`
- Create: `packages/ui/src/select/select.showcase.tsx`
- Test: `packages/ui/src/select/select.test.tsx`
- Create: `packages/ui/src/select/index.ts`
- Modify: `packages/ui/src/index.ts`（主 barrel 加一行）

- [ ] **Step 1: 写类型 `select.types.ts`**

```ts
import type { ReactNode } from "react";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectTriggerProps {
  /** 无选中值时的占位文本（透传 Base UI Select.Value 的 placeholder）。 */
  placeholder?: ReactNode;
  size?: SelectSize;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  className?: string;
}

export interface SelectContentProps {
  children: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export interface SelectItemProps {
  /** 选项值（本批原始 string 值；对象值留后续批次）。 */
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}
```

- [ ] **Step 2: 写失败测试 `select.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./select";

const items = [
  { value: "sans", label: "无衬线" },
  { value: "serif", label: "衬线" },
  { value: "mono", label: "等宽" },
];

function Basic(props: {
  defaultValue?: string;
  open?: boolean;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}) {
  return (
    <Select items={items} defaultValue={props.defaultValue} open={props.open}>
      <SelectTrigger placeholder="请选择字体" size={props.size} invalid={props.invalid} />
      <SelectContent>
        {items.map((it) => (
          <SelectItem key={it.value} value={it.value}>
            {it.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// 用 placeholder 文本定位 trigger（鲁棒，不假设 role 名）。
const getTrigger = () => screen.getByText("请选择字体").closest("button")!;

describe("Select", () => {
  it("闭合态: 触发器在, 选项不在 DOM", () => {
    render(<Basic />);
    expect(getTrigger()).toBeTruthy();
    expect(screen.queryByText("衬线")).toBeNull();
  });

  it("placeholder: 无值时 Trigger 显示占位 + Value 带 data-placeholder", () => {
    render(<Basic />);
    const phSpan = screen.getByText("请选择字体");
    expect(phSpan.getAttribute("data-placeholder")).toBe("");
  });

  it("受控 open: Popup mount + surface 皮肤 + 选项渲染", () => {
    render(<Basic open />);
    expect(screen.getByText("无衬线")).toBeTruthy();
    expect(screen.getByText("等宽")).toBeTruthy();
    const popup = document.querySelector(".bg-surface.border-border");
    expect(popup).not.toBeNull();
  });

  it("选中态: defaultValue 对应 Item 带 data-selected", () => {
    render(<Basic defaultValue="serif" open />);
    const selected = document.querySelector("[role='option'][data-selected]");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("衬线");
  });

  it("size=lg: Trigger 应用 lg 高度类", () => {
    render(<Basic size="lg" />);
    expect(getTrigger().className).toContain("h-12");
  });

  it("invalid: Trigger 落 data-invalid + aria-invalid", () => {
    render(<Basic invalid />);
    const trigger = getTrigger();
    expect(trigger.getAttribute("data-invalid")).toBe("");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
  });
});
```

> **实证断言点**（若 jsdom 下 Base UI 实际输出与断言偏差，用 `superpowers:systematic-debugging` 先 `screen.debug()` 看真实 DOM 再调，不硬改实现）：①`[role='option']` 若非 option 改用 Item 渲染的实际 role/选择器；②受控 open 下 List measure 若报错，参照 Tabs Indicator 的 ResizeObserver 守卫经验排查。

- [ ] **Step 3: 跑测试确认失败**

Run: `cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm --filter @hulian/ui exec vitest run src/select/select.test.tsx 2>&1 | tail -20`
Expected: FAIL（`./select` 模块不存在 / 导出缺失）。

- [ ] **Step 4: 写实现 `select.tsx`**

```tsx
"use client";
import type { ComponentProps } from "react";
import { Select as BaseSelect } from "@base-ui-components/react/select";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { SelectContentProps, SelectItemProps, SelectTriggerProps } from "./select.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 的 CSS 镜像驱动 Base UI 原生过渡（同 Dialog/Tooltip/Popover）。
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

// Trigger 外壳：复用 Input 外壳气质；焦点环落 Trigger 自身（button 可聚焦 → self focus-visible，区别于 Slider 的内嵌 input has-）。
export const selectTriggerVariants = cva(
  [
    "inline-flex w-full items-center justify-between gap-2 rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "data-[popup-open]:border-ring",
    "data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger",
    "disabled:cursor-not-allowed disabled:opacity-50",
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

export function Select(props: ComponentProps<typeof BaseSelect.Root>) {
  return <BaseSelect.Root {...props} />;
}

export function SelectTrigger({ placeholder, size, invalid, className }: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger
      {...(invalid && { "data-invalid": "", "aria-invalid": true })}
      className={cn(selectTriggerVariants({ size }), className)}
    >
      <BaseSelect.Value placeholder={placeholder} className="truncate data-[placeholder]:text-muted" />
      <BaseSelect.Icon className="flex shrink-0 text-muted transition-transform data-[popup-open]:rotate-180">
        <ChevronDownIcon />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export function SelectContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
}: SelectContentProps) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignItemWithTrigger={false}
        className="z-50"
      >
        <BaseSelect.Popup
          className={cn(
            "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-[var(--radius)] border border-border bg-surface p-1 text-foreground shadow-xl outline-none",
            "transition-[opacity,transform] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          <BaseSelect.List>{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({ value, disabled, children, className }: SelectItemProps) {
  return (
    <BaseSelect.Item
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-[calc(var(--radius)-0.25rem)] py-1.5 pl-2 pr-8 text-sm outline-none",
        "data-[highlighted]:bg-muted/15 data-[highlighted]:text-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
    >
      <BaseSelect.ItemText className="truncate">{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="absolute right-2 flex items-center text-foreground">
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}
```

- [ ] **Step 5: 写 showcase `select.showcase.tsx`**

```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./select";

type Side = "top" | "bottom";
type Size = "sm" | "md" | "lg";

const FONTS = [
  { value: "sans", label: "无衬线 Sans" },
  { value: "serif", label: "衬线 Serif" },
  { value: "mono", label: "等宽 Mono" },
  { value: "cursive", label: "手写 Cursive" },
];

function Demo({
  placeholder = "请选择字体",
  size = "md",
  disabled = false,
  invalid = false,
  side = "bottom",
  defaultValue,
}: {
  placeholder?: string;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  side?: Side;
  defaultValue?: string;
}) {
  return (
    <div className="w-60">
      <Select items={FONTS} defaultValue={defaultValue} disabled={disabled}>
        <SelectTrigger placeholder={placeholder} size={size} invalid={invalid} />
        <SelectContent side={side}>
          {FONTS.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const selectShowcase: ShowcaseSpec = {
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "请选择字体", label: "占位文案" },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "side", type: "select", options: ["bottom", "top"], defaultValue: "bottom" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "无效态" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "已选值", render: () => <Demo defaultValue="serif" /> },
    { name: "禁用", render: () => <Demo disabled defaultValue="sans" /> },
    { name: "无效态", render: () => <Demo invalid /> },
    { name: "向上弹", render: () => <Demo side="top" placeholder="向上展开" /> },
    { name: "small", render: () => <Demo size="sm" defaultValue="mono" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      placeholder={p.placeholder as string}
      size={p.size as Size}
      side={p.side as Side}
      disabled={p.disabled as boolean}
      invalid={p.invalid as boolean}
    />
  ),
  toCode: (p) =>
    `<Select items={items} defaultValue="…">\n  <SelectTrigger placeholder="${p.placeholder}" size="${p.size}" />\n  <SelectContent side="${p.side}">\n    {items.map((it) => <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>)}\n  </SelectContent>\n</Select>`,
};
```

- [ ] **Step 6: 写桶导出 `index.ts`**

```ts
export { Select, SelectTrigger, SelectContent, SelectItem } from "./select";
export type { SelectTriggerProps, SelectContentProps, SelectItemProps, SelectSize } from "./select.types";
export { selectShowcase } from "./select.showcase";
```

- [ ] **Step 7: 主 barrel 加导出**

Read `packages/ui/src/index.ts`，照已有 tooltip/popover 行的**完全相同风格**追加 select 一行（若现有是 `export * from "./tooltip";` 则加 `export * from "./select";`；若是显式 `export { ... } from "./tooltip"` 则照该形式显式列出 select 的 4 组件 + 类型 + selectShowcase）。

- [ ] **Step 8: 跑 select 单测确认通过**

Run: `cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm --filter @hulian/ui exec vitest run src/select/select.test.tsx 2>&1 | tail -20`
Expected: PASS（6 测试全绿）。若某断言因 Base UI 真实 DOM 偏差，按 Step 2 的"实证断言点"用 systematic-debugging 调。

- [ ] **Step 9: typecheck**

Run: `cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck 2>&1 | tail -20`
Expected: PASS（含 `Select` 泛型 Root 透传无类型错）。

- [ ] **Step 10: Commit**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
git add packages/ui/src/select packages/ui/src/index.ts
git commit -m "feat(ui): Select 下拉选择（Base UI overlay 单选·守红线·四件套）

- 复合组件 Select/SelectTrigger/SelectContent/SelectItem，薄包 @base-ui-components/react/select
- Trigger 复用 Input 外壳气质 + self focus-visible 焦点环 + Icon chevron data-[popup-open] 翻转
- Value placeholder prop + items 自动 label + data-[placeholder] muted
- Content Portal→Positioner(alignItemWithTrigger=false 下方弹)→Popup(surface+motion CSS 镜像过渡)→List
- Item data-[highlighted]/data-[selected] + ItemIndicator 勾；锚宽 var(--anchor-width)
- 6 单测绿：闭合/placeholder/受控open/选中态/size/invalid

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: 接入 www 文档站 IA（manifest + registry）

**Files:**
- Modify: `apps/www/lib/manifest.ts`（+1 条目）
- Modify: `apps/www/lib/registry.tsx`（+1 import + 1 map 项）

> 套 skill `rsc-registry-split-data-from-spec-to-isolate-server-module-graph`：manifest 纯数据（server 可读）、registry `"use client"`（spec 映射）。

- [ ] **Step 1: manifest 加条目**

Read `apps/www/lib/manifest.ts`，在 `inputs` 分类相邻条目处照 `ComponentMeta` 接口字段对齐追加（注意现有条目字段顺序/命名）：
```ts
{ slug: "select", name: "Select", description: "下拉选择（单选）", category: "inputs", status: "new" },
```

- [ ] **Step 2: registry 加映射**

Read `apps/www/lib/registry.tsx`，照现有 import + map 风格追加：
```ts
// import 区（与其它 showcase 同处）：
import { selectShowcase } from "@hulian/ui";
// specBySlug 映射区：
select: selectShowcase,
```

- [ ] **Step 3: typecheck + 生产 build（必 --force --filter=www）**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck 2>&1 | tail -15
pnpm build --filter=www --force 2>&1 | tail -25
```
Expected: 两者 PASS；`/components/select` 进入 SSG 静态参数（`generateStaticParams` 读 manifest）。

- [ ] **Step 4: Commit**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): Select 接入 IA（inputs 分组 + registry 注册）

- manifest +1（slug=select, category=inputs, status=new）
- registry +1（selectShowcase 映射，client 岛消费）
- /components/select SSG 生成

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: 三道门 --force 全绿 + Playwright 明暗两态像素验收

**Files:** 无（验收；若发现 bug 才回 Task 1/2 修 + 补 commit）

- [ ] **Step 1: 三道门 --force 全绿确认**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck 2>&1 | tail -10
pnpm test --force 2>&1 | tail -40
pnpm build --filter=www --force 2>&1 | tail -15
```
Expected: typecheck + build 绿；`pnpm test` 我的 select 6 测试绿。与 Task 0 基线对比：**若有红，确认是否他人 untracked WIP**（非我引入则隔离记录、不背锅、不删改他人文件，套 `turbo-test-red-isolate-untracked-wip-not-your-regression`）。

- [ ] **Step 2: 起 dev 实例（端口策略）**

检查桌面 app 是否已在 5514（`lsof -i:5514`）：
- 已跑 5514 → 直接用 5514 截图（**别另起 5512**，会被 Next 16 dir-guard 拒，套 `nextjs-16-dev-server-dedupes-by-project-dir-not-port`）。
- 未跑 → `cd apps/www && pnpm dev`（5512）后台起。

- [ ] **Step 3: Playwright/chrome-devtools 截图明暗两态（先点开下拉再截）**

导航 `/components/select`，**先点击 Trigger 展开下拉**再截图（验弹层）。明暗各一组，存 **cwd 根**：
- `select-light-open.png` / `select-dark-open.png`（下拉展开：弹层在 trigger 下方、≥trigger 宽、选中项打勾、highlighted 高亮）
- `select-light-closed.png` / `select-dark-closed.png`（闭合：placeholder muted / 已选 label / 禁用态 / 无效态描边）
- 验 Trigger 焦点环（programmatic focus 或 Tab 聚焦后截）。

参考 tooltip/popover 截图脚本（`cdp-shot.mjs` 或 chrome-devtools MCP）。

- [ ] **Step 4: Read 截图看像素验收**

`Read` 每张 png（套 `ui-layout-verify-needs-screenshot-not-dom-eval`），核对：
1. 弹层定位（下方、不覆盖 trigger、宽 ≥ trigger）
2. 选中项 ✓ 勾位置正确（右侧）
3. highlighted 高亮（muted/15 底）
4. Trigger 焦点环（ring-ring + offset 双层）
5. placeholder muted 色（明暗都可读）
6. disabled 半透 + invalid danger 描边
7. chevron 在 open 态翻转 180°
8. 明暗两态语义 token 自适配（无写死色）

- [ ] **Step 5: 桌面 app(5514) 加载确认**

确认桌面 app 打开 `/components/select` 正常渲染（截图或目视）。

- [ ] **Step 6（仅当发现 bug）: 修复 + 补 commit**

若像素验收发现问题（如焦点环 self `focus-visible:` 不出环需改 `data-[focused]:`、弹层未等宽需调锚宽变量、过渡闪烁等），用 `superpowers:systematic-debugging` 定位 → 改 `select.tsx` → 重跑 Step 1 三道门 + Step 3 截图复验 → commit `fix(ui): Select <具体修复>`。

---

## 收尾（不在 task 内，主线执行）

- 更新项目记忆 `hulian-phase-status`：Select 完成、组件计数 +1、本批固化坑（placeholder=Value 的 prop / data-popup-open / data-selected≠active / 锚宽 var）。
- claudeception：评估是否沉淀 skill（如「Base UI Select data 属性族 + placeholder via Value prop」）。
