---
slug: code-block
name: CodeBlock
category: typography
group: code
tags: []
exports: [CodeBlock, HighlightedCode, tokenizeCode, type CodeToken, type CodeTokenType]
status: enriched
---

# CodeBlock

> 代码块 · 多行 <pre> + 一键复制(剪贴板+反馈) + 可选语言标签 · typography/code

## 何时用

展示多行代码片段，自带语法着色、右上角语言标签与一键复制。单行命令/内联标识用 [Snippet](../snippet/snippet.md)；只是一段内联 `code` 文字用 [Code](../code/code.md)；展示前后差异用 [CodeDiff](../code-diff/code-diff.md)。

## 导入
```ts
import { CodeBlock, HighlightedCode, tokenizeCode, type CodeToken, type CodeTokenType } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| code* | `string` | — | 代码文本，多行用 `\n` |
| lang | `string` | — | 右上角语言标签（如 `"tsx"`），同时决定着色规则走 JS 家族还是 Shell |
| copyable | `boolean` | `true` | 是否显示复制按钮 |
| highlight | `boolean` | `true` | 是否语法着色；关掉则纯文本 |
| className | `string` | — | 容器类名 |

## 示例
```tsx
<CodeBlock code={`import { Button } from "@hulianui/ui";`} lang="tsx" />

// Shell 走 Shell 着色规则
<CodeBlock code={`pnpm add @hulianui/ui`} lang="bash" />
```

## 禁忌 / 坑

暂无已知坑。

## 相关
[Code](../code/code.md) · [Snippet](../snippet/snippet.md) · [CodeDiff](../code-diff/code-diff.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
