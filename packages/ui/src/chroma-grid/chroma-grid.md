---
slug: chroma-grid
name: ChromaGrid
category: data-display
group: collection
tags: [animated]
exports: [ChromaGrid]
status: enriched
---

# ChromaGrid

> 光标聚光揭示的卡片墙 · 整片灰度暗化、光标圈内透出全彩 + 单卡 hover 径向高光（弹性跟随·reduced-motion） · data-display/collection · #animated

## 何时用

需要一面卡片墙、整体灰度暗化、靠光标聚光圈在指针附近透出全彩的展示位时用，多见于团队/成员墙、作品集封面墙。要 3D 自动洗牌的卡堆用 [CardSwap](../card-swap/card-swap.md)；要扇形铺开+入场弹跳用 [BounceCards](../bounce-cards/bounce-cards.md)；要规整数据表格用 [Table](../table/table.md)。卡片色彩通过每项 `borderColor` / `gradient` 喂 chart token 定制。

## 导入
```ts
import { ChromaGrid } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `ChromaGridItem[]` | 内置占位 demo | 卡片数据数组，缺省回退占位便于空状态预览 |
| radius | `number` | `300` | 聚光揭示半径（px），此半径内全彩、外侧渐隐为灰度 |
| columns | `number` | `3` | 栅格列数（桌面端），窄屏自动回落单列 |
| damping | `number` | `0.45` | 光标跟随阻尼（0~1，越大越黏/越慢）；reduced-motion 下忽略直接吸附 |
| fadeOut | `number` | `0.6` | 光标移出后灰度遮罩恢复全覆盖的淡出秒数 |
| className | `string` | — | 透传根容器类名 |
| style | `CSSProperties` | — | 透传根容器内联样式 |

`ChromaGridItem`：`{ image?; title?; subtitle?; handle?; location?; borderColor?; gradient?; url?; children? }`。`borderColor` / `gradient` 建议喂 `var(--color-chart-1)`~`var(--color-chart-5)`；`url` 提供时卡片可点击（新标签打开）；`children` 覆盖默认 image+文字布局。

## 示例
```tsx
<ChromaGrid
  columns={2}
  radius={260}
  items={[
    {
      title: "林屿",
      subtitle: "全栈工程师",
      handle: "@linyu",
      borderColor: "var(--color-chart-1)",
      gradient: "linear-gradient(145deg, var(--color-chart-1), transparent)",
    },
    {
      title: "陈墨",
      subtitle: "DevOps 工程师",
      handle: "@chenmo",
      borderColor: "var(--color-chart-2)",
      gradient: "linear-gradient(210deg, var(--color-chart-2), transparent)",
    },
  ]}
/>
```

不传 items 时用内置占位卡预览：
```tsx
<ChromaGrid columns={3} />
```

## 禁忌 / 坑

- 卡片色彩 token 必须带 `--color-` 前缀（如 `var(--color-chart-1)`）；裸 `var(--chart-1)` 在渐变/描边里不解析。
- 揭示效果靠灰度对比，深色底容器观感最佳（showcase 用 `oklch(0.16 0.02 255)`）。
- reduced-motion 下光标弹性跟随退化为直接吸附，属预期。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
