---
slug: sparkles-text
name: SparklesText
category: typography
group: text
tags: [animated]
exports: [SparklesText]
status: enriched
---

# SparklesText

> 星闪文字 · 随机小星脉冲(客户端生成) + token · typography/text · #animated

## 何时用

给一小段标题/品牌词围绕随机小星脉冲点缀（客户端随机生成星位）。要文字本体彩色流动用 [AuroraText](../aurora-text/aurora-text.md) / [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)；要横扫高光徽标用 [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)；静态文本用 [Text](../text/text.md)。客户端组件（随机星位 + 动画），源文件已含 `"use client"`。

## 导入
```ts
import { SparklesText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | `ReactNode` | — | 要渲染的文字 |
| colors | `string[]` | `[primary, chart-1]` token | 星色数组 |
| sparklesCount | `number` | `8` | 星星数量 |

继承 `ComponentPropsWithoutRef<"span">`（除 `color`），如 `className` / `style`。

## 示例
```tsx
<SparklesText className="text-4xl font-bold text-foreground">瑚琏 Hulian</SparklesText>
```

## 禁忌 / 坑

- 星位在客户端随机生成，不要期待 SSR 与首帧水合后位置一致；本身是 `"use client"` 组件，作为子组件可嵌进 server 页，但不能当纯 RSC 用。
- 自定义 `colors` 用瑚琏 token 时须带 `--color-` 前缀才能在星点着色里解析（见 hulian token 规范）。
- 星数过大（`sparklesCount` 偏高）会增加动画节点数，小面积文字上密集星点可能显得杂乱。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
