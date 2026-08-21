---
slug: blur-text
name: BlurText
category: typography
group: text
tags: [animated]
exports: [BlurText]
status: enriched
---

# BlurText

> 模糊解析 · 各词从模糊+位移解析到清晰 + 滚入视口触发(motion · top/bottom 方向 · aria-label 整段 · reduced-motion 直呈清晰) · typography/text · #animated

## 何时用

标题/段落滚入视口时让每段从「模糊+位移」解析到清晰，比纯位移淡入更有镜头对焦质感。只要逐段位移淡入（不模糊）用 [SplitText](../split-text/split-text.md)；要随滚动进度持续逐词显影用 [ScrollReveal](../scroll-reveal/scroll-reveal.md)；普通静态标题用 [Heading](../heading/heading.md)。

## 导入
```ts
import { BlurText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text * | `string` | - | 要逐段模糊浮现的文本 |
| splitType | `"char" \| "word"` | `"word"` | 切分粒度：word 逐词（按空白切）/ char 逐字（中文友好） |
| direction | `"top" \| "bottom"` | `"top"` | 进场方向，伴随 y 位移与中段过冲 |
| delay | `number` | `120` | 相邻段错峰毫秒，越大波浪推进越慢 |
| blur | `number` | `8` | 起始模糊像素，解析到 0 时清晰 |
| stepDuration | `number` | `0.5` | 单段从起始到清晰的整体时长（秒），内部分两步 |
| threshold | `number` | `0.3` | 触发动画的视口可见比例（useInView amount），0~1 |

其余 `<p>` 原生属性透传；`onDrag/onDragStart/onDragEnd/onAnimationStart` 因与 motion 签名冲突被剔除。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onAnimationComplete | `() => void` | 末段动画结束回调（整句浮现完成时触发一次） |

## 示例
```tsx
<BlurText text="Isn't this so cool?!" className="text-3xl font-bold text-foreground" />

<BlurText
  text="清晰浮现的瑚琏标题"
  splitType="char"
  direction="bottom"
  className="text-3xl font-bold text-primary"
/>
```

## 禁忌 / 坑

- `text` 只收纯字符串，不能塞 JSX。
- 中文用 `splitType="word"` 会因无空白而整段一次浮现；逐字效果需显式传 `splitType="char"`。
- 进场只触发一次（基于视口可见比例 `threshold`）；反复观察需更换 `key` 强制 remount。
- 尊重 `prefers-reduced-motion`：开启减弱动效时直呈清晰终态。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
