---
slug: stack
name: Stack
category: layout
group: arrange
tags: []
exports: [Stack]
status: enriched
---

# Stack

> 弹性布局 · flex 原语 direction/gap/align/justify/wrap + as 多态(零依赖·RSC) · layout/arrange

## 何时用

把一组子元素按单一主轴（横/纵）排开并统一间距时用 Stack——一维线性排列、需要 gap/对齐/换行控制的场景。需要二维行列对齐（同时控制列数与跨列跨行）改用 [Grid](../grid/grid.md)；只想在两个元素间塞一段定向留白用 [Spacer](../spacer/spacer.md)。

## 导入
```ts
import { Stack } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| direction | `StackDirection \| ResponsiveDirection` | `"column"` | 主轴方向。传字符串=固定；传 `{base,sm,md,lg,xl,2xl}`=按断点响应式 |
| gap | `number` | `0` | 子项间距（× 0.25rem，同 Tailwind spacing 刻度） |
| align | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | — | 交叉轴对齐 |
| justify | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | — | 主轴对齐 |
| wrap | `boolean` | `false` | 是否换行（仅 row 有意义） |
| inline | `boolean` | `false` | 用 inline-flex 而非 flex（随内容收缩、可与文字基线排列） |
| as | `ElementType` | `"div"` | 渲染的元素标签 |

`StackDirection = "row" \| "column"`；其余 `HTMLAttributes<HTMLElement>` 属性（className/style/事件等）透传。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 子元素 |

响应式档位铺满 Tailwind 断点：`base / sm / md / lg / xl / 2xl`。中后台宽屏（≥1280）恰恰最需要在 `xl` 档换布局，档位止于 lg 会逼消费方一半走 prop 一半走 className（hulianui/hulian#61）。例：`direction={{ base: "column", xl: "row" }}`。

## 示例
```tsx
// 横向排列，间距 3
<Stack direction="row" gap={3}>
  <Box>A</Box>
  <Box>B</Box>
  <Box>C</Box>
</Stack>

// 两端对齐
<Stack direction="row" justify="between" className="w-64">
  <Box>左</Box>
  <Box>右</Box>
</Stack>
```

## 禁忌 / 坑

暂无已知坑。`gap` 是 Tailwind 刻度倍数而非像素（`gap={3}` = 0.75rem）；`wrap`/`justify` 仅在 `direction="row"` 下有实际意义。候选坑 multi-card-stack-trace / swiftui-text-css-font-stack 与本组件无关，已剔除。

### `as` 是**类型多态**的

`as="form"` 之后，事件与属性会跟着目标元素走：`onSubmit` 拿到 `FormEvent<HTMLFormElement>`、`as="a"` 能传 `href`。
早先 `as` 不参与推导，`event.currentTarget` 一律退化成 `HTMLElement`，表单专有 API 只能 as-cast——
而 cast 掉的正是类型安全本身（hulianui/hulian#62）。

## 相关
[Grid](../grid/grid.md) · [Spacer](../spacer/spacer.md) · [Divider](../divider/divider.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
