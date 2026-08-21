---
slug: divider
name: Divider
category: layout
group: arrange
tags: []
exports: [Divider]
status: enriched
---

# Divider

> 用一条分隔线把内容切开，线上可以带文字 · layout/arrange

## 何时用

需要在分隔线中嵌入文字标题（如「最近更新」「更多」），或要虚线样式、行内竖线时用 Divider。纯几何分隔、无文字、要 ARIA `role="separator"` 语义则用 [Separator](../separator/separator.md)——二者互补：Divider 偏内容装饰，Separator 偏结构语义。

## 导入
```ts
import { Divider } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| type | `"horizontal" \| "vertical"` | `"horizontal"` | 方向。vertical 为行内分隔（嵌在一行文本/元素之间） |
| orientation | `"left" \| "center" \| "right"` | `"center"` | 嵌入文字的水平位置（仅 horizontal + 有文字时生效） |
| dashed | `boolean` | `false` | 虚线 |
| plain | `boolean` | `false` | 文字常规字重（默认加粗一档） |
| className | `string` | - | 额外类名 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 嵌入分隔线中的文字；不传则为纯分隔线 |

## 示例
```tsx
// 纯分隔线
<p>上段内容</p>
<Divider />
<p>下段内容</p>

// 带文字 + 偏左
<Divider orientation="left">最近更新</Divider>

// 行内竖线
<div className="flex items-center">
  <span>文档</span>
  <Divider type="vertical" />
  <span>组件</span>
</div>
```

## 禁忌 / 坑

暂无已知坑。`orientation` 仅在 `type="horizontal"` 且有 children 时生效；`type="vertical"` 用作行内竖线，需放在 flex 行内且依赖父级行高。

## 相关
[Stack](../stack/stack.md) · [Grid](../grid/grid.md) · [Spacer](../spacer/spacer.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
