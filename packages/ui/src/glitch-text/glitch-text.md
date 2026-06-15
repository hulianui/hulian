---
slug: glitch-text
name: GlitchText
category: typography
group: text
tags: [animated]
exports: [GlitchText]
status: enriched
---

# GlitchText

> 故障撕裂 · 双伪元素 RGB 错位 + clip-path 切片抖动(纯 CSS 零依赖 RSC · 撕裂色吃 chart token · enableOnHover 门控 · motion-reduce 退普通文本) · typography/text · #animated

## 何时用

赛博朋克/科技感标题做 RGB 错位+切片抖动的故障撕裂效果，纯 CSS 零依赖、可在 RSC 直接渲染。要做乱码逐位解码用 [DecryptedText](../decrypted-text/decrypted-text.md)；要做模糊对焦用 [BlurText](../blur-text/blur-text.md)；普通静态标题用 [Heading](../heading/heading.md)。

## 导入
```ts
import { GlitchText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children * | `string` | — | 要做撕裂故障效果的文本，必须是纯字符串（供伪元素 `attr(data-text)` 复制） |
| speed | `number` | `2.5` | 撕裂周期秒数，越小越狂躁 |
| enableOnHover | `boolean` | `false` | 仅悬停时故障，静息为普通文本；默认常驻故障 |

其余 `<span>` 原生属性透传。

## 示例
```tsx
<GlitchText className="text-4xl font-extrabold tracking-tight">HULIAN</GlitchText>

<GlitchText enableOnHover className="text-4xl font-extrabold tracking-tight">
  GLITCH
</GlitchText>
```

## 禁忌 / 坑

- `children` 必须是纯字符串：伪元素靠 `attr(data-text)` 复制文本制造错位层，传入 JSX/元素会让撕裂层为空。
- 撕裂色吃 chart token（`var(--color-chart-*)`），随主题切换；自定义颜色须带 `--color-` 前缀或合法 CSS 颜色，裸 `var(--primary)` 在本 Tailwind v4 设定下不解析。
- 尊重 `prefers-reduced-motion`：开启减弱动效时退化为普通文本、不抖动。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
