---
slug: dome-gallery
name: DomeGallery
category: data-display
group: collection
tags: [animated]
exports: [DomeGallery]
status: enriched
---

# DomeGallery

> 球面图库：图片瓦片贴在 CSS 3D 半球内壁，拖拽旋转浏览、点击放大查看 · 原生 PointerEvents 自搓拖拽+RAF 惯性 + motion 灯箱(零依赖·token·reduced-motion) · data-display/collection · #animated

## 何时用

需要把一组图片贴在 3D 半球内壁、拖拽旋转浏览并点击放大查看的沉浸式图库时用，多见于品牌氛围墙、作品集首屏。要弧形横向轨道（滚轮平移、无缝循环）用 [CircularGallery](../circular-gallery/circular-gallery.md)；要光标聚光揭示的卡片墙用 [ChromaGrid](../chroma-grid/chroma-grid.md)；要规整数据表格用 [Table](../table/table.md)。纯 CSS 3D + 原生 PointerEvents，零外部依赖。

## 导入
```ts
import { DomeGallery } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| images | `DomeGalleryImage[]` | 内置占位渐变瓦片 | 贴球面的图片集合（字符串或 `{ src, alt }`）；数量不足循环铺满，超出尾部不显示 |
| segments | `number` | `24` | 球面经向分段数（横向密度），越大瓦片越密越小 |
| fit | `number` | `0.5` | 球半径相对容器尺寸比例，越小曲率越大越「贴脸」（受 min/maxRadius 钳制） |
| minRadius | `number` | `380` | 半径下限（px），防小容器球面塌缩 |
| maxRadius | `number` | `1600` | 半径上限（px），防大屏球面过平 |
| maxVerticalRotationDeg | `number` | `6` | 纵向（rotateX）最大摆动角，限制上下翻转避免看到球两极 |
| dragSensitivity | `number` | `18` | 拖拽灵敏度：像素位移 ÷ 该值 = 旋转角，越大越迟钝 |
| dragDampening | `number` | `0.55` | 松手后惯性阻尼（0~1），越大滑行越久 |
| grayscale | `boolean` | `true` | 瓦片是否灰度滤镜（放大后恢复彩色） |
| imageBorderRadius | `string` | `"16px"` | 瓦片圆角（CSS 长度） |
| openedImageBorderRadius | `string` | `"24px"` | 放大查看时图片圆角（CSS 长度） |
| overlayColor | `string` | `"var(--color-background)"` | 边缘渐隐/中心遮罩底色，传 token 以匹配容器背景 |
| enlargeTransitionMs | `number` | `320` | 放大查看/自动旋转过渡时长（ms） |
| autoRotate | `boolean` | `false` | 无拖拽时自动缓慢自转（展示/壁纸场景） |
| className | `string` | — | 透传根元素类名 |
| style | `CSSProperties` | — | 透传根元素内联样式 |

`DomeGalleryImage`：`string` 或 `{ src: string; alt?: string }`。

## 示例
```tsx
<div className="relative h-80 overflow-hidden rounded-xl bg-background">
  <DomeGallery
    images={[
      { src: "/a.jpg", alt: "封面 A" },
      { src: "/b.jpg", alt: "封面 B" },
    ]}
  />
</div>
```

壁纸级自动自转 + 彩色瓦片：
```tsx
<DomeGallery autoRotate grayscale={false} segments={20} />
```

## 禁忌 / 坑

- 需放进有明确高度 + `overflow-hidden` 的承托容器；小容器靠 `minRadius` 兜底防球面塌缩。
- `overlayColor` 应与容器背景一致（默认 `var(--color-background)`），否则边缘渐隐处会露出色差接缝。
- `images` 数量不足会循环铺满全部瓦片，超出可用瓦片数则尾部图片不显示——按 `segments` 估算瓦片总数再配图。
- reduced-motion 下惯性/自转降级，属预期。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
