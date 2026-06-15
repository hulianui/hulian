---
slug: qrcode
name: QRCode
category: data-display
group: info
tags: []
exports: [QRCode]
status: enriched
---

# QRCode

> 二维码 · 编码内核 qrcode-generator + 瑚琏自渲 SVG(暗块合 path/crispEdges) + currentColor 吃主题 + UTF-8 中文 + 纠错级别 + 中心 logo(可 RSC) · data-display/info

## 何时用

把 URL/文本编码为可扫二维码（自渲 SVG，吃主题色，支持中文与中心 logo）。展示静态信息码用本组件；本批其余组件不涉及编码生成。

## 导入
```ts
import { QRCode } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `string` | — | 编码内容（URL/文本，UTF-8）。 |
| size | `number` | `160` | 边长 px。 |
| level | `"L" \| "M" \| "Q" \| "H"` | `"M"` | 纠错级别（带 logo 建议 H）。 |
| margin | `number` | `2` | 静默区模块数。 |
| color | `string` | `currentColor` | 暗块颜色（默认继承 text-foreground）。 |
| background | `string` | 透明 | 背景色。 |
| logo | `QRCodeLogo` | — | 中心 logo，`{ src: string; size?: number }`；务必配 `level="H"` 留足纠错冗余。 |
| aria-label | `string` | 取 value | 无障碍标签。 |
| className | `string` | — | — |

## 示例
```tsx
<QRCode value="https://hulian.dev" size={160} level="M" />
```
```tsx
// 吃主题主色（暗块用 text-primary）
<QRCode value="https://hulian.dev" size={140} className="text-primary" />
```

## 禁忌 / 坑

- 暗块默认 `currentColor`，靠外层文字色控制；要染色用 `className="text-primary"` 或显式 `color`，背景默认透明需自备底色保证扫码对比度。
- 加 `logo` 必须同时 `level="H"`，否则 logo 遮挡导致纠错冗余不足、扫不出。
- 中文/长文本会抬高二维码版本（更密），扫描距离与 size 要相应放大。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
