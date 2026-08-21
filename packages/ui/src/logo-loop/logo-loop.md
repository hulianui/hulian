---
slug: logo-loop
name: LogoLoop
category: data-display
group: collection
tags: [animated]
exports: [LogoLoop]
status: enriched
---

# LogoLoop

> logo 跑马灯 · 无缝无限滚动的 logo 跑马灯 · RAF 速度低通平滑 + 序列复制无缝回卷 · 横纵四向/悬停变速暂停/单项放大/两端渐隐(零依赖·token·reduced-motion) · data-display/collection · #animated

## 何时用

「合作伙伴 / 集成 / 技术栈 logo 墙」这种需要无限滚动跑马灯展示一排徽标时用。它只负责无缝滚动一组 logo；如果是结构化数据列表/表格，用 [Table](../table/table.md)/[ProTable](../pro-table/pro-table.md)；要纯展示价格矩阵用 [PricingTable](../pricing-table/pricing-table.md)。

## 导入
```ts
import { LogoLoop } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| logos * | `LogoItem[]` | - | logo 列表，可混用图片型(`{src,...}`)与节点型(`{node,...}`)；复制整序列实现无限滚动 |
| speed | `number` | `120` | 滚动速度（px/s），负值反转方向 |
| direction | `"left" \| "right" \| "up" \| "down"` | `"left"` | 滚动方向，up/down 为纵向 |
| width | `number \| string` | `"100%"` | 容器宽度，数字按 px、字符串原样 |
| logoHeight | `number` | `28` | 单个 logo 高度（px） |
| gap | `number` | `32` | logo 之间间距（px） |
| pauseOnHover | `boolean` | `undefined`（等价 true） | 悬停是否暂停（速度归零）；与 hoverSpeed 共存时以 hoverSpeed 优先 |
| hoverSpeed | `number` | - | 悬停时目标速度（px/s），可做减速而非全停 |
| fadeOut | `boolean` | `false` | 两端是否加渐隐遮罩（吃 bg-surface token，自动明暗适配） |
| fadeOutColor | `string` | `var(--color-surface)` | 渐隐遮罩颜色，可传任意 CSS 颜色覆盖 |
| scaleOnHover | `boolean` | `false` | 悬停是否放大单个 logo（scale 1.2） |
| ariaLabel | `string` | `"合作伙伴 logo"` | 根容器无障碍标签 |
| className | `string` | - | 透传根容器额外类名 |
| style | `CSSProperties` | - | 透传根容器内联样式 |

> `LogoItem` 二选一：图片型 `{ src, srcSet?, sizes?, width?, height?, alt?, title?, href? }` 或节点型 `{ node, ariaLabel?, title?, href? }`；带 `href` 时整项包裹为链接。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderItem | `(item: LogoItem, index: number) => ReactNode` | 渲染函数：自定义渲染单项，覆盖默认图片/节点逻辑 |

## 示例
```tsx
const logos = [
  { node: <HexagonIcon />, ariaLabel: "Hexagon" },
  { node: <CloudIcon />, ariaLabel: "Cloud" },
];

// 默认向左 + 两端渐隐
<LogoLoop logos={logos} fadeOut />

// 向右 + 悬停暂停并放大
<LogoLoop logos={logos} direction="right" fadeOut pauseOnHover scaleOnHover />
```

## 禁忌 / 坑

- 纵向滚动（`direction="up"/"down"`）需要父容器有明确高度，否则没有滚动空间。
- 图片型 `LogoItem` 的 `alt` 缺省退化为空串，作为有意义内容时记得补 alt 以保无障碍。
- `pauseOnHover` 与 `hoverSpeed` 同时给时以 `hoverSpeed` 为准（不会全停而是切到该速度）。
- reduced-motion 下自动停止滚动。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
