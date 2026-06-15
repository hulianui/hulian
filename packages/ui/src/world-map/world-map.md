---
slug: world-map
name: WorldMap
category: data-display
group: stat
tags: [animated]
exports: [WorldMap]
status: enriched
---

# WorldMap

> 点阵世界地图 · 预烘点阵(零依赖·吃主题) + 经纬度动画弧线(pathLength 画入 + 端点脉冲) + 独立节点 points(value 分大小/可选标签) + onPointClick 可点击键盘下钻(交互态放开 aria-hidden) + flyingMarker 沿飞线移动标记(✈️飞机/光点彗尾/箭头·offset-path 动效自动转向) · data-display/stat · #animated

## 何时用

需要在世界点阵底图上画跨地域连线/节点分布（全球 PoP、调度指挥中心、流量大屏）时用。它是经纬度驱动的「装饰性可视化」，不是精确地理统计——要 GeoJSON 行政区填色/数据地图请用专门的地图库；纯数字滚动用 [NumberTicker](../number-ticker/number-ticker.md)，常规图表用 [Chart](../chart/chart.md)。

## 导入
```ts
import { WorldMap } from "@hulianui/ui"
```

## Props

`WorldMapDot` = `{ start: WorldMapPoint; end: WorldMapPoint; color?: string }`；`WorldMapPoint` = `{ lat; lng; label? }`；`WorldMapNode` = `WorldMapPoint & { id?; value?; color? }`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| dots | `WorldMapDot[]` | — | 要画的连线对（经纬度）。不传/空数组则只显示点阵底图 |
| flyingMarker | `"plane" \| "comet" \| "arrow"` | — | 沿每条飞线循环移动的标记。plane/arrow 自动转向贴合飞行方向，用各自连线色 |
| points | `WorldMapNode[]` | — | 独立节点（节点分布）。与 dots 互不依赖，可单独使用。`value` 按当前 points 范围归一化映射半径 |
| showLabels | `boolean` | `false` | 是否渲染节点标签文字 |
| onPointClick | `(node, index) => void` | — | 传入则节点可点击/键盘聚焦下钻，同时 svg 放开 aria-hidden 暴露交互节点 |
| lineColor | `string` | chart token | 弧线颜色（CSS 颜色）。逐条可用 `dot.color` 覆盖 |
| dotColor | `string` | border token | 点阵颜色（CSS 颜色） |
| duration | `number` | — | 单条弧线画入时长（秒） |
| className | `string` | — | 容器类名 |

## 示例
```tsx
// 单条连线：北京 → 纽约
<WorldMap dots={[{ start: { lat: 39.9, lng: 116.4 }, end: { lat: 40.7, lng: -74 } }]} />

// 节点分布 + 可点击下钻（value 驱动大小）
<WorldMap
  points={[
    { id: "sh", lat: 31.2, lng: 121.5, label: "上海", value: 92 },
    { id: "sg", lat: 1.35, lng: 103.8, label: "新加坡", value: 64 },
  ]}
  showLabels
  onPointClick={(n) => console.log("下钻", n.label)}
/>

// 飞线 + 飞机标记
<WorldMap dots={dots} flyingMarker="plane" />
```

## 禁忌 / 坑

- 颜色 prop 喂给 SVG `stroke`/`fill`，必须用带 `--color-` 前缀的 token（`var(--color-chart-1)`），裸 `var(--chart-1)` 在 Tailwind v4 下解析不出会变黑/透明。参见 [[hulian-token-color-var-needs-color-prefix]]。
- 弧线是 pathLength 画入 + 端点脉冲动画，headless 截图会停在动画起始帧（线画不出来），不是 bug；验证视觉用真机或 reduced-motion。参见 [[verify-sub-second-web-animation-via-headless-screenshot]]、[[recharts-headless-screenshot-blank-clippath-animation-starved]]。
- 不传 `onPointClick` 时 svg 整体 `aria-hidden`（纯装饰）；传了才暴露可聚焦节点，键盘可达。

## 相关
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md)
