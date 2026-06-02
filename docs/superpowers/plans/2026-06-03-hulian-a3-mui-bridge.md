# 瑚琏 A3 MUI 桥接 spike 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development 或 executing-plans 逐任务实施。步骤用 `- [ ]` 复选框追踪。

**Goal:** 打通 MUI emotion theme 桥（palette 读瑚琏 CSS 变量单一真源 + App Router emotion 注册），上 Rating + Stepper 两个非 overlay 件证明桥成立。

**Architecture:** MUI `createTheme` 的 palette 槽位全设为瑚琏 `var(--color-*)`（每槽给齐 main/light/dark/contrastText 跳过 augmentColor 解析），`data-theme` 一处切两边同步。`@mui/material-nextjs` 的 `AppRouterCacheProvider`（server layout 可用，children 透传保持 server 渲染）+ "use client" `MuiBridgeProvider`（ThemeProvider）。桥接产物隔离在 `packages/ui/src/_mui/`。只取非 overlay 件（红线）。

**Tech Stack:** MUI v7 + @emotion/react/styled + @mui/material-nextjs + React 19 + Next 16 App Router + vitest/jsdom。

**关键约束（继承）：** 明暗只走瑚琏 token 单一真源（无 success）；overlay 全 Base UI 红线（MUI 只取非 overlay）；四件套 + MUI 桥件本体必 `"use client"` + showcase 必 `"use client"` + 桶导出 + 主 index export + showcase 从主 barrel 导出；三道门 `--force`（[[turbo-test-red-isolate-untracked-wip-not-your-regression]]）；精确 `git add <路径>` 不碰他人 WIP（[[parallel-session-git-add-all-sweeps-your-staged-files]]，本会话并行有 number-ticker/combobox/pagination 等，commit 前临时移除他人未提交的共享文件行→commit→复原）；截图明暗两态存 cwd 根 Read（[[ui-layout-verify-needs-screenshot-not-dom-eval]]，[[mcp-browser-busy-launch-isolated-chromium-via-executablepath]]）；新依赖 lockfile 随 commit。

**文件结构：**
- 新建 `packages/ui/src/_mui/`：`theme.ts` / `theme.test.ts` / `provider.tsx` / `rating.{tsx,types.ts,showcase.tsx,test.tsx}` / `stepper.{tsx,types.ts,showcase.tsx,test.tsx}` / `index.ts`。
- 改 `packages/ui/package.json`（+@mui/material @emotion/react @emotion/styled）、`apps/www/package.json`（+@mui/material-nextjs @emotion/cache @emotion/react）。
- 改 `packages/ui/src/index.ts`（+export * from "./_mui"）。
- 改 `apps/www/app/layout.tsx`（AppRouterCacheProvider + MuiBridgeProvider 包 children）。
- 改 `apps/www/lib/manifest.ts` + `registry.tsx`（+2：rating→inputs / stepper→navigation）。

---

## Task 1: 装依赖 + 桥主题 + Provider（含 theme TDD）

**Files:** `packages/ui/package.json`、`apps/www/package.json`、`packages/ui/src/_mui/theme.ts`、`theme.test.ts`、`provider.tsx`

- [ ] **Step 1: 装依赖**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm --filter @hulian/ui add @mui/material @emotion/react @emotion/styled
pnpm --filter www add @mui/material-nextjs @emotion/cache @emotion/react
```
Expected: ui deps 多三者、www deps 多三者；lockfile 更新。peer warning（React 版本）可继续，硬失败则加 `@latest`。

- [ ] **Step 2: 写 theme.test.ts（失败测试）**

```ts
import { describe, it, expect } from "vitest";
import { hulianMuiTheme } from "./theme";

describe("hulianMuiTheme（MUI 桥主题读瑚琏 var 单一真源）", () => {
  it("createTheme 不抛 + palette 槽位是瑚琏 CSS 变量", () => {
    expect(hulianMuiTheme.palette.primary.main).toBe("var(--color-primary)");
    expect(hulianMuiTheme.palette.primary.contrastText).toBe("var(--color-primary-foreground)");
    expect(hulianMuiTheme.palette.background.paper).toBe("var(--color-surface)");
    expect(hulianMuiTheme.palette.text.secondary).toBe("var(--color-muted)");
    expect(hulianMuiTheme.palette.divider).toBe("var(--color-border)");
  });
});
```

- [ ] **Step 3: 跑测试验证失败**

Run: `pnpm --filter @hulian/ui exec vitest run src/_mui/theme.test.ts`
Expected: FAIL（`./theme` 不存在）。

- [ ] **Step 4: 写 theme.ts**

```ts
import { createTheme } from "@mui/material/styles";

// 瑚琏 MUI 桥主题：palette 槽位全读瑚琏 CSS 变量（单一真源），data-theme 切换实时换色。
// ⚠️ 每个调色槽给齐 {main,light,dark,contrastText} → MUI createPalette 的 augmentColor
//    检测到齐全就跳过 lighten/darken/getContrastText（它们无法解析 var() 会 NaN/抛错）。
// ⚠️ shape.borderRadius 必须是数字（不能 var()）→ 用 10（≈ --radius 0.625rem，此处刻意复制）。
// ⚠️ action.hover/selected 用 color-mix 替代 MUI 运行时 alpha(main)（alpha 同样吃不了 var()）。
export const hulianMuiTheme = createTheme({
  palette: {
    primary: {
      main: "var(--color-primary)",
      light: "var(--color-primary-hover)",
      dark: "var(--color-primary-hover)",
      contrastText: "var(--color-primary-foreground)",
    },
    error: {
      main: "var(--color-danger)",
      light: "var(--color-danger)",
      dark: "var(--color-danger)",
      contrastText: "var(--color-danger-foreground)",
    },
    background: { default: "var(--color-bg)", paper: "var(--color-surface)" },
    text: {
      primary: "var(--color-foreground)",
      secondary: "var(--color-muted)",
      disabled: "var(--color-muted)",
    },
    divider: "var(--color-border)",
    action: {
      active: "var(--color-foreground)",
      hover: "color-mix(in srgb, var(--color-foreground) 6%, transparent)",
      selected: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
      disabled: "var(--color-muted)",
      disabledBackground: "var(--color-surface-hover)",
    },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: "inherit" },
});
```

- [ ] **Step 5: 跑测试验证通过**

Run: `pnpm --filter @hulian/ui exec vitest run src/_mui/theme.test.ts`
Expected: PASS。

- [ ] **Step 6: 写 provider.tsx**

```tsx
"use client";
import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { hulianMuiTheme } from "./theme";

// 瑚琏 MUI 桥 Provider：把桥主题下发给子树所有 MUI 件。挂在 www layout（AppRouterCacheProvider 内）。
export function MuiBridgeProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={hulianMuiTheme}>{children}</ThemeProvider>;
}
```

- [ ] **Step 7: Commit**

```bash
git add packages/ui/package.json apps/www/package.json pnpm-lock.yaml packages/ui/src/_mui/theme.ts packages/ui/src/_mui/theme.test.ts packages/ui/src/_mui/provider.tsx
git commit -m "feat(ui): A3 MUI 桥起步 — 装 MUI/emotion + 桥主题(palette 读瑚琏 var 单一真源) + MuiBridgeProvider"
```

---

## Task 2: Rating（inputs，TDD）

**Files:** `packages/ui/src/_mui/rating.types.ts`、`rating.test.tsx`、`rating.tsx`

- [ ] **Step 1: rating.types.ts**

```ts
export interface RatingProps {
  value?: number;
  defaultValue?: number;
  /** 瑚琏命名受控回调（替代 MUI onChange(e,v)） */
  onValueChange?: (value: number | null) => void;
  max?: number;
  readOnly?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

- [ ] **Step 2: rating.test.tsx（失败测试）**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MuiBridgeProvider } from "./provider";
import { Rating } from "./rating";

describe("Rating（MUI 桥）", () => {
  it("可交互时渲染 max 个星 radio", () => {
    const { getAllByRole } = render(
      <MuiBridgeProvider>
        <Rating max={5} value={0} />
      </MuiBridgeProvider>,
    );
    expect(getAllByRole("radio").length).toBeGreaterThanOrEqual(5);
  });

  it("点第 3 星触发 onValueChange(3)", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <MuiBridgeProvider>
        <Rating max={5} value={0} onValueChange={onValueChange} />
      </MuiBridgeProvider>,
    );
    const radio = container.querySelector('input[type="radio"][value="3"]') as HTMLInputElement;
    expect(radio).toBeTruthy();
    fireEvent.click(radio);
    expect(onValueChange).toHaveBeenCalledWith(3);
  });

  it("readOnly 不渲染可点 radio", () => {
    const { queryAllByRole } = render(
      <MuiBridgeProvider>
        <Rating max={5} value={3} readOnly />
      </MuiBridgeProvider>,
    );
    expect(queryAllByRole("radio").length).toBe(0);
  });
});
```

- [ ] **Step 3: 跑测试验证失败**

Run: `pnpm --filter @hulian/ui exec vitest run src/_mui/rating.test.tsx`
Expected: FAIL（`./rating` 不存在）。

- [ ] **Step 4: rating.tsx**

```tsx
"use client";
import MuiRating from "@mui/material/Rating";
import type { RatingProps } from "./rating.types";

const SIZE_MAP = { sm: "small", md: "medium", lg: "large" } as const;

// 瑚琏 Rating = MUI Rating 罩瑚琏受控 API + token 皮肤（星色走 var()）。
export function Rating({
  value,
  defaultValue,
  onValueChange,
  max = 5,
  readOnly,
  disabled,
  size = "md",
  className,
}: RatingProps) {
  return (
    <MuiRating
      className={className}
      value={value}
      defaultValue={defaultValue}
      max={max}
      readOnly={readOnly}
      disabled={disabled}
      size={SIZE_MAP[size]}
      onChange={(_, v) => onValueChange?.(v)}
      sx={{
        "& .MuiRating-iconFilled": { color: "var(--color-primary)" },
        "& .MuiRating-iconEmpty": { color: "var(--color-border)" },
        "& .MuiRating-iconHover": { color: "var(--color-primary-hover)" },
      }}
    />
  );
}
```

- [ ] **Step 5: 跑测试验证通过**

Run: `pnpm --filter @hulian/ui exec vitest run src/_mui/rating.test.tsx`
Expected: PASS（3 用例绿）。若 `input[value="3"]` 找不到，改 `getByLabelText(/3 Star/i)`（MUI 版本默认 label 文案）。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/_mui/rating.types.ts packages/ui/src/_mui/rating.tsx packages/ui/src/_mui/rating.test.tsx
git commit -m "feat(ui): MUI 桥 Rating(瑚琏受控 API + 星色走 token var) + TDD 3 用例"
```

---

## Task 3: Stepper（navigation，TDD）

**Files:** `packages/ui/src/_mui/stepper.types.ts`、`stepper.test.tsx`、`stepper.tsx`

- [ ] **Step 1: stepper.types.ts**

```ts
import type { ReactNode } from "react";

export interface StepItem {
  label: ReactNode;
}
export interface StepperProps {
  steps: StepItem[];
  /** 受控当前步（0-based） */
  activeStep: number;
  className?: string;
}
```

- [ ] **Step 2: stepper.test.tsx（失败测试）**

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MuiBridgeProvider } from "./provider";
import { Stepper } from "./stepper";

const steps = [{ label: "下单" }, { label: "付款" }, { label: "发货" }];

describe("Stepper（MUI 桥）", () => {
  it("渲染所有步文字", () => {
    const { getByText } = render(
      <MuiBridgeProvider>
        <Stepper steps={steps} activeStep={1} />
      </MuiBridgeProvider>,
    );
    expect(getByText("下单")).toBeTruthy();
    expect(getByText("付款")).toBeTruthy();
    expect(getByText("发货")).toBeTruthy();
  });

  it("activeStep 标记当前步（Mui-active）", () => {
    const { container } = render(
      <MuiBridgeProvider>
        <Stepper steps={steps} activeStep={1} />
      </MuiBridgeProvider>,
    );
    expect(container.querySelector(".Mui-active")).toBeTruthy();
  });
});
```

- [ ] **Step 3: 跑测试验证失败**

Run: `pnpm --filter @hulian/ui exec vitest run src/_mui/stepper.test.tsx`
Expected: FAIL（`./stepper` 不存在）。

- [ ] **Step 4: stepper.tsx**

```tsx
"use client";
import MuiStepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import type { StepperProps } from "./stepper.types";

// 瑚琏 Stepper = MUI Stepper 罩瑚琏 API（steps 数组 + activeStep）+ token 皮肤（active/completed 走 var()）。
export function Stepper({ steps, activeStep, className }: StepperProps) {
  return (
    <MuiStepper
      activeStep={activeStep}
      alternativeLabel
      className={className}
      sx={{
        "& .MuiStepIcon-root": { color: "var(--color-border)" },
        "& .MuiStepIcon-root.Mui-active": { color: "var(--color-primary)" },
        "& .MuiStepIcon-root.Mui-completed": { color: "var(--color-primary)" },
        "& .MuiStepIcon-text": { fill: "var(--color-primary-foreground)" },
        "& .MuiStepLabel-label": { color: "var(--color-muted)" },
        "& .MuiStepLabel-label.Mui-active": { color: "var(--color-foreground)" },
        "& .MuiStepLabel-label.Mui-completed": { color: "var(--color-foreground)" },
        "& .MuiStepConnector-line": { borderColor: "var(--color-border)" },
      }}
    >
      {steps.map((s, i) => (
        <Step key={i}>
          <StepLabel>{s.label}</StepLabel>
        </Step>
      ))}
    </MuiStepper>
  );
}
```

- [ ] **Step 5: 跑测试验证通过**

Run: `pnpm --filter @hulian/ui exec vitest run src/_mui/stepper.test.tsx`
Expected: PASS（2 用例绿）。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/_mui/stepper.types.ts packages/ui/src/_mui/stepper.tsx packages/ui/src/_mui/stepper.test.tsx
git commit -m "feat(ui): MUI 桥 Stepper(steps 数组 + activeStep + token 皮肤) + TDD 2 用例"
```

---

## Task 4: showcase + 桶导出 + 主 barrel

**Files:** `packages/ui/src/_mui/rating.showcase.tsx`、`stepper.showcase.tsx`、`_mui/index.ts`、`packages/ui/src/index.ts`

- [ ] **Step 1: rating.showcase.tsx**

```tsx
"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Rating } from "./rating";

function Demo() {
  const [v, setV] = useState<number | null>(3);
  return <Rating value={v ?? 0} onValueChange={setV} />;
}

export const ratingShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "尺寸" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "可交互", render: () => <Demo /> },
    { name: "只读", render: () => <Rating value={4} readOnly /> },
    { name: "lg", render: () => <Rating defaultValue={3} size="lg" /> },
  ],
  renderWithProps: (p) => (
    <Rating defaultValue={3} size={(p.size as "sm" | "md" | "lg") ?? "md"} readOnly={p.readOnly === true} />
  ),
  toCode: (p) => `<Rating defaultValue={3} size="${p.size ?? "md"}"${p.readOnly ? " readOnly" : ""} />`,
};
```

- [ ] **Step 2: stepper.showcase.tsx**

```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Stepper } from "./stepper";

const steps = [{ label: "下单" }, { label: "付款" }, { label: "发货" }, { label: "完成" }];

export const stepperShowcase: ShowcaseSpec = {
  controls: [{ prop: "activeStep", type: "number", defaultValue: 1, label: "当前步" }],
  states: [
    { name: "第二步", render: () => <Stepper steps={steps} activeStep={1} /> },
    { name: "首步", render: () => <Stepper steps={steps} activeStep={0} /> },
    { name: "已完成", render: () => <Stepper steps={steps} activeStep={4} /> },
  ],
  renderWithProps: (p) => <Stepper steps={steps} activeStep={Number(p.activeStep)} />,
  toCode: (p) => `<Stepper steps={steps} activeStep={${p.activeStep}} />`,
};
```

- [ ] **Step 3: _mui/index.ts**

```ts
export { Rating } from "./rating";
export type { RatingProps } from "./rating.types";
export { ratingShowcase } from "./rating.showcase";
export { Stepper } from "./stepper";
export type { StepperProps, StepItem } from "./stepper.types";
export { stepperShowcase } from "./stepper.showcase";
export { MuiBridgeProvider } from "./provider";
export { hulianMuiTheme } from "./theme";
```

- [ ] **Step 4: 主 barrel 追加（锚定当前最后一行组件 export，用 Edit；若被并行改动则锚实际行）**

`packages/ui/src/index.ts` 在组件区末尾加：
```ts
export * from "./_mui";
```

- [ ] **Step 5: typecheck**

Run: `pnpm --filter @hulian/ui exec tsc --noEmit 2>&1 | grep -E "_mui/" || echo "✅ _mui 零报错"`
Expected: ✅ _mui 零报错（其余他人 WIP 报错隔离不管）。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/_mui/rating.showcase.tsx packages/ui/src/_mui/stepper.showcase.tsx packages/ui/src/_mui/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): MUI 桥 Rating/Stepper showcase + _mui 桶导出 + 主 barrel"
```
> ⚠️ 若 `git diff packages/ui/src/index.ts` 含他人未提交行（如 combobox/pagination/number-ticker），先临时移除他人行→commit 我的→复原（[[parallel-session-git-add-all-sweeps-your-staged-files]]）。

---

## Task 5: 挂 layout + 接 IA + 三道门

**Files:** `apps/www/app/layout.tsx`、`apps/www/lib/manifest.ts`、`apps/www/lib/registry.tsx`

- [ ] **Step 1: layout.tsx 挂 MUI 桥（AppRouterCacheProvider + MuiBridgeProvider 包 children，children 透传保持 server 渲染）**

把 body 内改为（在现有 `<ThemeProvider>` 内嵌入）：
```tsx
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { MuiBridgeProvider } from "@hulian/ui";
// …
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider defaultSetting="system">
          <AppRouterCacheProvider options={{ key: "mui" }}>
            <MuiBridgeProvider>
              <MswProvider>{children}</MswProvider>
            </MuiBridgeProvider>
          </AppRouterCacheProvider>
        </ThemeProvider>
      </body>
```
（注：`<script>` 原在 `<head>`；若现状如此则保持 head 内，仅在 body 包 MUI 两层。按文件实际结构 Edit。）

- [ ] **Step 2: manifest +2（幂等 python）**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
python3 - <<'PY'
p = "apps/www/lib/manifest.ts"
s = open(p, encoding="utf-8").read()
lines = [
  '  { slug: "rating", name: "Rating", description: "评分 · MUI 桥(emotion theme 读瑚琏 token) + 受控星级", category: "inputs", status: "new" },\n',
  '  { slug: "stepper", name: "Stepper", description: "步骤条 · MUI 桥 + active/completed 走瑚琏 token", category: "navigation", status: "new" },\n',
]
idx = s.rfind("];")
add = "".join(l for l in lines if f'slug: "{l.split(chr(34))[1]}"' not in s)
if add:
    s = s[:idx] + add + s[idx:]; open(p,"w",encoding="utf-8").write(s); print("inserted", [l.split(chr(34))[1] for l in lines if l in add])
else: print("present")
PY
grep -n 'slug: "rating"\|slug: "stepper"' apps/www/lib/manifest.ts
```

- [ ] **Step 3: registry +2（幂等 python）**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
python3 - <<'PY'
p = "apps/www/lib/registry.tsx"
s = open(p, encoding="utf-8").read()
if "ratingShowcase" not in s:
    s = s.replace("\n} from \"@hulian/ui\";", "\n  ratingShowcase,\n  stepperShowcase,\n} from \"@hulian/ui\";", 1)
    idx = s.rfind("};")
    s = s[:idx] + "  rating: ratingShowcase,\n  stepper: stepperShowcase,\n" + s[idx:]
    open(p,"w",encoding="utf-8").write(s); print("inserted")
else: print("present")
PY
grep -n "ratingShowcase\|stepperShowcase\|rating: \|stepper: " apps/www/lib/registry.tsx
```

- [ ] **Step 4: 三道门 `--force`**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
pnpm typecheck 2>&1 | tail -6
pnpm --filter @hulian/ui exec vitest run src/_mui 2>&1 | tail -6
pnpm build --filter=www --force 2>&1 | tail -20
```
Expected: typecheck PASS（_mui 我 scope）；_mui 测试全绿（theme 1 + rating 3 + stepper 2）；**`build --filter=www` PASS**——重点确认 MUI+emotion+AppRouterCacheProvider 在 `next build` SSR 下不报错（`/components/rating`+`/components/stepper` SSG 生成）。他人 WIP 致全量 typecheck 红则隔离判定。

- [ ] **Step 5: git diff 核对仅自己增量 + commit（含 layout）**

```bash
git diff apps/www/app/layout.tsx apps/www/lib/manifest.ts apps/www/lib/registry.tsx
# 确认仅 MUI 桥挂载 + rating/stepper 增量；他人未提交行先移除→commit→复原
git add apps/www/app/layout.tsx apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): MUI 桥挂载 layout(AppRouterCacheProvider+MuiBridgeProvider) + Rating/Stepper 接 IA +2"
```

---

## Task 6: 浏览器实测明暗两态（重点验 token 配色 + 无 FOUC）

**Files:** 无代码改动。截图存 cwd 根 `rating-{light,dark}.png` / `stepper-{light,dark}.png`（自己文件名，不 commit）。

- [ ] **Step 1: 探活端口**

```bash
for p in 5514 5512; do for s in rating stepper; do echo "$p/$s: $(curl -s -o /dev/null -w '%{http_code}' --max-time 4 http://localhost:$p/components/$s)"; done; done
```
任一 200 即用（桌面 app 跑 5514 优先）；都不在则 `pnpm --filter www dev` 后台起。

- [ ] **Step 2: 隔离 chromium 截 4 图**

```bash
cd /tmp/hlshot3 2>/dev/null || { mkdir -p /tmp/hlshot3 && cd /tmp/hlshot3 && npm init -y >/dev/null 2>&1 && npm i playwright-core >/dev/null 2>&1; }
cat > /tmp/hlshot3/shot-mui.mjs <<'EOF'
import { chromium } from "playwright-core";
const EXEC = "/Users/zhangzhiwei/Library/Caches/ms-playwright/chromium-1124/chrome-mac/Chromium.app/Contents/MacOS/Chromium";
const OUT = "/Users/zhangzhiwei/Desktop/code/hulian";
const PORT = process.env.PORT || "5514";
const browser = await chromium.launch({ executablePath: EXEC, headless: true });
for (const slug of ["rating", "stepper"]) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1400 }, deviceScaleFactor: 2 });
    await ctx.addInitScript((t) => { try { localStorage.setItem("hulian-theme", t); } catch {} }, theme);
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${PORT}/components/${slug}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${slug}-${theme}.png`, fullPage: true });
    console.log(`${slug}-${theme}: data-theme=${await page.evaluate(() => document.documentElement.getAttribute("data-theme"))}`);
    await ctx.close();
  }
}
await browser.close();
EOF
PORT=<探活端口> node /tmp/hlshot3/shot-mui.mjs
```

- [ ] **Step 3: Read 4 图看像素**

逐条核：①Rating 星 filled = 瑚琏 primary 蓝（非 MUI 默认琥珀）、empty = border 色；②Stepper active/completed 圆点 = primary、未达 = border/muted、文字 active=foreground 其余 muted、连接线 = border；③**暗态：MUI 件背景/文字随瑚琏暗 token 切换，无残留亮块、无 MUI 默认浅主题漏出（无 FOUC）**；④几何正常、不溢出。
Expected: 全符合；不符回 theme.ts/sx 调（漏切色多半是某 MUI 类没被 sx 覆盖到，截图定位类名补 sx）。

- [ ] **Step 4: 桌面 app(5514) 加载验证**

确认 5514 `/components/rating`+`/components/stepper` 正常（MUI 在 WKWebView 出、color-mix 生效、左树 inputs 出现 Rating / navigation 出现 Stepper）。

---

## Task 7: 收尾

- [ ] **Step 1: 回写主 spec §10**

主 spec §10 A3 行追注：MUI 桥 spike 已落（`…-a3-mui-bridge-design.md`），emotion theme palette 读瑚琏 var 单一真源 + AppRouterCacheProvider + 只取非 overlay 件（Rating/Stepper）；Ant 桥待续。

- [ ] **Step 2: 更新项目记忆**

`hulian-phase-status.md` 追加 A3 MUI 桥完成态（桥架构 + a/b/c/d 四裁决 + 选件 + 红线取舍 + 组件计数）；MEMORY.md 索引刷新。

- [ ] **Step 3: claudeception 评估**

emotion theme palette 读 CSS 变量（augmentColor 跳过技巧）+ App Router emotion SSR 注册 + 跨库 overlay 红线取舍 + MUI sx 落 token，几乎必产新 skill。跑 claudeception 沉淀。

---

## Self-Review

**Spec 覆盖：** §2a 明暗对账(theme var+全四值)→T1；§2b SSR emotion(AppRouterCacheProvider+client provider)→T1/T5；§2c 红线(只非 overlay)→选件 Rating/Stepper + §8 不做；§2d 隔离(_mui/)→全 T；§3 依赖→T1S1；§4 瑚琏 API→T2/T3；§5 文件结构→全 T；§6 测试→T1/T2/T3；§7 三道门+截图→T5/T6；§8 不做项→计划无 overlay/CssBaseline/mode 代码。✅
**Placeholder 扫描：** 无 TBD/TODO；每代码步完整代码；layout/barrel 锚点说明并行应对。
**类型一致性：** `RatingProps`/`StepperProps`/`StepItem`/`MuiBridgeProvider`/`hulianMuiTheme`/`ratingShowcase`/`stepperShowcase` 在 types→tsx→showcase→index→provider→registry 全程一致；`onValueChange(value:number|null)` 签名 T1/T2 一致；MUI 类名钩子 `.Mui-active`/`.MuiStepIcon-root` 在 stepper.tsx 与 test 一致。
