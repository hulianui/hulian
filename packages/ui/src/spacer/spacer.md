---
slug: spacer
name: Spacer
category: layout
group: arrange
tags: []
exports: [Spacer]
status: enriched
---

# Spacer

> 在布局中插入一段纯粹的空白间距 · layout/arrange

## 何时用

在两个相邻元素之间塞一段固定的定向留白（水平/垂直）时用 Spacer，自带 `aria-hidden` 不进无障碍树。若是给一整组子项统一加间距，优先用 [Stack](../stack/stack.md)/[Grid](../grid/grid.md) 的 `gap`（无需逐个插 Spacer）；需要可见分隔线用 [Divider](../divider/divider.md)/[Separator](../separator/separator.md)。

## 导入
```ts
import { Spacer } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| x | `number` | - | 水平间距（× 0.25rem，同 Tailwind spacing 刻度） |
| y | `number` | - | 垂直间距（× 0.25rem） |
| className | `string` | - | 额外类名 |

## 示例
```tsx
// 横向留白
<span className="inline-flex items-center">
  <Box>A</Box>
  <Spacer x={8} />
  <Box>B</Box>
</span>

// 纵向留白
<span className="inline-flex flex-col">
  <Box>上</Box>
  <Spacer y={6} />
  <Box>下</Box>
</span>
```

## 禁忌 / 坑

暂无已知坑。`x`/`y` 是 Tailwind 刻度倍数（`x={8}` = 2rem）。容器为 flex 行时用 `x`、为 flex 列时用 `y`；方向与父容器主轴不匹配时留白不会生效。

## 相关
[Stack](../stack/stack.md) · [Grid](../grid/grid.md) · [Divider](../divider/divider.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
