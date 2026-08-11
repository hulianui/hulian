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
| lang | `string` | — | 右上角语言标签（如 `"tsx"`），同时决定着色规则走 JS 家族、Shell 还是 Python |
| copyable | `boolean` | `true` | 是否显示复制按钮 |
| highlight | `boolean` | `true` | 是否语法着色；关掉则纯文本 |
| lineNumbers | `boolean \| { start?: number }` | `false` | 是否显示行号。`{ start: 120 }` 让片段从指定行号起算；列宽按最大行号的位数自适应 |
| className | `string` | — | 容器类名 |

## 着色支持的语言

| lang | 走哪套规则 |
|------|-----------|
| `js` `jsx` `ts` `tsx` `json` | JS 家族 |
| `bash` `sh` `shell` `zsh` `console` | Shell（命令名与 flag 分色） |
| `py` `python` `python3` | Python（`#` 注释、三引号文档串、`f`/`r`/`b` 前缀串、装饰器、内置名、`0b`/`0o`/`0x`/下划线/虚数字面量） |
| 其它 | 按 JS 家族**近似**处理 |

## 示例
```tsx
<CodeBlock code={`import { Button } from "@hulianui/ui";`} lang="tsx" />

// Shell 走 Shell 着色规则
<CodeBlock code={`pnpm add @hulianui/ui`} lang="bash" />

// Python
<CodeBlock code={`def guess(n: int) -> str:\n    return f"你猜的是 {n}"`} lang="python" />

// 教学 / 文档 / code review：正文要指「第 N 行」时开行号
<CodeBlock code={source} lang="python" lineNumbers />

// 片段从源文件第 120 行截来
<CodeBlock code={snippet} lang="python" lineNumbers={{ start: 120 }} />
```

## 禁忌 / 坑

- **`lang` 传到没有专门分支的语言，是「近似」不是「支持」**。表里三类之外的语言一律按 JS 家族扫描：`yaml` / `toml` / `ini` / `dockerfile` 的 `#` 注释、SQL 的 `--` 注释都不会被当注释，注释正文会被当代码再扫一遍，里面的词还可能被着成 JS 关键字。这类语言要么接受它、要么先传 `highlight={false}` 保证不着错色，需要真正的着色档请来提 issue。
- **行号是装饰，不是内容**。它 `aria-hidden` 且不可选中：屏幕阅读器不念，用户框选整段代码复制时也不会混进 `1 2 3`；复制按钮复制的始终是原始 `code`。反过来说，别把「行号」当成可复制的数据来源。
- **行号列会一直钉在左侧**（`sticky left-0` + 不透明底色）。长行横向滚动时行号不会滑走，代价是滚过去的代码会被行号列遮住一小条——这是刻意的取舍，长行看行号比看那一小条代码重要。
- 复制按钮读的是 `navigator.clipboard`，只在安全上下文（HTTPS / localhost）可用；HTTP 局域网页面里点了不会有反应。

## 相关
[Code](../code/code.md) · [Snippet](../snippet/snippet.md) · [CodeDiff](../code-diff/code-diff.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
