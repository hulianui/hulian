---
slug: aurora-text
name: AuroraText
category: typography
group: text
tags: [animated]
exports: [AuroraText]
status: enriched
---

# AuroraText

> 极光文字 · bg-clip 流动渐变 + chart token + RSC · typography/text · #animated

## 何时用

给一小段标题/品牌词加极光流动渐变（bg-clip 文字裁切），默认吃 4 个瑚琏 chart token 随明暗主题切换。要横扫高光徽标气质用 [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)；要行内随文流动的渐变用 [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)；普通文本用 [Text](../text/text.md)，不要给大段正文套动效。

## 导入
```ts
import { AuroraText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | `ReactNode` | — | 要渲染的文字 |
| colors | `string[]` | 4 个瑚琏 chart token | 渐变停靠色数组（自动吃明暗主题） |
| speed | `number` | `1` | 流动速度倍率，越大越快 |

继承 `ComponentPropsWithoutRef<"span">`（除 `color`），如 `className` / `style`。

## 示例
```tsx
<AuroraText className="text-4xl font-bold">瑚琏 Hulian</AuroraText>
```

加速：
```tsx
<AuroraText className="text-4xl font-bold" speed={2}>Aurora</AuroraText>
```

## 禁忌 / 坑

- 渲染为 `<span>`，效果靠 `text-*`/`font-*` 等字号样式撑出可见面积，给空 children 或无字号时看不到流光。
- 自定义 `colors` 须用可解析的 CSS 颜色值；用 token 时注意瑚琏 token 需带 `--color-` 前缀才在 SVG/渐变里解析（见 hulian token 规范）。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
