---
slug: color-field
name: ColorField
category: forms
group: advanced
tags: []
exports: [ColorField, normalizeHex, isHexColor]
status: enriched
---

# ColorField

> 颜色输入框 · 紧凑单行：色块(调起系统取色器) + 十六进制文本输入 + 短写自动展开(#abc→#aabbcc) + 草稿态支持手输 · forms/advanced

## 何时用

表单里的**一行**颜色输入：主题配置表、设计 token 编辑器、图表配色项 —— 已知色值、偶尔微调的场景。

需要完整取色面板（饱和度方块 + HEX/RGB/HSL 格式切换）用 [ColorPicker](../colorpicker/colorpicker.md)；只从固定几个预设里挑用 [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md)。ColorField 的定位是**不抢版面**，一行能塞进标签和说明文字旁边。

## 导入
```ts
import { ColorField, normalizeHex, isHexColor } from "@hulianui/ui"
```

## Props

继承原生 `<input>` 属性（`size`/`prefix`/`value`/`defaultValue`/`onChange`/`type` 已被覆盖）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | — | 受控值。接受 `#rgb` / `#rrggbb` / 无 `#` 写法，内部统一规范为小写 `#rrggbb` |
| defaultValue | `string` | `"#3b82f6"` | 非受控初值 |
| showSwatch | `boolean` | `true` | 左侧色块，点开调起系统取色器 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 尺寸（与 Input 同一套外壳变体，色块随之缩放） |
| invalid | `boolean` | `false` | 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动 |
| disabled | `boolean` | `false` | 同时禁用文本框与取色器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(hex: string) => void` | 值变化。参数**恒为规范化后的 `#rrggbb`**；输入不合法时不触发 |

## 工具函数

| 函数 | 签名 | 说明 |
|------|------|------|
| normalizeHex | `(input: string) => string \| null` | 规范化成小写 `#rrggbb`；不可解析返回 `null`（不抛错、不吐默认色） |
| isHexColor | `(input: string) => boolean` | 是否可解析（3/6 位，`#` 可省） |

两个纯函数单独导出：「哪些写法算合法颜色」消费方也要用（比如导入一份主题配置前先校验），不该只活在组件内部。

## 示例
```tsx
const [hex, setHex] = useState("#38e8ff");
<ColorField value={hex} onValueChange={setHex} className="w-40" aria-label="主色" />
```

配置表里一行一色：
```tsx
{THEME_KEYS.map((k) => (
  <div key={k} className="flex items-center gap-3">
    <span className="w-28 text-sm">{k}</span>
    <ColorField value={theme[k]} onValueChange={(hex) => setColor(k, hex)} className="w-36" aria-label={k} />
  </div>
))}
```

## 禁忌 / 坑

- **短写是缩写，不是另一种颜色**：`#abc` 展开成 `#aabbcc`（逐位重复），不是 `#abc000`。`normalizeHex` 已按此实现，自己解析时别写错。
- **不要把 value 直接当 input 的显示值自己实现一遍**：受控值经规范化后回灌会让手输在第一个字符就被打回（敲 `#3` 立刻变回原值，根本没法输）。本组件内部维护「草稿态」——键入期间以草稿为准、只在解析成功时抛值、失焦丢草稿归一。扩展/仿写时必须保留这个机制。
- `onValueChange` 在输入不合法时**不触发**，所以它拿到的一定是可用色值；要感知「用户正在敲一个还不合法的值」请监听原生 `onInput`。
- 外部传入不可解析的 `value` 时回落到内部值而不是崩，但这是兜底不是契约 —— 受控方应自己保证传合法色。
- 原生 `input[type=color]` 的外观改不动，所以色块是「透明原生 input 铺在 token 着色的 span 上」。别给它加 `appearance` 之类的样式，改不动也不生效。

## 相关
[ColorPicker](../colorpicker/colorpicker.md) · [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md) · [Input](../input/input.md) · [Field](../field/field.md) · [SecretField](../secret-field/secret-field.md)
