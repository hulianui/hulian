---
slug: code-diff
name: CodeDiff
category: typography
group: code
tags: []
exports: [CodeDiff, diffLines, diffStat]
status: enriched
---

# CodeDiff

> 按行展示代码增删，可单栏也可左右双栏对照 · typography/code

## 何时用

展示两段文本的行级差异（PR 评审、agent 改动回放、配置变更对比），增绿删红、双行号、可挂行级批注。只展示静态代码用 [CodeBlock](../code-block/code-block.md)；单行命令用 [Snippet](../snippet/snippet.md)。`diffLines`/`diffStat` 是纯函数，可单独用于自定义渲染或统计。

## 导入
```ts
import { CodeDiff, diffLines, diffStat } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| oldText* | `string` | - | 旧文本 |
| newText* | `string` | - | 新文本 |
| mode | `"unified" ｜ "split"` | `"unified"` | unified 单栏 / split 双栏对照 |
| filename | `string` | - | 头部文件名条；省略则不渲染头部 |
| showLineNumbers | `boolean` | `true` | 显示行号槽 |
| annotations | `CodeDiffAnnotation[]` | - | 行锚定批注：在匹配行渲染 gutter 标记 + 行下方插入整宽 content 槽（仅 unified 模式插 content） |
| className | `string` | - | 容器类名 |

`CodeDiffAnnotation`：`{ side?: "old"｜"new"（默认 "new"）; line: number（1-based）; gutter?: ReactNode; content?: ReactNode }`。

## 示例
```tsx
<CodeDiff filename="greet.ts" oldText={OLD} newText={NEW} />

// 双栏对照
<CodeDiff mode="split" filename="greet.ts" oldText={OLD} newText={NEW} />
```

## 禁忌 / 坑

- `annotations` 的 `content` 槽**仅在 unified 模式**插入；split 模式只渲染 gutter 标记。需要在差异行下方挂 CodeReviewThread 等内容时用 `mode="unified"`。
- `annotations[].line` 是 1-based 行号，按 `side` 对应旧文件或新文件，别和数组下标混淆。

## 相关
[Code](../code/code.md) · [CodeBlock](../code-block/code-block.md) · [Snippet](../snippet/snippet.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
