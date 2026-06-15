---
slug: scroll-reveal
name: ScrollReveal
category: typography
group: text
tags: [animated]
exports: [ScrollReveal]
status: enriched
---

# ScrollReveal

> 滚动显影 · 整段随容器滚过视口逐词 opacity+blur 解析(motion useScroll/useTransform · 每词独立进度区间 · reduced-motion 直呈可读) · typography/text · #animated

## 何时用

长文段落随页面滚动进度逐词从模糊/低透明度解析到清晰，营造「读到哪亮到哪」的阅读节奏。要进场一次性逐词淡入（不绑滚动进度）用 [SplitText](../split-text/split-text.md)；要进场一次性模糊解析用 [BlurText](../blur-text/blur-text.md)；普通静态段落用 [Prose](../prose/prose.md)。

## 导入
```ts
import { ScrollReveal } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| baseOpacity | `number` | `0.12` | 静息（未滚入解析区间）时每词的基础透明度，0~1；越小入场对比越强 |
| baseRotation | `number` | `3` | 整段进入时的初始旋转角（deg），随进度回正到 0；设 0 关闭 |
| enableBlur | `boolean` | `true` | 是否伴随模糊解析：未揭示词带模糊随进度消散 |
| blurStrength | `number` | `4` | `enableBlur` 为真时词的起始模糊半径（px），随进度降到 0 |

其余 `<p>` 原生属性透传；`onDrag/onDragStart/onDragEnd/onAnimationStart` 因与 motion 签名冲突被剔除。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children * | `string` | 要随滚动逐词显影的整段文本，仅字符串（内部按空白拆词并保留分隔符） |

## 示例
```tsx
<ScrollReveal className="text-xl font-semibold">
  When you scroll this block the words resolve from blur to focus one by one.
</ScrollReveal>

<ScrollReveal enableBlur={false} baseRotation={6} className="text-xl font-semibold">
  纯透明度与旋转 适合追求克制质感的标题段落
</ScrollReveal>
```

## 禁忌 / 坑

- 效果由滚动进度驱动：组件必须处在可滚动上下文里、上下留出滚动空间才能看到逐词显影；放在不滚动的容器里只会停在静息态。
- `children` 只收纯字符串，不能塞 JSX。
- 尊重 `prefers-reduced-motion`：开启减弱动效时直呈完全可读（不模糊不变透明）。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
