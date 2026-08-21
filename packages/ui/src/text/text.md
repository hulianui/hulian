---
slug: text
name: Text
category: typography
group: text
tags: []
exports: [Text]
status: enriched
---

# Text

> 统一正文的字号、字重、语义色和截断方式 · typography/text

## 何时用

正文、辅助说明、行内文本——需要统一字号/语义色调/字重并支持单行省略或多行截断时用 Text。标题层级（h1-h6 语义 + 标题尺寸）用 [Heading](../heading/heading.md)；整段富文本/Markdown 排版用 [Prose](../prose/prose.md)。

## 导入
```ts
import { Text } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| as | `ElementType` | `"p"` | 渲染的元素标签 |
| size | `"xs" \| "sm" \| "base" \| "lg" \| "xl"` | `"base"` | 字号 |
| tone | `"default" \| "muted" \| "primary" \| "success" \| "warning" \| "danger"` | `"default"` | 语义色调（明暗自适配） |
| weight | `"normal" \| "medium" \| "semibold" \| "bold"` | `"normal"` | 字重 |
| truncate | `boolean` | `false` | 单行省略号截断 |
| lineClamp | `number` | - | 多行截断（最多 n 行后省略号）；设置后优先于 truncate |

继承 `HTMLAttributes<HTMLElement>`（已 Omit `color`，色调走 tone）。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 文本内容 |

## 示例
```tsx
// 语义色调
<Text tone="muted">辅助说明</Text>
<Text tone="success">3/3 分 · 判分正确</Text>
<Text tone="warning">掌握率偏低</Text>
<Text tone="danger">危险提示</Text>

// 多行截断
<div className="max-w-xs">
  <Text lineClamp={2}>{longText}</Text>
</div>
```

## 禁忌 / 坑

暂无已知坑。`truncate`（单行省略）依赖容器有确定宽度才会触发；`lineClamp` 与 `truncate` 同设时 `lineClamp` 优先。候选坑列表（bff-refresh/cjk-tokenizer/menubar/pdf/regex/sliding-pill/swiftui 各项）均与本纯皮肤文本组件无关，已剔除。

## 相关
[Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
