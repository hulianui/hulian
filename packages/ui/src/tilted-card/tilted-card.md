---
slug: tilted-card
name: TiltedCard
category: data-display
group: collection
tags: [animated]
exports: [TiltedCard]
status: enriched
---

# TiltedCard

> 指针驱动的 3D 倾斜卡片 · perspective + rotateX/Y 弹簧倾斜 + 悬停放大 + 跟随指针的浮动提示气泡（motion 弹簧·零新依赖·reduced-motion） · data-display/collection · #animated

## 何时用

给任意一张图片/内容卡加"悬停指针 3D 倾斜 + 放大 + 浮动提示"的通用交互时用，是最轻量的单卡倾斜原语。要的是**有姓名/职位语义的名片**用 [ProfileCard](../profile-card/profile-card.md)，要悬停像素波纹卡用 [PixelCard](../pixel-card/pixel-card.md)，要成组聚光网格用 [MagicBento](../magic-bento/magic-bento.md)。

## 导入
```ts
import { TiltedCard } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| imageSrc | `string` | — | 卡面图片地址，传了即渲染铺满的 `<img>`；也可只用 children 自定义卡面 |
| altText | `string` | — | 图片 alt 文案（无障碍） |
| containerHeight | `CSSProperties["height"]` | `"300px"` | 外层透视容器高度 |
| containerWidth | `CSSProperties["width"]` | `"100%"` | 外层透视容器宽度 |
| cardHeight | `CSSProperties["height"]` | `"300px"` | 倾斜卡面高度 |
| cardWidth | `CSSProperties["width"]` | `"300px"` | 倾斜卡面宽度 |
| scaleOnHover | `number` | `1.1` | 悬停时整体放大倍数 |
| rotateAmplitude | `number` | `14` | 倾斜最大角度（度），越大越立体 |
| showTooltip | `boolean` | `true` | 是否渲染跟随指针的浮动提示气泡 |
| displayOverlayContent | `boolean` | `false` | 是否显示 overlayContent |
| className | `string` | — | 合并到外层 `<figure>` 的额外类名 |
| style | `CSSProperties` | — | 额外内联样式（合并到外层透视容器） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| captionText | `ReactNode` | 跟随指针的浮动提示文案，为空则不渲染提示气泡 |
| overlayContent | `ReactNode` | 浮于卡面之上、随倾斜一同 3D 抬升的叠加内容（角标/标题） |
| children | `ReactNode` | 卡面内容（与 imageSrc 二选一或叠加，置于图片之上、overlay 之下） |

## 示例
```tsx
// 内容卡 + 浮动提示
<TiltedCard
  cardWidth="240px" cardHeight="240px"
  containerWidth="240px" containerHeight="240px"
  captionText="悬停我"
>
  <div className="flex h-full flex-col items-center justify-center gap-2 p-6">
    <p className="text-lg font-semibold text-foreground">瑚琏组件库</p>
  </div>
</TiltedCard>

// 图片卡 + 抬升角标
<TiltedCard
  imageSrc="/cover.jpg" altText="封面"
  displayOverlayContent
  overlayContent={<span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs text-primary-foreground">NEW</span>}
/>
```

## 禁忌 / 坑

- 倾斜需鼠标悬停触发：触屏/无指针环境不产生倾斜，关键内容不要只靠倾斜表达。
- `containerWidth/Height` 与 `cardWidth/Height` 是两套尺寸（透视容器 vs 倾斜卡面），二者不一致时卡面会在容器内偏移，通常应配套设同值。
- 基于 motion 弹簧、零新依赖；reduced-motion 下自动停倾斜。[[motion-v12-interrupted-animation-promise-never-settles]]：若在它之上再编排被打断的 motion 动画链，注意被中断的动画 promise 可能永不 settle。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
