---
slug: heatmap
name: Heatmap
category: data-display
group: collection
tags: []
exports: [Heatmap, buildMatrix, bucketize]
status: enriched
---

# Heatmap

> 热力图 · 网格色阶映射(value→bucket→primary 透明度档·纯函数 buildMatrix/bucketize 可测) + 行列标签 + 原生 hover 提示 + 点击下钻 · 代码热点/贡献活动/覆盖率·库内首个热力图 · data-display/collection

## 何时用

把稀疏的 `{x, y, value}` 点集按二维网格展开、用色阶强度表达数值密度时用（贡献活动墙、模块×时间问题热点、覆盖率矩阵）。需要可排序、可分页、单元格内放富内容的表格走 [Table](../table/table.md) / [ProTable](../pro-table/pro-table.md)；这里只做「强度即颜色」的密度可视化。

## 导入
```ts
import { Heatmap, buildMatrix, bucketize } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data* | `HeatCell[]` | — | 稀疏点集 `{x, y, value}`。 |
| xLabels | `(string｜number)[]` | 从 data 推导 | 显式列标签。 |
| yLabels | `(string｜number)[]` | 从 data 推导 | 显式行标签。 |
| colorScale | `number` | `5` | 色阶档数。 |
| max | `number` | 数据最大值 | 满值（决定色阶顶档）。 |
| cellSize | `number` | `14` | 格子边长 px。 |
| gap | `number` | `3` | 格间距 px。 |
| showLabels | `boolean` | `true` | 是否显示行/列标签。 |
| formatTooltip | `(cell: HeatmapCellInfo) => string` | — | 悬停原生提示文案（返回字符串）。 |
| className | `string` | — | — |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onCellClick | `(cell: HeatmapCellInfo) => void` | 点击格子下钻。 |

## 示例
```tsx
const data = MODULES.flatMap((m, mi) =>
  WEEKDAYS.map((d, di) => ({ x: d, y: m, value: (mi * 7 + di * 3 + 2) % 10 })),
);

<Heatmap data={data} xLabels={WEEKDAYS} yLabels={MODULES} cellSize={18} />
```

无标签紧凑模式：
```tsx
<Heatmap data={data} xLabels={WEEKDAYS} yLabels={MODULES} showLabels={false} cellSize={12} />
```

## 禁忌 / 坑

暂无已知坑。注意 `data` 的 `value` 应为确定性数据：showcase 用伪随机公式而非 `Math.random()` 生成，避免 SSR/CSR 首帧色阶不一致。色阶顶档由 `max`（缺省取数据最大值）决定，跨多张图对比时建议显式传同一 `max` 才能横向可比。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
