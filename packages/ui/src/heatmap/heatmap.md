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

> 热力图 · 网格色阶映射(value→bucket→primary 透明度档·纯函数 buildMatrix/bucketize 可测) + 小数值域 domain/百分比 valueFormat + 色阶图例 + 行列标签 + 原生 hover 提示 + 点击下钻 · 代码热点/贡献活动/覆盖率/掌握率·库内首个热力图 · data-display/collection

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
| max | `number` | 数据最大值 | 满值（决定色阶顶档）；`domain` 同传时以 domain 为准。 |
| domain | `[number, number]` | `[0, max]` | 显式值域，按 `(value-min)/(max-min)` 比例分档；小数/比率数据传 `[0, 1]` 或收紧到实际区间（如掌握率 `[0.5, 0.9]`）铺满色阶。value ≤ min 落 0 档。 |
| valueFormat | `(value: number) => string` | `String` | 数值显示格式化，tooltip 默认文案与图例共用（比率转百分比：`(v) => \`${Math.round(v*100)}%\``）。优先于 unit。 |
| unit | `string` | — | 数值后缀（`"%"`、`" 次"`），拼在原始值后；要换算用 valueFormat。 |
| showLegend | `boolean` | `false` | 色阶图例（值域下限 → colorScale+1 个色块 → 上限，标签走 valueFormat/unit）。 |
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

小数值域（掌握率 0–1）+ 百分比 + 图例：
```tsx
<Heatmap
  data={masteryData}                       // value 是 0.5~0.9 的比率
  domain={[0.5, 0.9]}                      // 收紧值域，低区间也铺满色阶
  valueFormat={(v) => `${Math.round(v * 100)}%`}
  showLegend
/>
```

## 禁忌 / 坑

注意 `data` 的 `value` 应为确定性数据：showcase 用伪随机公式而非 `Math.random()` 生成，避免 SSR/CSR 首帧色阶不一致。色阶顶档由 `max`（缺省取数据最大值）决定，跨多张图对比时建议显式传同一 `max`（或同一 `domain`）才能横向可比。

- `unit` 是纯后缀拼接：0–1 比率数据配 `unit="%"` 会显示「0.55%」——比率转百分比必须用 `valueFormat`。
- 0.6.x 起小数数据不传 `max` 时按真实数据最大值分档（旧版会抬到 1）；依赖旧行为的显式传 `max={1}`。
- `domain` 的 min 是「0 档下限」：value ≤ min 渲染为最浅档，min 别设成有效数据的下界值本身（如掌握率最低 0.55 就设 0.5）。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
