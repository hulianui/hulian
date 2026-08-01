---
slug: markdown
name: Markdown
category: typography
group: text
tags: []
exports: [Markdown, parseBlocks]
status: enriched
---

# Markdown

> Markdown 渲染 · 只读，零依赖块级解析(标题/代码块/列表/引用/行内粗斜码链) · 套 Prose 排版 + 围栏代码块委托 CodeBlock · 区别 MarkdownEditor 可编辑 · RSC 安全 · typography/text

## 何时用

把一段 Markdown 源字符串只读渲染成排版好的富文本（标题/围栏代码块/列表/引用/行内粗斜码链）。需要可编辑用 [MarkdownEditor]；已经是 HTML/JSX 而非 Markdown 源用 [Prose](../prose/prose.md) 直接包裹；单段原子文本用 [Text](../text/text.md)。`parseBlocks` 导出供需要拿块级 AST 自定义渲染的场景。

## 导入
```ts
import { Markdown, parseBlocks } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" \| "base"` | `"base"` | 排版尺寸基准，透传给内部 Prose |
| className | `string` | — | 透传容器类名 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `string` | Markdown 源文本（只读渲染；编辑用 MarkdownEditor） |

## 示例
```tsx
<div className="max-w-2xl">
  <Markdown>{`## 快速排序

\`\`\`js
function quickSort(arr) { /* ... */ }
\`\`\`

平均复杂度 **O(n log n)**，行内 \`代码\` 与[外链](https://mdn.io)正常渲染。

> 引用块整体排版吃 Prose 语义 token。`}</Markdown>
</div>
```

## 禁忌 / 坑

- 零依赖块级解析输出 JSX（非 `dangerouslySetInnerHTML`/`innerHTML`），不走原生 HTML sink，故无 [[dompurify-vhtml-markdown-sanitize]] 那类存储型 XSS 风险；但若后续改造成「直接注入 HTML」或扩展支持原始 HTML 标签，必须经 DOMPurify 等清洗后再渲染，不要把不可信源直接喂进 innerHTML。
- 只读组件，不接受编辑回调；需要双向编辑改用 MarkdownEditor。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
