# 瑚琏 A2.2 — Combobox（overlay 录入补全）设计 spec

- 日期：2026-06-03
- 范围：A2.2 overlay 族「录入补全」单件 Combobox（文本输入 + 实时过滤 listbox 的 typeahead）
- 工作模式：用户授权「完成再通知我」(autonomous)，本 spec 以用户详细 brief 为设计输入，裁决均经 require.resolve + 读 `.d.ts` 实证（非记忆），自审后直接推进 plan + 实施，不在审批门阻塞。

## 1. 目标与边界

**是什么**：Combobox = 文本输入框 + 随输入实时过滤的下拉 listbox（typeahead 自动补全选择）。

**与 Select 的区别**（同 overlay 族、不同形态）：
- Select = button trigger + 全量 listbox（点开看全部）。
- Combobox = `<input>` trigger + 过滤后的 listbox（边打字边缩小候选）。

**复用**：成熟的 overlay 承载（Portal/Positioner/Popup + motion-token CSS 镜像）抄 Select/Tooltip/Popover；输入框外壳气质抄 Input；皮肤（高亮/打勾/空态）抄 SelectItem/Menu。

**不做（YAGNI 推迟，记 future）**：
- **多选（multiple + Chips/ChipRemove/Chips 容器）** —— 多选是一整个子家族（chip 渲染/删除/换行布局），同 Slider 只做数组驱动、submenu 推迟的纪律，本批只做单选。
- 受控过滤（`filteredItems` + `useFilter()`）—— 内置过滤已覆盖典型场景，外部受控留 future。
- 分组（Group/GroupLabel）、网格（Row/grid）、虚拟化、Arrow/Backdrop、对象自定义 `itemToString`（items 用 `{value,label}` 自动派生即可）。

## 2. API 实证裁决（require.resolve + .d.ts，非记忆）

包存在：`@base-ui-components/react/combobox`（rc.0）。部件（`index.parts.d.ts`）：
`Root / Value / Input / Trigger / List / Status / Portal / Backdrop / Positioner / Popup / Arrow / Icon / Group / GroupLabel / Item / ItemIndicator / Chips / Chip / ChipRemove / Row / Collection / Empty / Clear` + `useFilter`。

固化的实证事实（**踩坑预防**）：

1. **过滤默认内置**：`Root` 接 `items` prop，`filterMode` 默认 `'list'` → 随 `Input` 值动态过滤，**零受控代码**。可选 `filteredItems`（配 `useFilter()`）走外部受控；本批不用。`filter` prop 可换匹配函数（`useFilter` 提供 `contains`（默认）/`startsWith`）。
2. **List children 支持 render fn**：`children?: ReactNode | ((item, index) => ReactNode)`，List 自动遍历**已过滤**项调用 render fn。→ 惯用法 `<List>{(item) => <Item value={item}>{item.label}</Item>}</List>`。
3. **items 为 `{value,label}` 对象时自动派生**：Root docs 明示 shape 为 `{value,label}` 时 label 自动用于 input 显示、value 自动用于表单提交，**无需 `itemToStringLabel`/`itemToStringValue`**。→ 瑚琏 `Item value={item}`（整对象），选中后 Input 显示 `item.label`。
4. **Empty 仅列表空时渲染**：`Combobox.Empty` 渲 `<div>`，**要求 Root 有 `items` prop**，politely 播报 → 「无匹配项」空过滤态。
5. **Item 渲 `<div>`**，state = `selected / highlighted / disabled` → 皮肤钩子 `data-selected`（驱动 ItemIndicator 打勾）/ `data-highlighted`（键盘漫游+指针 hover 同置位，同 Menu/Select，**禁 hover/focus 伪类**）/ `data-disabled`（**非 `:disabled`**，div 非 button）。
6. **Input 渲 `<input>`**（自身受焦点），state extends `FieldRoot.State` + `open/popupSide/listEmpty/readOnly`。→ **焦点环用外壳 `focus-within`**（input 是后代，抄 Input 外壳），**异于** Select.Trigger（button 用自身 `focus-visible`）。invalid 走 `has-[[data-invalid]]`（同 Input 外壳）。**实测定**（截图自证），不假设。
7. **Positioner 必须包 `<Combobox.Portal>`**：守 `base-ui-overlay-positioner-requires-portal`（overlay 族已踩，脱离即抛）。
8. **多选/单选切换**：Root 泛型 `<Value, Multiple>`，`multiple` 默认 `false`。本批固定单选，不暴露 `multiple`。
9. `defaultValue`/`value`/`onValueChange` 受控/非受控对称透传（家风同 Select/Tabs/Slider）。`disabled`/`name`/`required`/`readOnly` 透传 Root。

## 3. 瑚琏外观（4 组件 facade，镜像 Select）

```tsx
<Combobox items={FRUITS}>
  <ComboboxInput placeholder="搜索水果…" />
  <ComboboxContent emptyMessage="无匹配项">
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>
```

| 瑚琏组件 | 包装 | 职责 |
|---|---|---|
| `Combobox` | 透明转发 `Combobox.Root` | 接 `items`（`{value,label}[]`）+ value/defaultValue/onValueChange/filter/disabled/name/required 等；不偷改默认（守薄包家风） |
| `ComboboxInput` | `Combobox.Input` 裹输入外壳 | 抄 Input 外壳（border/bg/圆角/`focus-within` ring/`has-[[data-invalid]]`/`has-[:disabled]`）+ 尾部 chevron `Combobox.Icon` + 可选清除 `Combobox.Clear`；`size` 三档（sm/md/lg，抄 Input/Select）；`invalid` 独立态翻译 `data-invalid` |
| `ComboboxContent` | `Portal > Positioner > Popup` + `Empty` + `List` | 抄 SelectContent 皮肤（`max-h`/`min-w-[var(--anchor-width)]`/surface/shadow-xl/`data-[starting/ending-style]` 过渡，motion-token CSS 镜像）；内含 `Empty`（emptyMessage）+ `List`（children=render fn 透传）；side/align/sideOffset 透传 |
| `ComboboxItem` | `Combobox.Item` + `ItemIndicator` | 抄 SelectItem 皮肤（`data-[highlighted]:bg-muted/15` + `data-[selected]` 打勾 + `data-[disabled]:opacity-50`）；`value`（对象）/`disabled`/`children` |

只消费语义 token（无 success）。motion 复用 `motionDurationCss`/`motionEaseCss` CSS 镜像（同 dialog/select），**零 motion 运行时**。

## 4. 测试策略（jsdom 边界，照 Select/overlay 族）

vitest（无 jest-dom，断言 `toBeTruthy`/`className.toContain`，同兄弟件）：
1. `Combobox` 透传 items 渲染、`ComboboxInput` 出 `<input>` 带 placeholder。
2. 默认闭合：未交互时 listbox 不在 DOM（或 Popup 未 mount）。
3. 受控 `defaultValue={obj}` → Input 显示对应 label。
4. 过滤：输入触发 → 候选缩小（断言匹配项在、非匹配项不在）；空过滤 → Empty「无匹配项」可见。
5. `data-highlighted`/`data-selected` 皮肤钩子类存在；`disabled` item 出 `data-disabled`。
6. invalid → 外壳 `has-[[data-invalid]]` 路径（Input 落 `data-invalid`/`aria-invalid`）。

**留 Playwright/CDP 截图**（jsdom 测不了几何/定位/焦点环）：输入框/弹层定位、过滤高亮、选中打勾、空态、**焦点环（实测 `focus-within` 假设）**，明暗两态，**先聚焦/输入弹出再截**。

## 5. 承载（overlay 族裁决·`ShowcaseSpec` 零改）

闭合态交互触发器：showcase states 渲染闭合的 Combobox（只见输入框），**聚焦/输入才弹**。否决「默认展开态」（Positioner 必 Portal + 挂 body → 强制展开浮整页飘乱）。截图口径「先触发再截」。

- controls：placeholder（text）、size（sm/md/lg）、disabled（boolean）、invalid（boolean）。
- states：default / 已选值（defaultValue） / 禁用 / 无效态 / small。
- 选项数据：复用一组确定性水果/字体清单（防 hydration mismatch，不引 faker——纯静态数组即可）。

## 6. 落地清单（四件套 + IA）

库内（`packages/ui/src/combobox/`）：`combobox.tsx` + `combobox.types.ts` + `combobox.showcase.tsx`（必 `"use client"`）+ `combobox.test.tsx` + `index.ts`（桶导出）；主 `packages/ui/src/index.ts` 加 `export * from "./combobox"`。

IA（双文件 SSOT，幂等 python 读改写插入·检测 slug 存在则跳过·缩并发竞争窗口）：
- `apps/www/lib/manifest.ts`：`inputs` 分组 +1 行 Combobox。
- `apps/www/lib/registry.tsx`：import + map +1（消费主 barrel 的 `comboboxShowcase`）。

门禁（自己跑，别信 turbo cache）：`pnpm typecheck && 自己 vitest && pnpm build --filter=www --force`。

并发硬纪律：精确 `git add <具体路径>` / `git commit -- <pathspec>`（race-safe，不碰他人 untracked WIP）；MCP 浏览器被占 → 自起隔离 chromium CDP（`executablePath` 指 ms-playwright 缓存 + `addInitScript` 预置 `localStorage hulian-theme`），轮询 `body.innerText` 等 hydration 后再 `captureScreenshot`，存 cwd 根 Read 看像素。

## 7. 继承的硬约束

只消费语义 token（无 success）；overlay 全 Base UI（禁 React Aria）；四件套 + `"use client"`（showcase 必加；组件本体含 hook/overlay 也须加）+ 桶导出 + 主 index export + showcase 从主 barrel 导出；Positioner 裹 Portal；data-* 皮肤钩子用 `data-[highlighted]`/`data-[selected]`/`data-[disabled]` 非伪类。
