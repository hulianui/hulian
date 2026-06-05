# A2.4 effects 起步（NumberTicker + Marquee）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给瑚琏新增动效族首两件 NumberTicker（数字滚动）+ Marquee（无缝跑马灯），左树「动效」分类首现。

**Architecture:** Magic UI copy-paste 吸取模式——抄实现骨架 + 换瑚琏语义 token + 统一瑚琏 API + 复用 `packages/ui/src/motion` 时长/曲线。NumberTicker 走 motion-runtime（`"use client"`，tween 复用 `motionEase.out` + `useReducedMotion`）；Marquee 走纯 CSS keyframe（无 `"use client"`，关键帧落 `@hulianui/tokens` preset.css，`motion-reduce:` 变体停）。

**Tech Stack:** React 19 + motion v12 + Tailwind v4（`@hulianui/tokens` preset）+ Base UI 无关 + vitest(jsdom) + 四件套 + manifest/registry 双文件 IA。

**Spec:** `docs/superpowers/specs/2026-06-03-hulian-a2-4-effects-number-ticker-marquee-design.md`

---

## 关键约定（实现全程守）

- **三道门 `--force`**：`pnpm typecheck && pnpm test && pnpm build --filter=www`。turbo cache-hit 会重放陈旧日志 → 门禁/基线一律加 `--force`（或直跑 vitest）拿真实态（skill `turbo-test-red-isolate-untracked-wip-not-your-regression`）。build **必 `--filter=www`**（避桌面 tauri beforeBuild 二次 build，skill `turbo-monorepo-desktop-shell-beforebuild-double-builds-frontend`）。
- **单文件快测**：`cd packages/ui && npx vitest run src/<dir>/<file>.test.tsx`（红/绿快速循环，不过 turbo）。
- **并发纪律**：多 session 同动 master → **精确 `git add <自己具体路径>`，禁 `-A`**（skill `parallel-session-git-add-all-sweeps-your-staged-files`）；commit 用 `git commit -- <pathspec>` 兜底（别人可在 add↔commit 间 stage）；他人 untracked WIP 致全量门禁瞬时红 → isolate 不碰。
- **commit 由 orchestrator 在 review（含明暗截图看像素）通过后执行**；subagent 只实现 + 跑确定性门禁（typecheck/vitest/build）+ 回报。
- **截图（orchestrator review 侧）**：dev 站 www=5512 / 桌面 app=5514（app 已跑则用 5514，skill `nextjs-16-dev-server-dedupes-by-project-dir-not-port`）；MCP 浏览器被并行 session 占用 → 自起隔离 chromium（skill `mcp-browser-busy-launch-isolated-chromium-via-executablepath`）；存 cwd 根 Read 看像素（skill `ui-layout-verify-needs-screenshot-not-dom-eval`），明暗两态。
- **plan 对 spec §7 的细化**：spec §7 把「接 IA」列为独立 Step 3；本 plan **改为每个组件端到端**（四件套 + 主 barrel + manifest +1 + registry +1 + 三道门 + 截图 + commit 一次成型），每步即产出一个可截图验证的真实组件页，更符合「每步独立可提交/回滚」。

---

## Task 0：记录绿色基线

**Files:** 无（只读门禁）

- [ ] **Step 1: 跑三道门 `--force` 记录真实基线**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck && pnpm test -- --force && pnpm build --filter=www --force 2>&1 | tail -30
```
Expected: typecheck 绿；vitest 全量绿（若红，`git status` 确认是否他人 untracked WIP——是则 isolate 记录，不替背锅）；`build --filter=www` 绿、SSG 出 20 组件页（button…table）。记录组件页计数作 Task 1/2 对比基线。

- [ ] **Step 2: 确认 motion 基元与注入点现状**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
sed -n '1,33p' packages/ui/src/motion/tokens.ts            # 确认 motionEase.out 在
grep -n "@theme\|@keyframes" packages/tokens/src/preset.css  # 确认 preset.css 结构（追加 keyframe 用）
grep -c "slug" apps/www/lib/manifest.ts                       # 当前组件数
```
Expected: `motionEase.out` 存在；preset.css 有 `@theme inline` 块、暂无 `@keyframes`；manifest 20 条。

---

## Task 1：NumberTicker（端到端：四件套 + 主 barrel + IA + 门禁）

**Files:**
- Create: `packages/ui/src/number-ticker/number-ticker.types.ts`
- Create: `packages/ui/src/number-ticker/number-ticker.tsx`
- Create: `packages/ui/src/number-ticker/number-ticker.test.tsx`
- Create: `packages/ui/src/number-ticker/number-ticker.showcase.tsx`
- Create: `packages/ui/src/number-ticker/index.ts`
- Modify: `packages/ui/src/index.ts`（加 `export * from "./number-ticker";`）
- Modify: `apps/www/lib/manifest.ts`（追加 1 条 effects）
- Modify: `apps/www/lib/registry.tsx`（import + map）

- [ ] **Step 1: 写 types**

`packages/ui/src/number-ticker/number-ticker.types.ts`:
```ts
import type { ComponentPropsWithoutRef } from "react";

export interface NumberTickerProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /** 目标值（必填）。进入视口后从 startValue 滚到此值 */
  value: number;
  /** 起始值，默认 0。startValue > value 即自然向下滚（无需单独 direction prop） */
  startValue?: number;
  /** 小数位，默认 0。驱动 Intl.NumberFormat 的 min/maxFractionDigits */
  decimalPlaces?: number;
  /** 滚动时长（秒），默认 1.2。曲线固定复用 motionEase.out（瑚琏签名） */
  duration?: number;
  /** 进入视口后延迟开始（秒），默认 0 */
  delay?: number;
}
```

- [ ] **Step 2: 写失败测试（先 formatTicker 纯函数，再静态渲染）**

`packages/ui/src/number-ticker/number-ticker.test.tsx`:
```tsx
import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { NumberTicker, formatTicker } from "./number-ticker";

// jsdom 无 IntersectionObserver：给永不触发的桩，让 useInView 恒 false（停在起始值，可稳定断言静态渲染）。
// 注：motion 的 useReducedMotion 已内建 `if (window.matchMedia)` 守卫，jsdom 无 matchMedia 不崩，无需打桩。
beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});

describe("formatTicker", () => {
  it("整数千分位", () => {
    expect(formatTicker(1234, 0)).toBe("1,234");
    expect(formatTicker(1234567, 0)).toBe("1,234,567");
  });
  it("零与负数", () => {
    expect(formatTicker(0, 0)).toBe("0");
    expect(formatTicker(-1234, 0)).toBe("-1,234");
  });
  it("小数位", () => {
    expect(formatTicker(99.9, 1)).toBe("99.9");
    expect(formatTicker(3.14159, 2)).toBe("3.14");
    expect(formatTicker(1000, 2)).toBe("1,000.00");
  });
});

describe("NumberTicker", () => {
  it("初始渲染显示格式化的 startValue（IO 桩不触发 → 停在起始值）", () => {
    const { container } = render(<NumberTicker value={1234} startValue={0} />);
    expect(container.querySelector("span")!.textContent).toBe("0");
  });
  it("startValue 带千分位也正确格式化", () => {
    const { container } = render(<NumberTicker value={0} startValue={1000} />);
    expect(container.querySelector("span")!.textContent).toBe("1,000");
  });
  it("含 tabular-nums + text-foreground 皮肤类", () => {
    const { container } = render(<NumberTicker value={1} />);
    const cls = container.querySelector("span")!.className;
    expect(cls).toContain("tabular-nums");
    expect(cls).toContain("text-foreground");
  });
  it("className 与 props（aria-label/data-*）透传", () => {
    const { container } = render(
      <NumberTicker value={1} className="text-2xl" aria-label="计数" data-testid="t" />,
    );
    const span = container.querySelector("span")!;
    expect(span.className).toContain("text-2xl");
    expect(span.getAttribute("aria-label")).toBe("计数");
    expect(span.getAttribute("data-testid")).toBe("t");
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `cd packages/ui && npx vitest run src/number-ticker/number-ticker.test.tsx`
Expected: FAIL（`./number-ticker` 不存在 / `NumberTicker`、`formatTicker` 未定义）。

- [ ] **Step 4: 写组件实现**

`packages/ui/src/number-ticker/number-ticker.tsx`:
```tsx
"use client";
import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { motionEase } from "../motion";
import { cn } from "../lib/cn";
import type { NumberTickerProps } from "./number-ticker.types";

/**
 * 纯函数：数字格式化（千分位 + 小数位）。独立可单测——动效本身靠截图，格式化逻辑靠单测。
 * 固定 en-US（千分位逗号，通用），locale 化列为 future。
 */
export function formatTicker(value: number, decimalPlaces: number): string {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(value.toFixed(decimalPlaces)));
}

// 吸取自 magicui.design NumberTicker，三处瑚琏化：
//   ① spring → tween 复用 motionEase.out 签名曲线（不另起弹簧体系）
//   ② text-black dark:text-white → text-foreground 语义 token
//   ③ 补 useReducedMotion（reduced 落终值不滚）
export function NumberTicker({
  value,
  startValue = 0,
  decimalPlaces = 0,
  duration = 1.2,
  delay = 0,
  className,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const mv = useMotionValue(startValue);
  const inView = useInView(ref, { once: true });

  // 滚动期：motionValue 每变化写一次格式化文本
  useMotionValueEvent(mv, "change", (latest) => {
    if (ref.current) ref.current.textContent = formatTicker(latest, decimalPlaces);
  });

  // 进入视口触发：reduced 直接落终值不滚；否则 tween 复用 motionEase.out
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, delay, ease: motionEase.out });
    return () => controls.stop();
  }, [inView, reduced, value, duration, delay, mv]);

  // 关键：每次 render 把当前 motionValue 同步回 textContent，
  // 否则父级重渲染（明暗 toggle）会用 JSX children 覆盖回 startValue 且不再重滚 → 暗色截图会显错值。
  useEffect(() => {
    if (ref.current) ref.current.textContent = formatTicker(mv.get(), decimalPlaces);
  });

  return (
    <span ref={ref} className={cn("inline-block tabular-nums text-foreground", className)} {...props}>
      {formatTicker(startValue, decimalPlaces)}
    </span>
  );
}
```

- [ ] **Step 5: 跑测试确认通过**

Run: `cd packages/ui && npx vitest run src/number-ticker/number-ticker.test.tsx`
Expected: PASS（formatTicker 3 组 + 组件 4 条全绿）。

- [ ] **Step 6: 写 showcase**

`packages/ui/src/number-ticker/number-ticker.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { NumberTicker } from "./number-ticker";

export const numberTickerShowcase: ShowcaseSpec = {
  controls: [
    { prop: "value", type: "number", defaultValue: 1234 },
    { prop: "startValue", type: "number", defaultValue: 0 },
    { prop: "decimalPlaces", type: "number", defaultValue: 0 },
    { prop: "duration", type: "number", defaultValue: 1.2 },
  ],
  states: [
    { name: "整数千分位", render: () => <NumberTicker value={12345} className="text-4xl font-semibold" /> },
    {
      name: "百分比（1 位小数）",
      render: () => <NumberTicker value={99.9} decimalPlaces={1} className="text-4xl font-semibold" />,
    },
    { name: "向下计数", render: () => <NumberTicker startValue={100} value={0} className="text-4xl font-semibold" /> },
  ],
  renderWithProps: (p) => (
    <NumberTicker
      value={p.value as number}
      startValue={p.startValue as number}
      decimalPlaces={p.decimalPlaces as number}
      duration={p.duration as number}
      className="text-4xl font-semibold"
    />
  ),
  toCode: (p) => `<NumberTicker value={${p.value}} decimalPlaces={${p.decimalPlaces}} />`,
};
```

- [ ] **Step 7: 写 index 桶导出 + 主 barrel**

`packages/ui/src/number-ticker/index.ts`:
```ts
export { NumberTicker, formatTicker } from "./number-ticker";
export type { NumberTickerProps } from "./number-ticker.types";
export { numberTickerShowcase } from "./number-ticker.showcase";
```

`packages/ui/src/index.ts` —— 在 `export * from "./table";` 之后追加一行：
```ts
export * from "./number-ticker";
```

- [ ] **Step 8: 接 IA（manifest + registry）**

`apps/www/lib/manifest.ts` —— 在 `manifest` 数组末尾（`table` 那条之后）追加：
```ts
  { slug: "number-ticker", name: "NumberTicker", description: "数字滚动 · 进入视口 tween 到目标值 + reduced-motion", category: "effects", status: "new" },
```

`apps/www/lib/registry.tsx` —— import 块加 `numberTickerShowcase`，map 加一行：
```ts
// import 块（与其余 showcase 并列）：
  numberTickerShowcase,
// specBySlug map 末尾：
  "number-ticker": numberTickerShowcase,
```

- [ ] **Step 9: 三道门 `--force`**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck && pnpm test -- --force && pnpm build --filter=www --force 2>&1 | tail -30
```
Expected: 全绿；`build --filter=www` SSG 组件页 21 个（含 `/components/number-ticker`）。若全量 vitest 红，确认是否他人 untracked WIP（isolate）；自己 ui 包 number-ticker 测试须全绿。

- [ ] **Step 10: orchestrator review（截图明暗看像素）+ commit**

orchestrator 侧：启动/复用 dev 站（5512 或桌面 5514），导航 `/components/number-ticker`：
- 正常态截「加载后立刻」（试捕滚动中某帧）+「settle 后」（终值帧）—— 验数字在动且终值格式正确（`12,345` / `99.9` / 向下到 `0`）；
- 切暗后截图 —— 验**终值仍在**（不回 startValue，证 effect ③）+ `text-foreground` 明暗对比足；
- `emulateMedia({ reducedMotion: 'reduce' })` 截图 —— 验直接显终值不滚；
- 左树「动效」分组**首次出现**含 NumberTicker(new)。
像素 OK 后精确提交：
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
git add packages/ui/src/number-ticker/ packages/ui/src/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx
# 注意 git arg 顺序：-m "msg" 在前，-- <pathspec> 在最后（-- 之后全被当 pathspec）
git commit -m "feat(ui): NumberTicker 数字滚动 — Magic UI 吸取(spring→tween 复用 motionEase.out) + reduced-motion + 接 IA(effects 首落)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>" -- packages/ui/src/number-ticker/ packages/ui/src/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx
```

---

## Task 2：Marquee（端到端：preset.css keyframe + 四件套 + 主 barrel + IA + 门禁）

**Files:**
- Modify: `packages/tokens/src/preset.css`（追加 `@keyframes hulian-marquee`）
- Create: `packages/ui/src/marquee/marquee.types.ts`
- Create: `packages/ui/src/marquee/marquee.tsx`
- Create: `packages/ui/src/marquee/marquee.test.tsx`
- Create: `packages/ui/src/marquee/marquee.showcase.tsx`
- Create: `packages/ui/src/marquee/index.ts`
- Modify: `packages/ui/src/index.ts`（加 `export * from "./marquee";`）
- Modify: `apps/www/lib/manifest.ts`（追加 1 条 effects）
- Modify: `apps/www/lib/registry.tsx`（import + map）

- [ ] **Step 1: preset.css 追加无缝跑马灯关键帧**

`packages/tokens/src/preset.css` —— 在文件末尾（`@theme inline { ... }` 块之后）追加：
```css

/* effects/Marquee 无缝跑马灯关键帧（CSS 侧动效 SSOT；JS 侧动效见 @hulianui/ui motion/variants.ts）。
   每份子项平移 -100% - gap，配合复制 N 份实现无缝循环。 */
@keyframes hulian-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - var(--hulian-marquee-gap, 1rem)));
  }
}
```

- [ ] **Step 2: 写 types**

`packages/ui/src/marquee/marquee.types.ts`:
```ts
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  /** 滚动方向，默认 "left"（内容向左滚）。"right" 经 animation-direction: reverse */
  direction?: "left" | "right";
  /** 单轮时长（秒），默认 40。越大越慢 */
  duration?: number;
  /** 子项间距（CSS 长度），默认 "1rem" */
  gap?: string;
  /** 鼠标悬停暂停，默认 false */
  pauseOnHover?: boolean;
  /** 子项复制份数，默认 4（窄内容也铺满不露缝） */
  repeat?: number;
}
```

- [ ] **Step 3: 写失败测试（纯 DOM 结构，无动画时序）**

`packages/ui/src/marquee/marquee.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Marquee } from "./marquee";

// container > [Marquee 根 div] > [N 个轨道 div]；":scope > div > div" 精确选中轨道（子项 span 是第 3 层不被选中）
const tracksOf = (container: HTMLElement) => container.querySelectorAll(":scope > div > div");

describe("Marquee", () => {
  it("默认复制 4 份动画轨道（无缝循环所需）", () => {
    const { container } = render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(container).length).toBe(4);
  });
  it("repeat 可配置份数", () => {
    const { container } = render(
      <Marquee repeat={2}>
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(container).length).toBe(2);
  });
  it("复制份（index>0）带 aria-hidden，首份不带（AT 只读一次）", () => {
    const { container } = render(
      <Marquee repeat={3}>
        <span>x</span>
      </Marquee>,
    );
    const tracks = tracksOf(container);
    expect(tracks[0].getAttribute("aria-hidden")).toBe(null);
    expect(tracks[1].getAttribute("aria-hidden")).toBe("true");
    expect(tracks[2].getAttribute("aria-hidden")).toBe("true");
  });
  it("外层 overflow-hidden + group", () => {
    const { container } = render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain("overflow-hidden");
    expect(root.className).toContain("group");
  });
  it("pauseOnHover 为真 → 轨道带 group-hover 暂停类；默认假则无", () => {
    const on = render(
      <Marquee pauseOnHover>
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(on.container)[0].className).toContain("group-hover:[animation-play-state:paused]");
    const off = render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(off.container)[0].className).not.toContain("group-hover:[animation-play-state:paused]");
  });
  it("direction=right → 轨道带 reverse 类", () => {
    const { container } = render(
      <Marquee direction="right">
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(container)[0].className).toContain("[animation-direction:reverse]");
  });
  it("motion-reduce 停用类恒在（尊重 prefers-reduced-motion）", () => {
    const { container } = render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(container)[0].className).toContain("motion-reduce:[animation:none]");
  });
  it("duration/gap 落 CSS 变量", () => {
    const { container } = render(
      <Marquee duration={20} gap="2rem">
        <span>x</span>
      </Marquee>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hulian-marquee-duration")).toBe("20s");
    expect(root.style.getPropertyValue("--hulian-marquee-gap")).toBe("2rem");
  });
  it("className 与 props 透传", () => {
    const { container } = render(
      <Marquee className="my-4" data-testid="m">
        <span>x</span>
      </Marquee>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain("my-4");
    expect(root.getAttribute("data-testid")).toBe("m");
  });
});
```

- [ ] **Step 4: 跑测试确认失败**

Run: `cd packages/ui && npx vitest run src/marquee/marquee.test.tsx`
Expected: FAIL（`./marquee` / `Marquee` 未定义）。

- [ ] **Step 5: 写组件实现（纯 CSS，无 "use client"）**

`packages/ui/src/marquee/marquee.tsx`:
```tsx
import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { MarqueeProps } from "./marquee.types";

// 吸取自 magicui.design Marquee：复制子项 N 份、每份 CSS 平移 -100% - gap → 无缝循环。
// 瑚琏化：纯 CSS（无 "use client"，可 RSC，同 Breadcrumb/Alert）；关键帧在 @hulianui/tokens preset.css；
// reduced-motion 用 Tailwind motion-reduce: 变体停；容器中性、子项自带色（只消费语义 token）。
export function Marquee({
  children,
  direction = "left",
  duration = 40,
  gap = "1rem",
  pauseOnHover = false,
  repeat = 4,
  className,
  style,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn("group flex overflow-hidden [gap:var(--hulian-marquee-gap)]", className)}
      style={
        {
          "--hulian-marquee-duration": `${duration}s`,
          "--hulian-marquee-gap": gap,
          ...style,
        } as CSSProperties
      }
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--hulian-marquee-gap)]",
            "[animation:hulian-marquee_var(--hulian-marquee-duration,40s)_linear_infinite]",
            direction === "right" && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            "motion-reduce:[animation:none]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: 跑测试确认通过**

Run: `cd packages/ui && npx vitest run src/marquee/marquee.test.tsx`
Expected: PASS（10 条全绿）。

- [ ] **Step 7: 写 showcase（用纯 token chip 子项，不耦合其他组件 API）**

`packages/ui/src/marquee/marquee.showcase.tsx`:
```tsx
"use client";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Marquee } from "./marquee";

// chip：只消费已确认的语义 token（border-border / bg-surface / text-foreground），不依赖 Badge API。
function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1 text-sm text-foreground">
      {children}
    </span>
  );
}

const items = ["React", "Vue", "Svelte", "Solid", "Angular", "Qwik"];

export const marqueeShowcase: ShowcaseSpec = {
  controls: [
    { prop: "direction", type: "select", options: ["left", "right"], defaultValue: "left" },
    { prop: "duration", type: "number", defaultValue: 20 },
    { prop: "pauseOnHover", type: "boolean", defaultValue: true },
  ],
  states: [
    {
      name: "default（向左 · hover 暂停）",
      render: () => (
        <Marquee className="w-80" pauseOnHover>
          {items.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </Marquee>
      ),
    },
    {
      name: "向右 · 慢速",
      render: () => (
        <Marquee className="w-80" direction="right" duration={30}>
          {items.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </Marquee>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Marquee
      className="w-80"
      direction={p.direction as "left" | "right"}
      duration={p.duration as number}
      pauseOnHover={p.pauseOnHover as boolean}
    >
      {items.map((c) => (
        <Chip key={c}>{c}</Chip>
      ))}
    </Marquee>
  ),
  toCode: (p) =>
    `<Marquee direction="${p.direction}" duration={${p.duration}} pauseOnHover={${p.pauseOnHover}}>\n  {items}\n</Marquee>`,
};
```

- [ ] **Step 8: 写 index 桶导出 + 主 barrel**

`packages/ui/src/marquee/index.ts`:
```ts
export { Marquee } from "./marquee";
export type { MarqueeProps } from "./marquee.types";
export { marqueeShowcase } from "./marquee.showcase";
```

`packages/ui/src/index.ts` —— 在 `export * from "./number-ticker";` 之后追加一行：
```ts
export * from "./marquee";
```

- [ ] **Step 9: 接 IA（manifest + registry）**

`apps/www/lib/manifest.ts` —— 在 number-ticker 那条之后追加：
```ts
  { slug: "marquee", name: "Marquee", description: "跑马灯 · 纯 CSS 无缝循环 + hover 暂停 + 方向", category: "effects", status: "new" },
```

`apps/www/lib/registry.tsx` —— import 块加 `marqueeShowcase`，map 加一行：
```ts
// import 块：
  marqueeShowcase,
// specBySlug map：
  marquee: marqueeShowcase,
```

- [ ] **Step 10: 三道门 `--force`**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck && pnpm test -- --force && pnpm build --filter=www --force 2>&1 | tail -30
```
Expected: 全绿；`build --filter=www` SSG 组件页 22 个（含 `/components/marquee`）。

- [ ] **Step 11: orchestrator review（截图明暗看像素）+ commit**

orchestrator 侧：导航 `/components/marquee`：
- 截图验**无缝衔接**——轨道不露缝、子项不溢出视口、`overflow-hidden` 裁切正确（左右边缘 chip 半隐自然）；
- 向左/向右两态；hover 暂停（可截 hover 态）；
- **reduced-motion**（`emulateMedia reducedMotion:reduce`）截图 —— 验静止可见不滚；
- 明暗两态 chip 边框/底色对比足；左树「动效」含 Marquee(new)。
像素 OK 后精确提交：
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
git add packages/tokens/src/preset.css packages/ui/src/marquee/ packages/ui/src/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx
# 注意 git arg 顺序：-m "msg" 在前，-- <pathspec> 在最后
git commit -m "feat(ui): Marquee 无缝跑马灯 — Magic UI 吸取(纯 CSS keyframe@tokens + 复制子项无缝) + hover 暂停/方向/reduced-motion + 接 IA

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>" -- packages/tokens/src/preset.css packages/ui/src/marquee/ packages/ui/src/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx
```

---

## Self-Review（plan 对照 spec）

**Spec coverage：**
- §1 吸取模式差异（copy-paste 非 npm）→ Task 1/2 组件注释 + 实现路径 ✓
- §2 NumberTicker（API / spring→tween 复用 motionEase.out / reduced-motion / formatTicker 纯函数 / effect ③ resync）→ Task 1 Step 1/4 全覆盖 ✓
- §2.3 单测边界（纯函数强测 + 静态渲染 + IO 桩）→ Task 1 Step 2 ✓；reduced/动画靠截图 → Task 1 Step 10 ✓
- §3 Marquee（API / 复制子项无缝 / 关键帧落 preset.css / pauseOnHover / direction / motion-reduce / aria-hidden 复制份）→ Task 2 Step 1/5 全覆盖 ✓
- §3.4 Marquee 单测（DOM 结构/复制份/类/CSS 变量/透传）→ Task 2 Step 3 ✓
- §4 复用 motion token（motionEase.out / linear / text-foreground）→ Task 1/2 实现 ✓
- §5 硬约束（语义 token / 四件套 / "use client" 规则[ticker 加·marquee 不加·两 showcase 加] / barrel / reduced-motion / 端口 / 三道门 --force / 并发纪律）→ 关键约定 + 各 Task ✓
- §6 IA 接入（manifest +2 / registry +2 / effects 首现）→ Task 1 Step 8 + Task 2 Step 9 ✓
- §6.2 验收（三道门 / 左树动效 / 明暗截图 ticker 两帧+reduced / marquee 无缝 / 桌面 5514）→ Task 1/2 Step 10/11 ✓

**Placeholder scan：** 无 TBD/TODO；每步含完整代码与精确命令。✓

**Type consistency：** `NumberTickerProps`/`MarqueeProps` 字段在 types.ts 定义、组件解构、showcase 使用三处一致；`formatTicker(value, decimalPlaces)` 签名在实现/测试/showcase 一致；`numberTickerShowcase`/`marqueeShowcase` 导出名在 index.ts/registry import 一致；CSS 变量名 `--hulian-marquee-duration`/`--hulian-marquee-gap` 在组件 style/className/preset.css keyframe 三处一致；keyframe 名 `hulian-marquee` 在 preset.css 与组件 className 一致。✓

**步序依赖：** Task 1 先于 Task 2（主 index.ts 先加 number-ticker 再加 marquee；registry 顺序无强依赖）。preset.css keyframe 在 Task 2 Step 1（Marquee 实现前）。✓
