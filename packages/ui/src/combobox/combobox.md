---
slug: combobox
name: Combobox
category: forms
group: advanced
tags: []
exports: [Combobox, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxChips, ComboboxChip]
status: enriched
---

# Combobox

> 自动补全 · 触发按钮 + 弹层内搜索(图4 范式)，亦支持内联输入；浮层锚到字段等宽 · forms/advanced

## 何时用

选项较多需边打字边过滤（自动补全/可搜索下拉）时用；支持单选、`multiple` 多选 chips、触发按钮式弹层内搜索，以及内联输入直接过滤三种范式。选项少且全可见用 [Select](../select/select.md)；纯展示已有密钥用 [SecretField](../secret-field/secret-field.md)；@提及场景用 [Mentions](../mentions/mentions.md)。

## 导入
```ts
import { Combobox, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxChips, ComboboxChip } from "@hulianui/ui"
```

## Props

`Combobox`（透传 Base UI `Combobox.Root<ComboboxItemData, Multiple>`，下表为瑚琏常用项）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `ComboboxItemData[]` | — | 选项数据 `{value,label}`，自动以 label 显示、value 提交 |
| value | `ComboboxItemData｜ComboboxItemData[]` | — | 受控选中（multiple 时为数组） |
| defaultValue | 同上 | — | 非受控初始选中 |
| multiple | `boolean` | `false` | true 时 value/onValueChange 自动变数组 |
| disabled | `boolean` | `false` | 禁用 |

`ComboboxTrigger`（图4 范式：显示已选 label / placeholder，点击展开弹层内搜索）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm"｜"md"｜"lg"` | `"md"` | 尺寸 |
| placeholder | `string` | — | 未选中时占位文案 |
| invalid | `boolean` | `false` | 独立使用（非 Field 内）时手动置无效态皮肤 |
| className | `string` | — | — |

`ComboboxInput`（内联自动补全：输入框本身即可见字段）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm"｜"md"｜"lg"` | `"md"` | 尺寸 |
| placeholder | `string` | — | 占位 |
| invalid | `boolean` | `false` | 手动置无效态皮肤 |
| clearable | `boolean` | `false` | 有值时渲染清除按钮 |
| className | `string` | — | — |

`ComboboxContent`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| searchPlaceholder | `string` | — | 设置后在浮层顶部渲染搜索框（图4 范式，配合 Trigger）；不设则为内联补全态 |
| side | `"top"｜"bottom"` | — | 浮层方位 |
| align | `"start"｜"center"｜"end"` | — | 浮层对齐 |
| sideOffset | `number` | — | 偏移 |
| className | `string` | — | — |

`ComboboxItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value * | `ComboboxItemData` | — | 选项 `{value,label}` 对象 |
| disabled | `boolean` | `false` | 禁用该项 |
| className | `string` | — | — |

`ComboboxChips`（多选 chips 外壳）：`size`、`invalid`、`placeholder`、`className`（外加 `children` 插槽，见 Slots）。
`ComboboxChip`（单个已选 chip）：`className`（外加 `children` 插槽，见 Slots）。

## Events

`Combobox`（透传 Base UI `Combobox.Root`）

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value) => void` | 选中变化回调（multiple 时 value 为数组） |

## Slots

`Combobox`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 内放 Trigger/Input + Content |

`ComboboxContent`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children * | `(item, index) => ReactNode` | 渲染函数，List 自动遍历已过滤项调用 |
| emptyMessage | `ReactNode` | 无匹配时文案 |

`ComboboxItem`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children * | `ReactNode` | 渲染内容 |

`ComboboxChips`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 内含 chip 列 + 输入框 |

`ComboboxChip`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children * | `ReactNode` | chip 内容 |

## 示例

触发按钮 + 弹层内搜索（图4 范式）：
```tsx
<Combobox items={FRUITS}>
  <ComboboxTrigger placeholder="选择水果" />
  <ComboboxContent searchPlaceholder="搜索水果…">
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>
```

内联自动补全（输入框即字段）：
```tsx
<Combobox items={FRUITS}>
  <ComboboxInput placeholder="搜索水果…" clearable />
  <ComboboxContent>
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>
```

## 禁忌 / 坑

- `ComboboxItem` 的 `value` 是整个 `{value,label}` 对象（非字符串）——render fn 里直接传 `value={item}`，Base UI 自动派生 label/value。
- 浮层内搜索框由 `ComboboxContent` 的 `searchPlaceholder` 触发：配 `ComboboxTrigger` 用就给它（图4 范式），配 `ComboboxInput` 内联补全则不设（输入框本身即搜索）。
- `multiple` 一开 value/onValueChange 即变数组，受控时 state 类型要跟着变。
- `invalid` 仅用于「非 Field 内」独立使用时手动置无效皮肤；在 Field 内由 Field 接管，不用手传。

## 相关
[SecretField](../secret-field/secret-field.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../_mui/rating.md) · [Upload](../upload/upload.md)
