---
slug: animated-shiny-text
name: AnimatedShinyText
category: typography
group: text
tags: [animated]
exports: [AnimatedShinyText]
status: enriched
---

# AnimatedShinyText

> 高光文字 · 横扫高光 + 徽标气质 + RSC · typography/text · #animated

## 何时用

给小段文字加一道横扫高光，常用于 pill 徽标 / "Introducing" 提示条这类轻量营销点缀。要彩色极光渐变文字用 [AuroraText](../aurora-text/aurora-text.md)；要行内流动渐变用 [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)；普通文本用 [Text](../text/text.md)。

## 导入
```ts
import { AnimatedShinyText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| shimmerWidth | `number` | `100` | 高光带宽度（px） |

继承 `ComponentPropsWithoutRef<"span">`（`children` / `className` / `style` 等）。

## 示例
```tsx
<div className="rounded-full border border-border bg-surface px-4 py-1.5">
  <AnimatedShinyText className="text-sm">✨ Introducing 瑚琏 Hulian</AnimatedShinyText>
</div>
```

## 禁忌 / 坑

- 高光靠遮罩横扫文字本体，需要文字有可见前景色才看得出来；放在过亮/过暗背景上高光带可能不明显，配合徽标容器（border + bg-surface）效果最佳。
- 渲染为 `<span>`，无字号/无内容时无可见效果。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
