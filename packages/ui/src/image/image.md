---
slug: image
name: Image
category: data-display
group: collection
tags: []
exports: [Image, imageVariants]
status: enriched
---

# Image

> 图片 · 加载淡入 + 失败回退/占位 + isZoomed hover 放大 + radius · data-display/collection

## 何时用

替代原生 `<img>` 展示需要加载淡入、失败回退占位、圆角、hover 放大的图片（封面、头像、内容图）。只是装饰性 logo 滚动墙用 [Marquee](../marquee/marquee.md)；要全屏看大图/缩放预览用 ImageViewer。

## 导入
```ts
import { Image, imageVariants } from "@hulianui/ui"
```

## Props

继承 `Omit<ImgHTMLAttributes<HTMLImageElement>, "width" | "height">`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| src * | string | — | 图片地址 |
| alt | string | — | 替代文本 |
| width | number ｜ string | — | 宽（数字或 CSS 长度） |
| height | number ｜ string | — | 高（数字或 CSS 长度） |
| radius | `"none"｜"sm"｜"md"｜"lg"｜"full"` | `"md"` | 圆角刻度 |
| isZoomed | boolean | false | hover 放大（外壳裁切溢出） |
| fallbackSrc | string | — | 加载失败时回退图；缺省则显示占位底 |
| className | string | — | 外壳 className（控制尺寸/圆角区域） |
| imgClassName | string | — | `<img>` 自身 className |
| ...img | Omit\<ImgHTMLAttributes, "width"｜"height"\> | — | 透传其余原生 img 属性 |

## 示例
```tsx
<Image src="/photo.jpg" alt="风景" width={220} height={140} />

// hover 放大
<Image src="/photo.jpg" alt="风景" width={200} height={130} isZoomed />

// 加载失败回退
<Image src="https://invalid.example/none.png" fallbackSrc="/photo.jpg" alt="回退" width={200} height={130} />
```

## 禁忌 / 坑

- `isZoomed` 的放大效果靠外壳 `overflow` 裁切，外壳尺寸由 `width/height`/`className` 决定——别给 `<img>`（`imgClassName`）单独设溢出。
- 圆角分两层：`radius` 作用于外壳；要单独调 `<img>` 走 `imgClassName`。`radius="full"` 配等宽高做圆形头像。
- 候选坑 skill（`dark-image-page-bg-seam-converge-same-color` / `image-enhancer` 等）均为业务/工具场景，与本组件无关，不引用。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
