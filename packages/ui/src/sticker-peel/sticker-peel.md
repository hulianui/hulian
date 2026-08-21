---
slug: sticker-peel
name: StickerPeel
category: decoration
group: overlay-fx
tags: [animated]
exports: [StickerPeel]
status: enriched
---

# StickerPeel

> 可拖拽贴纸 · hover/按住顶部卷边揭起 + 落地投影 + 鼠标跟随高光（零依赖·PointerEvents 拖拽·reduced-motion） · decoration/overlay-fx · #animated

## 何时用

把一张图片做成可揭起卷边、可在父容器内拖动的「随手贴」装饰时用，适合营销页/作品集里趣味性的徽标、奖章、活动贴纸。它是图片专用的拟物玩法；如果你要的是给任意容器加发光描边或扫光，用 [GlareHover](../glare-hover/glare-hover.md)/[ShineBorder](../shine-border/shine-border.md)；要图片局部放大镜则用 [Lens](../lens/lens.md)。

## 导入
```ts
import { StickerPeel } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| imageSrc * | `string` | - | 贴纸图片地址，渲染两层：正面贴纸 + 翻起的背面卷边 |
| alt | `string` | `""` | 图片可访问性描述（透传 img alt），装饰性贴纸可留空 |
| width | `number` | `200` | 贴纸宽度（px），高度按图片原比例自适应 |
| rotate | `number` | `30` | 内部图案旋转角（deg），制造随手贴的歪斜感 |
| peelBackHoverPct | `number` | `30` | hover 时卷边翻起百分比（顶部揭开高度占比） |
| peelBackActivePct | `number` | `40` | active（按住）时卷边翻起百分比，通常比 hover 大 |
| peelDirection | `number` | `0` | 卷边方向角度（deg），整张贴纸连卷边一起旋转 |
| shadowIntensity | `number` | `0.6` | 落地投影强度 0~1（drop-shadow 透明度） |
| lightingIntensity | `number` | `0.4` | 鼠标跟随高光强度 0~1，0 关闭高光 |
| initialPosition | `"center" \| { x: number; y: number }` | `"center"` | 贴纸初始落点：居中或相对父容器左上角的像素偏移 |
| draggable | `boolean` | `true` | 是否允许在父容器内拖拽（越界自动夹回） |

> 还继承 `HTMLAttributes<HTMLDivElement>`（除 `children`），可透传 `className`/`style`/事件等。

## 示例
```tsx
// 默认：揭起 + 拖拽
<StickerPeel imageSrc="/sticker.svg" width={150} rotate={14} />

// 大幅卷边 + 强高光 + 锁定不可拖
<StickerPeel
  imageSrc="/sticker.svg"
  width={170}
  peelBackHoverPct={42}
  peelBackActivePct={55}
  lightingIntensity={0.7}
  draggable={false}
/>
```

## 禁忌 / 坑

- 父容器需 `position: relative` + `overflow-hidden`，否则拖拽边界算不准、贴纸会跑出框。
- `draggable` 默认开启，会拦截 PointerEvents；若贴纸放在可点击/可滚动区域内需评估手势冲突，按需关掉。
- reduced-motion 下卷边/高光动效降级，但贴纸本体仍可见。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
