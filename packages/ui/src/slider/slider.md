---
slug: slider
name: Slider
category: forms
group: basic
tags: []
exports: [Slider]
status: enriched
---

# Slider

> 沿轨道拖出一个数值或一段区间，支持键盘步进 · forms/basic

## 何时用

在连续/分档区间内拖选一个数值或一个范围（音量、价格区间、百分比）、且大致量级比精确数字更重要时用。需精确录入数字并带 ±步进按钮用 [NumberField](../number-field/number-field.md)；离散少量挡位也可用 [Segmented](../segmented/segmented.md)。

## 导入
```ts
import { Slider } from "@hulianui/ui"
```

## Props

透传 Base UI `Slider.Root`（除 `render`/`children`），下表为常用项；`value` 为 `number` 时单值、为 `number[]` 时自动走 range。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `number｜readonly number[]` | - | 受控值（数组=range） |
| defaultValue | `number｜readonly number[]` | - | 非受控初始值 |
| min | `number` | `0` | 最小值 |
| max | `number` | `100` | 最大值 |
| step | `number` | `1` | 步进量 |
| disabled | `boolean` | `false` | 禁用 |
| showValue | `boolean` | `false` | 在轨道上方显示当前数值读出（Slider.Value） |
| thumbAriaLabel | `string ｜ [string, string]` | - | 手柄的无障碍名。省略时自动取 Root 的 `aria-label`；range 传二元组分别命名两个手柄 |
| className | `string` | - | Root wrapper className |

> 其余 Base UI `Slider.Root` 的 prop（`name`、`orientation` 等）原样透传。

## Events

透传 Base UI `Slider.Root`，下表为常用项（签名照上游）。

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: number｜number[], eventDetails) => void` | 值变化回调（单值传 number、range 传 number[]） |
| onValueCommitted | `(value: number｜number[], eventDetails) => void` | 拖动结束/提交时回调 |

## 示例
```tsx
<Slider defaultValue={60} showValue className="w-64" />
```

范围（range）：
```tsx
<Slider defaultValue={[25, 75]} showValue className="w-64" />
```

## 禁忌 / 坑

- 单值传 `number`、范围传 `number[]`——传数组即自动 range，别再找单独的 range prop。
- 想看到数值读出需显式 `showValue`（默认不显示）。
- `className` 落在 Root wrapper；宽度需自己给（如 `w-64`），否则可能塌成内容宽。
- **`aria-label` 的落点会变**：单值滑块上它被移到手柄（那个视觉隐藏的 `<input type="range">`）而不是留在 Root——Root 是 `role="group"`，名字挂那儿时读屏在焦点落到滑块上只会念「滑块，100」。组里只有一个控件，所以是转移不是复制（两处同名会被念两遍，`getByLabelText` 之类按名字找控件也会撞到两个）。range 才保留组名，此时用 `thumbAriaLabel` 传二元组分别命名两个手柄，否则读屏听起来是两个一模一样的滑块。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
