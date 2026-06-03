# SearchForm 查询筛选表单 — 设计稿

- 日期：2026-06-03
- 分类：inputs（表单录入）
- 策略：零依赖自研 · dogfood 瑚琏 `Grid / Field / Input / Select / Button` · 核心不引 `_mui`

## 1. 目标与定位

中后台列表页顶部条件区（第一屏筛选区）。消费者用 `fields` 配置数组描述查询条件，组件负责：响应式多列栅格布局、字段多时折叠到一行、查询/重置操作区、受控值与提交回调。

第一性原理：组件只做「筛选条件的录入 + 布局 + 提交语义」，**不做网络请求、不持有业务数据**（同 Table/Upload 受控家风）。查询动作通过 `onSearch(values)` 把当前值交给消费者。

## 2. 核心裁决（已与用户确认）

1. **栅格模型 = 固定列数 + 一行折叠**（否决 auto-fit 真响应式）。`columns` 默认 3，复用 Grid 的 inline `repeat(N, minmax(0,1fr))`；折叠态确定性「一行」= 前若干字段 + 末格操作区。Ant QueryFilter 成熟模型。代价：窄屏列变窄不自动堆叠（消费者按需传更小 `columns`）。
2. **控件类型 = 内置零依赖 + render 逃生舱**（否决硬引 `_mui` DatePicker）。内置 `input/select/date/date-range` 全基于瑚琏 Input/Select + 原生 `<input type=date>`，核心零 MUI/零 emotion，守 `_mui` side-effect-free 隔离红线。复杂控件（MUI DatePicker 弹日历、Cascader 等）走 `render` 逃生舱由消费者自插。
3. **不包 Base UI Form**：Base UI Form 的 `onFormSubmit` 取 DOM-uncontrolled values，与本组件受控 `values` 是两个状态源，会冲突。改用原生 `<form onSubmit>` 读受控 values，Enter 即触发 `onSearch`（搜索框家风）。

## 3. 架构

单组件 + 一个独立纯函数：

- `SearchForm`（`search-form.tsx`，`"use client"`）：渲染 `<form>` + Grid 栅格 + 字段控件 + 操作区。
- `planLayout(fields, columns, collapsed)`（`search-form.layout.ts`，零 React）：算折叠时可见字段集与操作区 grid 起列。独立可单测，同 `pagination.range.ts` / `applyResize` / `progressPercent` 家风（纯逻辑抽离，jsdom 无关）。

### 3.1 受控/非受控对称（家风同 Tabs/Table/Slider）

```
const isControlled = values !== undefined
const [internal, setInternal] = useState(() => seedDefaults(fields))  // 非受控 seed 自 field.defaultValue
const current = isControlled ? values : internal
const setValue = (name, v) => {
  const next = { ...current, [name]: v }
  if (!isControlled) setInternal(next)
  onChange?.(next)
}
```

- 提交：`<form onSubmit={(e)=>{ e.preventDefault(); onSearch(current) }}>`；查询按钮 `type="submit"`；Enter 自然触发。
- 重置：`const defaults = seedDefaults(fields); if(!isControlled) setInternal(defaults); onChange?.(defaults); onReset?.(defaults)`。
- 折叠态用内部 `useState(defaultCollapsed)`（纯 UI 态，不外露）。

## 4. API

### SearchFormProps

| prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `fields` | `SearchField[]` | — | 字段配置数组（必填） |
| `values` | `Record<string, unknown>` | — | 受控值；缺省走内部 state |
| `onChange` | `(values) => void` | — | 任一字段编辑时触发（受控回填） |
| `onSearch` | `(values) => void` | — | 查询 / 回车提交（必填） |
| `onReset` | `(values) => void` | — | 重置（values = 各字段 default 后的值） |
| `columns` | `number` | `3` | 桌面列数（复用 Grid inline cols） |
| `gap` | `number` | `4` | 行列间距（×0.25rem，同 Grid/Tailwind 刻度） |
| `collapsible` | `boolean` | `true` | 字段填不满一行时自动失效（不渲折叠按钮） |
| `defaultCollapsed` | `boolean` | `true` | 初始折叠 |
| `submitText` | `ReactNode` | `"查询"` | 主按钮文案 |
| `resetText` | `ReactNode` | `"重置"` | 重置按钮文案 |
| `loading` | `boolean` | `false` | 查询按钮 loading 态（透传 Button） |
| `className` | `string` | — | 落最外层容器 |

### SearchField（联合类型，按 `render` / `type` 区分）

公共：`{ name: string; label: ReactNode; placeholder?: string; colSpan?: number; defaultValue?: unknown }`

- `{ type?: "input"; inputType?: string }` — dogfood `Input`，`value=String(v??"")`，`onChange=e=>setValue(name,e.target.value)`，`type=inputType`（text/number/...）。
- `{ type: "select"; options: { value: string; label: ReactNode }[] }` — dogfood `Select`，`value`/`onValueChange`，注入 `placeholder`，children 渲 `SelectTrigger`+`SelectContent`(map options→SelectItem)。
- `{ type: "date" }` — `<Input type="date">`。
- `{ type: "date-range" }` — 两个 `<Input type="date">`，`value=[start,end]`（`unknown[]`），中缀「~」分隔；任一变更写回数组对应位。
- `{ render: (ctx) => ReactNode }` — 逃生舱；`ctx = { name, value, onChange:(v)=>void }`。消费者可插 `_mui` DatePicker（弹日历）、Cascader 等。

每个字段外层包瑚琏 `<Field label={label}>{control}</Field>` 拿统一标签 + 间距 + a11y。

## 5. 折叠 / 操作区布局算法（`planLayout`）

操作区恒占 ≥1 格（min 1 列）。

```
span(f) = min(f.colSpan ?? 1, columns)
canCollapse = collapsible && sum(span(f) for all fields) > columns - 1

planLayout(fields, columns, collapsed):
  if collapsed (且 canCollapse):
    贪心取 fields 直到累计 span > columns - 1 停 → visible
  else:
    visible = fields
  used = sum(span(f) for f in visible)
  rem = used % columns
  actionFullRow = (rem === 0 && visible.length > 0)   // 整行满 → 操作区另起一行
  actionStart = actionFullRow ? 1 : rem + 1            // 1-based grid 起列；end 恒 -1
  return { visible, actionStart, actionFullRow }
```

- 折叠：visible 后余 ≥1 格放 `[查询][重置][展开▾]`，精确一行。
- 展开：字段后操作区 `gridColumn: ${actionStart} / -1` 吸右；整行满则新行右对齐。
- 操作区内部 `flex items-center justify-end gap-2`：`查询`=Button solid（loading）、`重置`=Button `variant="ghost"`、`展开/收起`=文字按钮 + chevron（`rotate-180` 切换，仅 canCollapse 渲）。
- 字段 GridItem 按 `colSpan` 给 `gridColumn: span N`。

栅格容器：复用 `Grid`（`cols={columns}` `gap={gap}`）或等价 inline `repeat(columns, minmax(0,1fr))`（动态列数无法预生成 Tailwind 类，同 Grid 既有裁决）。

## 6. 皮肤

- 容器：`rounded-[var(--radius)] border border-border bg-surface p-4`（卡片气质，列表页顶部条区常规）；可被 `className` 覆盖/去边框。
- 全程消费语义 token，明暗两态自适应（无写死色）。
- 复用 Field/Input/Select/Button 既有皮肤，SearchForm 自身只管栅格 + 操作区排版。

## 7. YAGNI 推迟（明确不做）

- 字段级 validate / 字段联动 / 异步 options。
- inline 标签 / `labelWidth` / 标签左置（只做 Field 默认上置）。
- 多行折叠保留 N 行（只做「折一行」）。
- date-range 弹日历（要弹历走 `render` 插 `_mui` DatePicker）。
- 字段级 disabled / 整表 disabled。

## 8. 验证

- 五件套：`search-form.tsx` + `search-form.types.ts` + `search-form.layout.ts` + `search-form.showcase.tsx`(必 "use client") + `search-form.test.tsx` + `index.ts`。
- 接线：主 barrel `export *`；manifest 一行（inputs 分类）；registry import + map。
- 三道门 `--force`：`pnpm typecheck && pnpm test && pnpm build --filter=www`。
- 单测：
  - `planLayout` 纯函数 —— 折叠边界、colSpan 累计、操作区 `actionStart`/`actionFullRow`、canCollapse 判定。
  - 组件 —— 受控回填（编辑字段触发 onChange）、提交（onSearch 拿当前 values）、重置（onReset 拿 defaults）、render 逃生舱被调用、折叠/展开切换可见字段数、select/date 控件渲染。
- 截图：隔离 chromium 明暗两态像素自证（折叠态一行、展开态多行、操作区右对齐、查询触发）。

## 9. showcase

- `controls`：`columns`(number→用 select 近似或固定)、`collapsible`(boolean)。
- `states`：①基础（4-5 字段，input+select+date-range，默认折叠）②展开态 ③不可折叠（少字段）。
- `renderWithProps`：Demo 内部 `useState` 持 values，`onSearch` 把 values JSON 显示出来印证。
- date-range 用内置 type 演示（零 MUI）。
