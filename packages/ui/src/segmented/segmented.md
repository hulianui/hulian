---
slug: segmented
name: Segmented
category: forms
group: basic
tags: []
exports: [Segmented]
status: enriched
---

# Segmented

> 分段控制器 · 自研 radio 语义(方向键漫游) + active-tab CSS 变量滑块(零依赖) · forms/basic

## 何时用

横向一排互斥选项（约 2–5 段，如「日/周/月」「网格/列表/地图」「按月/按年付费」）需滑块高亮当前段时用，items 数组驱动、单值互斥。选项纵向排列或语义偏表单单选用 [Radio](../radio/radio.md)；切换页面级视图区块用 Tabs；选项多需收起用 [Select](../select/select.md)。

## 导入
```ts
import { Segmented } from "@hulianui/ui"
```

## Props

`Segmented`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items * | `SegmentedItem[]` | — | 段定义数组 |
| value | `string` | — | 受控选中值 |
| defaultValue | `string` | 首个未禁用段 | 非受控初始选中值 |
| onValueChange | `(value: string) => void` | — | 选中变化（单值，radio 语义互斥） |
| disabled | `boolean` | `false` | 整体禁用 |
| size | `"sm"｜"md"` | `"md"` | — |
| className | `string` | — | — |
| aria-label | `string` | — | 无可见标题时提供 |

`SegmentedItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value * | `string` | — | 该段唯一值（也是选中标识） |
| label * | `ReactNode` | — | 段内容（文字或图标） |
| ariaLabel | `string` | — | label 为富节点（图标/徽标）时必填，否则降级取 value |
| disabled | `boolean` | `false` | 单段禁用 |

## 示例
```tsx
<Segmented
  items={[
    { value: "day", label: "日" },
    { value: "week", label: "周" },
    { value: "month", label: "月" },
  ]}
  defaultValue="week"
  aria-label="周期"
/>
```

图标段（每段给 ariaLabel）：
```tsx
<Segmented
  items={[
    { value: "grid", ariaLabel: "网格视图", label: <LayoutGrid className="size-4" /> },
    { value: "list", ariaLabel: "列表视图", label: <List className="size-4" /> },
  ]}
  defaultValue="grid"
  aria-label="视图"
/>
```

## 禁忌 / 坑

- 段 `label` 是图标/徽标等富节点时必须给该段 `ariaLabel`，否则读屏会读英文 `value`（念读不友好）。
- 用 `value`/`onValueChange` 即受控，须自管 state；非受控只给 `defaultValue`。
- 选中是单值互斥，没有多选——多选共存改用 [ToggleGroup](../toggle/toggle.md)。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
