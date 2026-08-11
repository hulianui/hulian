---
slug: input
name: Input
category: forms
group: basic
tags: []
exports: [Input, inputShellVariants]
status: enriched
---

# Input

> 输入框 · Base UI Field + 前后缀 + invalid · forms/basic

## 何时用

单行文本输入。多行文本用 [Textarea](../textarea/textarea.md)；从固定选项里选一项用 [Select](../select/select.md)；布尔/多选/单选分别用 [Switch](../switch/switch.md) / [Checkbox](../checkbox/checkbox.md) / [Radio](../radio/radio.md)。放进 hulian Field 内会自动接管 label/error/aria 关联。

## 导入
```ts
import { Input, inputShellVariants } from "@hulianui/ui"
```

## Props

继承原生 `<input>` 属性（除 `size`/`prefix` 被下方覆盖外，如 `value`/`onChange`/`type`/`placeholder`/`disabled`…）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"xs" ｜ "sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸（CVA 变体，覆盖原生 size）。`xs` = 28px 高 / 12px 字，给存量密集数据表的行内编辑器（仍带边框，区别于无边框的 `variant="cell"`）。`variant="cell"` 下只影响字号，不再有高度与内距 |
| variant | `"default" ｜ "cell"` | `"default"` | 外壳形态。`cell` = 表格单元格里的就地编辑器：无边框、透明底、零内距、不占固定行高，焦点态用浅底 + 内嵌下划线代替焦点环 |
| invalid | `boolean` | `false` | 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动，无需重复传 |
| disabled | `boolean` | `false` | 禁用 |
| ref | `Ref<HTMLInputElement>` | — | 转发到**内层原生 `<input>`**（不是外壳 span）。`focus()` / `select()` / 取 `.value` / react-hook-form 的 `register()` 都靠它 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(e: ChangeEvent<HTMLInputElement>) => void` | 透传原生输入回调（受控时配合 `value` 使用） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| prefix | `ReactNode` | 前缀内容（如 `¥`） |
| suffix | `ReactNode` | 后缀内容（如 `.00`） |

## 示例
```tsx
<Input placeholder="请输入…" className="w-64" />
```
```tsx
{/* 前后缀 */}
<Input prefix="¥" suffix=".00" placeholder="0" className="w-64" />
```
```tsx
{/* 表格内联编辑：单元格本身就是输入框，不需要任何 className */}
const columns: ColumnDef<Row, any>[] = [
  {
    accessorKey: "name",
    header: "字段名",
    cell: ({ row }) => (
      <Input
        variant="cell"
        value={row.original.name}
        onChange={(e) => setField(row.original.id, "name", e.target.value)}
        aria-label="字段名"
      />
    ),
  },
];
<Table columns={columns} data={rows} density="compact" />
```

## 禁忌 / 坑

- 在 hulian Field 内时不要重复传 `invalid`——Field.Root 的 invalid 会自动驱动标红，手动再传会冲突。`invalid` 只在脱离 Field 独立使用时手动传。
- 表格里就地编辑用 `variant="cell"`，**不要**在调用处写 `className="border-0 bg-transparent p-0 focus-visible:ring-0 …"` 覆盖默认外壳。除了这是明令禁止的调用处补丁，还有两处肉眼难发现：一是 `ring-0` 清不掉 `ring-offset`（残留一圈底色描边），二是默认外壳的固定行高（`h-10`）不是 padding，`p-0` 覆盖不掉，密集表格的行高仍会被撑起来。
- `variant="cell"` 的焦点态是浅底 + 内嵌下划线，不是焦点环——单元格没有内距，2px 环 + 2px offset 会溢出去顶到相邻格。若你所在的场景需要更强的焦点提示，改整格背景（在 `<td>` 上做），不要把环加回来。

## 相关
[Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
