# 瑚琏 Hulian A2 反馈族补充 — Progress 进度条设计文档

- **日期**: 2026-06-03
- **状态**: 已据用户原始 prompt 倾向 + 代码库 ethos 自行拍板全部关键裁决（用户设「完成再通知我」自主推进，不阻塞审阅），进入实施计划
- **本 spec 覆盖范围**: A2 反馈族补充单组件 **Progress 进度条**（`linear` 横条 + `circular` 环，含 `indeterminate` 不定态）。展示型、纯皮肤 + 值驱动，**零 Base UI 行为、零浮层、零 Portal、零新依赖**。
- **上游依据**:
  - `2026-06-02-hulian-a2-absorption-batch-design.md`（§3.4 分类法 `feedback` · §6 硬约束 · §9 YAGNI）
  - 项目记忆 `hulian-phase-status`（已完成态 + 固化坑 + 并行纪律）
- **对照范式**:
  - `packages/ui/src/badge/badge.tsx`（纯 CVA 皮肤）、`alert/`（feedback 纯皮肤 + a11y role 派生）
  - `packages/ui/src/skeleton/skeleton.tsx`（motion 循环动画展示组件 + `"use client"`，本批 indeterminate 的最近先例）
  - `packages/ui/src/slider/slider.tsx`（**反向对照**：Slider 几何由 Base UI 自算「禁写 width」；Progress **几何由组件自己拥有**，linear 填充宽度 / circular stroke 都自己算）

---

## 1. 本组件定义与边界

Progress 是**只读展示型**进度反馈：给定 `value`/`max` 渲染确定进度；不给 `value` 则进入 `indeterminate` 不定态（循环动画表达"进行中、总量未知"）。与 Slider（可交互输入、几何由 Base UI 接管）本质不同——Progress 无交互、无 Base UI、**几何完全自有**。

- **做**：`<Progress>` 单组件，`variant="linear"|"circular"` 两形态 + indeterminate 不定态 + `tone` primary/danger + 可选 `showValue` 百分比标签 + 完整 a11y。
- **不做**（YAGNI，见 §7）：分段/缓冲(buffer)进度、label 模板、`success`/`warning` tone（token 无）、垂直 linear、circular 端点装饰、`striped`/渐变填充、value 变化的数字 tween（那是 NumberTicker 的活）。

---

## 2. 关键裁决（4 个 brainstorm 点 + 收口裁决）

| 决策点 | 裁决 | 理由 |
|--------|------|------|
| **① scope：linear+circular 都做 vs 分阶段** | **都做，合一为单个 `<Progress variant>` 组件** | 两形态共用同一套 value/max/a11y/indeterminate 内核，拆开会让 spec/plan/门禁/截图全套仪式翻倍而风险收益极低；circular SVG 几何成熟可控。**IA 接入 = manifest +1 / registry +1（单组件单文档页同时展示两态）**，自然印证"合一"。 |
| **② indeterminate 是否本批** | **本批做**（无 `value` 即不定态） | indeterminate 是 Progress 核心用例（加载中、总量未知）；是本组件最有沉淀价值的部分（circular 旋转 + reduced-motion）。代价 = 本体 `"use client"`（用 motion + `useReducedMotion`），可接受（Skeleton 已是此范式）。 |
| **③ circular 尺寸/粗细参数** | **数值 props `size`(直径 px, 默认 40) + `thickness`(描边 px, 默认 4)** | SVG 几何是连续数学（半径 `(size−thickness)/2`、周长 `2πr`、dashoffset），数值参数比 t-shirt 枚举更贴切且更灵活；不枚举 sm/md/lg（YAGNI）。**linear 不吃 size/thickness**（高度固定 `h-2`，保持 API 极简）。 |
| **④ reduced-motion 策略 + 动画技术** | **确定态纯 CSS；不定态 motion JS 循环，统一受 `useReducedMotion()` 门控** | 见 §5。确定态零 JS（inline style + CSS transition 复用 motion-token CSS 镜像）；不定态循环动画走 motion JS（沿用 Skeleton 先例，复用 `motionDuration`/`motionEase`），`useReducedMotion()` 为 true 时**不跑无限动画、退化为静态指示**（DOM 结构不变、仅去掉 animate prop → 避免 hydration mismatch）。 |
| 分类归属 | **`feedback`**（反馈族） | 进度反馈表达"某操作进行中/完成度"，归 feedback（与 MUI/多数体系一致）；§3.4 原表未列 Progress，本 spec 新增。 |
| tone 集合 | **primary（默认）+ danger** | token 仅 primary/danger（无 success/warning）；danger 用于"危险/超限"进度。皮肤靠 literal class 查表（Tailwind `@source` 只扫字面量，禁动态拼类）。 |
| showValue | **可选，默认 false** | circular 中心显示 `N%` 近乎刚需、linear 可右侧附标签；廉价且提升可读性（同 Slider 保留 showValue）。indeterminate 时不显示数值（无意义）。 |

---

## 3. API（四件套）

### 3.1 `progress.types.ts`

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
  /** 是否显示百分比标签（circular 居中 / linear 右侧），默认 false；indeterminate 时不显示 */
  showValue?: boolean;
}
```

所有自定义 props **必须 destructure 出来**，只把 `...rest` spread 到根元素（避免 React 19 把 `variant`/`tone`/`size` 等渲到 DOM）。`role`/`aria-*` 先写、`...rest` 后置 → 消费者可覆盖（同 Alert `props.role` 可覆盖）。

### 3.2 纯函数（导出供单测，同 `skeletonVariants` 可测范式）

```ts
// value/max → 百分比 0..100；indeterminate(undefined/NaN) → null
export function progressPercent(value: number | undefined, max: number): number | null;
// 周长 + 百分比 → SVG stroke-dashoffset
export function dashOffset(circumference: number, percent: number): number;
```

`progressPercent`：`undefined`/`NaN` → `null`（不定态）；`max<=0` → `0`；否则 `clamp(value/max,0,1)*100`。
`dashOffset`：`circumference * (1 - percent/100)`。

---

## 4. a11y

- 根元素 `role="progressbar"`、`aria-valuemin={0}`、`aria-valuemax={max}`。
- 确定态：`aria-valuenow={value}`（原始值，落在 min..max）。
- **不定态：省略 `aria-valuenow`**（WAI-ARIA：indeterminate progressbar 不提供 valuenow）。
- `aria-label`/`aria-labelledby` 经 `...rest` 透传由消费者提供；本组件不强塞默认 label（保持纯净，文档示例演示如何传）。

---

## 5. 皮肤与动画（§6 硬约束逐条对齐）

### 5.1 linear 横条

- 外轨（根/track）：`relative h-2 w-full overflow-hidden rounded-full bg-surface-hover`。
- 确定态填充：子 div `h-full rounded-full` + tone 填充类（`bg-primary`/`bg-danger`）+ **inline `style={{ width: \`${pct}%\` }}`**（**几何自有，与 Slider 禁区相反**）+ `transition-[width]`（时长/曲线复用 `motionDurationCss`/`motionEaseCss` inline，零额外 transition 散写）。
- 不定态：一条 `w-1/3` 光带（`motion.div`）`animate={{ x: [...] }}` 横向往复（`repeat:Infinity`，`ease` 取 `motionEase`），reduced-motion → 静态光带（不传 animate）。

### 5.2 circular 环

- 容器 `relative inline-flex items-center justify-center`（承载可选居中标签）。
- `<svg width={size} height={size}>` 内两个 `<circle>`（同 `cx=cy=size/2`、`r=(size−thickness)/2`、`fill="none"`、`strokeWidth={thickness}`）：
  - 轨：`stroke-[var(--color-surface-hover)]`。
  - 进度：`stroke-[var(--color-primary)]`（danger → `stroke-[var(--color-danger)]`），`strokeLinecap="round"`，`strokeDasharray={circumference}`，`strokeDashoffset={dashOffset(circ,pct)}`，整体 `-rotate-90 origin-center`（起点 12 点钟），`transition-[stroke-dashoffset]`（motion-token CSS 镜像）。
  - **stroke 用 `stroke-[var(--color-…)]` 字面量** → 走 CSS 变量，`[data-theme=dark]` 重定义变量即自动换肤（明暗适配根本，§6.1）。
- 不定态：整个 `<svg>` 走 motion JS 旋转（`animate={{rotate:360}}`，`repeat:Infinity`，`ease:"linear"` 恒速——旋转必须匀速，不能用减速曲线），进度弧固定为 1/4 环（`dashOffset(circ,25)`）；reduced-motion → 静态 1/4 弧（不旋转）。

### 5.3 reduced-motion（§6 a11y + 任务硬约束）

- `useReducedMotion()`（motion）返回 true → **两种不定态都不跑无限动画**，渲染同一 DOM 但去掉 `animate`/`transition`（静态光带 / 静态弧）。
- DOM 结构在 reduced/正常下**完全一致**，只切换 animate prop → 规避 motion 的 `useReducedMotion` SSR→client 值跳变导致的 hydration mismatch；同时天然避开 [[motion-reveal-invisible-after-wrapper-becomes-client]]（本组件不做 opacity 0→1 reveal，元素恒可见）。
- 因用 motion + `useReducedMotion`，**本体 `"use client"`**；showcase 亦 `"use client"`（四件套硬约束）。

---

## 6. showcase（`ShowcaseSpec` 零改）

- `controls`：`value`(number 40)、`max`(number 100)、`variant`(select linear/circular)、`tone`(select primary/danger)、`showValue`(boolean)、`indeterminate`(boolean —— UI 便利开关，为 true 时 `renderWithProps` 不传 value)。
- `states`：linear 25%/60%/100% 三档 + linear indeterminate + circular 75% + circular showValue + circular indeterminate + danger 态（覆盖各档值 + 两形态 + 不定态 + tone）。
- `renderWithProps`：按 `indeterminate` 决定是否传 `value`；`toCode` 对应。
- **不改 `@hulian/ui` 的 `ShowcaseSpec` 类型**（§9 沿用既有承载）。

---

## 7. YAGNI（本组件不做）

- 不做 buffer/分段进度、label 模板字符串、value 数字 tween（NumberTicker 的活）。
- 不做 `success`/`warning` tone（token 未注册）、垂直 linear、circular 端点圆点/刻度、striped/渐变填充。
- 不引任何新依赖（motion 已在 `@hulian/ui` deps）。
- 不发明瑚琏平行 a11y（progressbar role + aria-value* 是 WAI-ARIA 标准，直接写）。

---

## 8. 继承的硬约束（plan/实现逐条守）

1. **四件套**：`progress.tsx` / `progress.types.ts` / `progress.showcase.tsx`（必 `"use client"`）/ `progress.test.tsx` + `index.ts`；桶导出 + 主 `packages/ui/src/index.ts` 加 `export * from "./progress"`；showcase 从主 barrel 导出（registry 消费）。
2. **只消费语义 token**：禁裸值；stroke 用 `stroke-[var(--color-…)]`；明暗靠 `data-theme` 重定义变量。
3. **动效用 `packages/ui/src/motion` 基元**：复用 `motionDuration`/`motionEase`(JS) + `motionDurationCss`/`motionEaseCss`(CSS)，不散写 transition；reduced-motion 受尊重。
4. **门禁**：自己 `vitest`（progressPercent/dashOffset 计算 + aria 值 + 结构可单测）+ `pnpm typecheck` + `pnpm build --filter=www --force`（必 `--filter=www` 避 desktop 二次 build；必 `--force` 避 turbo cache-hit 重放他人陈旧日志 [[turbo-test-red-isolate-untracked-wip-not-your-regression]]）。
5. **截图**：被占则自起隔离 chromium（[[mcp-browser-busy-launch-isolated-chromium-via-executablepath]]），等 hydration（轮询 `body.innerText`）后 `captureScreenshot`，存 cwd 根 Read 看像素；明暗两态验 linear 填充比例 / circular 环角度 / indeterminate 动画 / 暗态轨与填充对比 / SVG stroke 走变量换肤。5514 桌面 app www 实例可直接用（[[nextjs-16-dev-server-dedupes-by-project-dir-not-port]]）。
6. **并行纪律**：接 IA 用幂等 python 读改写插入（检测 slug 存在则跳过、缩竞争窗口）；精确 `git commit -- <pathspec>` 不碰他人 untracked WIP（number-ticker/pagination/stat/chart 等并行中）（[[parallel-session-git-add-all-sweeps-your-staged-files]]）。

---

## 9. 测试边界

- **纯函数（单测主力）**：`progressPercent`（40/100→40、5/10→50、120→100 clamp、−5→0、undefined→null、max=0→0、NaN→null）；`dashOffset`（circ=100,pct=25→75；pct=0→circ；pct=100→0）。
- **组件结构/a11y（jsdom）**：linear 确定态 `role=progressbar` + `aria-valuenow/min/max` + 填充 inline width；indeterminate **无 `aria-valuenow`**；circular 渲两 `<circle>` + 进度环带 `stroke-dashoffset`；tone=danger 用 danger 字面类；`showValue` 渲百分比文本。
- **动画/几何精确角度** jsdom 测不了 → 截图实测（同既有族）。
