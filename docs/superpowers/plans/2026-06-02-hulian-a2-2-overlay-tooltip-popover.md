# 瑚琏 A2.2 实施计划 — overlay 浮层族起步 Tooltip + Popover

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **本次执行注记（2026-06-02）**：因 master 有活跃并行 WIP（未跟踪 accordion/slider/tabs），共享文件竞争 + 门禁污染隔离判断风险高，作者选择 **inline TDD 亲自执行**而非派子 agent，产出口径不变。

**Goal:** 吸取 overlay 浮层族前两件 Tooltip·Popover（全 Base UI rc.0，与 Dialog 同 Portal/Positioner 引擎），并以之确立「overlay 在 showcase 里以交互触发器承载」的全族通用约定。

**Architecture:** 两组件镜像 Dialog 的「薄包 Root + 透传子件 + 复合 Content」。`TooltipContent`/`PopoverContent` 内固定 `Portal>Positioner>Popup(+Arrow)`（实测 Positioner 必须包 Portal，不能内联）；定位/碰撞/箭头交 Base UI Positioner（`positionMethod` 默认 absolute、`side`/`align`/`sideOffset` 直通）。Tooltip 反相气泡 `bg-foreground/text-bg`，Popover 抬升 surface 面板。motion 复用 Dialog 的 CSS 镜像 token 驱动原生过渡。承载约定 = states 渲染闭合态触发器、零 `ShowcaseSpec` 改动。

**Tech Stack:** Next 16(App Router/SSG) · React 19 · Base UI rc.0(tooltip/popover) · Tailwind v4(语义 token) · CVA 不需要(无尺寸变体，静态皮肤) · vitest 3.2 + jsdom + @testing-library/react · pnpm + Turborepo。

**上游 spec:** `docs/superpowers/specs/2026-06-02-hulian-a2-2-overlay-tooltip-popover-design.md`（本计划覆盖其 §3 API / §4 承载 / §6 测试 / §8 步骤 / §9 验收）。

---

## 约定速查（执行者必读）

**可用语义 token（仅这些，无 success/warning）**：Tooltip 用 `bg-foreground`/`text-bg`/`shadow-md`；Popover 用 `bg-surface`/`text-foreground`/`text-muted`/`border-border`/`shadow-xl`；圆角 `rounded-[var(--radius)]`；层级 `z-50`。`bg-foreground`/`text-bg` 均因对应 `--color-*` 已注册而自动可用（`text-foreground`/`bg-bg` 已在用即证）。

**import 路径**：组件内 `import { cn } from "../lib/cn"`；motion `import { motionDurationCss, motionEaseCss } from "../motion"`；Base UI `import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip"`、`import { Popover as BasePopover } from "@base-ui-components/react/popover"`；showcase 里 `import { Button } from "../button/button"`。

**实测钉死的 API 事实（防漂移）**：
- 子件：Tooltip=`Root/Trigger/Portal/Positioner/Popup/Arrow/Provider`；Popover=`Root/Trigger/Portal/Positioner/Popup/Arrow/Title/Description/Close`（Backdrop 不用）。
- **Positioner 必须包在 `<X.Portal>` 内**，否则抛 `Base UI: <X.Portal> is missing.`（实测）→ Content 永远带 Portal，无 `portal` 开关。
- **`delay` 在 `TooltipProvider`（`delay`/`closeDelay`/`timeout`），不在 Root**：showcase 用 `<TooltipProvider delay={0} closeDelay={0}>` 包裹实现 hover 即开（截图稳态）。组件本身无 Provider 也能用（默认 delay）。
- Positioner props：`side`(默认 bottom)/`align`(默认 center)/`sideOffset`(默认 0)/`positionMethod`(默认 absolute)。Tooltip 默认朝向取 `top`，Popover 取 `bottom`。
- Root 受控 `open` + Trigger/Close 用 `render={<Button/>}`（同 Dialog 范式）。
- **jsdom 实测**：带 Portal 的受控 `open` 浮层能 mount，`screen.getByText(内容)` 通过 → open 态结构/皮肤/a11y 可单测，无需 polyfill。

**门禁节奏**（沿用批次一/Step2）：每组件 TDD 先红后绿 `pnpm --filter @hulian/ui exec vitest run <名>`；commit 前 `pnpm typecheck`。**完整三道门 + 生产 build 只在 D3 跑一次**：`pnpm typecheck && pnpm test && pnpm build --filter=www`（build 必 `--filter=www`）。

**⚠️ 并行 WIP 隔离（本次特有，套 `turbo-test-red-isolate-untracked-wip-not-your-regression`）**：
- 全程 `git add` **精确路径**，**绝不 `git add -A`**（未跟踪 accordion/slider/tabs/`*.png`/`.playwright-mcp/` 不得卷入）。
- 改 `index.ts`/`manifest.ts`/`registry.tsx` 前**必 fresh 重读**（别人可能已改），只 append 自己的行。
- D3 完整 `pnpm test` 若红：先按**失败文件名**核——∈ 未跟踪 sibling（accordion/slider/tabs 等）= 非我回归，**surface 不修**；我只对 `vitest run tooltip popover` 全绿负责。必要时 `turbo run test --force` 防缓存掩盖。

**trunk-based**：直接 master 小步 commit，无 remote、不 push。

---

## Task 0: 确认绿色基线 ✅（已完成）

**Files:** 无（只读）

- [x] **Step 1: 跑 typecheck + test 基线** — 已跑：typecheck 3/3 绿；test 62 ui(含未跟踪 accordion 9/slider 7)+4 www 全绿，`Cached:0`(真实执行非缓存)。基线干净，accordion WIP 当前不污染。build 留 D3 跑。

---

## Task D1: Tooltip（四件套，TDD）

**Files:**
- Create: `packages/ui/src/tooltip/tooltip.test.tsx`
- Create: `packages/ui/src/tooltip/tooltip.tsx`
- Create: `packages/ui/src/tooltip/tooltip.types.ts`
- Create: `packages/ui/src/tooltip/tooltip.showcase.tsx`
- Create: `packages/ui/src/tooltip/index.ts`
- Modify: `packages/ui/src/index.ts`（fresh 重读后 append 一行）

- [ ] **Step 1: 写 tooltip 测试（先红）**

Create `packages/ui/src/tooltip/tooltip.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

describe("Tooltip", () => {
  it("闭合态: 触发器在, 浮层文本不在 DOM", () => {
    render(
      <Tooltip>
        <TooltipTrigger render={<button>悬停</button>} />
        <TooltipContent>提示内容</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByText("悬停")).toBeTruthy();
    expect(screen.queryByText("提示内容")).toBeNull();
  });

  it("受控 open: 浮层 Portal mount + 反相气泡皮肤(bg-foreground/text-bg)", () => {
    render(
      <Tooltip open>
        <TooltipTrigger render={<button>悬停</button>} />
        <TooltipContent>提示内容</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByText("提示内容")).toBeTruthy();
    const popup = document.querySelector(".bg-foreground.text-bg");
    expect(popup).not.toBeNull();
    expect(popup!.textContent).toContain("提示内容");
  });

  it("open 态触发器 a11y: aria-describedby 串浮层", () => {
    render(
      <Tooltip open>
        <TooltipTrigger render={<button>悬停</button>} />
        <TooltipContent>提示内容</TooltipContent>
      </Tooltip>,
    );
    const trigger = screen.getByText("悬停");
    expect(trigger.getAttribute("aria-describedby")).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulian/ui exec vitest run tooltip`
Expected: FAIL —— `./tooltip` 不存在。

- [ ] **Step 3: 实现 tooltip.types.ts**

Create `packages/ui/src/tooltip/tooltip.types.ts`:
```ts
import type { ReactNode } from "react";

export interface TooltipContentProps {
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}
```

- [ ] **Step 4: 实现 tooltip.tsx**

Create `packages/ui/src/tooltip/tooltip.tsx`:
```tsx
"use client";
import type { ComponentProps } from "react";
import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { TooltipContentProps } from "./tooltip.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 的 CSS 镜像驱动 Base UI 原生过渡（与 Dialog 同手感）。
const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

export function Tooltip(props: ComponentProps<typeof BaseTooltip.Root>) {
  return <BaseTooltip.Root {...props} />;
}

export const TooltipTrigger = BaseTooltip.Trigger;
export const TooltipProvider = BaseTooltip.Provider; // 可选：多 tooltip 共享 delay 分组 / 设 delay

export function TooltipContent({
  children,
  side = "top",
  align = "center",
  sideOffset = 8,
  className,
}: TooltipContentProps) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BaseTooltip.Popup
          className={cn(
            "rounded-[var(--radius)] bg-foreground px-2.5 py-1 text-xs text-bg shadow-md outline-none",
            "transition-[opacity,transform] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {children}
          {/* 箭头：Base UI Positioner 沿边居中定位，瑚琏给皮肤；旋转方块成尖。几何在 D3 Playwright 调。 */}
          <BaseTooltip.Arrow className="-z-10">
            <span className="block h-2 w-2 rotate-45 bg-foreground" />
          </BaseTooltip.Arrow>
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
```

- [ ] **Step 5: 实现 tooltip.showcase.tsx**

Create `packages/ui/src/tooltip/tooltip.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "./tooltip";
import { Button } from "../button/button";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

function Demo({ side = "top", align = "center", text = "瑚琏提示" }: { side?: Side; align?: Align; text?: string }) {
  // delay=0 让 hover 即开，截图/实看稳态（delay 在 Provider 不在 Root）。
  return (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline">悬停查看</Button>} />
        <TooltipContent side={side} align={align}>
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const tooltipShowcase: ShowcaseSpec = {
  controls: [
    { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "top" },
    { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "center" },
    { prop: "text", type: "text", defaultValue: "瑚琏提示", label: "提示文案" },
  ],
  states: [
    { name: "top", render: () => <Demo side="top" /> },
    { name: "right", render: () => <Demo side="right" text="向右" /> },
    { name: "bottom", render: () => <Demo side="bottom" text="向下" /> },
    { name: "left", render: () => <Demo side="left" text="向左" /> },
    { name: "长文案", render: () => <Demo text="较长的提示文案验证最大宽度与换行表现" /> },
  ],
  renderWithProps: (p) => (
    <Demo side={p.side as Side} align={p.align as Align} text={p.text as string} />
  ),
  toCode: (p) =>
    `<Tooltip>\n  <TooltipTrigger render={<Button>悬停查看</Button>} />\n  <TooltipContent side="${p.side}" align="${p.align}">${p.text}</TooltipContent>\n</Tooltip>`,
};
```

- [ ] **Step 6: 实现 index.ts 桶导出**

Create `packages/ui/src/tooltip/index.ts`:
```ts
export { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "./tooltip";
export type { TooltipContentProps } from "./tooltip.types";
export { tooltipShowcase } from "./tooltip.showcase";
```

- [ ] **Step 7: 主 index 导出 tooltip（fresh 重读后 append）**

先 `Read packages/ui/src/index.ts` 取当前态（并行 WIP 可能已改）；在「组件」区末尾 append:
```ts
export * from "./tooltip";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulian/ui exec vitest run tooltip`
Expected: PASS（3 用例绿；若 `aria-describedby` 在受控 open 下 Base UI 未串，按实测改断言为「存在 role=tooltip 浮层」并记录——TDD 实测优先）。

- [ ] **Step 9: typecheck + Commit（精确路径）**

Run: `pnpm typecheck` → 无错（若报错在 accordion/slider/tabs 等未跟踪文件 = 非我，surface 不修；我的 tooltip 文件须零错）。
```bash
git add packages/ui/src/tooltip packages/ui/src/index.ts
git commit -m "feat(ui): Tooltip 组件(Base UI Positioner 浮层 + 反相气泡皮肤 + 箭头 + hover 触发)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task D2: Popover（四件套，TDD）

**Files:**
- Create: `packages/ui/src/popover/popover.test.tsx`
- Create: `packages/ui/src/popover/popover.tsx`
- Create: `packages/ui/src/popover/popover.types.ts`
- Create: `packages/ui/src/popover/popover.showcase.tsx`
- Create: `packages/ui/src/popover/index.ts`
- Modify: `packages/ui/src/index.ts`（fresh 重读后 append 一行）

- [ ] **Step 1: 写 popover 测试（先红）**

Create `packages/ui/src/popover/popover.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "./popover";

describe("Popover", () => {
  it("闭合态: 触发器在, 面板内容不在 DOM", () => {
    render(
      <Popover>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题">正文</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("打开")).toBeTruthy();
    expect(screen.queryByText("标题")).toBeNull();
    expect(screen.queryByText("正文")).toBeNull();
  });

  it("受控 open: title/description/children 渲染 + surface 面板皮肤", () => {
    render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题" description="说明">
          正文
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("标题")).toBeTruthy();
    expect(screen.getByText("说明")).toBeTruthy();
    expect(screen.getByText("正文")).toBeTruthy();
    const popup = document.querySelector(".bg-surface.border-border");
    expect(popup).not.toBeNull();
  });

  it("PopoverClose 在面板内渲出可点按钮", () => {
    render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题">
          <PopoverClose render={<button>关闭</button>} />
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("关闭")).toBeTruthy();
  });

  it("open 态触发器 aria-expanded=true + aria-haspopup", () => {
    render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题">正文</PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByText("打开");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-haspopup")).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulian/ui exec vitest run popover`
Expected: FAIL —— `./popover` 不存在。

- [ ] **Step 3: 实现 popover.types.ts**

Create `packages/ui/src/popover/popover.types.ts`:
```ts
import type { ReactNode } from "react";

export interface PopoverContentProps {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}
```

- [ ] **Step 4: 实现 popover.tsx**

Create `packages/ui/src/popover/popover.tsx`:
```tsx
"use client";
import type { ComponentProps } from "react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { PopoverContentProps } from "./popover.types";

const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

export function Popover(props: ComponentProps<typeof BasePopover.Root>) {
  return <BasePopover.Root {...props} />;
}

export const PopoverTrigger = BasePopover.Trigger;
export const PopoverClose = BasePopover.Close;

export function PopoverContent({
  title,
  description,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  className,
}: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BasePopover.Popup
          className={cn(
            "w-[min(90vw,18rem)] rounded-[var(--radius)] border border-border bg-surface p-4 text-foreground shadow-xl outline-none",
            "transition-[opacity,transform] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {title != null && (
            <BasePopover.Title className="text-sm font-semibold text-foreground">{title}</BasePopover.Title>
          )}
          {description != null && (
            <BasePopover.Description className="mt-1 text-xs text-muted">{description}</BasePopover.Description>
          )}
          {children != null && <div className="mt-2 text-sm text-foreground">{children}</div>}
          {/* 箭头：surface 方块（无 border，避免逐 side 描边复杂度）；几何 D3 Playwright 调。 */}
          <BasePopover.Arrow className="-z-10">
            <span className="block h-2 w-2 rotate-45 border-b border-r border-border bg-surface" />
          </BasePopover.Arrow>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
```

- [ ] **Step 5: 实现 popover.showcase.tsx**

Create `packages/ui/src/popover/popover.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Popover, PopoverTrigger, PopoverClose, PopoverContent } from "./popover";
import { Button } from "../button/button";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

function Demo({
  side = "bottom",
  align = "center",
  title = "瑚琏弹层",
  withClose = true,
}: { side?: Side; align?: Align; title?: string; withClose?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger render={<Button>打开弹层</Button>} />
      <PopoverContent side={side} align={align} title={title} description="点击外部或 Esc 关闭。">
        <div className="flex justify-end gap-2">
          {withClose && <PopoverClose render={<Button variant="ghost">取消</Button>} />}
          <PopoverClose render={<Button>确定</Button>} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const popoverShowcase: ShowcaseSpec = {
  controls: [
    { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "bottom" },
    { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "center" },
    { prop: "title", type: "text", defaultValue: "瑚琏弹层", label: "标题" },
    { prop: "withClose", type: "boolean", defaultValue: true, label: "含取消按钮" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "含交互", render: () => <Demo withClose title="确认操作" /> },
    { name: "top", render: () => <Demo side="top" title="向上弹" /> },
    { name: "right", render: () => <Demo side="right" title="向右弹" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      side={p.side as Side}
      align={p.align as Align}
      title={p.title as string}
      withClose={p.withClose as boolean}
    />
  ),
  toCode: (p) =>
    `<Popover>\n  <PopoverTrigger render={<Button>打开弹层</Button>} />\n  <PopoverContent side="${p.side}" align="${p.align}" title="${p.title}">\n    {/* 内容 + <PopoverClose/> */}\n  </PopoverContent>\n</Popover>`,
};
```

- [ ] **Step 6: 实现 index.ts**

Create `packages/ui/src/popover/index.ts`:
```ts
export { Popover, PopoverTrigger, PopoverClose, PopoverContent } from "./popover";
export type { PopoverContentProps } from "./popover.types";
export { popoverShowcase } from "./popover.showcase";
```

- [ ] **Step 7: 主 index 导出 popover（fresh 重读后 append）**

`Read packages/ui/src/index.ts`，在组件区 append（紧跟 `export * from "./tooltip";` 后）:
```ts
export * from "./popover";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulian/ui exec vitest run popover`
Expected: PASS（4 用例绿；aria-haspopup/expanded 若值不符按实测调）。

- [ ] **Step 9: typecheck + Commit（精确路径）**

Run: `pnpm typecheck` → 我的 popover 文件零错。
```bash
git add packages/ui/src/popover packages/ui/src/index.ts
git commit -m "feat(ui): Popover 组件(Base UI Positioner 面板 + 标题/描述/Close + 箭头 + click 触发)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task D3: 接 IA + 验收 + Playwright 截图

**Files:**
- Modify: `apps/www/lib/manifest.ts`（fresh 重读后 append 2 条）
- Modify: `apps/www/lib/registry.tsx`（fresh 重读后 +2 import +2 map）

- [ ] **Step 1: manifest 追加 2 条（feedback/new）**

`Read apps/www/lib/manifest.ts`，在 `manifest` 数组 feedback 区（`alert` 条目后）append:
```ts
  { slug: "tooltip", name: "Tooltip", description: "提示浮层 · Base UI Positioner + 箭头 + hover 触发", category: "feedback", status: "new" },
  { slug: "popover", name: "Popover", description: "气泡卡片 · click 触发 + 标题/描述/Close", category: "feedback", status: "new" },
```

- [ ] **Step 2: registry 追加 2 import + 2 map**

`Read apps/www/lib/registry.tsx`，import 块加 `tooltipShowcase, popoverShowcase`，map 加:
```ts
  tooltip: tooltipShowcase,
  popover: popoverShowcase,
```

- [ ] **Step 3: 契约测试（manifest↔registry 一致）**

Run: `pnpm --filter www exec vitest run manifest`
Expected: PASS —— 双边 slug 齐全、无孤儿/缺失（含 tooltip/popover）。

- [ ] **Step 4: 完整三道门（含 WIP 隔离判断）**

Run: `pnpm typecheck && pnpm test && pnpm build --filter=www`
Expected: typecheck 绿；test —— **我的 tooltip/popover 全绿**；若整体 red，按失败**文件名**核：∈ 未跟踪 accordion/slider/tabs = 非我回归，`turbo run test --force` 复核后 surface 不修；build(`--filter=www`) 绿、SSG 生成 `/components/tooltip` + `/components/popover`。

- [ ] **Step 5: Playwright 截图明暗两态（先触发再截）+ 像素 Read**

先确认服务端口：`lsof -i:5512 -i:5514` 或看 desktop app 是否在跑。
- 若 5514（桌面 app）已在跑 → 直接用 5514（套 `nextjs-16-dev-server-dedupes-by-project-dir-not-port`，勿另起 5512）。
- 否则 `pnpm dev`（www 起 5512）。

逐个访问 `/components/tooltip`、`/components/popover`：
- **Tooltip**：Playwright `hover` 第一个「悬停查看」触发器 → `wait_for` 浮层文本 → 截图。明暗各一张：`overlay-tooltip-light.png` / `overlay-tooltip-dark.png`，存 `/Users/zhangzhiwei/Desktop/code/hulian/`。
- **Popover**：`click`「打开弹层」→ `wait_for` 面板 → 截图 `overlay-popover-light.png` / `overlay-popover-dark.png`。
- **Read 每张图看像素**逐项核：
  - Tooltip：反相气泡（亮色页深底浅字 / 暗色页浅底深字翻转）、箭头指向触发器、文本可读、定位贴合 side。
  - Popover：surface 面板浮于内容之上（z 层级）、标题/描述/按钮排版正确、箭头指向、明暗对比足、面板描边 `border-border` 可见。
  - 箭头几何若脱离/朝向错 → 调 `Arrow` 内方块的 `data-[side]` 偏移/边框后重截（spec §3 已声明箭头实现期调）。
- 全程右上明暗开关切换两组件同步换肤、无白闪。
- 桌面 app(5514)：确认壳内加载新 IA「反馈」组新增 Tooltip/Popover 正常。

- [ ] **Step 6: Commit（精确路径）**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): overlay 浮层族(Tooltip/Popover)接入 IA feedback 分类，A2.2 起步收口

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

> 截图 PNG 不入库（与 `alert-*.png` 同例，作收尾证据后保留在 cwd 根；如需清理由人决定）。

---

## 完成标志（本计划 = spec D1–D3）

- 左树「反馈」新增 Tooltip/Popover（`new` 标记），各自 `/components/[slug]` 独立 SSG 页。
- 两组件四件套齐、只消费语义 token、`"use client"` 正确、overlay 全 Base UI（Portal/Positioner/Popup/Arrow）、定位交 Positioner。
- Tooltip hover(`delay=0`)即弹反相气泡 + 箭头 + 四向 side；Popover click 弹 surface 面板 + title/desc/Close + Esc/外部关闭。
- 我的 `vitest run tooltip popover` 全绿；契约测试双边齐；`build --filter=www` 绿；桌面 app(5514) 正常。
- Playwright 明暗两态截图 Read 像素，浮层定位/箭头/层级/明暗对比自证。
- 承载约定（spec §4）落地，`ShowcaseSpec` 类型未动、未引新依赖。
- 全程精确 `git add`，未把并行 WIP 卷入；门禁若有未跟踪 sibling 红已 surface 不修。

---

## Self-Review（plan 对 spec 的覆盖核查）

**1. Spec coverage**：
- spec §2 裁决 → 承载方案 A(D1/D2 showcase 触发器)、Positioner-must-Portal(Content 固定 Portal)、Provider 可选(导出+showcase delay=0)、jsdom open 可测(各 test open 用例) ✓
- spec §3 API → Tooltip/Popover 薄包+透传+Content(D1/D2 tsx) ✓；皮肤 token(反相/surface) ✓
- spec §4 承载约定 → showcase states=触发器、零类型改动(三 showcase 全用现有 ShowcaseSpec 字段) ✓
- spec §6 测试策略 → 闭合/open/皮肤/Close/aria 单测；定位/箭头交 Playwright(D3 Step5) ✓
- spec §7 硬约束 → token/overlay 全 BaseUI/Positioner 兜底/四件套/主 index/motion/RSC client 岛/端口 逐条落 ✓
- spec §8 步骤 → Task0/D1/D2/D3 对应 ✓；spec §9 验收 → 完成标志 ✓；spec §10 YAGNI(无 Backdrop/不改类型/不加 polyfill) ✓

**2. Placeholder scan**：无 TBD/TODO；箭头几何「D3 Playwright 调」是 spec 明示的实现期细节（几何需像素验），非占位——D1/D2 已给可跑的 Arrow 基线实现。

**3. Type consistency**：`TooltipContentProps`/`PopoverContentProps`/`tooltipShowcase`/`popoverShowcase` 跨 Task 一致；index 桶导出名 ↔ registry import 名 ↔ manifest slug(tooltip/popover) 一致；`Side`/`Align` 联合体在 showcase 内自洽；Button 仅用已验证的 `variant="outline"|"ghost"|默认`（不用未确认的 size，规避类型错）。
