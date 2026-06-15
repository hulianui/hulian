---
slug: scrambled-text
name: ScrambledText
category: typography
group: text
tags: [animated]
exports: [ScrambledText]
status: enriched
---

# ScrambledText

> 指针靠近文字逐字翻滚乱码再收敛的悬停文字特效 · 半径内越近翻滚越久 + 可自定字符集/速度（零依赖 RAF·reduced-motion） · typography/text · #animated

## 何时用

整段文字想要「指针扫过逐字解码」的悬停互动时用。要的是像素扫描错位的故障质感用 FuzzyText；要平滑入场用 ScrollFloat / Reveal；ScrambledText 适合一段可读正文/小标题，靠鼠标半径触发逐字符乱码翻滚再收敛。

## 导入
```ts
import { ScrambledText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| radius | `number` | `100` | 指针生效半径(px)，落在某字符中心此半径内才触发该字翻滚 |
| duration | `number` | `1.2` | 单字乱码翻滚最长时间(秒)，离指针越近越接近此值 |
| speed | `number` | `0.5` | 翻滚速度(0~1)，越大每帧切换乱码越频繁、收敛越快 |
| scrambleChars | `string` | `".:"` | 乱码随机替换用的字符集，逐字符循环取样 |
| className | `string` | — | 透传根元素额外类名(cn 合并) |
| style | `CSSProperties` | — | 透传根元素内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 要逐字打乱的文本(仅纯文本，内部拆成单字符 span) |

## 示例
```tsx
// 默认：.: 字符集
<ScrambledText>把指针移到这段文字上 — Hover scrambles the glyphs.</ScrambledText>

// 大半径 + 全角符号集
<ScrambledText radius={160} scrambleChars="█▓▒░">
  HULIAN UI · Scramble On Hover
</ScrambledText>
```

## 禁忌 / 坑

- children 仅支持纯文本：内部按字符拆 span，传嵌套元素的结构会被打散。
- 半径基于字符中心：超长段落里离指针远的字几乎不动，这是设计预期而非 bug。
- reduced-motion 下不做翻滚动画，直接显示原文。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
