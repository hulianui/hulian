# 瑚琏 A2 导航族补充 实施计划 — Accordion 手风琴

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 吸取导航族 Accordion 手风琴，统一成瑚琏 API + 明暗 token 皮肤；单开/多开/可折叠，panel 展开收起走 **Base UI 内建的 `--accordion-panel-height` CSS 变量纯 CSS 高度过渡**（不手撸 scrollHeight、不引 motion）。

**Architecture（含 brainstorm 裁决）:** 建在 Base UI rc.0 `accordion` primitive 上，镜像 Dialog 的「多部件薄包 + `"use client"`」范式。四个导出件：
- **`Accordion`** = 透明转发 `Accordion.Root`（`multiple`/`value`/`defaultValue`/`disabled`/`onValueChange` 全经 `ComponentProps` 透传，不偷改 Base UI 默认 `multiple=true`，同 Switch/Dialog 转发 Root）+ 容器皮肤（`border`/`rounded`/item 间 `divide-y`）。
- **`AccordionItem`** = 薄包 `Accordion.Item`（转发 `value`/`disabled`）。
- **`AccordionTrigger`** = 打包 `Accordion.Header` + `Accordion.Trigger` + chevron 指示箭头；行皮肤（padding/hover/focus-ring/font），chevron 经 `group-data-[panel-open]:rotate-180` 随开合旋转。
- **`AccordionPanel`** = 薄包 `Accordion.Panel`，**Panel 本体零 padding**（border-box 下有 padding 会撑破塌到 0）：`overflow-hidden` + `h-[var(--accordion-panel-height)]` + `transition-[height]`（时长/曲线复用 `motionDurationCss.base`/`motionEaseCss.out` inline，同 Dialog）+ `data-[starting-style]:h-0 data-[ending-style]:h-0`；**内层 div 承载 padding** 与正文皮肤。

**关键 API 事实（require.resolve `@base-ui-components/react/accordion` 实证，rc.0）:**
- 子组件：`Accordion.Root / Item / Header / Trigger / Panel`。
- Root props：`value?`/`defaultValue?`（`AccordionValue = (any|null)[]` 数组）、**`multiple?` 默认 `true`**（⚠️ 不是 `openMultiple`）、`disabled?`、`keepMounted?`(默认 false)、`hiddenUntilFound?`、`loopFocus?`(默认 true)、`onValueChange?`、`orientation?`。
- `Item.value?: any`（缺省自动生成 id）。
- Panel 自动在 inline style 暴露 `--accordion-panel-height` / `--accordion-panel-width`（Base UI 内部测量），data 属性 `data-open`/`data-starting-style`/`data-ending-style`/`data-index`/`data-disabled`/`data-orientation`；`keepMounted` 默认 false（关闭即卸载，Base UI 延后到出场过渡结束才卸，同 Dialog Backdrop）。
- Trigger（`<button>`）data 属性 `data-panel-open`（面板开时present）/`data-disabled`；Item data 属性 `data-open`。

**Tech Stack:** Next 16 (App Router/SSG) · React 19 · Base UI rc.0 (accordion) · Tailwind v4 (语义 token) · 现有 motion 时长/曲线 token · vitest 3.2 + jsdom + @testing-library/react · pnpm + Turborepo。

**上游 spec:** `docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md`（§3.4 分类法 navigation 含 Accordion · §6 硬约束）。本计划无需回写主 spec §4（§4 第一批清单表未含 Accordion，§3.4 已把 Accordion 列为 navigation 占位 → 本计划只是落地占位，spec 文本无须改判）。

---

## File Structure

**Task D1 — Accordion（四件套）**
- Create: `packages/ui/src/accordion/accordion.tsx` — 四部件薄包 + 高度过渡皮肤 + chevron。
- Create: `packages/ui/src/accordion/accordion.types.ts` — 四个 Props 类型（ComponentProps 转发）。
- Create: `packages/ui/src/accordion/accordion.showcase.tsx` — `"use client"` ShowcaseSpec（states 演示单开/多开/禁用）。
- Create: `packages/ui/src/accordion/accordion.test.tsx` — 结构 + 开合行为 + 单/多开 + 皮肤钩子。
- Create: `packages/ui/src/accordion/index.ts` — 桶导出。
- Modify: `packages/ui/src/index.ts` — `export * from "./accordion"`。

**Task D2 — 接 IA + 验收**
- Modify: `apps/www/lib/manifest.ts` — 追加 1 条（category `navigation`，status `new`）。
- Modify: `apps/www/lib/registry.tsx` — +1 import 名 + 1 map 行。

---

## 约定速查（执行者必读）

**可用语义 token（仅这些，无 success/warning）**：`bg-bg` `bg-surface` `bg-surface-hover` `text-foreground` `text-muted` `border-border` `ring-ring` `bg-primary` `text-primary-foreground` `text-primary`；圆角 `rounded-[var(--radius)]`。

**import 路径**：组件内 `import { cn } from "../lib/cn"`；`import { motionDurationCss, motionEaseCss } from "../motion"`；Base UI `import { Accordion as BaseAccordion } from "@base-ui-components/react/accordion"`。

**四件套**：`accordion.tsx` + `accordion.types.ts` + `accordion.showcase.tsx`（必 `"use client"`）+ `accordion.test.tsx` + `index.ts`（桶导出组件/类型/showcase）。本体用 Base UI(client) → 加 `"use client"`。

**门禁节奏**（沿用既验证模式）：
- 组件 Task TDD 循环：`pnpm --filter @hulian/ui exec vitest run accordion`（先红后绿）。
- 组件 Task commit 前：`pnpm typecheck`。
- **完整三道门 + 生产 build 只在 D2 跑一次**：`pnpm typecheck && pnpm test && pnpm build --filter=www`（**build 必 `--filter=www`**——全包 build 撞 desktop tauri `beforeBuildCommand` 二次 build www）。
- **Playwright 截图实测只在 D2**：明暗两态各一张，存 cwd 根 `/Users/zhangzhiwei/Desktop/code/hulian/*.png`，Read 看像素（验 panel 展开/收起、箭头旋转、多 item 间距、focus ring；别只读 DOM）。端口 5512/5514（桌面 app 已跑 5514 则用 5514）。

**trunk-based**：直接在 master 小步 commit，无 remote、不 push。

---

## Task 0: 确认绿色基线

**Files:** 无（只读校验）

- [ ] **Step 1: 跑完整三道门，记录基线**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck && pnpm test && pnpm build --filter=www
```
Expected: 全绿（10 组件收尾态 `4e974dc`）。**若此处已红，先停下报告——是存量问题。**

---

## Task D1: Accordion（四件套，TDD）

- [ ] **Step 1: 写 accordion 测试（先红）**

Create `packages/ui/src/accordion/accordion.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "./accordion";

function Three(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="a">
        <AccordionTrigger>问题一</AccordionTrigger>
        <AccordionPanel>答案一</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>问题二</AccordionTrigger>
        <AccordionPanel>答案二</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("trigger 渲染为 button + 文字 + chevron", () => {
    const { getByText } = render(<Three />);
    const trigger = getByText("问题一").closest("button")!;
    expect(trigger).toBeTruthy();
    // chevron：trigger 内带旋转钩子的指示元素
    expect(trigger.querySelector("[data-chevron]")).toBeTruthy();
  });

  it("默认全闭合：trigger aria-expanded=false", () => {
    const { getByText } = render(<Three />);
    expect(getByText("问题一").closest("button")!.getAttribute("aria-expanded")).toBe("false");
  });

  it("点击 trigger 展开对应 item（aria-expanded=true + item data-open）", () => {
    const { getByText } = render(<Three />);
    const trigger = getByText("问题一").closest("button")!;
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.hasAttribute("data-panel-open")).toBe(true);
  });

  it("multiple=false（单开）：开第二个时第一个自动闭合", () => {
    const { getByText } = render(<Three multiple={false} defaultValue={["a"]} />);
    const t1 = getByText("问题一").closest("button")!;
    const t2 = getByText("问题二").closest("button")!;
    expect(t1.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(t2);
    expect(t2.getAttribute("aria-expanded")).toBe("true");
    expect(t1.getAttribute("aria-expanded")).toBe("false"); // 单开互斥
  });

  it("multiple=true（多开）：两个可同时展开", () => {
    const { getByText } = render(<Three multiple defaultValue={["a"]} />);
    const t1 = getByText("问题一").closest("button")!;
    const t2 = getByText("问题二").closest("button")!;
    fireEvent.click(t2);
    expect(t1.getAttribute("aria-expanded")).toBe("true");
    expect(t2.getAttribute("aria-expanded")).toBe("true"); // 多开共存
  });

  it("可折叠：再次点击已开 item 可收起", () => {
    const { getByText } = render(<Three defaultValue={["a"]} />);
    const t1 = getByText("问题一").closest("button")!;
    expect(t1.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(t1);
    expect(t1.getAttribute("aria-expanded")).toBe("false"); // 折叠回零
  });

  it("Panel 皮肤带高度过渡钩子（var 高度 + overflow-hidden + ending 塌零）", () => {
    const { getByText } = render(<Three defaultValue={["a"]} />);
    // open 态 panel 在 DOM（keepMounted=false 默认下，open 的 item panel 已挂载）
    const panel = getByText("答案一").closest("[role='region']")!;
    expect(panel.className).toContain("overflow-hidden");
    expect(panel.className).toContain("[--accordion-panel-height]"); // h-[var(--accordion-panel-height)]
    expect(panel.className).toContain("data-[ending-style]:h-0");
  });

  it("chevron 带 group-data-[panel-open] 旋转钩子", () => {
    const { getByText } = render(<Three />);
    const chevron = getByText("问题一").closest("button")!.querySelector("[data-chevron]")!;
    expect(chevron.getAttribute("class")).toContain("group-data-[panel-open]:rotate-180");
  });

  it("容器皮肤：border + 圆角 + item 间分隔", () => {
    const { container } = render(<Three />);
    const root = container.firstElementChild!;
    expect(root.className).toContain("border");
    expect(root.className).toContain("divide-y");
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulian/ui exec vitest run accordion`
Expected: FAIL —— `./accordion` 不存在。

- [ ] **Step 3: 实现 accordion.types.ts**

Create `packages/ui/src/accordion/accordion.types.ts`:
```ts
import type { ComponentProps } from "react";
import { Accordion as BaseAccordion } from "@base-ui-components/react/accordion";

export type AccordionProps = ComponentProps<typeof BaseAccordion.Root>;
export type AccordionItemProps = ComponentProps<typeof BaseAccordion.Item>;
export type AccordionTriggerProps = ComponentProps<typeof BaseAccordion.Trigger>;
export type AccordionPanelProps = ComponentProps<typeof BaseAccordion.Panel>;
```

- [ ] **Step 4: 实现 accordion.tsx**

Create `packages/ui/src/accordion/accordion.tsx`:
```tsx
"use client";
import { Accordion as BaseAccordion } from "@base-ui-components/react/accordion";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionPanelProps,
} from "./accordion.types";

// 容器：透明转发 Root（不偷改 Base UI 默认 multiple=true）+ 边框/圆角/item 分隔皮肤。
export function Accordion({ className, ...props }: AccordionProps) {
  return (
    <BaseAccordion.Root
      {...props}
      className={cn(
        "w-full divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border bg-surface text-foreground",
        className,
      )}
    />
  );
}

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <BaseAccordion.Item {...props} className={cn(className)} />;
}

// Header(语义 heading) + Trigger(button) + chevron 打包；group 让 chevron 读父 data-panel-open。
export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <BaseAccordion.Header>
      <BaseAccordion.Trigger
        {...props}
        className={cn(
          "group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-foreground outline-none transition-colors",
          "hover:bg-surface-hover",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
          className,
        )}
      >
        {children}
        <svg
          data-chevron
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0 text-muted transition-transform duration-200 group-data-[panel-open]:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

// Panel 本体零 padding（border-box 下 padding 会撑破塌零）；高度走 Base UI 内建 --accordion-panel-height 纯 CSS 过渡。
// 时长/曲线复用 motion token CSS 镜像（同 Dialog）—— 与 Button(motion) 同手感、零混库。
export function AccordionPanel({ className, children, ...props }: AccordionPanelProps) {
  return (
    <BaseAccordion.Panel
      {...props}
      style={{
        transitionDuration: motionDurationCss.base,
        transitionTimingFunction: motionEaseCss.out,
      }}
      className={cn(
        "h-[var(--accordion-panel-height)] overflow-hidden transition-[height]",
        "data-[starting-style]:h-0 data-[ending-style]:h-0",
        className,
      )}
    >
      <div className="px-4 pb-4 pt-1 text-sm text-muted">{children}</div>
    </BaseAccordion.Panel>
  );
}
```

- [ ] **Step 5: 实现 accordion.showcase.tsx**

Create `packages/ui/src/accordion/accordion.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "./accordion";

const FAQ = [
  { v: "ship", q: "瑚琏怎么发版？", a: "本地 master 直接 commit，trunk-based，无 remote。三道门全绿即可。" },
  { v: "token", q: "颜色怎么适配明暗？", a: "只消费语义 token，禁写死裸值；Tailwind v4 dark variant 自动换肤。" },
  { v: "a11y", q: "无障碍谁兜底？", a: "焦点环/键盘/ARIA 全交给 Base UI primitive，瑚琏只换皮肤。" },
];

function Demo(props: { multiple?: boolean; defaultValue?: string[]; disabledItem?: boolean }) {
  return (
    <Accordion
      multiple={props.multiple}
      defaultValue={props.defaultValue}
      className="w-80 max-w-full"
    >
      {FAQ.map((f, i) => (
        <AccordionItem key={f.v} value={f.v} disabled={props.disabledItem && i === 1}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionPanel>{f.a}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export const accordionShowcase: ShowcaseSpec = {
  controls: [
    { prop: "multiple", type: "boolean", defaultValue: false, label: "multiple（多开）" },
    { prop: "disabledItem", type: "boolean", defaultValue: false, label: "禁用第二项" },
  ],
  states: [
    { name: "单开（默认收起）", render: () => <Demo multiple={false} /> },
    { name: "单开·首项展开", render: () => <Demo multiple={false} defaultValue={["ship"]} /> },
    { name: "多开", render: () => <Demo multiple defaultValue={["ship", "token"]} /> },
    { name: "含禁用项", render: () => <Demo disabledItem defaultValue={["ship"]} /> },
  ],
  renderWithProps: (p) => (
    <Demo multiple={p.multiple as boolean} disabledItem={p.disabledItem as boolean} defaultValue={["ship"]} />
  ),
  toCode: (p) =>
    `<Accordion${p.multiple ? " multiple" : ""} defaultValue={["ship"]}>\n  <AccordionItem value="ship">\n    <AccordionTrigger>瑚琏怎么发版？</AccordionTrigger>\n    <AccordionPanel>本地 master 直接 commit…</AccordionPanel>\n  </AccordionItem>\n  {/* …更多 item */}\n</Accordion>`,
};
```

- [ ] **Step 6: 实现 index.ts**

Create `packages/ui/src/accordion/index.ts`:
```ts
export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "./accordion";
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionPanelProps,
} from "./accordion.types";
export { accordionShowcase } from "./accordion.showcase";
```

- [ ] **Step 7: 主 index 导出 accordion**

在 `packages/ui/src/index.ts` 组件区加（紧跟 `export * from "./field";` 之后）:
```ts
export * from "./accordion";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulian/ui exec vitest run accordion`
Expected: PASS（结构 + 开合 + 单/多开 + 折叠 + 皮肤钩子全绿）。

- [ ] **Step 9: typecheck + Commit**

Run: `pnpm typecheck`
```bash
git add packages/ui/src/accordion packages/ui/src/index.ts
git commit -m "feat(ui): Accordion 组件(Base UI 四部件薄包 + --accordion-panel-height 纯 CSS 高度过渡 + chevron 旋转)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task D2: 接 IA + 验收（首个 navigation 分组）

- [ ] **Step 1: manifest 追加 1 条（首个 navigation 项）**

在 `apps/www/lib/manifest.ts` 的 `manifest` 数组末尾追加:
```ts
  { slug: "accordion", name: "Accordion", description: "手风琴 · Base UI 单/多开 + 高度过渡", category: "navigation", status: "new" },
```

- [ ] **Step 2: registry 追加 1 import + 1 map**

`apps/www/lib/registry.tsx`：import 块加 `accordionShowcase`，map 加 `accordion: accordionShowcase`。

- [ ] **Step 3: 契约测试（manifest↔registry 一致）**

Run: `pnpm --filter www exec vitest run manifest`
Expected: PASS —— 11 个 slug 双边齐全。

- [ ] **Step 4: 完整三道门**

Run: `pnpm typecheck && pnpm test && pnpm build --filter=www`
Expected: 全绿；SSG 生成 `/components/accordion`；左树新增「导航」分组。

- [ ] **Step 5: Playwright 截图明暗两态 + 像素 Read**

起 dev（5512；若桌面 app 已跑 5514 则用 5514）。访问 `/components/accordion`，明暗各截一张存 cwd 根（`accordion-light.png`/`accordion-dark.png`），Read 看像素逐项确认：
- 左树新增「导航」分组、Accordion 带 `new` 标记、高亮当前页；
- **展开态**：panel 内容可见、箭头朝上（旋转 180）、内容有左右下内距不贴边；
- **收起态**：panel 塌到 0、箭头朝下；
- 多 item 间有分隔线、间距均匀；hover/focus 行底色/ring 正常；
- 明暗两态同步换肤、文字对比足够（`text-muted` 正文可读）、无白闪。
- （可选）桌面 app(5514) 壳内加载正常。

- [ ] **Step 6: Commit**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): Accordion 接入 IA(首个 navigation 分组) + 11 组件契约齐

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完成标志

- 左树新增「导航」分组，Accordion(`new`) 独立 `/components/accordion` SSG 页。
- 四件套齐、只消费语义 token、明暗自适应、`"use client"` 正确、a11y 由 Base UI 兜底（heading/button/aria-expanded/键盘方向键）。
- panel 展开/收起高度过渡顺滑（Base UI `--accordion-panel-height` 纯 CSS）、chevron 随开合旋转（Playwright 像素自证）。
- 单开互斥 / 多开共存 / 可折叠回零，三态行为测试覆盖。
- 三道门全绿；契约测试 11 slug 双边齐全；`ShowcaseSpec` 类型未动、未引新依赖。
</content>
</invoke>
