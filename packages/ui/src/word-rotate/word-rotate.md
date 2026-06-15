---
slug: word-rotate
name: WordRotate
category: typography
group: text
tags: [animated]
exports: [WordRotate]
status: enriched
---

# WordRotate

> 轮换词 · motion 进出场 + reduced-motion · typography/text · #animated

## 何时用

在一句固定文案里循环切换若干词（"让开发 更快/更稳/更美"），用 motion 进出场动画。要逐字打字效果用 [TypingAnimation](../typing-animation/typing-animation.md)；静态文本用 [Text](../text/text.md)。本组件是客户端组件（用 motion + state），源文件已含 `"use client"`。

## 导入
```ts
import { WordRotate } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| words* | `string[]` | — | 轮换的词数组 |
| duration | `number` | `2500` | 每词停留毫秒 |

继承 `ComponentPropsWithoutRef<"span">`（除 `children` 及 motion 冲突的 `onDrag`/`onDragStart`/`onDragEnd`/`onAnimationStart`），如 `className` / `style`。

## 示例
```tsx
<div className="text-3xl font-bold text-foreground">
  让开发 <WordRotate words={["更快", "更稳", "更美", "瑚琏"]} className="text-primary" />
</div>
```

## 禁忌 / 坑

- 透传给 `motion.span`，故公开类型剔除了 `onDrag`/`onDragStart`/`onDragEnd`/`onAnimationStart`（motion 12 把它们重定义为手势/动画签名，与 DOM 同名 handler 冲突）——别尝试传这几个。
- 客户端组件，不能在纯 RSC 边界直接当 server 组件用；放进 server 页时它本身带 `"use client"` 可正常作为子组件渲染。
- 尊重 `prefers-reduced-motion`，用户开启减弱动效时进出场会退化。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
