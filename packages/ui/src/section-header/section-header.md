---
slug: section-header
name: SectionHeader
category: typography
group: text
tags: []
exports: [SectionHeader]
status: enriched
---

# SectionHeader

> 区块开头的一组标题：小字栏目名、大标题、主色强调半句和导语 · typography/text

## 何时用

营销页、文档首页每个区块开头那一组：eyebrow 小字（栏目名）+ 分节大标题（后半句主色强调）+ 一段导语。中后台页面顶部的标题栏（返回、面包屑、操作按钮）用 [PageHeader](../page-header/page-header.md)；只要一个标题用 [Heading](../heading/heading.md)。

## 导入
```ts
import { SectionHeader } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title* | `ReactNode` | - | 标题 |
| eyebrow | `ReactNode` | - | 标题上方的一行小字（栏目名），主色 |
| accent | `ReactNode` | - | 标题后半句，主色强调 |
| accentBreak | `"always" \| "mobile" \| "space" \| "none"` | `"always"` | 标题与 `accent` 怎么接：`always` 总是换行；`mobile` 只在窄屏换行；`space` 同一行空一格（英文）；`none` 直接相连（中文） |
| description | `ReactNode` | - | 标题下方的导语，次要灰，最宽约 42rem |
| align | `"start" \| "center"` | `"start"` | 对齐；`center` 时导语也水平居中 |
| level | `2 \| 3 \| 4` | `2` | 标题语义层级；视觉尺寸固定为分节标题一档（窄屏 30px、sm 起 36px） |

> 继承 `<div>` 原生属性（`className` 落在外层容器上，给宽度 / 外边距用）。

## 示例
```tsx
<SectionHeader
  eyebrow="产品"
  title="从一个按钮，"
  accent="到一整个后台"
  accentBreak="mobile"
  description="四层粒度、一套设计语言，按需复制。"
/>

// 居中的收尾段
<SectionHeader align="center" title="现在开始，" accent="做好看又好用的软件" accentBreak="none" />

// 英文：同一行空一格
<SectionHeader eyebrow="In production" title="Built natively" accent="on Hulian UI" accentBreak="space" />
```

## 禁忌 / 坑

- 中文标题要连着读时用 `accentBreak="none"`，英文用 `"space"`；默认 `"always"` 会在两半之间换行。
- 标点归前半句（`title="从一个按钮，"`）：`mobile` 换行发生在 `accent` 之前，标点放进 `accent` 会在窄屏落到行首。

## 相关
[Heading](../heading/heading.md) · [PageHeader](../page-header/page-header.md) · [Text](../text/text.md)
