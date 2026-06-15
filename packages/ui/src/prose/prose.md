---
slug: prose
name: Prose
category: typography
group: text
tags: []
exports: [Prose]
status: enriched
---

# Prose

> 排版容器 · 富文本/markdown 后代选择器统一吃语义 token(纯皮肤·零依赖·RSC) · typography/text

## 何时用

包裹一段渲染好的富文本（markdown→HTML、MDX 输出或手写 JSX），用后代选择器把标题/段落/列表/链接/行内代码/引用统一接管为一致阅读排版、自动适配明暗主题。内容已是 Markdown 源字符串时用 [Markdown](../markdown/markdown.md)（它内部就套 Prose）；单段/单个标题等原子文本用 [Text](../text/text.md) / [Heading](../heading/heading.md)，不要为一句话套 Prose。

## 导入
```ts
import { Prose } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| as | `ElementType` | `"article"` | 渲染的容器标签 |
| size | `"sm" \| "base"` | `"base"` | 整体排版尺寸基准；`sm` 把基准字号降到 text-sm，适合侧栏/卡片内长文 |
| children | `ReactNode` | — | 富文本内容（HTML/JSX） |

继承 `HTMLAttributes<HTMLElement>`（`className` / `style` 等）。

## 示例
```tsx
<Prose className="max-w-2xl">
  <h1>瑚琏排版容器 Prose</h1>
  <p>把渲染好的富文本统一接管为一致阅读排版，<a href="#">链接</a> 与 <code>行内代码</code> 全吃语义 token。</p>
  <blockquote>排版即沉默的设计——容器统一规则，内容只管语义。</blockquote>
</Prose>
```

紧凑场景：
```tsx
<Prose size="sm" className="max-w-2xl">{/* 侧栏说明、卡片内富文本 */}</Prose>
```

## 禁忌 / 坑

- 见 [[chat-bubble-max-w-prose-overflows-narrow-column]]：`max-w-prose`（65ch≈398px）是绝对值、不感知父容器可用宽度，放进移动端窄 flex 列会横向溢出/裁切。约束宽度用 `max-w-[min(65ch,100%)]`，且父链 flex 项加 `min-w-0`；不要叠 `max-w-prose max-w-full`（同属性二选一由 CSS 顺序决定不可靠）。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
