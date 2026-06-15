---
slug: radio
name: Radio
category: forms
group: basic
tags: []
exports: [RadioGroup, Radio]
status: enriched
---

# Radio

> 单选 · RadioGroup 单选组 + 键盘方向键 · forms/basic

## 何时用

一组互斥选项里选且只选一个、且选项数少（约 2–6 个）需全部直接可见时用。选项多需收起或搜索改用 [Select](../select/select.md)；多选共存改用 [CheckboxGroup](../checkbox-group/checkbox-group.md)；横向二三段且要滑块视觉用 [Segmented](../segmented/segmented.md)。

## 导入
```ts
import { RadioGroup, Radio } from "@hulianui/ui"
```

## Props

`RadioGroup`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | — | 受控选中值 |
| defaultValue | `string` | — | 非受控初始选中值 |
| disabled | `boolean` | `false` | 整组禁用 |
| required | `boolean` | — | 表单必选 |
| name | `string` | — | 原生表单 name |
| orientation | `"vertical"｜"horizontal"` | `"vertical"` | 仅控布局 |
| className | `string` | — | — |
| aria-label | `string` | — | 无可见标题时提供 |

`Radio`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value * | `string` | — | 必填，标识该选项 |
| disabled | `boolean` | `false` | 单项禁用 |
| id | `string` | — | — |
| className | `string` | — | 落在 Radio.Root |

## Events

`RadioGroup`

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string) => void` | 选中变化回调 |

## Slots

`RadioGroup`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 内放 `Radio` 项 |

`Radio`

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 可选 inline label（点右，原生 `<label>` 关联） |

## 示例
```tsx
<RadioGroup defaultValue="b" aria-label="选项">
  <Radio value="a" label="选项一" />
  <Radio value="b" label="选项二" />
  <Radio value="c" label="选项三(禁用)" disabled />
</RadioGroup>
```

横向 + 受控：
```tsx
const [value, setValue] = useState("standard");
<RadioGroup value={value} onValueChange={setValue} orientation="horizontal" aria-label="套餐">
  <Radio value="standard" label="标准" />
  <Radio value="pro" label="专业" />
</RadioGroup>
```

## 禁忌 / 坑

- 选中值统一由 `RadioGroup` 管，`Radio` 不自带选中态——别在 `Radio` 上找 `checked`。
- 用 `value`/`onValueChange` 即受控，须自管 state；只给初值用 `defaultValue`，二者不要混用。
- 无可见标题的单选组要给 `aria-label`，否则无障碍读屏无名。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Switch](../switch/switch.md)
