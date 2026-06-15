---
slug: heading
name: Heading
category: typography
group: text
tags: []
exports: [Heading]
status: enriched
---

# Heading

> 标题 · 1-6 级语义标签 + size/weight + as 多态(纯皮肤·零依赖·RSC) · typography/text

## 何时用

需要语义标题（自动渲染为 h1–h6）并控制视觉尺寸/字重时用 Heading；支持视觉与语义解耦（如语义是 h2、视觉用 lg），以及用 `as` 把标题样式套到非标题标签上。正文、说明文本用 [Text](../text/text.md)；整段富文本排版用 [Prose](../prose/prose.md)。

## 导入
```ts
import { Heading } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| level | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | 标题级别，决定语义标签 `h{level}` 与默认视觉尺寸 |
| as | `ElementType` | `h{level}` | 覆盖渲染标签（视觉/语义解耦，如 level=1 样式渲染为 div） |
| size | `"xs" \| "sm" \| "base" \| "lg" \| "xl" \| "2xl" \| "3xl" \| "4xl"` | 按 level 派生 | 覆盖视觉尺寸（独立于 level） |
| weight | `"normal" \| "medium" \| "semibold" \| "bold"` | `"semibold"` | 字重 |
| balance | `boolean` | `false` | 启用 text-balance 平衡换行（多行标题更匀称） |

继承 `HTMLAttributes<HTMLHeadingElement>`（已 Omit `color`）。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 标题文本 |

## 示例
```tsx
// 语义标签 + 默认尺寸
<Heading level={1}>一级标题</Heading>

// 视觉/语义解耦：语义 h2，视觉 lg
<Heading level={2} size="lg">语义是 h2，视觉是 lg</Heading>

// 用 div 承载大标题样式 + 平衡换行
<Heading level={1} as="div" balance>大号视觉标题</Heading>
```

## 禁忌 / 坑

暂无已知坑。`level` 同时决定语义标签和默认尺寸——要保留语义标签但改视觉，用 `size` 覆盖，别为了视觉乱改 `level`（会破坏文档大纲）。注意 Heading 无 `size="md"` 档（只有 base，无 md），来自历史踩坑。

## 相关
[Text](../text/text.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
