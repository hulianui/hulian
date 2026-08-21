---
slug: toggle
name: Toggle
category: forms
group: basic
tags: []
exports: [Toggle, ToggleGroup, toggleVariants]
status: enriched
---

# Toggle

> 让单个按钮在按下与未按下之间切换 · forms/basic

## 何时用

带按下态的图标/文字按钮（工具栏加粗、对齐、AI 工具栏「深度思考」开关）用 Toggle；多个 Toggle 互斥单选或多选共存用 ToggleGroup。语义是「开关一个设置」而非「按钮态」时用 [Switch](../switch/switch.md)；纯单选一组对等选项用 [Radio](../radio/radio.md)。

## 导入
```ts
import { Toggle, ToggleGroup, toggleVariants } from "@hulianui/ui"
```

## Props

`Toggle`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| pressed | `boolean` | - | 受控按下态 |
| defaultPressed | `boolean` | `false` | 非受控初始按下态 |
| disabled | `boolean` | `false` | 禁用 |
| value | `string` | - | 在 ToggleGroup 内标识该项 |
| variant | `"default"｜"outline"｜"pill"` | `"default"` | default=灰底软选中 / outline=主色实心 / pill=圆角描边 + soft 主色选中（AI 工具栏开关风） |
| size | `"sm"｜"md"` | `"md"` | - |
| className | `string` | - | - |
| aria-label | `string` | - | 仅图标时必填 |

`ToggleGroup`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string[]` | - | 受控：已按下项 value 数组 |
| defaultValue | `string[]` | - | 非受控初始按下项数组 |
| disabled | `boolean` | `false` | 整组禁用 |
| multiple | `boolean` | `false` | true=多选共存；false=单选互斥 |
| orientation | `"horizontal"｜"vertical"` | `"horizontal"` | - |
| className | `string` | - | - |

## Events

`Toggle`

| 事件 | 类型 | 说明 |
|------|------|------|
| onPressedChange | `(pressed: boolean) => void` | 按下态变化（瑚琏收敛签名，丢 Base UI eventDetails） |

`ToggleGroup`

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string[]) => void` | 变化回调 |

## Slots

`Toggle`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 图标 / 文字 |

`ToggleGroup`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 内放 `Toggle` 项 |

## 示例

单个 toggle（受控）：
```tsx
const [on, setOn] = useState(false);
<Toggle pressed={on} onPressedChange={setOn} aria-label="加粗">
  <Bold className="size-4" />
</Toggle>
```

互斥单选组：
```tsx
<ToggleGroup defaultValue={["center"]}>
  <Toggle value="left" aria-label="左对齐"><AlignLeft className="size-4" /></Toggle>
  <Toggle value="center" aria-label="居中"><AlignCenter className="size-4" /></Toggle>
  <Toggle value="right" aria-label="右对齐"><AlignRight className="size-4" /></Toggle>
</ToggleGroup>
```

## 禁忌 / 坑

- 即便在 `ToggleGroup` 内，选中态也以 value 数组管理——`multiple={false}` 时数组里只会有 0 或 1 个元素。
- 仅渲染图标（无文字）的 `Toggle` 必须给 `aria-label`，否则读屏无名。
- 用 `pressed`/`onPressedChange`（或 group 的 `value`/`onValueChange`）即受控，须自管 state；非受控只给 `defaultPressed`/`defaultValue`。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
