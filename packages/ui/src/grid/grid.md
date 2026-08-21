---
slug: grid
name: Grid
category: layout
group: arrange
tags: []
exports: [Grid, GridItem]
status: enriched
---

# Grid

> 按栅格排列内容，子项可跨列跨行 · layout/arrange

## 何时用

需要二维行列对齐——固定列数、卡片网格、跨列跨行的局部布局时用 Grid，配 GridItem 控制单元的 `colSpan`/`rowSpan`。只需单轴线性排列（一行或一列）用 [Stack](../stack/stack.md) 更轻；只想插入定向留白用 [Spacer](../spacer/spacer.md)。

## 导入
```ts
import { Grid, GridItem } from "@hulianui/ui"
```

## Props

### Grid

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| cols | `number \| ResponsiveCols` | `1` | 列数。数字=固定列数（任意值，走 inline style）；`{base,sm,md,lg,xl,2xl}`=响应式（静态类） |
| rows | `number` | - | 行数（不填则按内容自动） |
| gap | `number` | `0` | 行列间距（× 0.25rem） |
| colGap | `number` | - | 列间距，覆盖 gap（× 0.25rem） |
| rowGap | `number` | - | 行间距，覆盖 gap（× 0.25rem） |
| inline | `boolean` | `false` | 用 inline-grid 而非 grid |
| as | `ElementType` | `"div"` | 渲染的元素标签 |

### GridItem

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colSpan | `number` | - | 跨列数 |
| rowSpan | `number` | - | 跨行数 |
| as | `ElementType` | `"div"` | 渲染的元素标签 |

两者其余 `HTMLAttributes<HTMLElement>` 属性透传。

## Slots

### Grid

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 子元素 |

### GridItem

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 子元素 |

响应式档位铺满 Tailwind 断点：`base / sm / md / lg / xl / 2xl`。中后台宽屏（≥1280）恰恰最需要在 `xl` 档换布局，档位止于 lg 会逼消费方一半走 prop 一半走 className（hulianui/hulian#61）。例：`cols={{ base: 1, xl: 4, "2xl": 6 }}`。

## 示例
```tsx
// 3 列等宽网格
<Grid cols={3} gap={3} className="w-72">
  {["1", "2", "3", "4", "5", "6"].map((n) => <Box key={n}>{n}</Box>)}
</Grid>

// 跨列
<Grid cols={3} gap={3}>
  <GridItem colSpan={2}><Box>跨 2 列</Box></GridItem>
  <Box>3</Box>
</Grid>
```

## 禁忌 / 坑

暂无已知坑。`cols` 传数字走 inline style 支持任意列数；传 `{base,sm,md,lg,xl,2xl}` 才走静态响应式类。候选坑 body-grid-place-items-center / grid-card-button-tail-row / nested-collapsible-css-grid-rows 均针对各自具体布局场景，与本通用栅格原语无直接关系，已剔除。

### `as` 是**类型多态**的

`as="ul"` 之后，事件与属性会跟着目标元素走：`onSubmit` 拿到 `FormEvent<HTMLFormElement>`、`as="a"` 能传 `href`。
早先 `as` 不参与推导，`event.currentTarget` 一律退化成 `HTMLElement`，表单专有 API 只能 as-cast——
而 cast 掉的正是类型安全本身（hulianui/hulian#62）。

## 相关
[Stack](../stack/stack.md) · [Spacer](../spacer/spacer.md) · [Divider](../divider/divider.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
