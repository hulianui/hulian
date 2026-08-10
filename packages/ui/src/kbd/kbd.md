---
slug: kbd
name: Kbd
category: typography
group: code
tags: []
exports: [Kbd]
status: enriched
---

# Kbd

> 按键 · <kbd> 等宽皮肤 + 组合键并排 + RSC · typography/code

## 何时用

标注单个键位/快捷键（`Esc`、`⌘`、`K`），等宽键帽皮肤。组合键由多个 Kbd 并排手动组合（见示例）。它是 RSC，可在服务端组件直接用。展示代码片段用 [CodeBlock](../code-block/code-block.md)/[Snippet](../snippet/snippet.md)。

## 导入
```ts
import { Kbd } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| ...HTMLAttributes | `HTMLAttributes<HTMLElement>` | — | 透传 `<kbd>` 原生属性（className、style 等） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 键位内容 |

## 示例
```tsx
<Kbd>Esc</Kbd>

// 组合键：多个 Kbd 并排
<span className="inline-flex items-center gap-1">
  <Kbd>⌘</Kbd>
  <span className="text-muted-foreground">+</span>
  <Kbd>K</Kbd>
</span>
```

## 禁忌 / 坑

- 单个 Kbd 只渲染一个键帽，组合键需自行用多个 Kbd 并排拼装，组件不内置 `+` 分隔。

## 相关
[Code](../code/code.md) · [CodeBlock](../code-block/code-block.md) · [Snippet](../snippet/snippet.md) · [CodeDiff](../code-diff/code-diff.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
