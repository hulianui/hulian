---
slug: qrcode
name: QRCode
category: data-display
group: info
tags: []
exports: [QRCode, buildQRCode, qrCodeSvgString, qrCodeToPngDataUrl]
status: enriched
---

# QRCode

> 二维码 · 编码内核 qrcode-generator + 瑚琏自渲 SVG(暗块合 path/crispEdges) + currentColor 吃主题(区别 qrcode.react 写死黑白) + UTF-8 中文 + 纠错级别 + minVersion 钉密度 + boostLevel 不升版本白拿纠错 + 中心 logo(excavate 抠空开关/opacity 水印) + qrCodeSvgString 出独立 SVG 串/qrCodeToPngDataUrl 出 PNG(按 DPR 放大·默认白底)(可 RSC) · data-display/info

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

### 新增能力（对标 qrcode.react 的缺口，2026-08-01）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| minVersion | `number` | — | 版本下限 1–40：内容变长会自动升版本→模块变密、观感尺寸跳变；钉住下限让一组码密度一致。内容装不下时自动用更大版本，不截断 |
| boostLevel | `boolean` | `true` | 在**不升版本**的前提下自动提升纠错级别（有余量就白拿鲁棒性） |
| logo.excavate | `boolean` | `true` | 是否垫底色块把 logo 底下的模块抠空；`false` 用于半透明水印式 logo |
| logo.opacity | `number` | `1` | logo 不透明度（做水印时配 `excavate={false}`） |

**导出用的两个函数**（与组件同一个编码内核，出的码一定一致）：

- `qrCodeSvgString({ value, size, color, background, ... })` → 独立 SVG 字符串。可直接下载 `.svg`、贴进邮件/海报，**服务端也能用**。导出场景默认给具体色（`#000`/`#fff`）——`currentColor` 脱离页面就没有可继承的颜色了。
- `qrCodeToPngDataUrl({ value, pixelSize, ... })` → `Promise<string>` PNG data URL（浏览器端）。自动按 `devicePixelRatio` 放大一档（打印/高分屏不糊），默认白底。
- `buildQRCode(options)` → `{ count, total, path, level, version }` 纯矩阵，想自己画（canvas/海报合成/异形码）时用。

## 示例
```tsx
<QRCode value="https://hulian.dev" size={160} level="M" />
```
```tsx
// 吃主题主色（暗块用 text-primary）
<QRCode value="https://hulian.dev" size={140} className="text-primary" />
```

## 禁忌 / 坑

- **导出 PNG 别用透明底**：PNG 没有「继承页面底色」这回事，透明底打印或贴进白底文档会糊成黑块。`qrCodeToPngDataUrl` 默认给白底就是为此。
- **不抠空的 logo 必须半透明**：`excavate={false}` 配不透明 logo 会盖掉模块直接扫不出来；水印式用法记得配 `opacity`。
- 为什么不引 qrcode.react：它把前景/背景写死成 `#000000`/`#FFFFFF`，暗色主题下要消费方自己传两个色；我们默认 `currentColor` + 透明底，跟着主题走。它的 Canvas 变体的价值（导出）我们用 `qrCodeToPngDataUrl` 覆盖，不必为此多一个组件与一份依赖。

- 暗块默认 `currentColor`，靠外层文字色控制；要染色用 `className="text-primary"` 或显式 `color`，背景默认透明需自备底色保证扫码对比度。
- 加 `logo` 必须同时 `level="H"`，否则 logo 遮挡导致纠错冗余不足、扫不出。
- 中文/长文本会抬高二维码版本（更密），扫描距离与 size 要相应放大。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
