---
slug: snippet
name: Snippet
category: typography
group: code
tags: []
exports: [Snippet, SnippetGroup]
status: enriched
---

# Snippet

> 展示一行命令，带提示符和一键复制 · typography/code

## 何时用

展示单行命令/代码片段，前置提示符 + 一键复制，适合安装命令、CLI 指令。多行代码块用 [CodeBlock](../code-block/code-block.md)；纯内联标识文字用 [Code](../code/code.md)。

## 导入
```ts
import { Snippet, SnippetGroup } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text | `string` | - | 复制到剪贴板的文本；缺省时取 children（仅当为字符串时） |
| symbol | `string ｜ null` | `"$"` | 命令提示符；传 `null` 不显示，适合非命令片段 |
| lang | `string` | - | 语法着色语言（如 `"tsx"`/`"bash"`），仅 children 为字符串时生效 |
| highlight | `boolean` | `true` | 是否语法着色，仅 children 为字符串时生效 |
| copyLabel | `string` | 跟随 locale | 复制按钮无障碍标签；显式传值优先 |
| copiedLabel | `string` | 跟随 locale | 复制成功后的无障碍标签；显式传值优先 |
| muted | `boolean` | `false` | 次要行：沉一档底色、文字转次要灰（「也可以这样」的补充命令、给 AI 读的链接） |
| className | `string` | - | 容器类名 |

**SnippetGroup**（多条命令堆叠在同一张卡里，组画外框与行间分隔线，里面的 Snippet 自动去掉各自的边框 / 底色并铺满一行）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| overlay | `ReactNode` | - | 绝对定位的装饰层（BorderBeam 等），画在分隔线列表之外，不会被当成一行 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 显示内容（字符串或节点） |

## 示例
```tsx
<Snippet>pnpm add @hulianui/ui</Snippet>

// 非命令片段，去掉提示符
<Snippet symbol={null}>const theme = useTheme()</Snippet>

// 一组上手步骤：堆叠在同一张卡里，最后一行是次要行
<SnippetGroup overlay={<BorderBeam size={120} />}>
  <Snippet>pnpm add @hulianui/ui @hulianui/tokens</Snippet>
  <Snippet>npx @hulianui/mcp init-agent</Snippet>
  <Snippet symbol={null} highlight={false} muted>https://hulian.dev/start</Snippet>
</SnippetGroup>
```

## 禁忌 / 坑

- `text`/`lang`/`highlight` 的着色与复制兜底仅在 `children` 为**字符串**时生效；传入节点时只能手动给 `text` 指定复制内容。
- 默认复制标签跟随 `ConfigProvider locale`；无 Provider 时保持“复制 / 已复制”，`enUS` 为 “Copy / Copied”。
- 宽度不会超过父容器：不带空格的长串（URL、token）装不下时会在任意位置折行。0.74.1 及以前它不折行，会把 Snippet 连同父级一起撑出视口。

## 相关
[Code](../code/code.md) · [CodeBlock](../code-block/code-block.md) · [CodeDiff](../code-diff/code-diff.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
