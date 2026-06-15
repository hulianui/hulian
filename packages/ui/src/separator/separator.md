---
slug: separator
name: Separator
category: layout
group: arrange
tags: []
exports: [Separator]
status: enriched
---

# Separator

> 分隔线 · Base UI role=separator + 横/竖几何 · layout/arrange

## 何时用

需要一条带 ARIA `role="separator"` 语义的纯几何分隔线（横线或竖线）时用 Separator——结构性分组、菜单/列表分段。要在分隔线里嵌文字、虚线或左右偏移文字标题则用 [Divider](../divider/divider.md)。

## 导入
```ts
import { Separator } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | 水平（h-px 横线）/ 垂直（w-px 竖线，需父容器有高度） |
| className | `string` | — | 额外类名 |

## 示例
```tsx
// 水平分隔
<p>瑚琏设计系统</p>
<Separator className="my-3" />
<p>吸取式聚合组件库</p>

// 垂直分隔（父容器须有高度）
<div className="flex h-6 items-center gap-3">
  <span>文档</span>
  <Separator orientation="vertical" />
  <span>组件</span>
</div>
```

## 禁忌 / 坑

暂无已知坑。`orientation="vertical"` 的竖线靠 `w-px` + 高度撑开，父容器必须有确定高度（如 flex 行 `h-6`），否则竖线高度为 0 不可见。

## 相关
[Stack](../stack/stack.md) · [Grid](../grid/grid.md) · [Spacer](../spacer/spacer.md) · [Divider](../divider/divider.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
