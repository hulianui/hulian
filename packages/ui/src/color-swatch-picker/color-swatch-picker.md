---
slug: color-swatch-picker
name: ColorSwatchPicker
category: forms
group: advanced
tags: []
exports: [ColorSwatchPicker, normalizeSwatches]
status: enriched
---

# ColorSwatchPicker

> 预设色块单选 · base-ui RadioGroup 换皮(方向键 a11y) + 选中 ring + mix-blend 勾(零依赖) · forms/advanced

## 何时用

从一组固定预设色（品牌色板、标签颜色）里单选一个时用，本质是 RadioGroup 的色块皮肤，自带方向键漫游。若需自由取任意颜色用 [ColorPicker](../colorpicker/colorpicker.md)。

## 导入
```ts
import { ColorSwatchPicker, normalizeSwatches } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors* | `(string \| { color: string; label?: string })[]` | — | 预设色块列表。字符串 = 任意 CSS 颜色串（hex / rgb / hsl / 具名色 / `var(--color-x)`）；对象可另给 `label` 作无障碍名与 hover 提示。两种形态可混写 |
| value | `string` | — | 受控选中值（须与某个色块的 `color` 严格相等） |
| defaultValue | `string` | — | 非受控初始选中值 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 色块尺寸 |
| disabled | `boolean` | `false` | 整组禁用 |
| className | `string` | — | 透传到容器 |
| aria-label | `string` | — | 无障碍标签 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(color: string) => void` | 选中变更回调，参数始终是色块的 `color` 而不是 `label` |

## 工具函数

| 名称 | 签名 | 说明 |
|------|------|------|
| normalizeSwatches | `(colors: (string \| ColorSwatchItem)[]) => { color: string; label: string }[]` | 把混合数组归一成带可读名的色块；字符串项与缺省/空白 `label` 一律回退到色值本身 |

## 示例
```tsx
const PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
const [v, setV] = useState("#3b82f6");
<ColorSwatchPicker colors={PALETTE} value={v} onValueChange={setV} />

// 非受控
<ColorSwatchPicker colors={PALETTE} defaultValue="#3b82f6" size="lg" />

// 主题 token 色板：给 label，读屏才不会念 "var(--color-primary)"
<ColorSwatchPicker
  colors={[
    { color: "var(--color-primary)", label: "主色" },
    { color: "var(--color-danger)", label: "危险色" },
    "#3b82f6",
  ]}
  defaultValue="var(--color-primary)"
/>
```

## 禁忌 / 坑

- **token 色必须给 `label`**。`colors` 里的裸字符串会直接当色块的 `aria-label`，`var(--color-primary)` 会被读屏原样念成变量名，对屏幕阅读器用户毫无意义；`#3b82f6`、`oklch(...)` 同理只是一串字符。只有具名色（`red` / `tomato`）裸着还能读。
- `value` / `onValueChange` 的身份始终是 `color` 字符串，不是 `label`。给了 `label` 也别拿它当选中值传回来。
- 受控 `value` 必须与某个色块的 `color` **严格字符串相等**才会高亮；`"#FFF"` 与 `"#ffffff"`、`"#3b82f6"` 与 `"rgb(59,130,246)"` 视为不同值。统一大小写与写法。
- 默认无障碍名称跟随 `ConfigProvider locale`；显式 `aria-label` 优先，未包 Provider 时保持中文。
- 仅支持单选；多选场景不在本组件范围内。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
