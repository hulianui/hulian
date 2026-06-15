---
slug: split-text
name: SplitText
category: typography
group: text
tags: [animated]
exports: [SplitText]
status: enriched
---

# SplitText

> 切字进场 · 文本切字/词 + 滚入视口逐段错峰位移淡入(motion · useInView 触发一次 · aria-label 整段读屏友好 · reduced-motion 直呈终态) · typography/text · #animated

## 何时用

标题/Hero 文案首次滚入视口时做逐字（或逐词）错峰位移淡入，强调登场感。要逐段「从模糊解析到清晰」用 [BlurText](../blur-text/blur-text.md)；要随滚动进度持续逐词显影（而非进场一次）用 [ScrollReveal](../scroll-reveal/scroll-reveal.md)；只要普通静态标题用 [Heading](../heading/heading.md)。

## 导入
```ts
import { SplitText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text * | `string` | — | 要逐段进场的文本 |
| splitType | `"char" \| "word"` | `"char"` | 切分粒度：char 逐字（中文友好）/ word 逐词（按空白切） |
| from | `"bottom" \| "top" \| "left" \| "right"` | `"bottom"` | 进场方向，每段从该方向位移入场 |
| delay | `number` | `40` | 相邻段错峰毫秒，越大波浪推进越慢 |
| duration | `number` | `0.5` | 单段动画时长（秒） |

其余 `<span>` 原生属性（`className` 等）透传；`onDrag/onDragStart/onDragEnd/onAnimationStart` 因与 motion 签名冲突被剔除。

## 示例
```tsx
<SplitText text="让开发更快更稳更美" className="text-3xl font-bold text-foreground" />

<SplitText
  text="Build faster with 瑚琏"
  splitType="word"
  from="left"
  className="text-3xl font-bold text-primary"
/>
```

## 禁忌 / 坑

- `useInView` 只触发一次：进场动画播完不再重放。文档里反复观察需更换 `key` 强制 remount。
- `text` 只收纯字符串（非 children），不能塞 JSX。
- 尊重 `prefers-reduced-motion`：用户开启减弱动效时直呈终态、不播位移淡入。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
