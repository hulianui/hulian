# 瑚琏 Hulian A2.4 设计文档 — 动效族（effects）起步：NumberTicker + Marquee

- **日期**: 2026-06-03
- **状态**: 自主推进模式（用户「完成再通知我」）—— 设计裁决按本批详细 brief + 既有固化坑做合理默认并在此文档化，不阻塞等审，收尾统一通知
- **本 spec 覆盖范围**: **A2.4 起步** = 动效族（`effects` 分类）首两件 **NumberTicker**（数字滚动）+ **Marquee**（无缝跑马灯）。A2.4 其余件（beam 等）与 A3/A4 各自再开 spec。
- **上游依据**:
  - `2026-06-02-hulian-a2-absorption-batch-design.md`（§3.4 分类法含 `effects`：shimmer・marquee・beam・number-ticker；§6 硬约束；§10 A2.4 预告「`magic` = magicui.design；copy-paste 模式，换瑚琏 token 类」）
  - `2026-06-02-hulian-absorption-model-v3.md`（吸取式聚合模型 v3）
  - 项目记忆 `hulian-phase-status`（已完成 20 组件 + 固化坑：三道门 `--force` / 精确 git add 禁 -A / 别碰他人 WIP / 自起隔离浏览器截图 / motion-reveal-invisible 坑）

---

## 1. 本批定义与「吸取模式」的不同之处

A2 此前各批（Base UI 族、纯皮肤族）的吸取对象是 **npm primitive**（Base UI / TanStack）——吸取 = 装库 + 薄包装 + 换瑚琏皮肤。**A2.4 是不同的吸取模式**：

> **Magic UI（magicui.design）不是 npm primitive，而是 copy-paste 源码**。吸取 = **抄实现骨架 + 换瑚琏语义 token 类 + 统一成瑚琏 API + 复用 `packages/ui/src/motion` 的时长/曲线**，而非装一个依赖。

因此本批**不新增任何 npm 依赖**（motion 已在 A1 装好，是 Skeleton shimmer 的运行时）。两件组件分别示范两条吸取路径：

| 组件 | Magic UI 原实现 | 瑚琏吸取后 | 运行时 |
|------|----------------|-----------|--------|
| **NumberTicker** | `useInView` + `useMotionValue` + `useSpring` + `Intl.NumberFormat` | motion-runtime（**改 spring → tween 复用 `motionEase.out` 签名曲线**）+ `useReducedMotion` + 瑚琏 `text-foreground` | motion（`"use client"`，同 Skeleton 范式） |
| **Marquee** | Tailwind config keyframes + 复制子项 + `group-hover:[animation-play-state:paused]` | **纯 CSS keyframe**（关键帧落 `@hulian/tokens` 的 preset.css）+ 瑚琏 token + `motion-reduce:` 变体 | **无运行时 / 无 `"use client"`**（纯 CSS/RSC，同 Breadcrumb/Alert） |

**`effects` 是左树目前空着的分类**（`manifest.ts` 的 `CategoryKey`/`CATEGORIES` 已定义 `effects`「动效」，但无任何组件）。本批接入后**左树「动效」分组首次出现**。

---

## 2. NumberTicker 设计

### 2.1 API（瑚琏统一，非 Magic UI 原样）

```ts
// number-ticker.types.ts
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

> 裁决：**不要 Magic UI 的 `direction: "up"|"down"` prop**——`startValue` 与 `value` 的大小关系已天然表达方向（YAGNI）。**不做 locale prop**——固定 `Intl.NumberFormat("en-US")`（千分位逗号，通用），locale 化列入 future。

### 2.2 实现骨架（抄 Magic UI + 三处瑚琏化改造）

```tsx
"use client";
import { animate, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { motionEase } from "../motion";
import { cn } from "../lib/cn";
import type { NumberTickerProps } from "./number-ticker.types";

/** 纯函数：格式化逻辑独立可单测（动效本身靠截图，格式化靠单测） */
export function formatTicker(value: number, decimalPlaces: number): string {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(value.toFixed(decimalPlaces)));
}

export function NumberTicker({
  value, startValue = 0, decimalPlaces = 0, duration = 1.2, delay = 0, className, ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const mv = useMotionValue(startValue);
  const inView = useInView(ref, { once: true });

  // ① 滚动期间：motionValue 每变化一次就把格式化文本写进 textContent
  useMotionValueEvent(mv, "change", (latest) => {
    if (ref.current) ref.current.textContent = formatTicker(latest, decimalPlaces);
  });

  // ② 进入视口触发：reduced 直接落终值不滚；否则 tween 复用 motionEase.out
  useEffect(() => {
    if (!inView) return;
    if (reduced) { mv.set(value); return; }
    const controls = animate(mv, value, { duration, delay, ease: motionEase.out });
    return () => controls.stop();
  }, [inView, reduced, value, duration, delay, mv]);

  // ③ 关键：每次 render 都把当前 motionValue 同步回 textContent
  //    否则父级重渲染（如明暗 toggle）会把 React children 文本重置回 startValue 且不再重滚 → 暗色截图会显错值
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

**三处瑚琏化改造**：
1. **spring → tween + `motionEase.out`**：Magic UI 用 `useSpring`（物理弹簧，不在瑚琏 token 体系内）。瑚琏改 `animate(mv, value, { ease: motionEase.out })` **复用签名曲线 token**（ease-out-expo），不另起弹簧体系。`duration` 默认 1.2s（数字滚动需比交互级 token slow=0.3s 长，照 shimmer 在 variants.ts 直写 1.4s 的先例——**曲线是复用的 token，时长是 per-animation 常量/prop**）。
2. **颜色 token**：Magic UI 写死 `text-black dark:text-white` → 瑚琏 `text-foreground`（语义 token，明暗自动）。`tabular-nums` 保留（等宽数字，滚动时不抖位）。
3. **reduced-motion**（Magic UI 缺失，硬约束补齐）：`useReducedMotion()` 为真时 `mv.set(value)` 直接落终值不滚。

**③ 是本组件最关键的非显然点**（imperative `textContent` 必须每 render 重新同步）：`useMotionValueEvent` 只在滚动期写文本；动画settle 后若父级重渲染，React 会用 JSX children（`startValue`）覆盖 textContent，而 `inView/value` 未变 → effect ② 不重跑 → 数字卡回 startValue。文档站「先截亮态、点 toggle 切暗再截」的流程恰好会触发这次重渲染 → **不修则暗色截图显 startValue 而非终值**。effect ③ 无依赖每 render 跑、读 `mv.get()` 重写当前值，根治。**列为 claudeception 候选**。

### 2.3 单测边界（jsdom 无 IntersectionObserver / 无真实 RAF）

- **纯函数 `formatTicker`**：强覆盖——整数千分位（`1234`→`1,234`）、百万级（`1234567`→`1,234,567`）、小数位（`99.9` @1 → `99.9`、`3.14159` @2 → `3.14`）、零、负数、`startValue` 格式化。
- **组件静态渲染**：初始渲染 textContent === `formatTicker(startValue)`（jsdom 无 IO → `inView` 恒 false，停在起始值，正好可断言）；`tabular-nums`/`text-foreground` 类在；`className`/`...props`（如 `data-*`/`aria-label`）透传到 span。
- **滚动过程 + reduced-motion 落终值**：属「动效本身」→ **Playwright 截图验**（见 §6）：`emulateMedia({ reducedMotion: 'reduce' })` 下截图应显终值；正常态截「滚动中某帧」+「终值帧」两帧验数字在动且最终正确。

---

## 3. Marquee 设计

### 3.1 API

```ts
// marquee.types.ts
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
  /** 子项复制份数，默认 4（保证窄内容也铺满不露缝） */
  repeat?: number;
}
```

> 裁决：**只做横向**（任务明确「子项无缝横向循环滚动」）——`direction: "left"|"right"`，**不做 vertical**（YAGNI，列 future）。`repeat` 默认 4（抄 Magic UI 默认，窄内容安全；内容已宽于视口时 2 份即够，文档化）。

### 3.2 无缝原理（抄 Magic UI 的复制子项 + 每份平移 `-100% - gap`）

```tsx
// marquee.tsx —— 无 "use client"（纯 CSS/RSC，同 Breadcrumb/Alert）
import { cn } from "../lib/cn";
import type { MarqueeProps } from "./marquee.types";

export function Marquee({
  children, direction = "left", duration = 40, gap = "1rem", pauseOnHover = false, repeat = 4, className, style, ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn("group flex overflow-hidden", className)}
      style={{
        gap,
        // 喂给 keyframe 的 CSS 变量（关键帧在 @hulian/tokens 的 preset.css，见 §3.3）
        ["--hulian-marquee-duration" as string]: `${duration}s`,
        ["--hulian-marquee-gap" as string]: gap,
        ...style,
      }}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}            // 复制份对 AT 隐藏，只读一次
          className={cn(
            "flex shrink-0 justify-around",
            "[gap:var(--hulian-marquee-gap)]",
            // 每份独立平移 -100% - gap：repeat≥2 时第 i+1 份恰好补到第 i 份起点 → 无缝
            "[animation:hulian-marquee_var(--hulian-marquee-duration,40s)_linear_infinite]",
            direction === "right" && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            "motion-reduce:[animation:none]",        // reduced-motion 时停（停在起点、内容静态可见）
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
```

### 3.3 关键帧落 `@hulian/tokens/preset.css`（CSS 侧动效的 SSOT）

motion 体系是分裂的两套（见 `motion/tokens.ts` 注释）：**JS 运行时动效**（spring/tween/shimmer）住 `packages/ui/src/motion/variants.ts`；**CSS keyframe 动效**自然的家是 **Tailwind v4 主题 CSS 层**（`packages/tokens/src/preset.css`，已被 `apps/www/app/globals.css` 导入 + Tailwind 处理 → 全消费方可见）。Marquee 是纯 CSS 动效 → 关键帧落这里，与「motion SSOT、不散写动画」一致：

```css
/* preset.css 顶层追加（@import / @theme 之后） */
@keyframes hulian-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(-100% - var(--hulian-marquee-gap, 1rem))); }
}
```

- **为何不放组件内**：避免 `<style>` 散写关键帧、避免跨包 CSS import 的 Next 处理风险。preset.css 是已验证被处理+下发的 CSS SSOT。代价：Marquee 的关键帧依赖 `@hulian/tokens`（一行 `@keyframes`），实现阶段 git add 须含 `packages/tokens/src/preset.css`，文档化此跨包耦合。
- **级联正确性**：base 类 `.[animation:...]`（特异性 0,1,0）的 `animation` 简写含 `animation-play-state:running`；hover 暂停 `.group:hover .x { animation-play-state: paused }`（0,2,0）与 reduced `@media{ .x { animation: none } }`（源序在后）均能正确覆盖 → 暂停/停用生效。已在 Magic UI 同款结构验证。
- **reduced-motion 用 Tailwind 内置 `motion-reduce:` 变体**（无需 JS hook）→ Marquee 保持纯 CSS、无 `"use client"`。

### 3.4 单测边界（纯 CSS 无运行时逻辑，全 DOM 可查）

- 渲染 children；**复制 `repeat` 份**（断言 DOM 里出现 repeat 个动画轨道 div）；
- 复制份（index>0）带 `aria-hidden`（AT 只读一次）；
- `pauseOnHover` 为真 → 轨道带 `group-hover:[animation-play-state:paused]` 类（假则无）；
- `direction="right"` → 轨道带 `[animation-direction:reverse]` 类；
- 外层 `overflow-hidden`；`--hulian-marquee-duration`/`--hulian-marquee-gap` CSS 变量按 prop 落在 style；
- `className`/`...props` 透传。
- **无缝衔接/不露缝/不溢出**属视觉 → Playwright 截图验（§6）。

---

## 4. 复用的 motion token（不另起动画体系）

| 维度 | NumberTicker | Marquee | 来源 |
|------|--------------|---------|------|
| 缓动曲线 | `motionEase.out`（ease-out-expo 签名） | `linear`（匀速循环，同 shimmer） | `packages/ui/src/motion/tokens.ts` |
| 时长 | `duration` prop，默认 1.2s（per-animation，照 shimmer 1.4s 先例） | `duration` prop，默认 40s（跑马灯本就长） | 组件 prop/常量 |
| 颜色 | `text-foreground`（语义 token） | 中性（子项自带，容器不染色） | `@hulian/tokens` 语义层 |

**不新增 motion token**：NumberTicker/Marquee 的长时长是 per-animation 特性（同 shimmer 直写 1.4s），核心交互时长标尺（fast/base/slow）不动；签名曲线 `motionEase.out` 复用。

---

## 5. 继承的硬约束（plan/实现逐条守）

1. **只消费语义 token**：无 success/warning（token 无）；动效组件多中性，文字 `text-foreground`；禁写死颜色/裸值。
2. **四件套**：每组件 `*.tsx` / `*.types.ts` / `*.showcase.tsx`（手写 control schema，**必 `"use client"`**）/ `*.test.tsx` / `index.ts`，桶导出 + 主 `packages/ui/src/index.ts` 加 `export *`。
3. **`"use client"` 规则**：用 motion 运行时**必加** → **NumberTicker.tsx 加**；Marquee 纯 CSS **不加**（同 Breadcrumb）；两个 showcase **都加**。
4. **showcase 必从主 barrel 导出**（`numberTickerShowcase`/`marqueeShowcase`，registry 消费）。
5. **reduced-motion 必尊重**：NumberTicker 经 `useReducedMotion`（落终值不滚）；Marquee 经 `motion-reduce:[animation:none]`（停）。
6. **motion 运行时坑**：NumberTicker 包成 client 后注意 `motion-reveal-invisible-after-wrapper-becomes-client`（本组件初始 children = 格式化 startValue，SSR/CSR 一致、无隐身、无 hydration mismatch；effect ③ 解决 re-render 重置）。
7. **端口**：www = 5512，桌面 app devUrl = 5514（桌面 app 已跑 5514 则用 5514 截图，见 `nextjs-16-dev-server-dedupes-by-project-dir-not-port`）。
8. **三道门 `--force`**：`pnpm typecheck && pnpm test && pnpm build --filter=www`，基线/门禁用 `--force` 或直跑 vitest 拿真实态（turbo cache-hit 会重放陈旧日志，见 `turbo-test-red-isolate-untracked-wip-not-your-regression`）；build **必 `--filter=www`**（避桌面 tauri beforeBuild 二次 build）。
9. **并发纪律**：多 session 同动 master → **精确 `git add <自己具体路径>`，禁 `-A`**（见 `parallel-session-git-add-all-sweeps-your-staged-files`）；他人 untracked WIP 致全量门禁瞬时红 → isolate 不碰（见 `turbo-test-red-isolate-untracked-wip-not-your-regression`）；MCP 浏览器被占用 → 自起隔离 chromium（见 `mcp-browser-busy-launch-isolated-chromium-via-executablepath`）。

---

## 6. IA 接入 + 验收口径

### 6.1 IA 接入（manifest +2 / registry +2）

- `apps/www/lib/manifest.ts` 追加两行（`effects` 分类、status `new`）：
  ```ts
  { slug: "number-ticker", name: "NumberTicker", description: "数字滚动 · 进入视口 tween 到目标值 + reduced-motion", category: "effects", status: "new" },
  { slug: "marquee", name: "Marquee", description: "跑马灯 · 纯 CSS 无缝循环 + hover 暂停 + 方向", category: "effects", status: "new" },
  ```
- `apps/www/lib/registry.tsx` 追加 import + map：`numberTickerShowcase` / `marqueeShowcase`。
- 接入后 **左树「动效」分组首现**（manifest 现 20 → 22 组件）。

### 6.2 验收（done 标志）

1. 三道门 `--force` 全绿（typecheck + vitest 全量 + `build --filter=www` 22 组件页 SSG）。
2. 左树「动效」分组出现，含 NumberTicker（new）+ Marquee（new），各有独立 `/components/[slug]` 页 SSG。
3. **明暗两态截图 Read 看像素**（存 cwd 根）：
   - **NumberTicker**：① 正常态截「滚动中某帧」+「终值帧」两帧——验数字在动且最终格式正确（千分位/小数）；② reduced-motion 态（`emulateMedia reducedMotion:reduce`）截图显终值（不滚）；③ 明暗两态文字 `text-foreground` 对比足。
   - **Marquee**：截图验**无缝衔接**（轨道不露缝/子项不溢出视口/`overflow-hidden` 裁切正确）；hover 暂停（可截 hover 态）；明暗两态。
4. 桌面 app(5514) 加载新动效页正常。

---

## 7. 分步落地（每步独立 commit + 三道门 --force + 明暗截图）

| Step | 内容 | 产出标志 |
|------|------|---------|
| **Step 0 — 基线** | `--force` 跑三道门记录真实绿基线（隔离他人 untracked WIP），确认 motion/preset.css 现状 | 真实基线记录在案 |
| **Step 1 — NumberTicker** | 四件套 TDD（先 `formatTicker` 纯函数测红→绿，再静态渲染测）+ 主 barrel export | typecheck + ticker 单测绿；正常/终值/reduced 三类截图明暗 |
| **Step 2 — Marquee** | preset.css 加 `@hulian/tokens` keyframe + 四件套 TDD（DOM 结构/复制份/类/aria/CSS 变量）+ 主 barrel export | typecheck + marquee 单测绿；无缝/hover/明暗截图 |
| **Step 3 — 接 IA** | manifest +2 / registry +2 | 三道门 `--force` 全绿；左树「动效」首现；两组件页 SSG；桌面 app 5514 正常 |

> 步序：先 NumberTicker（motion-runtime 路径，含最关键的 imperative resync 坑）→ 再 Marquee（纯 CSS 路径，跨包 keyframe）→ 最后一次性接 IA + 全量门禁。每步可独立提交/回滚。

---

## 8. 本批不做（YAGNI 边界）

- **不做** Marquee vertical（纵向）——只横向（任务明确）；future。
- **不做** NumberTicker `direction: up/down` prop（startValue↔value 已表达方向）、locale prop（固定 en-US）；future。
- **不做** beam 等 A2.4 其余 effects 件——本批只 NumberTicker + Marquee，其余再开 spec。
- **不新增** npm 依赖（motion 已在）、**不改** `ShowcaseSpec` 类型（用 controls + states 承载）。
- **不新增** motion 核心交互时长 token（长时长走 per-animation prop/常量，照 shimmer 先例）。
- **不引入** spring 物理体系（NumberTicker 用 tween 复用既有曲线 token）。

---

## 9. 后续批次预告（不在本 spec 范围）

- **A2.4 续** — effects 其余件（beam / 其余 Magic UI 动效，按需）。
- **A3 — 付代价家族桥接**：MUI（emotion theme 桥）+ Ant（ConfigProvider 桥）。
- **A4 — prod 打包**：www 静态导出（处理 MSW dev-only）+ Tauri dmg。
