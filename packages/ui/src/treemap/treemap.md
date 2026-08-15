---
slug: treemap
name: Treemap
category: data-display
group: collection
tags: []
exports: [Treemap, treemapLabelFit]
status: enriched
---

# Treemap

> 矩形树图 · 一组扁平数据按 value 占面积铺满矩形，「谁占大头」一眼可见 · recharts squarify 引擎 + chart token 皮肤 · 格内文字按格子尺寸自动取舍(放不下就不画·treemapLabelFit 纯函数带单测) + onItemClick 钻取 + valueFormat 统管格内与 tooltip · 单层不下钻 · data-display/collection

## 何时用

一组同类项要看「占比分布」时用：50 家门店按会员数、各渠道按销售额、各错误类型按发生次数。读者要的是**一眼看出谁占大头**，而不是精确读数。

需要精确比较相邻两项、或要按顺序逐条阅读时用 [BarChart](../chart/chart.md) 的 `horizontal`（横向条形列表）——树图的面积差在相邻项之间是读不准的。只有三五项、且要强调「合计 100%」时用 [PieChart](../chart/chart.md)。

## 导入
```ts
import { Treemap } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data* | `TreemapDatum[]` | — | 扁平数据（单层）`{ name, value, color? }`；面积按 `value` 占总量的比例分配 |
| height | `number` | `280` | 组件总高（SSR 安全：宽走 ResponsiveContainer，高需显式值） |
| showValue | `boolean` | `false` | 格子里是否在名字下面加一行数值 |
| valueFormat | `(value: number) => string` | `String` | 数值显示格式，**同时作用于格内文字与 tooltip**（避免两处各写一套） |
| onItemClick | `(info: { datum, index }) => void` | — | 点中某一格时回调（钻取：点门店进该店会员列表）。只在格子上触发，点留白不触发 |
| className | `string` | — | 透传类名（宽度在此设） |

### TreemapDatum

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| name* | `string` | — | 格内显示的名字，也是 tooltip 的标题 |
| value* | `number` | — | 决定面积的值 |
| color | `string` | 按 index 取 `chart-N` | 格子色；可传语义色名（`"success"` 等）或任意 CSS 颜色 |

## 示例
```tsx
<Treemap
  data={[
    { name: "杭州湖滨店", value: 3820 },
    { name: "上海南京西路店", value: 3140 },
    { name: "苏州观前街店", value: 2470 },
  ]}
  showValue
  valueFormat={(v) => `${(v / 10000).toFixed(2)} 万`}
  onItemClick={({ datum }) => router.push(`/members?store=${datum.name}`)}
/>
```

## 禁忌 / 坑

- **长尾项的名字会不画出来，这是设计不是 bug。** 格子大小由数据决定，占比小的那批必然小到放不下任何字；放不下还硬画得到的是一片互相压叠的碎字（SVG 的 `text` 不会被 `rect` 裁掉，溢出直接盖在邻格上）。取舍规则在纯函数 `treemapLabelFit` 里，判据是「减去内边距后宽高都够不够」。要让读者认得长尾项，靠 tooltip 或配一份列表，别指望格内文字。
- **不做层级下钻。** 单层就是全部能力：`data` 不收 `children`。多层树图的交互（点进去、面包屑返回）是另一个组件的量级，而消费场景里的「钻取」实际是「跳到另一个页面」，那由 `onItemClick` 交给业务侧。
- 格内文字固定用白色而不是 `foreground`：格子填的是 `chart-N`（深浅不一），跟着主题前景色走会在浅色格上变成浅灰对浅底。与饼图的扇区标签同口径。
- 项太多（>60）时树图会退化成一片碎格，此时该换聚合口径（Top 20 + 「其它」）而不是继续塞。

## 相关
[Chart](../chart/chart.md) · [Heatmap](../heatmap/heatmap.md) · [Funnel](../funnel/funnel.md) · [Sankey](../sankey/sankey.md)
