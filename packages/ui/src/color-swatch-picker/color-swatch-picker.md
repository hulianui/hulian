---
slug: color-swatch-picker
name: ColorSwatchPicker
category: forms
group: advanced
tags: []
exports: [ColorSwatchPicker]
status: enriched
---

# ColorSwatchPicker

> 预设色块单选 · base-ui RadioGroup 换皮(方向键 a11y) + 选中 ring + mix-blend 勾(零依赖) · forms/advanced

## 何时用

从一组固定预设色（品牌色板、标签颜色）里单选一个时用，本质是 RadioGroup 的色块皮肤，自带方向键漫游。若需自由取任意颜色用 [ColorPicker](../colorpicker/colorpicker.md)。

## 导入
```ts
import { ColorSwatchPicker } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors* | `string[]` | — | 预设色块列表，任意 CSS 颜色串（hex / rgb / hsl / 具名色） |
| value | `string` | — | 受控选中值（须与 colors 中某项严格相等） |
| defaultValue | `string` | — | 非受控初始选中值 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 色块尺寸 |
| disabled | `boolean` | `false` | 整组禁用 |
| className | `string` | — | 透传到容器 |
| aria-label | `string` | — | 无障碍标签 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(color: string) => void` | 选中变更回调 |

## 示例
```tsx
const PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
const [v, setV] = useState("#3b82f6");
<ColorSwatchPicker colors={PALETTE} value={v} onValueChange={setV} />

// 非受控
<ColorSwatchPicker colors={PALETTE} defaultValue="#3b82f6" size="lg" />
```

## 禁忌 / 坑

- 受控 `value` 必须与 `colors` 中某项**严格字符串相等**才会高亮；`"#FFF"` 与 `"#ffffff"`、`"#3b82f6"` 与 `"rgb(59,130,246)"` 视为不同值。统一大小写与写法。
- 默认无障碍名称跟随 `ConfigProvider locale`；显式 `aria-label` 优先，未包 Provider 时保持中文。
- 仅支持单选；多选场景不在本组件范围内。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
