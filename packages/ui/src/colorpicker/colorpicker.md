---
slug: colorpicker
name: ColorPicker
category: forms
group: advanced
tags: []
exports: [ColorPicker, parseColor, rgbToHex, rgbToHsl, formatColor]
status: enriched
---

# ColorPicker

> 颜色选择 · react-colorful 内核 + HEX/RGB/HSL 多格式输出与切换器(零依赖派生) + 瑚琏 token 皮肤 · forms/advanced

## 何时用

需要让用户从色域面板自由取任意颜色、并能在 HEX/RGB/HSL 间切换输出格式时用。若只是从一组预设色块里单选用更轻的 [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md)。

## 导入
```ts
import { ColorPicker, parseColor, rgbToHex, rgbToHsl, formatColor } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | — | 受控颜色值。接受 hex / rgb() / hsl() 串，内部统一规范为 hex 作单一真源 |
| defaultValue | `string` | `"#3b82f6"` | 非受控初值 |
| format | `"hex" \| "rgb" \| "hsl"` | — | 受控的输出/展示格式，传入即进入格式受控模式 |
| defaultFormat | `"hex" \| "rgb" \| "hsl"` | `"hex"` | 非受控初始格式 |
| disabled | `boolean` | `false` | 禁用：罩层 + 屏蔽交互 |
| showInput | `boolean` | `true` | 是否显示文本输入 |
| showFormatSwitcher | `boolean` | `true` | 是否显示 HEX/RGB/HSL 格式切换器 |
| className | `string` | — | 透传到外壳 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string) => void` | 变更回调，参数为**当前所选格式**的字符串；切换格式也会触发 |
| onFormatChange | `(format: ColorFormat) => void` | 格式切换回调 |

## 示例
```tsx
// 受控（注意 onValueChange 给的是当前格式串）
const [v, setV] = useState("#3b82f6");
<ColorPicker value={v} onValueChange={setV} />

// 固定 RGB 输出、隐藏切换器
<ColorPicker defaultValue="#3b82f6" defaultFormat="rgb" showFormatSwitcher={false} />
```

## 禁忌 / 坑

- `onValueChange` 回传的是**当前所选格式**的字符串（hex/rgb/hsl），且切换格式本身也会触发回调——别假设永远是 hex。内部以 hex 为真源，但回调按 format 输出。
- 受控 `value` 可传任意 hex/rgb()/hsl() 串，组件内部归一为 hex 再渲染，回写时再转回所选格式。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../_mui/rating.md)
