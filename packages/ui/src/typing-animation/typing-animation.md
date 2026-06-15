---
slug: typing-animation
name: TypingAnimation
category: typography
group: text
tags: [animated]
exports: [TypingAnimation]
status: enriched
---

# TypingAnimation

> 打字机 · 逐字 + 闪烁光标 + 进入视口触发 · typography/text · #animated

## 何时用

逐字"打"出一段文本，带闪烁光标，默认进入视口才开始（适合首屏标语 / hero 文案）。要在固定句式里循环换词用 [WordRotate](../word-rotate/word-rotate.md)；静态文本用 [Text](../text/text.md)。客户端组件（用 state + IntersectionObserver），源文件已含 `"use client"`。

## 导入
```ts
import { TypingAnimation } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text* | `string` | — | 要逐字打出的文本 |
| duration | `number` | `80` | 每字毫秒 |
| delay | `number` | `0` | 开始前延迟毫秒 |
| startOnView | `boolean` | `true` | 进入视口才开始；设 `false` 立即开始 |
| showCursor | `boolean` | `true` | 显示闪烁光标 |

继承 `ComponentPropsWithoutRef<"span">`（除 `children`），如 `className` / `style`。

## 示例
```tsx
<TypingAnimation
  text="瑚琏 Hulian — 吸取式聚合设计系统"
  className="text-2xl font-semibold text-foreground"
/>
```

立即开始（不等进入视口，常用于已在首屏内）：
```tsx
<TypingAnimation text="瑚琏 Hulian" startOnView={false} duration={60} />
```

## 禁忌 / 坑

- `startOnView` 默认 `true`：若组件初始就在视口外且页面不滚动（如截图/headless 验收），打字永不触发、看似空白——验收/首屏内场景显式传 `startOnView={false}`。
- 客户端组件，含 `"use client"`；可作为子组件嵌进 server 页，但不能当纯 RSC 用。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
