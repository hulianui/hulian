---
slug: animated-gradient-text
name: AnimatedGradientText
category: typography
group: text
tags: [animated]
exports: [AnimatedGradientText]
status: enriched
---

# AnimatedGradientText

> 渐变文字 · 行内 chart 渐变流动 + RSC · typography/text · #animated

## 何时用

给一小段行内文字加流动渐变着色，随文排版（inline），默认吃瑚琏 chart token。要文字内部极光/大标题质感用 [AuroraText](../aurora-text/aurora-text.md)（二者都基于 chart 渐变，AuroraText 偏标题级面积、本组件偏行内嵌入）；要横扫高光徽标用 [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)。

## 导入
```ts
import { AnimatedGradientText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors | `string[]` | 瑚琏 chart token | 渐变停靠色数组 |
| speed | `number` | `1` | 流动速度倍率 |

继承 `ComponentPropsWithoutRef<"span">`（除 `color`），如 `className` / `style`。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 要渲染的文字 |

## 示例
```tsx
<AnimatedGradientText className="text-2xl">🎉 全新瑚琏组件库</AnimatedGradientText>
```

## 禁忌 / 坑

- 行内 `<span>`，靠字号/前景裁切显色，空内容或无字号无可见效果。
- 自定义 `colors` 用瑚琏 token 时须带 `--color-` 前缀才能在渐变里解析（见 hulian token 规范）。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
