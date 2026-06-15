---
slug: checkbox-group
name: CheckboxGroup
category: forms
group: basic
tags: []
exports: [CheckboxGroup]
status: enriched
---

# CheckboxGroup

> 复选组 · Base UI 值数组协调 + 复用瑚琏 Checkbox · forms/basic

## 何时用

一组相关复选项，需用一个 value 数组统一管理勾选状态（多选筛选、兴趣标签）。单个独立勾选用 [Checkbox](../checkbox/checkbox.md)；互斥单选用 [Radio](../radio/radio.md)；下拉式多选用 [Select](../select/select.md)。子项放瑚琏 [Checkbox](../checkbox/checkbox.md)，每个带 `value`，组按 value 匹配成员。

## 导入
```ts
import { CheckboxGroup } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string[]` | — | 受控：已勾选项的 value 数组 |
| defaultValue | `string[]` | — | 非受控初始勾选项 |
| disabled | `boolean` | `false` | 下发禁用到组内全部 Checkbox |
| orientation | `"vertical" ｜ "horizontal"` | `"vertical"` | 排列方向 |
| className | `string` | — | 透传根节点类名 |
| aria-label | `string` | — | 组的无障碍标签 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string[]) => void` | 勾选变化回调 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 子项为瑚琏 Checkbox（每个带 value） |

## 示例
```tsx
<CheckboxGroup defaultValue={["apple"]}>
  <Checkbox value="apple" label="苹果" />
  <Checkbox value="banana" label="香蕉" />
  <Checkbox value="cherry" label="樱桃" />
</CheckboxGroup>
```
```tsx
{/* 受控 */}
const [v, setV] = useState<string[]>(["apple"]);
<CheckboxGroup value={v} onValueChange={setV} orientation="horizontal">
  <Checkbox value="apple" label="苹果" />
  <Checkbox value="banana" label="香蕉" />
</CheckboxGroup>
```

## 禁忌 / 坑

- 每个子 Checkbox 必须传 `value`（不是 `name`）——见 [[base-ui-checkbox-group-matches-members-by-value-not-name]]：Base UI rc.0 CheckboxGroup 按子项 `value` 匹配成员，用 `name` 会让 defaultValue/value/onValueChange 全部静默失效（框渲染正常但勾选/回调全空，极易误判已装好）。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
