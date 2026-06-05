# 瑚琏 A3 起步 — MUI 桥接 spike（emotion theme 桥）设计

> 状态：设计已定（brainstorm 完成）。日期 2026-06-03。
> 上游：`2026-06-02-hulian-a2-absorption-batch-design.md` §10 A3「MUI(emotion theme 桥) + Ant(ConfigProvider 桥)，各取最佳组件」。
> 本 spec 仅覆盖 **MUI 桥接 spike**——打通桥 + 1-2 个非 overlay 标志组件证明桥成立。Ant 桥另开 spec。

## 1. 本质与边界

这是**全新吸取模式**（区别于 Base UI 薄包 / 纯 CVA 皮肤 / Magic 抄取 / headless 库+皮肤）：MUI 自带 emotion 主题引擎，瑚琏不重写它，而是**把 MUI 的 theme.palette 接到瑚琏 CSS 变量单一真源**，让 MUI 组件吃瑚琏 token + 明暗自动同步，验证后各取其最佳组件。

**这是架构 spike，不是铺组件**：先打通桥（依赖 + emotion 注册 + 对账主题），再上 **2 个非 overlay 标志件证明桥成立**：**Rating（评分，inputs）+ Stepper（步骤条，navigation）**——瑚琏都没有、纯非 overlay、color 直引 palette（低 alpha 依赖，桥的颜色能直接验证）。

## 2. 四个 spike 难点的裁决（核心，先定方案）

### a) 明暗双机制对账 → MUI palette 读瑚琏 CSS 变量，单一真源

瑚琏 dark = CSS 变量 + `<html data-theme="dark">`（themeScript 早置，见 layout.tsx）。MUI dark = `createTheme({palette:{mode}})`。**两套并成一套**：MUI theme 的 palette 槽位值**全部设为瑚琏 `var(--color-*)` 字符串**，MUI 组件样式把它们当 CSS 值输出 → `data-theme` 一处切，CSS 变量实时变，MUI 组件随之换色。**无需 MUI 的 `palette.mode` 切换**（不搞第二套明暗状态）。

⚠️ **关键坑（spike 核心，必处理）**：MUI `createPalette` 对每个调色槽跑 `augmentColor`——若只给 `main` 不给 `light/dark/contrastText`，MUI 会用 `lighten()/darken()/getContrastText()` **解析 `main` 算衍生色**；而 `var(--color-primary)` 不是 MUI 能解析的颜色字符串 → 抛错/NaN。**对策：每个调色槽显式提供 `{main,light,dark,contrastText}` 全四值（都用 var()）**，augmentColor 检测到齐全就跳过解析。`shape.borderRadius` 必须是数字（不能 var()）→ 用 `10`（≈ --radius 0.625rem，文档化此处复制）。组件内运行时 `alpha(palette.x.main, n)` 的悬浮/选中底色无法吃 var() → 用 `action.hover/selected` 预置 `color-mix(in srgb, var(--color-*) N%, transparent)` 覆盖（WKWebView 支持 color-mix）。

### b) SSR/RSC + emotion 注册 → @mui/material-nextjs AppRouterCacheProvider + "use client" ThemeProvider

Next App Router 下 MUI+emotion 需 emotion cache 注册否则 hydration/FOUC 炸。用官方 `@mui/material-nextjs/v15-appRouter` 的 `AppRouterCacheProvider`（可在 server layout 用）+ 一层 **"use client"** `MuiBridgeProvider`（`<ThemeProvider theme={hulianMuiTheme}>`，createTheme 须在 client 模块）。挂在 `layout.tsx` body 内、包住 children（套 [[heroui-v3-client-only-next-app-router-server-files]] + [[rsc-registry-split-data-from-spec-to-isolate-server-module-graph]]：theme/Provider 全在 client 边界，layout server 只渲染它们）。瑚琏 `var()` 在 `<html data-theme>` 上解析，与 Provider 嵌套顺序无关。

### c) overlay 红线张力 → 本 spike 只取非 overlay 件

MUI 自带 Portal/Popper 引擎——用 MUI overlay 件（Menu/Select/Tooltip/Dialog/Autocomplete/Snackbar）= **引第二套 overlay 引擎，破「overlay 全 Base UI」红线**。**本 spike 严格只取非 overlay 件（Rating/Stepper）**。将来要 MUI overlay 件必须先与用户确认是否破红线（届时写进 spec 取舍）。

### d) 付代价自觉 → 隔离在 `packages/ui/src/_mui/` + 标注代价

MUI bundle 重，A3 本就是「付代价家族」。桥接产物全部隔离在 **`packages/ui/src/_mui/`**（下划线前缀 = 重/付代价/隔离），不污染轻量主线。主 barrel `export * from "./_mui"` 是 side-effect-free re-export → ESM tree-shaking 保证非 MUI 消费者不 bundle MUI（只有 import Rating/Stepper 才拉 MUI）。dev 文档站全量 bundle MUI 可接受（prod 打包 A4 处理 dev-only）。

## 3. 依赖

- `@hulianui/ui` deps：`@mui/material`、`@emotion/react`、`@emotion/styled`（组件 + theme 所在）。
- `apps/www` deps：`@mui/material-nextjs`、`@emotion/cache`、`@emotion/react`（app 级 emotion registry）。
- 装：`pnpm --filter @hulianui/ui add @mui/material @emotion/react @emotion/styled` + `pnpm --filter www add @mui/material-nextjs @emotion/cache @emotion/react`。lockfile 随实现 commit。MUI v7 / emotion 11 兼容 React 19 + Next 16。

## 4. 瑚琏 API 罩住 MUI（外部看是瑚琏件，不是裸 MUI）

### 4.1 `Rating`（inputs）
```ts
export interface RatingProps {
  value?: number; defaultValue?: number;
  onValueChange?: (value: number | null) => void;  // 瑚琏命名（非 MUI onChange(e,v)）
  max?: number; readOnly?: boolean; disabled?: boolean;
  size?: "sm" | "md" | "lg";                        // 映射 MUI size small/medium/large
  className?: string;
}
```
皮肤：filled 星色 = `var(--color-primary)`（经 `sx`/styleOverrides 落 `.MuiRating-iconFilled`），empty 星 = `var(--color-border)`。受控/非受控对称（透传 value/defaultValue）。

### 4.2 `Stepper`（navigation）
```ts
export interface StepItem { label: ReactNode; }
export interface StepperProps {
  steps: StepItem[];
  activeStep: number;          // 受控当前步（0-based）
  className?: string;
}
```
皮肤：active/completed StepIcon = `var(--color-primary)`、未达 = `var(--color-muted)`/`var(--color-border)`；StepLabel 文字 active=`var(--color-foreground)` 其余=`var(--color-muted)`；connector=`var(--color-border)`。水平布局。

两件本体 **必 `"use client"`**（MUI 组件 + emotion）。

## 5. 文件结构（四件套套进 `_mui/`）

```
packages/ui/src/_mui/
  theme.ts              # hulianMuiTheme = createTheme(...) 读瑚琏 var()（含全四值调色槽 + color-mix action）
  provider.tsx          # "use client" MuiBridgeProvider = <ThemeProvider theme={hulianMuiTheme}>
  rating.tsx/.types.ts/.showcase.tsx/.test.tsx
  stepper.tsx/.types.ts/.showcase.tsx/.test.tsx
  index.ts              # 桶导出 Rating/Stepper/MuiBridgeProvider/hulianMuiTheme + 两 showcase
apps/www/components/mui-registry.tsx   # "use client" AppRouterCacheProvider + MuiBridgeProvider
apps/www/app/layout.tsx                # 挂 <MuiRegistry> 包 children
packages/ui/src/index.ts               # export * from "./_mui"
apps/www/lib/manifest.ts + registry.tsx  # +2（rating→inputs / stepper→navigation）
```

## 6. 测试（vitest/jsdom）

MUI Rating/Stepper 非 overlay、jsdom 可渲染（无 Portal）。**不测颜色**（jsdom 不算 var()）→ 测**结构 + 瑚琏 API 行为**，包在 `MuiBridgeProvider` 内确保桥不崩：
- Rating：渲染 `max` 个星（role `radio`/label）；受控 `value` 反映选中；点星触发 `onValueChange(新值)`；`readOnly` 不触发。
- Stepper：渲染 `steps.length` 个步；`activeStep` 标记当前步（MUI `.Mui-active`）；步文字渲染。
- `hulianMuiTheme`：`createTheme` 不抛（验证全四值调色槽配置成立）；`palette.primary.main === "var(--color-primary)"`。

## 7. 三道门 + 验收

1. 桥 + Rating + Stepper 四件套齐 + 主 barrel 导出 + manifest/registry 双文件 +2；layout 挂 MuiRegistry。
2. 三道门 `--force`：typecheck + 自己 vitest + `build --filter=www --force`——**重点验 MUI+emotion 在 `next build` SSR 下不报错/不 FOUC**（AppRouterCacheProvider 生效），新依赖 lockfile 一并 commit。
3. Playwright/隔离 chromium 截图**明暗两态**存 cwd 根 Read 看像素：**重点验 MUI 组件吃到瑚琏 token 配色**（Rating 星 = primary 色、Stepper active = primary）、**暗态同步切换无残留亮块 / 无 FOUC**（MUI 默认浅色主题不能漏出来）、组件几何正常。端口 5512/5514（桌面 app 跑 5514 则用 5514）。
4. 桌面 app 加载 rating/stepper 页正常（MUI 在 WKWebView 出，color-mix 生效）。
5. 不触碰他人 untracked WIP（并行族）。

## 8. 不做（YAGNI / 红线边界）

- **不取任何 MUI overlay 件**（Menu/Select/Autocomplete/Dialog/Tooltip/Snackbar/Popover）——破 overlay 红线，需用户确认。
- 不接 MUI 的 `palette.mode` 双主题 / 不用 MUI `cssVariables:true` 自生成变量（与瑚琏单一真源冲突）。
- 不铺更多 MUI 件（spike 证明桥成立即止；后续按需各取最佳件，复用本桥）。
- Ant 桥（ConfigProvider）另开 spec，不在本 spike。
- 不做 MUI 全局 `CssBaseline`（会重置全站样式，与瑚琏 token 冲突）。
