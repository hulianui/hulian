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
| scrollableTables | `boolean` | `false` | 宽表兜底：把 `table` 自身变成横向滚动容器，列多时不撑破版心（表头随之不换行）。代价是表格宽度改为按内容撑开、不再恒占满版心 |

继承 `HTMLAttributes<HTMLElement>`（`className` / `style` 等）。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 富文本内容（HTML/JSX） |

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

折叠块（GFM 的 `<details>`/`<summary>`，markdown 产物直接吃排版，无需额外包装）：
```tsx
<Prose>
  <details open>
    <summary>展开看答案</summary>
    <p>生成器表达式只在迭代时逐个产出，不会把整份数据读进内存。</p>
    <details>
      <summary>展开看报错怎么读</summary>
      <p>嵌套折叠块落弱背景，与外层的 surface 拉开一档。</p>
    </details>
  </details>
</Prose>
```

宽表（列多时在表格内部横向滚动，不撑破版心）：
```tsx
<Prose scrollableTables>{/* 六列以上的宽表 */}</Prose>
```

## 禁忌 / 坑

- `scrollableTables` 会把 `table` 改成 `display: block` 并给表头加 `whitespace-nowrap`。表头不换行不是修饰而是**滚动成立的前提**：只加 `overflow-x-auto` 的话浏览器会把每列压到 min-content（中文一列一字、行高翻几倍），内容永远不超出滚动容器，于是根本不滚——看上去像是字号或断点没调好。正文单元格保持换行：一条不换行的长描述会把表拖宽到别的列滚不到。
- `scrollableTables` 开启后表格宽度按内容撑开、不再恒占满版心（窄表会缩到内容宽）。只有在真的会溢出的宽表上开。
- `scrollableTables` 存在的理由只对 **HTML 字符串形态**成立：内容经 `dangerouslySetInnerHTML` 塞进来时，Prose 拿不到表格节点、包不了滚动容器，只能在 `table` 自身上开一档。如果内容是 **children（JSX 子节点）**，更推荐自己把那张宽表包进一层 `overflow-x-auto` 容器——可以只作用于确实会溢出的那一张表，也不必牺牲其余表格的满宽。
- 见 [[chat-bubble-max-w-prose-overflows-narrow-column]]：`max-w-prose`（65ch≈398px）是绝对值、不感知父容器可用宽度，放进移动端窄 flex 列会横向溢出/裁切。约束宽度用 `max-w-[min(65ch,100%)]`，且父链 flex 项加 `min-w-0`；不要叠 `max-w-prose max-w-full`（同属性二选一由 CSS 顺序决定不可靠）。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
