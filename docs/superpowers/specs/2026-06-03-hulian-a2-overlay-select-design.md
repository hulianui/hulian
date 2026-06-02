# 瑚琏 Hulian A2.2 — overlay 录入族 Select（下拉选择）设计

- **日期**: 2026-06-03
- **状态**: 设计定稿（用户授权"完成再通知"自主推进 → 本 spec 写毕直接进 writing-plans；用户可回审推翻任一裁决）
- **本 spec 范围**: A2.2 overlay 族第 3 个组件 **Select**（单选下拉）。承接已落地的 Tooltip/Popover overlay 模具。
- **上游依据**:
  - `2026-06-02-hulian-a2-absorption-batch-design.md`（§2 overlay 红线 · §3.4 inputs 含 Select · §6 硬约束 · §10 A2.2 预告）
  - `2026-06-02-hulian-a2-overlay-tooltip-popover-design.md`（overlay 在 ShowcaseSpec 的承载范式 = Content 合体 + 交互件分开导出 + Demo 承载）
  - 项目记忆 `hulian-phase-status`（固化坑：overlay 红线 / turbo `--force` / require.resolve 实证 / data 属性命名实证 / RSC 边界 / 截图看像素）
- **前置**: 现 12+ 组件；overlay 兄弟 Dialog/Tooltip/Popover 已落地，同源 Base UI Portal/Positioner + motion token CSS 镜像驱动原生过渡。

---

## 1. 选源与红线

- **全 Base UI**：`@base-ui-components/react/select`（rc.0）。守 **overlay 红线**——禁第二套 Portal/Positioner 引擎、禁 React Aria。与 Dialog/Tooltip/Popover 同一套 overlay 引擎、同手感曲线（motion token CSS 镜像）、bundle 最小。
- **承载约定（A2.2 已立）**：Positioner 必须 Portal → 交互触发器承载（Trigger render）。Select 天然符合（Trigger=锚点 button，Portal 弹列表）。

---

## 2. 关键裁决（含备选与取舍）

| 决策点 | 备选 | **裁决** | 理由（第一性原理） |
|--------|------|---------|------|
| **受控/非受控** | 只做一种 / 全透传 | **全透传** | 家风一致（Slider/Tabs/Switch/Dialog 皆透传 Root props）。`Select` = Root 薄包，`value/defaultValue/onValueChange/open/defaultOpen/onOpenChange/name/disabled/required/items/modal` 全直达。默认非受控。 |
| **多选 multiple** | 本批做全皮肤 / 完全阉割 / 透传不背书 | **单选一等公民；multiple 透传不阻止但本批不做皮肤/不测/不截图** | 单选是 Select 核心语义；多选 value 变数组、Trigger 显示要 join、placeholder/Indicator 语义不同 → 显著增量。照 Slider 推迟 marks/vertical、Tabs 不引 context 的 YAGNI 节奏。Root 透传天然带 `multiple` 类型，不主动删（不阉割 API），但皮肤只保证单选完美。 |
| **label 显示 + placeholder** | raw value / items 自动 label / Value.placeholder prop / 注入 null 项 | **配 `items`（`{value,label}[]`）→ Value 自动显示选中 label；placeholder 提升到 `Select`，内部注入 `{value:null,label:placeholder}` 项** | ⚠️ **实证（probe）：rc.0 `Select.Value` 仅 `children` prop，无 `placeholder` prop**（context7 给的是 v1.2+ 文档，与项目 rc.0 不符，一度误导 → 见复盘坑）。rc.0 正解：`resolveSelectedLabel` 无值时命中 `items` 里 `value:null` 项显示其 label → 瑚琏 `Select` 解构 `placeholder` 自动注入该 null 项；`SelectTrigger` 无 placeholder prop、`Value` 不写 children（有值 label / 无值占位）。 |
| **弹层定位** | `alignItemWithTrigger` 默认 true（原生覆盖式）/ false（现代下方弹出） | **`alignItemWithTrigger={false}` + `side="bottom"`** | 现代下拉气质（shadcn/Radix 风），定位可预测、便于截图验证碰撞翻转；覆盖式原生风会让弹层压住 trigger，文档展示不直观。消费者可覆盖。 |
| **焦点环挂点** | self `focus-visible:` / `data-[open]` / has-内嵌input | **Trigger 自身 button → 优先 self `focus-visible:ring-2`；截图 + DOM 实证定** | 实证 Trigger=`<button>`（NativeButton），可聚焦元素是 Trigger 本身（**不同于** Slider 焦点在内嵌 hidden input → 那里才用 `has-[:focus-visible]`）。hidden input 仅 form 提交用（`inputRef`/`name`），不受焦点。实证为准，不凭记忆。 |
| **分组 Group/Separator** | 本批做 / 推迟 | **推迟（扁平列表）** | Base UI 有 `Group/GroupLabel/Separator`，但本批先做扁平单选；纯增量可后补。YAGNI。 |
| **箭头 Arrow** | 做 / 不做 | **不做** | 下拉列表无需指向箭头（Tooltip/Popover 才需）；Trigger 右侧用 `Select.Icon` 放 chevron（open 翻转）。 |

---

## 3. API 形状（复合组件，shadcn 气质 · 照 Popover/Tooltip 家风）

导出 4 件 + showcase：

```tsx
// select.tsx —— "use client"（overlay 本体必加）
import { Select as BaseSelect } from "@base-ui-components/react/select";

// ① Select = Root 薄包 + placeholder 注入（rc.0 无 Value.placeholder prop → 注入 value:null 项做占位 label）
//    透传 items/value/defaultValue/onValueChange/name/disabled/multiple/open/modal…
export function Select({ items, placeholder, children, ...props }: SelectProps) {
  const finalItems = placeholder != null && items != null ? [{ value: null, label: placeholder }, ...items] : items;
  return <BaseSelect.Root items={finalItems} {...props}>{children}</BaseSelect.Root>;
}

// ② SelectTrigger = button 外壳皮肤（input 外壳气质：border/bg/radius/focus-ring/disabled/invalid）
//    内嵌 Select.Value(不写 children → 有值 label/无值占位) + Select.Icon(chevron, data-[popup-open]:rotate-180)
//    props: size(sm|md|lg) / invalid / className（placeholder 在 Select 上，非此处）
export function SelectTrigger({ size, invalid, className }: SelectTriggerProps) { … }

// ③ SelectContent = Portal > Positioner(side/align/sideOffset, alignItemWithTrigger=false) > Popup(surface 皮肤+motion CSS 镜像过渡) > List
//    props: side / align / sideOffset / className / children
export function SelectContent({ side="bottom", align="start", sideOffset=6, children, className }: SelectContentProps) { … }

// ④ SelectItem = Select.Item(div, role=option) 皮肤(data-highlighted/data-selected/data-disabled)
//    内嵌 Select.ItemIndicator(勾, 仅 selected 渲) + Select.ItemText(children)
//    props: value / disabled / className / children
export function SelectItem({ value, disabled, children, className }: SelectItemProps) { … }
```

**皮肤要点**：
- **SelectTrigger**：复用 Input 外壳气质（同款 token：`border-border bg-surface rounded-[var(--radius)]` + size 高度 + `disabled:`），**焦点环落 Trigger 自身**（`focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-bg`，button 原生 self）+ `data-[popup-open]:border-ring` 开启态描边。invalid → `data-invalid`/`aria-invalid` 翻译（照 Input：destructure 后翻译，禁裸 spread）。右侧 `Select.Icon` 放 chevron-down，`data-[popup-open]:rotate-180 transition-transform`。
- **SelectContent**：Popup 皮肤照 Popover（`bg-surface border-border rounded shadow-xl` + `data-[starting-style]/[ending-style]` scale/opacity 过渡 + `overlayTransition`=motionDurationCss/EaseCss）；`max-h` + `overflow-auto` 让长列表滚动；`min-w-[var(--anchor-width)]`（Base UI 暴露锚宽 CSS 变量，实证变量名）让列表至少与 trigger 等宽。
- **SelectItem**：`data-[highlighted]:bg-muted/40`（键盘/hover 高亮）、`data-[selected]:font-medium`、`data-[disabled]:opacity-50 data-[disabled]:pointer-events-none`；左/右留 `ItemIndicator` 勾位（`data-[selected]` 显示 check 图标）。
- **几何禁区**：Positioner 定位由 Base UI inline 自算，皮肤只给外观（bg/border/radius/shadow/max-h），**禁写 left/top/width/transform**（除 `--anchor-width` 消费）。

---

## 4. data 属性钩子（require.resolve 实证 · 绝不凭记忆）

| 元素 | State 字段 | 皮肤钩子 | 备注 |
|------|-----------|---------|------|
| `Select.Item` | `selected`/`highlighted`/`disabled` | `data-selected`・`data-highlighted`・`data-disabled` | **`data-selected`（≠ Tabs 的 `data-active`！同库不同组件命名不一致，故实证）**；`highlighted`=键盘/指针高亮（非 hover，`highlightItemOnHover` 默认 true） |
| `Select.ItemIndicator` | `selected` | 仅 `selected` 时渲染 | 勾打在选中项；放 check 图标 |
| `Select.Trigger` | `extends FieldRoot.State` + `open` | **`data-popup-open`**（pressableTriggerOpenStateMapping）+ 继承 Field invalid/valid/dirty | **非 `data-open`！** 在 `Field.Root` 内自动得 `data-invalid` |
| `Select.Icon` | `open` | **`data-[popup-open]:rotate-180`**（triggerOpenStateMapping） | chevron 翻转 |
| `Select.Popup`/`Positioner` | `open`/`side`/`align` | `data-open`/`data-side`/`data-align` + `data-[starting-style]`/`data-[ending-style]` | 过渡同 tooltip/popover |

---

## 5. showcase 承载（ShowcaseSpec 零改 · 照 tooltip/popover 写法）

- **Demo 组件**内组装完整 Select：`<Select items placeholder>` + `<SelectTrigger>` + `<SelectContent>{options.map(o => <SelectItem value={o.value}>{o.label}</SelectItem>)}</SelectContent>`。`items` 喂 Root（Value label 映射 + placeholder null 项），同份 `options` 渲染 Item。
- **controls**（标量）：`placeholder`(text)、`size`(select sm/md/lg)、`disabled`(boolean)、`invalid`(boolean)、`side`(select top/bottom)。
- **states**（预置 demo）：默认（placeholder）、已选值（`defaultValue`）、禁用、invalid、长列表（验滚动）、向上弹（`side="top"`）。
- **renderWithProps**：标量调 Demo。**toCode**：示意复合结构。
- showcase 必 `"use client"`（Portal 内容 client 岛）；从主 barrel 导出供 registry 消费。

---

## 6. 四件套 + IA 接入

- **四件套**：`select.tsx`(`"use client"`) · `select.types.ts` · `select.showcase.tsx`(`"use client"`) · `select.test.tsx` · `index.ts`（桶导出 4 组件 + 类型 + `selectShowcase`）。
- **主 barrel**：`packages/ui/src/index.ts` 加 `export * from "./select"`（或显式，照兄弟）。
- **IA（www）**：`lib/manifest.ts` +1（`{ slug:"select", name:"Select", category:"inputs", status:"new", description:"下拉选择，单选" }`）；`lib/registry.tsx` +1（`import { selectShowcase }` + `select: selectShowcase`）。套 `rsc-registry-split-data-from-spec-to-isolate-server-module-graph`（manifest 纯数据 server 可读、registry "use client"）。

---

## 7. 测试矩阵（vitest · 照 tooltip/popover 单测契约 + Slider）

单测守"组件真正负责的契约"，交互/键盘/a11y 串联走 Playwright（受控 open 不触发 hover/键盘路径，照 tooltip 注释）：

1. **闭合态**：Trigger 在 DOM、选项文本不在 DOM。
2. **受控 open**：Popup mount + surface 皮肤（`.bg-surface.border-border`）+ 选项渲染。
3. **选中态**：给 `defaultValue` → 对应 Item 带 `data-selected` + 其内 ItemIndicator（勾）在 DOM。
4. **placeholder**：无 value → Trigger 显示 placeholder 文本（muted）。
5. **size/invalid 皮肤透传**：`size="lg"` 高度类、`invalid` → `data-invalid`/`aria-invalid` 落 Trigger。
6. **side/align 定位透传**：归 §8 Task 3 Playwright 像素验（jsdom 无真实布局，且 `alignItemWithTrigger` 下 Positioner `data-side` 不可靠，不强求单测）。

> jsdom 安全：Base UI overlay 内部若有 ResizeObserver/measure，受控 open 渲染须不报错（照 Tabs Indicator 的 `typeof !== 'undefined'` 守卫经验，必要时验证）。

---

## 8. 门禁 + 浏览器实测

- **三道门**（套 `turbo-test-red-isolate-untracked-wip-not-your-regression`）：我的 scope vitest + `pnpm typecheck` + `pnpm build --filter=www --force`（**必 `--force`**，别信 turbo cache-hit；**必 `--filter=www`**，避桌面 tauri beforeBuild 二次 build）。并行 session 有 untracked WIP（accordion 已落、可能还有他人 WIP）→ 全量 `pnpm test` 若因他人 WIP 红，隔离判断、不背锅、不删改他人文件。
- **Playwright/chrome-devtools 截图**（明暗两态，**先点开下拉再截**）：验 ①弹层定位（trigger 下方、≥trigger 宽）②选中项打勾 ③Trigger 焦点环（programmatic focus）④disabled 态 ⑤placeholder muted ⑥长列表滚动。截图存 **cwd 根** → Read 看像素（套 `ui-layout-verify-needs-screenshot-not-dom-eval`）。
- **端口**：www=5512、桌面 app devUrl=5514；桌面 app 已跑 5514 则直接用 5514 截图（套 `nextjs-16-dev-server-dedupes-by-project-dir-not-port`，别另起 5512 被 dir-guard 拒）。
- 桌面 app(5514) 加载 `/components/select` 正常。

---

## 9. 继承硬约束（逐条守）

1. **只消费语义 token**（无 success；danger/muted/border/ring/surface/foreground）；Tailwind v4 dark variant 套 `tailwind-v4-shadcn-dark-variant-data-theme-bridge`。
2. **overlay 全 Base UI 红线**：禁第二套引擎、禁 React Aria。
3. **a11y 靠 Base UI 兜底**：键盘（方向键/Home/End/type-ahead 类型筛选/Enter/Esc）、碰撞翻转、`role`/`aria-*` 全 Base UI；瑚琏只给皮肤。
4. **变体走 CVA**（size），不散写 className 覆盖。
5. **"use client"**：select.tsx + select.showcase.tsx 必加（overlay 本体 + Portal client 岛）。
6. **motion**：过渡复用 motion token CSS 镜像（`motionDurationCss`/`motionEaseCss`），零 motion 运行时（同 Dialog/Tooltip/Popover），天然避 `motion-reveal-invisible-after-wrapper-becomes-client`。
7. **invalid 翻译**：destructure 后 `{...(invalid && {"data-invalid":"","aria-invalid":true})}`，禁裸 spread（React 19 会把 `invalid=""` 渲到 DOM）。
8. **圆角**：Trigger 用 `rounded-[var(--radius)]`（大控件 OK，无需封顶，区别于 Checkbox 小方块的 `min()` 封顶坑）。

---

## 10. 本批不做（YAGNI 边界）

- **不做** multiple 多选皮肤/测试/截图（透传不阻止）。
- **不做** Group/GroupLabel/Separator 分组（扁平列表）。
- **不做** Arrow 指向箭头。
- **不做** 异步/远程加载选项、搜索过滤（那是 Combobox 的活，A2.2 后续件）。
- **不改** `ShowcaseSpec` 类型（showcase 写法承载复合结构）。
- **不做** 对象型 value 的 `itemToStringLabel/Value`/`isItemEqualToValue`（先做原始值 value，透传保留可后用）。

---

## 11. 实现首步必先实证（写进 plan step 1）

1. **placeholder 接法**：读 `value/SelectValue.js` 全文（已定位第 42 行 `placeholder:!serializedValue`）确认「children 传纯 ReactNode（非函数）是否作 placeholder」+ items 模式无值渲染 → 定 Trigger 内 Value 写法。
2. **锚宽 CSS 变量名**：grep `positioner` 源码确认列表 ≥ trigger 宽的变量（`--anchor-width` 或 `--available-width` 等），别凭记忆。
3. **焦点态**：实测 Trigger button 是否 `:focus-visible` 出环，或需 `data-[focused]`（DOM + 截图双证）。
4. **chevron 翻转 data 属性**：确认 Icon/Trigger 的 open 钩子是 `data-[open]` 还是 `data-[popup-open]`。
