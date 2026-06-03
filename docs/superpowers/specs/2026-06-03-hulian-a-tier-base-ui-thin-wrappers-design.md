# 瑚琏 A 档 — HeroUI 缺口补完(Base UI rc.0 现成 primitive 薄包批)设计

- 日期：2026-06-03
- 批次：A 档(HeroUI 对照缺口 · Base UI 现成 primitive 薄包)
- 范围：**9 个 slug**，零新依赖（全部 `@base-ui-components/react@1.0.0-rc.0` 既装 primitive），照既有薄包家风（Switch/Slider/Dialog 范式）。

## 0. 缘起

对照 HeroUI v3（75+ web 组件）扫缺口，发现一批 HeroUI 暴露、瑚琏未做、而 **Base UI rc.0 已有现成 primitive** 的件——薄包成本与已做的 Slider/Accordion 完全一致，ROI 最高。本批一次吃掉，把覆盖率从 33 → 42 件。

实证结论（`ls @base-ui-components/react` + 读各 `index.d.ts`/`*Root.d.ts`，**非记忆**）：目标 9 件对应 primitive 全部存在。

## 1. 组件清单与分类

| # | slug | name | category | Base UI primitive | HeroUI 对应 |
|---|------|------|----------|-------------------|-------------|
| 1 | `separator` | Separator | data-display | `separator`(`Separator`) | Separator / Divider |
| 2 | `number-field` | NumberField | inputs | `number-field`(`NumberField.*`) | NumberField / NumberInput |
| 3 | `alert-dialog` | AlertDialog | feedback | `alert-dialog`(`AlertDialog.*`，复用 dialog parts) | AlertDialog |
| 4 | `toggle` | Toggle | inputs | `toggle`(`Toggle`) + `toggle-group`(`ToggleGroup`) | ToggleButton / ToggleButtonGroup |
| 5 | `toolbar` | Toolbar | navigation | `toolbar`(`Toolbar.*`) | Toolbar |
| 6 | `meter` | Meter | data-display | `meter`(`Meter.*`) | Meter |
| 7 | `form` | Form | inputs | `form`(`Form`) | Form |
| 8 | `scroll-area` | ScrollArea | data-display | `scroll-area`(`ScrollArea.*`) | ScrollShadow(近似：自定义滚动条) |
| 9 | `checkbox-group` | CheckboxGroup | inputs | `checkbox-group`(`CheckboxGroup`) + 复用瑚琏 `Checkbox` | CheckboxGroup |

> Toggle + ToggleGroup 合为 **1 slug `toggle`**（同目录、同 doc 页 states 同时展示单按钮与组；对齐 HeroUI 两组件但合页省接入）。

## 2. 实证 API（require.resolve 确认）

- **Separator**：渲 `<div role="separator">`，prop `orientation?:'horizontal'|'vertical'`（默认 horizontal），`data-[orientation]` 钩子。
- **NumberField**：parts `Root/Group/Input/Increment/Decrement/ScrubArea/ScrubAreaCursor`。Root props：`value?:number|null`/`defaultValue?:number`/`onValueChange?:(v:number|null,e)=>void`/`min`/`max`/`step`(默认1)/`smallStep`/`largeStep`/`disabled`/`readOnly`/`required`/`format?:Intl.NumberFormatOptions`/`name`/`id`。键盘 ↑↓/PageUp/Down/Home/End 全内置。
- **AlertDialog**：parts **复用 dialog**：`Root/Trigger/Portal/Backdrop/Popup/Title/Description/Close`。语义差异：默认**不响应点遮罩 / Esc 关闭**（强制显式决策）——这正是 AlertDialog 与 Dialog 的本质区别，由 `AlertDialogRoot` 内建。data-* 同 dialog（`data-starting-style`/`data-ending-style`）。
- **Toggle**：渲 `<button>`，props `pressed?`/`defaultPressed?`(默认false)/`onPressedChange?:(p,e)=>void`/`disabled?`/`value?:string`（在组内标识）。`ToggleState{pressed,disabled}` → `data-[pressed]`/`:disabled`(button 真伪类可用)。
- **ToggleGroup**：渲 `<div>`，props `value?:readonly any[]`/`defaultValue?`/`onValueChange?:(v:any[],e)=>void`/`disabled?`/`orientation?`(默认horizontal)/`loopFocus?`(默认true)/**`multiple?`(默认false→单选互斥)**。值为**数组**（同 Slider/CheckboxGroup 家风）。
- **Toolbar**：parts `Root/Group/Button/Link/Input/Separator`，`Orientation` 类型导出。Root 渲 `<div role="toolbar">`，键盘漫游内置。本批做 `Root/Button/Group/Separator`，**Link/Input YAGNI 后议**。
- **Meter**：parts `Root/Track/Indicator/Label/Value`。Root props：`value:number`(**必填**)/`min`(默认0)/`max`(默认100)/`format?`/`getAriaValueText?`/`'aria-valuetext'?`。渲 `<div role="meter">` + aria-valuenow 自动。**Indicator 宽度 Base UI 内联自算**（几何禁区，皮肤只给外观，禁写 width）。
- **Form**：渲 `<form>`，props `validationMode?:'onSubmit'(默认)|'onBlur'|'onChange'`/`errors?`(按 `<Field.Root name>` 映射的外部校验错误)/`onFormSubmit?:(values,e)=>void`。与瑚琏 `Field` 协同。
- **ScrollArea**：parts `Root/Viewport/Scrollbar/Thumb/Content/Corner`。装配 `Root>Viewport>{children}` + 自定义 `Scrollbar(orientation)>Thumb`。对应 HeroUI ScrollShadow 的「滚动美化」诉求——**做法是自定义细滚动条**（非渐变遮罩，spec 注明差异）。
- **CheckboxGroup**：渲 `<div role="group">`，props `value?:string[]`/`defaultValue?`/`onValueChange?:(v:string[],e)=>void`/`allValues?`(parent checkbox 用)/`disabled?`。内含多个**复用瑚琏 `Checkbox`**（每个带 `name`=该项 value）。

## 3. 逐件设计裁决

### 3.1 Separator（纯薄包 · 几何皮肤）
- `<Separator orientation? className />` 透传。皮肤：水平 `h-px w-full bg-border`；垂直 `w-px self-stretch bg-border`（用 `data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px`）。只消费 `border` 语义 token。
- 裁决：不做 `label`(带文字分隔线) → YAGNI 后议。

### 3.2 NumberField（外壳同 Input 家风）
- 单组件 `<NumberField>` = `Root>Group[ Decrement(−) · Input · Increment(+) ]`。
- 皮肤：Group 外壳 `inline-flex items-center rounded-[var(--radius)] border border-border bg-surface focus-within:ring-2 focus-within:ring-ring`（复刻 Input 外壳手感）；Input `w-16 bg-transparent text-center tabular-nums outline-none`；±按钮 `size-9 hover:bg-surface-hover disabled:opacity-50`，图标 lucide `Minus`/`Plus`，`rounded` 封顶。
- 受控/非受控对称透传；`disabled`/`readOnly`/`min`/`max`/`step` 直通。`aria-label` 透传到 Input。

### 3.3 AlertDialog（照搬 dialog.tsx 装配 · 语义=强制决策）
- `AlertDialog`(Root 透传) · `AlertDialogTrigger`(=Base Trigger) · `AlertDialogContent({title,description,children,className})`。
- 装配/皮肤/`overlayTransition` 100% 复刻 `dialog.tsx`（Portal+Backdrop opacity+Popup scale+motion-token CSS 镜像，**零 motion 运行时**）。**不碰现有 dialog 组件**（独立目录）。
- 区别文档化：AlertDialog = 销毁/不可逆操作的确认弹窗，**无点遮罩关闭、无 Esc**，children 放「取消 / 确认」按钮（取消用 `AlertDialogClose`）。

### 3.4 Toggle + ToggleGroup（CVA 皮肤 · 持久 pressed 态）
- `Toggle` = CVA：`variant`(default/outline) × `size`(sm/md)，pressed 态钩子 `data-[pressed]:bg-surface-hover data-[pressed]:text-foreground`（soft 选中，明暗都可读）；focus-visible ring；`disabled:opacity-50`。渲 button 故 `:disabled` 伪类可用。
- `ToggleGroup` = Root 透传（`value`/`multiple`/`orientation` 直通）+ 皮肤 `inline-flex rounded-[var(--radius)] border p-1 gap-1`；children 为 `Toggle`（带 `value`）。**single（默认 multiple=false 互斥）/ multiple（数组共存）都支持**（数组驱动，零额外引擎，同 Slider）。
- 裁决：不偷改 Base UI 默认（multiple=false），守薄包家风。

### 3.5 Toolbar（容器 + Button/Group/Separator）
- `Toolbar`(Root) · `ToolbarButton`(=Base Button 薄皮) · `ToolbarGroup` · `ToolbarSeparator`(=Base Separator 薄皮，竖线)。
- 皮肤：Root `inline-flex items-center gap-1 rounded-[var(--radius)] border border-border bg-surface p-1`；Button `inline-flex items-center justify-center rounded px-2 h-8 hover:bg-surface-hover data-[pressed]:bg-surface-hover focus-visible:ring`；Separator `mx-1 h-5 w-px bg-border`。
- `orientation` 透传（横/纵）。Link/Input 后议。

### 3.6 Meter（几何禁区 · 区别于 Progress）
- `<Meter value min? max? label? showValue? className />` = `Root>[Label? · Track>Indicator · Value?]`。
- 皮肤：Track `h-2 w-full overflow-hidden rounded-full bg-surface-hover`；Indicator `h-full rounded-full bg-primary`（**宽度 Base UI 自算，皮肤禁写 width/left/transform**，同 Slider 几何禁区）；Label `text-sm text-muted`，Value `text-sm tabular-nums text-foreground`。
- 区别文档化：Meter=静态度量(磁盘/电量/评分占比)`role=meter`；Progress=任务进度 `role=progressbar`。多阈值变色 YAGNI。

### 3.7 Form（极薄容器 · 与 Field 协同）
- `<Form>` 透传 Root + 默认布局 `space-y-4`（可被 className 覆盖）。核心价值：`errors`（外部/服务端校验按 name 串到 `Field.Error`）+ `onFormSubmit` 拿结构化 values + `validationMode`。
- showcase：含瑚琏 `Field`+`Input`+`Button` 的受控小表单，提交触发校验/展示 errors。

### 3.8 ScrollArea（自定义细滚动条）
- `<ScrollArea className(限高) orientation?>{children}</ScrollArea>` = `Root>Viewport>Content?` + 竖/横 `Scrollbar>Thumb`。
- 皮肤：Root `relative overflow-hidden`；Viewport `size-full overscroll-contain`；Scrollbar `flex touch-none select-none p-0.5 w-2`（横向 `h-2 flex-col`）`opacity` hover 显隐；Thumb `flex-1 rounded-full bg-border hover:bg-muted`。
- 限高由消费者经 className（如 `h-48`）给 Root。`orientation` 决定渲哪条 Scrollbar（默认 vertical；'both' 两条）。

### 3.9 CheckboxGroup（复用瑚琏 Checkbox）
- `<CheckboxGroup value/defaultValue/onValueChange/disabled>` 透传 Root + 皮肤 `flex flex-col gap-2`；children 为瑚琏 `Checkbox`（每个 `name=该项 value`、带 inline `label`）。
- 裁决：parent/全选 checkbox（`allValues`）**YAGNI 后议**；仅做 group 值数组协调 + disabled 下发。`onValueChange` 包 `(v)=>onValueChange(v as string[])`（Base UI 签名 `(v,e)`，strictFunctionTypes）。

## 4. 接入链路（每件 4 处，照既有 SSOT）

1. `packages/ui/src/<dir>/`：`<name>.tsx` + `<name>.types.ts` + `<name>.showcase.tsx` + `<name>.test.tsx` + `index.ts`。
   - Toggle 合并目录 `toggle/`（Toggle+ToggleGroup 同文件，两 showcase 合一）；CheckboxGroup 可入 `checkbox-group/` 复用 `../checkbox`。
2. `packages/ui/src/index.ts`：`export * from "./<dir>"`。
3. `apps/www/lib/manifest.ts`：加 meta 行（status `new`）。
4. `apps/www/lib/registry.tsx`：import showcase + map slug。

## 5. 共性裁决

- **全部 Base UI 薄包加 `"use client"`**（与 Switch/Slider/Dialog 一致；Separator/Meter 虽无交互，统一加防 RSC 边界踩坑，build 验证）。
- **data-* 钩子优先于伪类**：div-渲染件（Meter/ToggleGroup/Separator）用 `data-[...]`；button-渲染件（Toggle/ToolbarButton）`:disabled` 可用、`data-[pressed]` 选中。
- **几何禁区**：Meter.Indicator / 任何 Base UI 自算定位的部件，皮肤禁写 width/left/transform/inset。
- **零散写 transition**：需过渡复用 motion-token CSS 镜像（`motionDurationCss`/`motionEaseCss`，同 dialog.tsx）。
- **只消费语义 token**：无 success（升趋势用 primary）；tone 仅 primary/danger/neutral/border。

## 6. 测试与验收

- **vitest（每件 5–9 条）**：渲染根元素 + role/aria + 受控行为 + disabled + 皮肤类透传 + 几何禁区（Meter 断言 Indicator 不含字面 width 类）。jsdom 测不了的几何/定位交截图。
- **三道门**：`typecheck` + `vitest`（`--force` 拿真实态，避 turbo cache-hit/并行 WIP 误判）+ `build --filter=www`（SSG 全绿）。
- **截图自证**：隔离 chromium（CDP，`executablePath` 指 ms-playwright 缓存 + `addInitScript` 预置 `localStorage hulian-theme`）明暗两态；overlay 类（AlertDialog）「先触发再截」；5514 桌面 app www 实例（dir-guard）。

## 7. 风险与回退

- **Form/ScrollArea 装配最易踩坑**（多 part 协同）→ 实现时先 `require.resolve` + 读 part .d.ts 确认子组件 props，再装配。
- **AlertDialog** 若 Base UI parts 与 dialog 不完全同名 → 已实证复用 dialog parts（见 §2），直接照搬。
- **并发**：多 session 同动 master → 全程 `git commit -- <pathspec>`；manifest/registry/index.ts 高频被并行写 → 幂等插入 + 提交前隔离他人 WIP；门禁红先 isolate 判是否自身回归。
- 任一件 primitive 装配受阻 → 单件回退记 plan，不阻塞其余 8 件（独立 slug，互不依赖）。

## 8. 不做（YAGNI）

Separator label · NumberField scrub-area · Toolbar Link/Input · Meter 多阈值变色 · CheckboxGroup parent/全选 · ScrollArea 渐变遮罩(改自定义滚动条)。均可后续增量，皮肤零重构。
