---
slug: true-focus
name: TrueFocus
category: typography
group: text
tags: [animated]
exports: [TrueFocus]
status: enriched
---

# TrueFocus

> 真实焦点 · 句中一词清晰余词模糊 + 焦点循环移动 + 四角框跟随(测量 rect 定位 · 角框吃 chart token · manualMode 悬停聚焦 · reduced-motion 全清晰) · typography/text · #animated

## 何时用

短句逐词聚焦：当前词清晰、其余模糊，四角括号框跟随焦点循环移动，强调「逐词扫读」。要逐词从模糊解析到清晰（不带焦点框、不循环）用 [BlurText](../blur-text/blur-text.md)；要随滚动进度显影用 [ScrollReveal](../scroll-reveal/scroll-reveal.md)；普通标题用 [Heading](../heading/heading.md)。

## 导入
```ts
import { TrueFocus } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| sentence | `string` | `"True Focus"` | 整句文本，按 `separator` 切词后逐词聚焦 |
| separator | `string` | `" "` | 切词分隔符（传给 `String.prototype.split`） |
| blurAmount | `number` | `5` | 失焦词的模糊半径（px） |
| borderColor | `string` | `"var(--color-chart-1)"` | 四角括号描边色（CSS color，建议吃 token），须带 `--color-` 前缀或合法 CSS 颜色 |
| animationDuration | `number` | `1.2` | 单次对焦切换的动画 / 停留秒数 |
| pauseBetweenAnimations | `number` | `0.6` | 自动模式下两次切换之间的停顿（秒） |
| manualMode | `boolean` | `false` | 为 true 时不自动轮播，改由鼠标悬停某词来对焦 |

其余 `<div>` 原生属性透传。

## 示例
```tsx
<TrueFocus sentence="True Focus Effect" className="text-3xl font-bold text-foreground" />

<TrueFocus
  sentence="瑚琏 真实 焦点"
  borderColor="var(--color-primary)"
  blurAmount={6}
  className="text-3xl font-bold text-foreground"
/>
```

## 禁忌 / 坑

- 角框靠测量各词 rect 定位：父容器需给足布局空间（建议固定高度容器），避免换行/挤压让框错位。
- `borderColor` 须带 `--color-` 前缀或合法 CSS 颜色；裸 `var(--primary)` 在本 Tailwind v4 设定下不解析。
- 尊重 `prefers-reduced-motion`：开启减弱动效时全词清晰、不循环聚焦。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
