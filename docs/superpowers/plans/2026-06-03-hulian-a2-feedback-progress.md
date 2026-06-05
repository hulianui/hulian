# Progress 进度条 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给瑚琏 feedback 族加一个只读展示型 `<Progress>`（linear 横条 + circular 环 + indeterminate 不定态），几何自有、纯皮肤、零新依赖。

**Architecture:** 单组件 `variant="linear"|"circular"`。确定态几何由组件自己算（linear 填充 `width%` / circular `stroke-dasharray/dashoffset`），用 inline style + CSS transition（复用 motion-token CSS 镜像）。不定态用 motion JS 循环（linear 光带横扫 / circular 整体旋转），受 `useReducedMotion()` 门控、reduced 时退化为静态指示。a11y 走 WAI-ARIA `role=progressbar` + `aria-value*`（不定态省略 valuenow）。

**Tech Stack:** React 19 + TypeScript + Tailwind v4（语义 token）+ `motion/react`（已是 `@hulianui/ui` deps）+ CVA 非必需（用 literal class 查表）。测试 vitest + @testing-library/react（jsdom，无 jest-dom）。

参考 spec：`docs/superpowers/specs/2026-06-03-hulian-a2-feedback-progress-design.md`

---

## File Structure

- Create: `packages/ui/src/progress/progress.types.ts` — `ProgressProps` 接口
- Create: `packages/ui/src/progress/progress.tsx` — `Progress` 组件 + 纯函数 `progressPercent`/`dashOffset`（`"use client"`）
- Create: `packages/ui/src/progress/progress.test.tsx` — 纯函数单测 + 组件结构/a11y 测试
- Create: `packages/ui/src/progress/progress.showcase.tsx` — `progressShowcase`（`"use client"`）
- Create: `packages/ui/src/progress/index.ts` — dir barrel
- Modify: `packages/ui/src/index.ts` — 加 `export * from "./progress"`
- Modify: `apps/www/lib/manifest.ts` — manifest[] +1（feedback/new）
- Modify: `apps/www/lib/registry.tsx` — import `progressShowcase` + `specBySlug.progress`

---

### Task 1: 类型 + 纯函数（TDD）

**Files:**
- Create: `packages/ui/src/progress/progress.types.ts`
- Create: `packages/ui/src/progress/progress.test.tsx`
- Create: `packages/ui/src/progress/progress.tsx`

- [ ] **Step 1: 写失败测试（纯函数）** — `progress.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { progressPercent, dashOffset, Progress } from "./progress";

describe("progressPercent", () => {
  it("value/max → 百分比", () => {
    expect(progressPercent(40, 100)).toBe(40);
    expect(progressPercent(5, 10)).toBe(50);
  });
  it("超出上下界 clamp 到 0..100", () => {
    expect(progressPercent(120, 100)).toBe(100);
    expect(progressPercent(-5, 100)).toBe(0);
  });
  it("indeterminate：undefined/NaN → null", () => {
    expect(progressPercent(undefined, 100)).toBeNull();
    expect(progressPercent(NaN, 100)).toBeNull();
  });
  it("max<=0 → 0（不除零）", () => {
    expect(progressPercent(5, 0)).toBe(0);
  });
});

describe("dashOffset", () => {
  it("周长 + 百分比 → 偏移", () => {
    expect(dashOffset(100, 25)).toBe(75);
    expect(dashOffset(100, 0)).toBe(100);
    expect(dashOffset(100, 100)).toBe(0);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run src/progress/progress.test.tsx`
Expected: FAIL（`progress` 模块不存在 / 函数未定义）

- [ ] **Step 3: 写 types**

`progress.types.ts`：
```ts
import type { HTMLAttributes } from "react";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 当前值；省略/undefined → indeterminate 不定态 */
  value?: number;
  /** 最大值，默认 100 */
  max?: number;
  /** 形态，默认 "linear" */
  variant?: "linear" | "circular";
  /** 进度色调，默认 "primary" */
  tone?: "primary" | "danger";
  /** circular 直径 px，默认 40（linear 忽略） */
  size?: number;
  /** circular 描边 px，默认 4（linear 忽略） */
  thickness?: number;
  /** 显示百分比标签（circular 居中 / linear 右侧），默认 false；indeterminate 不显示 */
  showValue?: boolean;
}
```

- [ ] **Step 4: 写纯函数 + 组件**（完整 `progress.tsx`，见下方 Task 2 的完整文件）。本步先放纯函数 + 组件骨架使测试可编译。

- [ ] **Step 5: 跑测试确认纯函数过**

Run: `pnpm --filter @hulianui/ui exec vitest run src/progress/progress.test.tsx`
Expected: 纯函数 6 测试 PASS

---

### Task 2: Progress 组件（linear + circular + indeterminate + reduced-motion）

**Files:**
- Create/finalize: `packages/ui/src/progress/progress.tsx`

完整文件：

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEase, motionEaseCss } from "../motion";
import type { ProgressProps } from "./progress.types";

// value/max → 0..100；indeterminate(undefined/NaN) → null（不定态）
export function progressPercent(value: number | undefined, max: number): number | null {
  if (value === undefined || Number.isNaN(value)) return null;
  if (max <= 0) return 0;
  return Math.min(Math.max(value / max, 0), 1) * 100;
}

// 周长 + 百分比 → SVG stroke-dashoffset
export function dashOffset(circumference: number, percent: number): number {
  return circumference * (1 - percent / 100);
}

// tone → 字面 class（Tailwind @source 只扫字面量，禁动态拼类）
const barByTone = { primary: "bg-primary", danger: "bg-danger" } as const;
const strokeByTone = {
  primary: "stroke-[var(--color-primary)]",
  danger: "stroke-[var(--color-danger)]",
} as const;

// 确定态填充过渡：复用 motion-token CSS 镜像（零散写 transition）
const fillTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

const LOOP = 1.4; // 不定态循环秒数（同 shimmer 手感）

export function Progress({
  value,
  max = 100,
  variant = "linear",
  tone = "primary",
  size = 40,
  thickness = 4,
  showValue = false,
  className,
  ...rest
}: ProgressProps) {
  const reduce = useReducedMotion();
  const pct = progressPercent(value, max);
  const indeterminate = pct === null;

  const aria = {
    role: "progressbar" as const,
    "aria-valuemin": 0,
    "aria-valuemax": max,
    ...(indeterminate ? {} : { "aria-valuenow": value }),
  };

  if (variant === "circular") {
    const r = (size - thickness) / 2;
    const circ = 2 * Math.PI * r;
    const offset = dashOffset(circ, indeterminate ? 25 : (pct as number));
    const spin = indeterminate && !reduce;
    return (
      <div
        {...aria}
        className={cn("relative inline-flex items-center justify-center", className)}
        {...rest}
      >
        <motion.svg
          width={size}
          height={size}
          animate={spin ? { rotate: 360 } : undefined}
          transition={spin ? { repeat: Infinity, duration: LOOP, ease: "linear" } : undefined}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            className="stroke-[var(--color-surface-hover)]"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className={strokeByTone[tone]}
            style={{ transitionProperty: "stroke-dashoffset", ...fillTransition }}
          />
        </motion.svg>
        {showValue && !indeterminate && (
          <span className="absolute text-xs font-medium tabular-nums text-foreground">
            {Math.round(pct as number)}%
          </span>
        )}
      </div>
    );
  }

  // linear
  return (
    <div {...aria} className={cn("flex items-center gap-3", className)} {...rest}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-hover">
        {indeterminate ? (
          <motion.div
            className={cn("absolute inset-y-0 w-1/3 rounded-full", barByTone[tone])}
            style={reduce ? { left: "33%" } : undefined}
            animate={reduce ? undefined : { x: ["-110%", "320%"] }}
            transition={reduce ? undefined : { repeat: Infinity, duration: LOOP, ease: motionEase.inOut }}
          />
        ) : (
          <div
            className={cn("h-full rounded-full", barByTone[tone])}
            style={{ width: `${pct}%`, transitionProperty: "width", ...fillTransition }}
          />
        )}
      </div>
      {showValue && !indeterminate && (
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted">
          {Math.round(pct as number)}%
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 1: 写组件结构/a11y 失败测试** — 追加到 `progress.test.tsx`

```tsx
describe("Progress 组件", () => {
  it("linear 确定态：role=progressbar + aria-value*", () => {
    const { container } = render(<Progress value={40} />);
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar).toBeTruthy();
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });
  it("linear 确定态：填充 inline width = pct%", () => {
    const { container } = render(<Progress value={40} />);
    const fill = container.querySelector('[role="progressbar"] > div > div')!;
    expect((fill as HTMLElement).style.width).toBe("40%");
  });
  it("indeterminate：无 aria-valuenow", () => {
    const { container } = render(<Progress />);
    const bar = container.querySelector('[role="progressbar"]')!;
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
  });
  it("circular：渲两个 circle + 进度环带 stroke-dashoffset", () => {
    const { container } = render(<Progress variant="circular" value={25} size={40} thickness={4} />);
    expect(container.querySelector("svg")).toBeTruthy();
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
    expect(circles[1].getAttribute("stroke-dashoffset")).toBeTruthy();
  });
  it("tone=danger：linear 用 bg-danger", () => {
    const { container } = render(<Progress value={50} tone="danger" />);
    const fill = container.querySelector('[role="progressbar"] > div > div')!;
    expect(fill.className).toContain("bg-danger");
  });
  it("circular tone=danger：进度环用 danger stroke 变量", () => {
    const { container } = render(<Progress variant="circular" value={50} tone="danger" />);
    expect(container.querySelectorAll("circle")[1].className.baseVal ?? container.querySelectorAll("circle")[1].getAttribute("class")).toContain("var(--color-danger)");
  });
  it("showValue：渲染百分比文本", () => {
    const { getByText } = render(<Progress value={60} showValue />);
    expect(getByText("60%")).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑测试确认（实现已在上文，应直接 PASS）**

Run: `pnpm --filter @hulianui/ui exec vitest run src/progress/progress.test.tsx`
Expected: 全部 PASS（纯函数 6 + 组件 7 = 13）。若 circular danger 那条因 SVGAnimatedString 取类方式不稳，改断言 `getAttribute("class")` 包含 `var(--color-danger)`。

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/progress/progress.tsx packages/ui/src/progress/progress.types.ts packages/ui/src/progress/progress.test.tsx
git commit -m "feat(ui): Progress 进度条(linear+circular+indeterminate·几何自有·reduced-motion·TDD)" -- packages/ui/src/progress/progress.tsx packages/ui/src/progress/progress.types.ts packages/ui/src/progress/progress.test.tsx
```

---

### Task 3: showcase + dir barrel + 主 barrel

**Files:**
- Create: `packages/ui/src/progress/progress.showcase.tsx`
- Create: `packages/ui/src/progress/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 写 showcase** — `progress.showcase.tsx`

```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Progress } from "./progress";

export const progressShowcase: ShowcaseSpec = {
  controls: [
    { prop: "value", type: "number", defaultValue: 40, label: "value" },
    { prop: "max", type: "number", defaultValue: 100, label: "max" },
    { prop: "variant", type: "select", options: ["linear", "circular"], defaultValue: "linear", label: "形态" },
    { prop: "tone", type: "select", options: ["primary", "danger"], defaultValue: "primary", label: "色调" },
    { prop: "showValue", type: "boolean", defaultValue: false, label: "显示数值" },
    { prop: "indeterminate", type: "boolean", defaultValue: false, label: "不定态" },
  ],
  states: [
    { name: "linear 25%", render: () => <Progress value={25} className="w-64" /> },
    { name: "linear 60% + 数值", render: () => <Progress value={60} showValue className="w-64" /> },
    { name: "linear 100%", render: () => <Progress value={100} className="w-64" /> },
    { name: "linear danger 90%", render: () => <Progress value={90} tone="danger" showValue className="w-64" /> },
    { name: "linear 不定态", render: () => <Progress className="w-64" /> },
    { name: "circular 75% + 数值", render: () => <Progress variant="circular" value={75} showValue /> },
    { name: "circular danger 40%", render: () => <Progress variant="circular" value={40} tone="danger" showValue /> },
    { name: "circular 不定态", render: () => <Progress variant="circular" /> },
  ],
  renderWithProps: (p) => {
    const indeterminate = p.indeterminate as boolean;
    return (
      <Progress
        value={indeterminate ? undefined : (p.value as number)}
        max={p.max as number}
        variant={p.variant as "linear" | "circular"}
        tone={p.tone as "primary" | "danger"}
        showValue={p.showValue as boolean}
        className={p.variant === "circular" ? undefined : "w-64"}
      />
    );
  },
  toCode: (p) => {
    const indeterminate = p.indeterminate as boolean;
    const valueAttr = indeterminate ? "" : ` value={${p.value}}`;
    const variantAttr = p.variant === "circular" ? ` variant="circular"` : "";
    const toneAttr = p.tone === "danger" ? ` tone="danger"` : "";
    return `<Progress${variantAttr}${valueAttr}${toneAttr}${p.showValue ? " showValue" : ""} />`;
  },
};
```

- [ ] **Step 2: 写 dir barrel** — `index.ts`

```ts
export { Progress, progressPercent, dashOffset } from "./progress";
export type { ProgressProps } from "./progress.types";
export { progressShowcase } from "./progress.showcase";
```

- [ ] **Step 3: 主 barrel 加导出** — 在 `packages/ui/src/index.ts` 组件区追加（幂等检测：已有则跳过）

```ts
export * from "./progress";
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/progress/progress.showcase.tsx packages/ui/src/progress/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): Progress showcase + 桶导出 + 主 barrel" -- packages/ui/src/progress/progress.showcase.tsx packages/ui/src/progress/index.ts packages/ui/src/index.ts
```

---

### Task 4: 三道门 + 明暗截图

- [ ] **Step 1: typecheck**

Run: `pnpm --filter @hulianui/ui typecheck`（或根 `pnpm typecheck`）
Expected: 0 error（他人 WIP 致全量红时 isolate，只认我 scope）

- [ ] **Step 2: 我 scope vitest**

Run: `pnpm --filter @hulianui/ui exec vitest run src/progress/progress.test.tsx`
Expected: 13 PASS

- [ ] **Step 3: build（必 --filter=www --force）**

Run: `pnpm build --filter=www --force`
Expected: SSG 成功（页数 +1 含 /components/progress —— 接 IA 后）

- [ ] **Step 4: 隔离 chromium 明暗两态截图**

走 [[mcp-browser-busy-launch-isolated-chromium-via-executablepath]]：`executablePath` 指 ms-playwright chromium，`addInitScript` 预置 `localStorage hulian-theme=light/dark`，导航 `http://localhost:5514/components/progress`，轮询 `body.innerText` 含 demo 文案确认 hydration 后 `captureScreenshot`，存 cwd 根。验：linear 各档填充比例、circular 环角度（75%≈270°）、indeterminate（截到光带/旋转中间帧）、暗态轨(`surface-hover`)与填充(`primary`)对比足、SVG stroke 走 `var(--color-primary)` 明暗换肤、danger 态红。Read 看像素。

---

### Task 5: 接入 IA（幂等 python 读改写）

**Files:**
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`

- [ ] **Step 1: 幂等插入 manifest + registry**（python 检测 slug 存在则跳过，缩竞争窗口）

manifest 追加（feedback/new）：
```
{ slug: "progress", name: "Progress", description: "进度条 · linear/circular + 不定态 + 几何自有(reduced-motion)", category: "feedback", status: "new" },
```
registry 追加 import `progressShowcase` + map `progress: progressShowcase,`。

- [ ] **Step 2: 复跑三道门 `--force`**（接 IA 后 build 应 +1 页 /components/progress）

- [ ] **Step 3: pathspec commit**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): Progress 接入 IA(feedback 分组)" -- apps/www/lib/manifest.ts apps/www/lib/registry.tsx
```

---

## Self-Review

**Spec coverage：** ① linear+circular 单组件 → Task 2 ✓；② indeterminate → Task 2（motion + reduce）✓；③ circular size/thickness → Task 2 props ✓；④ reduced-motion → Task 2 `useReducedMotion` 门控 ✓；a11y role/aria → Task 2 ✓；tone primary/danger → Task 2 字面查表 ✓；showValue → Task 2 ✓；纯函数单测 → Task 1 ✓；showcase 零改 ShowcaseSpec → Task 3 ✓；IA +1 → Task 5 ✓；三道门 + 截图 → Task 4 ✓。无遗漏。

**Placeholder scan：** 无 TBD/TODO；每步含真实代码/命令/预期。

**Type consistency：** `ProgressProps`(types) ↔ 组件解构一致；`progressPercent`/`dashOffset` 签名 ↔ 测试 ↔ 组件调用一致；`progressShowcase` ↔ dir barrel ↔ registry import 名一致；`barByTone`/`strokeByTone` key=tone 联合一致。
