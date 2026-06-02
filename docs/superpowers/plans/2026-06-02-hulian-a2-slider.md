# 瑚琏 A2 表单录入补充 — Slider 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 吸取 Slider 滑块组件，瑚琏 API 薄包 Base UI rc.0 `slider` primitive，单值 + 可选 range（双 thumb），轨道/填充段/thumb 语义 token 皮肤，键盘交互全交 Base UI 兜底。

**Architecture:** `Slider` = `Slider.Root`(透传 value/min/max/step/disabled…) 内含 `Slider.Control > Slider.Track > {Slider.Indicator(填充) + Slider.Thumb}`。range 由「value/defaultValue 是数组」自动分流为双 thumb（`index={0}/index={1}`）。thumb 焦点环用 `has-[:focus-visible]:`（焦点落在 thumb 内嵌的 visuallyHidden `<input type=range>`，非 thumb div 本身——与 Switch 用 `focus-visible:` 的唯一差异）。几何（填充宽度/thumb 位置）由 Base UI inline style 自算，皮肤只给外观。

**Tech Stack:** Next 16 (App Router/SSG) · React 19 · Base UI rc.0 (`slider`) · Tailwind v4(语义 token) · vitest 3.2 + jsdom + @testing-library/react · pnpm + Turborepo。

**上游 spec:** `docs/superpowers/specs/2026-06-02-hulian-a2-slider-design.md`（本计划覆盖其 §4/§5/§7/§8 全部）。

---

## File Structure

**Task S1 — Slider 组件**
- Create: `packages/ui/src/slider/slider.tsx` — Root 薄包 + Control/Track/Indicator/Thumb 皮肤 + range 自动分流。
- Create: `packages/ui/src/slider/slider.types.ts` — `SliderProps`（透传 `SliderRoot.Props` + `showValue`）。
- Create: `packages/ui/src/slider/slider.showcase.tsx` — `"use client"` ShowcaseSpec。
- Create: `packages/ui/src/slider/slider.test.tsx` — 单值/range thumb 数、min/max/step/disabled 透传、showValue 输出。
- Create: `packages/ui/src/slider/index.ts` — 桶导出。
- Modify: `packages/ui/src/index.ts` — `export * from "./slider"`。

**Task S2 — 接 IA + 验收**
- Modify: `apps/www/lib/manifest.ts` — 追加 1 条（`slider`/`inputs`/`new`）。
- Modify: `apps/www/lib/registry.tsx` — +1 import 名 + 1 map 行。

---

## 约定速查（执行者必读）

**可用语义 token（仅这些，无 success/warning）**：`bg-bg` `bg-surface` `bg-surface-hover` `text-foreground` `text-muted` `border-border` `ring-ring` `bg-primary` `text-primary-foreground` `bg-danger`；圆角 `rounded-full`（slider 全圆）。Slider 用到：`surface`/`surface-hover`/`primary`/`border`/`ring`/`foreground`/`muted`/`bg`(ring-offset)。

**import 路径**：组件内 `import { cn } from "../lib/cn"`；Base UI 值 `import { Slider as BaseSlider } from "@base-ui-components/react/slider"`；Base UI 类型 `import type { SliderRoot } from "@base-ui-components/react/slider"`。

**四件套**：`slider.tsx` + `slider.types.ts` + `slider.showcase.tsx`（必 `"use client"`）+ `slider.test.tsx` + `index.ts`（桶导出组件/类型/showcase）。本体用 Base UI(client) → 加 `"use client"`。

**门禁节奏**（沿用已验证模式）：
- TDD 循环：`pnpm --filter @hulian/ui exec vitest run slider`（先红后绿）。
- commit 前：`pnpm typecheck`（守类型/导出）。
- **完整三道门 + 生产 build 只在 S2 跑一次**：`pnpm typecheck && pnpm test && pnpm build --filter=www`（**build 必 `--filter=www`**——全包 build 会撞 desktop tauri `beforeBuildCommand` 二次 build www）。
- **Playwright 截图实测只在 S2**：明暗两态各一张，存 cwd 根 `/Users/zhangzhiwei/Desktop/code/hulian/*.png`，Read 看像素（不靠 `browser_evaluate` 读 DOM）。

**关键坑（实现期守）**：
1. **focus 环必须 `has-[:focus-visible]:`**，不能 `focus-visible:`——焦点在 thumb 内嵌 input，不在 thumb div。
2. **皮肤只给外观，禁写几何**（left/width/transform/inset）——Base UI 自算 Indicator 填充宽度与 thumb 位置，覆盖会错位。
3. **range 必须显式 `index`**：数组 value 时两个 `<Slider.Thumb index={0}/index={1}>`（SSR range 强制要求）。

**trunk-based**：直接在 master 小步 commit，无 remote、不 push。

---

## Task 0: 确认绿色基线

**Files:** 无（只读校验）

- [ ] **Step 1: 跑完整三道门，记录基线**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck && pnpm test && pnpm build --filter=www
```
Expected: 全绿（Step 2 收尾态 `4e974dc`）。**若此处已红，先停下报告——是存量问题，不在本计划范围内修。**

---

## Task S1: Slider（四件套，TDD）

**Files:**
- Create: `packages/ui/src/slider/slider.test.tsx`
- Create: `packages/ui/src/slider/slider.tsx`
- Create: `packages/ui/src/slider/slider.types.ts`
- Create: `packages/ui/src/slider/slider.showcase.tsx`
- Create: `packages/ui/src/slider/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 写 slider 测试（先红）**

Create `packages/ui/src/slider/slider.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Slider } from "./slider";

const ranges = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLInputElement>('input[type="range"]'));

describe("Slider", () => {
  it("标量 value → 渲 1 个 range input(单 thumb)", () => {
    const { container } = render(<Slider defaultValue={40} />);
    expect(ranges(container)).toHaveLength(1);
  });

  it("数组 value → 渲 2 个 range input(range 双 thumb)", () => {
    const { container } = render(<Slider defaultValue={[25, 75]} />);
    expect(ranges(container)).toHaveLength(2);
  });

  it("min/max/step 透传到内层 input", () => {
    const { container } = render(<Slider defaultValue={5} min={0} max={50} step={5} />);
    const input = ranges(container)[0];
    expect(input.getAttribute("min")).toBe("0");
    expect(input.getAttribute("max")).toBe("50");
    expect(input.getAttribute("step")).toBe("5");
  });

  it("disabled 透传 → 内层 input 禁用", () => {
    const { container } = render(<Slider defaultValue={40} disabled />);
    expect(ranges(container)[0].disabled).toBe(true);
  });

  it("showValue 渲出数值读出 output", () => {
    const { container } = render(<Slider defaultValue={40} showValue />);
    expect(container.querySelector("output")).not.toBeNull();
  });

  it("无 showValue 时不渲 output", () => {
    const { container } = render(<Slider defaultValue={40} />);
    expect(container.querySelector("output")).toBeNull();
  });

  it("className 落在 Root wrapper", () => {
    const { container } = render(<Slider defaultValue={40} className="mt-4" />);
    expect((container.firstChild as HTMLElement).className).toContain("mt-4");
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulian/ui exec vitest run slider`
Expected: FAIL —— `./slider` 不存在。

- [ ] **Step 3: 实现 slider.types.ts**

Create `packages/ui/src/slider/slider.types.ts`:
```ts
import type { SliderRoot } from "@base-ui-components/react/slider";

// 透传 Base UI Root（非泛型，默认联合类型 number | readonly number[]，数组 value 自动走 range）。
export interface SliderProps
  extends Omit<SliderRoot.Props, "className" | "render" | "children"> {
  /** Root wrapper className（简化为 string，覆盖 Base UI 的 string|fn 形态）。 */
  className?: string;
  /** 在轨道上方显示当前数值读出（Slider.Value）。 */
  showValue?: boolean;
}
```

- [ ] **Step 4: 实现 slider.tsx**

Create `packages/ui/src/slider/slider.tsx`:
```tsx
"use client";
import { Slider as BaseSlider } from "@base-ui-components/react/slider";
import { cn } from "../lib/cn";
import type { SliderProps } from "./slider.types";

// thumb 皮肤：焦点环用 has-[:focus-visible]:（焦点在 thumb 内嵌 input，非 thumb div）。
// 几何（位置）由 Base UI 自算 inline style，这里只给外观。
const thumbCls = cn(
  "size-4 rounded-full border border-border bg-surface shadow outline-none transition-transform",
  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg",
);

export function Slider({ className, showValue, ...props }: SliderProps) {
  const current = props.value ?? props.defaultValue;
  const isRange = Array.isArray(current);

  return (
    <BaseSlider.Root
      {...props}
      className={cn(
        "w-full select-none data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
        className,
      )}
    >
      {showValue && (
        <div className="mb-2 flex items-center justify-end text-sm text-foreground">
          <BaseSlider.Value className="tabular-nums text-muted" />
        </div>
      )}
      <BaseSlider.Control className="relative flex w-full touch-none items-center py-2">
        <BaseSlider.Track className="relative h-1.5 w-full rounded-full bg-surface-hover">
          <BaseSlider.Indicator className="rounded-full bg-primary" />
          {isRange ? (
            <>
              <BaseSlider.Thumb index={0} className={thumbCls} />
              <BaseSlider.Thumb index={1} className={thumbCls} />
            </>
          ) : (
            <BaseSlider.Thumb className={thumbCls} />
          )}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
```

- [ ] **Step 5: 实现 slider.showcase.tsx**

Create `packages/ui/src/slider/slider.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Slider } from "./slider";

export const sliderShowcase: ShowcaseSpec = {
  controls: [
    { prop: "value", type: "number", defaultValue: 40, label: "value" },
    { prop: "min", type: "number", defaultValue: 0, label: "min" },
    { prop: "max", type: "number", defaultValue: 100, label: "max" },
    { prop: "step", type: "number", defaultValue: 1, label: "step" },
    { prop: "showValue", type: "boolean", defaultValue: true, label: "显示数值" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "default", render: () => <Slider defaultValue={40} className="w-64" /> },
    { name: "showValue", render: () => <Slider defaultValue={60} showValue className="w-64" /> },
    { name: "range", render: () => <Slider defaultValue={[25, 75]} showValue className="w-64" /> },
    { name: "step=10", render: () => <Slider defaultValue={50} step={10} className="w-64" /> },
    { name: "disabled", render: () => <Slider defaultValue={40} disabled className="w-64" /> },
  ],
  renderWithProps: (p) => (
    <Slider
      defaultValue={p.value as number}
      min={p.min as number}
      max={p.max as number}
      step={p.step as number}
      showValue={p.showValue as boolean}
      disabled={p.disabled as boolean}
      className="w-64"
    />
  ),
  toCode: (p) =>
    `<Slider defaultValue={${p.value}} min={${p.min}} max={${p.max}} step={${p.step}}${
      p.showValue ? " showValue" : ""
    }${p.disabled ? " disabled" : ""} />`,
};
```

> 注记：Playground（`renderWithProps`）每次以 `defaultValue={value}` 重渲——number control 改 value 会因 key 变化重置非受控初值，足以演示。range 不进 Playground（数组无法用标量 control 表达），仅在 `states` 的 `range` 项展示。

- [ ] **Step 6: 实现 index.ts 桶导出**

Create `packages/ui/src/slider/index.ts`:
```ts
export { Slider } from "./slider";
export type { SliderProps } from "./slider.types";
export { sliderShowcase } from "./slider.showcase";
```

- [ ] **Step 7: 主 index 导出 slider**

在 `packages/ui/src/index.ts` 组件区加一行（紧跟 `export * from "./field";` 之后）:
```ts
export * from "./slider";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulian/ui exec vitest run slider`
Expected: PASS（7 条用例全绿：单/双 thumb 计数、min/max/step 透传、disabled、showValue 有/无、className）。

- [ ] **Step 9: typecheck + Commit**

Run: `pnpm typecheck`
Expected: 无错。
```bash
git add packages/ui/src/slider packages/ui/src/index.ts
git commit -m "feat(ui): Slider 组件(Base UI slider 薄包 + 单值/range 双 thumb + has-[:focus-visible] 焦点环)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task S2: 接 IA + 验收（截图明暗两态）

**Files:**
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`

- [ ] **Step 1: manifest 追加 1 条**

在 `apps/www/lib/manifest.ts` 的 `manifest` 数组末尾、`field` 条目后追加:
```ts
  { slug: "slider", name: "Slider", description: "滑块 · Base UI 单值/range + 键盘步进", category: "inputs", status: "new" },
```

- [ ] **Step 2: registry 追加 1 import + 1 map**

修改 `apps/www/lib/registry.tsx`——import 块加 `sliderShowcase`，map 加 `slider` 行:
```tsx
import {
  buttonShowcase,
  switchShowcase,
  dialogShowcase,
  badgeShowcase,
  cardShowcase,
  skeletonShowcase,
  avatarShowcase,
  inputShowcase,
  textareaShowcase,
  fieldShowcase,
  sliderShowcase,
} from "@hulian/ui";

export const specBySlug: Record<string, ShowcaseSpec> = {
  button: buttonShowcase,
  switch: switchShowcase,
  dialog: dialogShowcase,
  badge: badgeShowcase,
  card: cardShowcase,
  skeleton: skeletonShowcase,
  avatar: avatarShowcase,
  input: inputShowcase,
  textarea: textareaShowcase,
  field: fieldShowcase,
  slider: sliderShowcase,
};
```

- [ ] **Step 3: 跑契约测试（验证 manifest↔registry 一致）**

Run: `pnpm --filter www exec vitest run manifest`
Expected: PASS —— 11 个 slug 双边齐全、无孤儿/缺失。

- [ ] **Step 4: 跑完整三道门**

Run: `pnpm typecheck && pnpm test && pnpm build --filter=www`
Expected: 全绿；SSG 生成 `/components` + 11 个 `/components/[slug]`（含 slider）。

- [ ] **Step 5: 浏览器实测（Playwright 截图明暗两态 + 像素 Read）**

起 www（若桌面 app 已占 5514 则用 5514，否则 `pnpm dev` 起 5512；见 `nextjs-16-dev-server-dedupes-by-project-dir-not-port`）。用 Playwright 访问 `/components/slider`，**明暗两态各截一张**，存到 `/Users/zhangzhiwei/Desktop/code/hulian/`（如 `slider-light.png`/`slider-dark.png`），并 **Read 每张图看像素**逐项确认：
- 左树「表单录入」分组新增 Slider（带 `new` 标记）；
- **轨道**：`bg-surface-hover` 浅灰底、`h-1.5` 细圆条；**已填充段** `bg-primary` 从左到 thumb；
- **thumb**：`bg-surface` + `border-border` 圆点，**垂直居中对齐轨道**、不偏上下；
- **键盘聚焦**：Tab/点击聚焦 thumb 后出现 `ring`（`has-[:focus-visible]` 生效，非透明）；
- **range 项**：双 thumb 各就位、中间段填充 `primary`、两端 `surface-hover`、两 thumb 不重叠；
- **disabled 项**：整体 `opacity-50` 变暗；
- **showValue 项**：轨道上方右侧数值读出 `text-muted` 可读；
- 全程右上明暗开关切换，同步换肤、无白闪。
- 桌面 app(5514)：确认壳内加载 Slider 正常。

> **若 filled 段/ring 异常**（透明/不显色）：回查 `bg-primary`/`ring-ring` 是否生成——这些 token 在 Step 1/2 已验证可用；若 Indicator 宽度为 0，检查是否误写了几何 className 覆盖了 Base UI inline style。

- [ ] **Step 6: Commit**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): Slider 接入 IA(manifest+registry)，表单录入补充收口

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完成标志（本计划 = spec §8）

- 左侧组件树「表单录入」新增 Slider（`new` 标记），`/components/slider` 独立 SSG 页。
- Slider 四件套齐、只消费语义 token、`"use client"` 正确、桶导出 + 主 index + showcase 从 barrel 出。
- **单值单 thumb / range 双 thumb 不重叠**、轨道/填充/thumb 对齐、键盘聚焦出 ring（Playwright 像素自证）、disabled 变暗。
- 三道门（typecheck + test + `build --filter=www`）全绿；契约测试 11 slug 双边齐全；桌面 app(5514) 正常。
- `ShowcaseSpec` 类型未动、未引新依赖。

---

## Self-Review（plan 对 spec 的覆盖核查）

**1. Spec coverage**：
- spec §3 裁决 → 单值/range 都做(S1 isRange 分流)、不做 marks/垂直(未实现=YAGNI)、受控/非受控(透传)、showValue(S1)、Playground 标量+range 仅 states(S1 showcase) ✓
- spec §4 结构与皮肤(轨道/填充/thumb token + has-[:focus-visible] + 禁几何) → S1 Step4 ✓
- spec §5 SliderProps(透传 SliderRoot.Props + showValue，非泛型) → S1 Step3 ✓
- spec §6 硬约束(四件套/"use client"/三道门 --filter=www/截图/端口) → 约定速查 + S1/S2 ✓
- spec §7 showcase(controls/states/renderWithProps/toCode，零改 ShowcaseSpec) → S1 Step5 ✓
- spec §8 验收(IA 接入/契约 11 slug/三道门/像素自证/桌面 app) → S2 ✓

**2. Placeholder scan**：无 TBD/TODO；每个 code step 含完整可跑代码。✓

**3. Type consistency**：`SliderProps`/`sliderShowcase`/`Slider` 跨 Task 命名一致；registry import 名 `sliderShowcase` 与 index.ts 桶导出一致；manifest slug `slider` 与 registry map key 一致。✓
