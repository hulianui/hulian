---
slug: circular-gallery
name: CircularGallery
category: data-display
group: collection
tags: [animated, webgl]
exports: [CircularGallery]
status: enriched
---

# CircularGallery

> 弧形图片画廊 · ogl 弧形图片画廊 · 卡片沿圆弧弯曲倾斜排开 + 滚轮/拖拽惯性平移首尾无缝循环(ogl·圆角SDF·token化标题·reduced-motion 降级静态轨道) · data-display/collection · #animated

## 何时用

需要一条 WebGL 弧形图片轨道、滚轮/拖拽惯性平移且首尾无缝循环的画廊时用，多见于作品集横向浏览、品牌矩阵展示。要球面 3D 图库（拖拽旋转半球内壁）用 [DomeGallery](../dome-gallery/dome-gallery.md)；要光标聚光揭示的卡片墙用 [ChromaGrid](../chroma-grid/chroma-grid.md)；要规整数据表格用 [Table](../table/table.md)。基于 ogl，是客户端组件，缺图时用 chart token 程序化生成离线占位图。

## 导入
```ts
import { CircularGallery } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `CircularGalleryItem[]` | 内置占位卡 | 画廊条目数组（图片+标题），不传/空数组用 chart token 程序化渐变占位（无远程资源） |
| bend | `number` | `3` | 弧形弯曲强度；`0`=平直，正值向下凹、负值向上凸，建议 -6~6 |
| textColor | `string` | `var(--color-foreground)` | 标题文字颜色，接受任意 CSS 颜色或 `var(--color-*)` token（运行时解析为实色喂 canvas） |
| borderRadius | `number` | `0.05` | 卡片圆角（归一化 0-0.5），`0`=直角，`0.5`=胶囊/圆 |
| scrollSpeed | `number` | `2` | 滚动/拖拽灵敏度，越大单次跨度越大 |
| scrollEase | `number` | `0.05` | 惯性 lerp 系数（0-1），越小越"重"越顺滑 |
| font | `string` | `bold 30px ui-sans-serif, system-ui, sans-serif` | 标题字体（canvas font 简写）；默认用系统字体栈，不发网络请求、SSR 期也不会缺字 |
| className | `string` | - | 透传根容器类名 |

`CircularGalleryItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| image | `string` | 程序化渐变占位图 | 卡片图片地址（远程 URL / data URI / 本地静态资源均可）。留空则用 chart token 程序化生成渐变占位图，离线可用且随明暗主题 |
| text * | `string` | - | 卡片下方标题文字 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `React.ReactNode` | reduced-motion / 无 WebGL 时的降级槽位（渲染在静态占位层之上） |

## 示例
```tsx
<div className="relative h-72 overflow-hidden rounded-xl">
  <CircularGallery
    items={[
      { text: "瀚枢" },
      { text: "瀚舵" },
      { text: "瀚舰" },
      { text: "瀚付" },
    ]}
  />
</div>
```

平直排列 + 自定义标题色：
```tsx
<CircularGallery bend={0} textColor="var(--color-chart-2)" items={items} />
```

## 禁忌 / 坑

- 基于 ogl 的 WebGL 组件，是客户端组件，需放进有明确高度 + `overflow-hidden` 的承托容器；在 SSR/RSC 下注意只在客户端渲染。
- `textColor` 喂主题色用 `var(--color-*)` 前缀 token，组件会运行时解析为实色再喂 canvas；裸 token 在 canvas 取色处不解析。
- reduced-motion / 无 WebGL 时降级为静态轨道（配合 `fallback` 槽位），属预期。
- headless 截图可能因 WebGL/动画首帧未驱动而偏空白，验视觉需真实浏览器或先暖帧。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
