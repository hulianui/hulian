---
slug: snippet
name: Snippet
category: typography
group: code
tags: []
exports: [Snippet]
status: enriched
---

# Snippet

> 代码片段 · 命令提示符 + 一键复制(剪贴板+反馈) · typography/code

## 何时用

展示单行命令/代码片段，前置提示符 + 一键复制，适合安装命令、CLI 指令。多行代码块用 [CodeBlock](../code-block/code-block.md)；纯内联标识文字用 [Code](../code/code.md)。

## 导入
```ts
import { Snippet } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | `ReactNode` | — | 显示内容（字符串或节点） |
| text | `string` | — | 复制到剪贴板的文本；缺省时取 children（仅当为字符串时） |
| symbol | `string ｜ null` | `"$"` | 命令提示符；传 `null` 不显示，适合非命令片段 |
| lang | `string` | — | 语法着色语言（如 `"tsx"`/`"bash"`），仅 children 为字符串时生效 |
| highlight | `boolean` | `true` | 是否语法着色，仅 children 为字符串时生效 |
| className | `string` | — | 容器类名 |

## 示例
```tsx
<Snippet>pnpm add @hulianui/ui</Snippet>

// 非命令片段，去掉提示符
<Snippet symbol={null}>const theme = useTheme()</Snippet>
```

## 禁忌 / 坑

- `text`/`lang`/`highlight` 的着色与复制兜底仅在 `children` 为**字符串**时生效；传入节点时只能手动给 `text` 指定复制内容。

## 相关
[Code](../code/code.md) · [CodeBlock](../code-block/code-block.md) · [CodeDiff](../code-diff/code-diff.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
