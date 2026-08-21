---
slug: fuzzy-text
name: FuzzyText
category: typography
group: text
tags: [animated]
exports: [FuzzyText]
status: enriched
---

# FuzzyText

> 噪点模糊标题 · 信号噪点模糊标题 · canvas2d 逐行/逐列随机错位扫描 + 悬停增强抖动(零依赖·token·reduced-motion 退静态帧) · typography/text · #animated

## 何时用

404 / 故障页 / 极客风大标题想要信号噪点、扫描错位的「毛刺」质感时用。要逐字翻滚乱码的悬停文字用 ScrambledText；要平滑发光渐变用 AuroraText；FuzzyText 是把字形按行/列像素错位做扫描噪点，适合厚重短标题。

## 导入
```ts
import { FuzzyText } from "@hulianui/ui"
```

## Props

继承 `CanvasHTMLAttributes<HTMLCanvasElement>`（去 `color`/`children`/`style`），核心如下：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| fontSize | `number \| string` | `"clamp(2rem, 10vw, 10rem)"` | 数字按 px、字符串按任意 CSS 长度(含 clamp)，自适应视口 |
| fontWeight | `number \| string` | `900` | 字重，厚笔画下噪点更醒目 |
| fontFamily | `string` | `"inherit"` | 字体族，inherit 读 canvas computed font-family |
| color | `string` | `var(--color-foreground)` | 填充色，随明暗主题；可传任意 CSS 颜色(含 var()/currentColor，内部经 computed style 解析)；style.color 优先级更高 |
| enableHover | `boolean` | `true` | 指针在文字范围内时抖动加剧 |
| baseIntensity | `number` | `0.18` | 静息态噪点强度(0-1)，越大越「毛」 |
| hoverIntensity | `number` | `0.5` | 悬停态噪点强度(0-1) |
| fuzzRange | `number` | `30` | 每行/列最大像素位移幅度，决定噪点散开范围 |
| direction | `"horizontal" \| "vertical" \| "both"` | `"horizontal"` | 抖动方向：按行左右/按列上下/两者叠加 |
| className | `string` | - | 透传 canvas 额外 className |
| style | `CSSProperties` | - | 透传 canvas 内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 要渲染的文字(仅纯文本，会被拼成一行) |

## 示例
```tsx
// 默认：横向扫描噪点
<FuzzyText fontSize="clamp(2rem, 8vw, 5rem)">瑚琏</FuzzyText>

// 404：高位移 + 主色
<FuzzyText fontSize="clamp(3rem, 14vw, 8rem)" fuzzRange={42} baseIntensity={0.3} color="var(--color-chart-1)">
  404
</FuzzyText>
```

## 禁忌 / 坑

- 渲染目标是 `<canvas>`：children 仅支持纯文本，传嵌套元素会被拼接为一行字符串。
- color 喂的是经 computed style 解析的颜色：可传 `var(--color-*)`/`currentColor`，但纯 canvas 不吃 Tailwind 工具类，给颜色走 color prop 或 style.color。
- reduced-motion 下退化为静态帧（保留可读文字），别依赖抖动作为唯一视觉反馈。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
