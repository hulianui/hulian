---
slug: lens
name: Lens
category: decoration
group: overlay-fx
tags: [animated]
exports: [Lens]
status: enriched
---

# Lens

> 放大镜 · 悬停光标处圆形放大任意 children(零依赖 mask+scale) · decoration/overlay-fx · #animated

## 何时用

想让用户悬停时在光标处用一个圆形镜片局部放大内容（产品图、地图、截图细节）时用。children 可以是任意内容（图片最常见），零依赖、纯 mask+scale 实现。要的是 hover 斜扫反光用 [GlareHover](../glare-hover/glare-hover.md)；要边框光效用 [BorderBeam](../border-beam/border-beam.md) / [ShineBorder](../shine-border/shine-border.md)。

## 导入
```ts
import { Lens } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | `ReactNode` | — | 被放大的内容（常为 `<img>`） |
| zoom | `number` | `1.8` | 放大倍数 |
| size | `number` | — | 镜片直径 px |
| className | `string` | — | 透传 className |

## 示例

```tsx
<Lens zoom={1.8} className="w-80 rounded-[var(--radius)] border">
  <img src="/photo.jpg" alt="森林" className="block aspect-[4/3] w-full object-cover" />
</Lens>
```

## 禁忌 / 坑

- 需指针 hover 才触发，纯触屏/键盘场景下无放大效果，不要把它当唯一的细节查看方式。
- `children` 必须是有确定尺寸、能被 scale 的可视内容（如 `block` 的 `<img>`），否则镜片放大区为空。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
