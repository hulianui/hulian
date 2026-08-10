---
slug: watermark
name: Watermark
category: data-display
group: placeholder
tags: []
exports: [Watermark]
status: enriched
---

# Watermark

> 水印 · 自研 canvas 平铺 + MutationObserver 防篡改 + 高清 DPR(零依赖·防截图泄密) · data-display/placeholder

## 何时用

需要在敏感内容区铺一层防截图泄密水印（文字/图片）时用，包裹 `children` 即可全区覆盖。它是「内容遮罩层」——空数据占位用 [Empty](../empty/empty.md)，加载占位用 [Skeleton](../skeleton/skeleton.md)。

## 导入
```ts
import { Watermark } from "@hulianui/ui"
```

## Props

继承 `div` 的所有原生属性（`content` 除外，已重定义为字符串/数组）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| content | `string \| string[]` | — | 水印文字，传数组渲染多行。与 `image` 二选一（同传 image 优先） |
| image | `string` | — | 图片水印源（dataURL/链接）。设置后忽略 content |
| width | `number` | `120` | 图片宽度（px），仅 image 模式生效 |
| height | `number` | 按原始宽高比 | 图片高度（px），仅 image 模式生效 |
| rotate | `number` | `-22` | 旋转角度（度） |
| gap | `number \| [number, number]` | `100` | 水印间距（px）。单值作用 x/y，或传 `[x, y]` |
| fontSize | `number` | `16` | 文字字号（px） |
| fontFamily | `string` | `sans-serif` | 字体族 |
| fontWeight | `number \| string` | `normal` | 字重 |
| color | `string` | `--color-muted-foreground` | 水印颜色，不传读语义 token 随明暗自适应 |
| opacity | `number` | `0.15` | 整体不透明度 |
| zIndex | `number` | `9` | 水印层 z-index（pointer-events:none 不挡交互） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 被水印覆盖的内容区 |

## 示例
```tsx
// 单行文字
<Watermark content="瑚琏 · 机密">
  <Sheet />
</Watermark>

// 多行 + 自定义颜色密度
<Watermark content={["瑚琏机密", "zhangzhiwei"]} gap={48} rotate={-30} color="var(--color-danger)">
  <Sheet />
</Watermark>

// 图片水印
<Watermark image={logoDataUri} width={84}>
  <Sheet />
</Watermark>
```

## 禁忌 / 坑

- 自定义 `color` 走 SVG/canvas 着色，必须用带 `--color-` 前缀的 token（`var(--color-danger)`），裸 `var(--danger)` 解析不出。参见 [[hulian-token-color-var-needs-color-prefix]]。
- 水印层是 canvas 平铺 + MutationObserver 防篡改，依赖客户端环境；纯 SSR 静态导出截图时水印层可能未绘制，验证视觉需真机。
- `content` 与 `image` 同传时 image 优先；想用文字别误传 image。

## 相关
[Empty](../empty/empty.md) · [Skeleton](../skeleton/skeleton.md) · [Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md)
