---
slug: code
name: Code
category: typography
group: code
tags: []
exports: [Code, codeVariants]
status: enriched
---

# Code

> 行内代码 · <code> 等宽皮肤 + tone(default/primary/danger) + RSC · typography/code

## 何时用

正文中嵌入行内代码片段（命令、标识符、路径），等宽皮肤 + tone 着色，可在 RSC 直接渲染。多行/带语法高亮的代码块用 [CodeBlock](../code-block/code-block.md)；带复制按钮的命令片段用 [Snippet](../snippet/snippet.md)；展示键盘按键用 [Kbd](../kbd/kbd.md)。

## 导入
```ts
import { Code, codeVariants } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| tone | `"default" \| "primary" \| "danger"` | `"default"` | 配色语气：默认 / 主色（强调）/ 危险（破坏性命令） |
| children | `ReactNode` | — | 代码内容 |

其余 `<code>`（HTMLElement）原生属性透传。`codeVariants` 为 CVA 样式函数，可在自定义元素上复用皮肤类名。

## 示例
```tsx
<span className="text-sm text-foreground">运行 <Code>pnpm install</Code> 安装依赖</span>

<Code tone="danger">rm -rf</Code>
```

## 禁忌 / 坑

暂无已知坑。

## 相关
[CodeBlock](../code-block/code-block.md) · [Snippet](../snippet/snippet.md) · [CodeDiff](../code-diff/code-diff.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
