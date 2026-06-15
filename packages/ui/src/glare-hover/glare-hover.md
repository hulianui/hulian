---
slug: glare-hover
name: GlareHover
category: decoration
group: overlay-fx
tags: [animated]
exports: [GlareHover]
status: enriched
---

# GlareHover

> 反光悬停 · hover 斜向扫光 + reduced-motion + RSC · decoration/overlay-fx · #animated

## 何时用

想让卡片/按钮/图块在 hover 时被一道斜向玻璃反光扫过（精致感、可交互暗示）时用。它是包裹容器，把要反光的内容作为 `children` 传入，并接受所有原生 `div` 属性。要边框上持续绕行的光点用 [BorderBeam](../border-beam/border-beam.md)；要整条边框流光用 [ShineBorder](../shine-border/shine-border.md)；要悬停放大内容用 [Lens](../lens/lens.md)。

## 导入
```ts
import { GlareHover } from "@hulianui/ui"
```

## Props

继承全部原生 `div` 属性（`ComponentPropsWithoutRef<"div">`），另有：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | `ReactNode` | — | 被反光扫过的内容 |
| glareColor | `string` | 半透明白 | 反光色，默认玻璃光泽（明暗皆宜） |
| duration | `string` | `"650ms"` | 扫光时长（showcase 可选 `"450ms"` / `"650ms"` / `"1000ms"`） |

## 示例

```tsx
<GlareHover className="grid h-40 w-72 place-items-center rounded-xl border bg-surface">
  <span className="text-lg font-semibold">悬停看反光</span>
</GlareHover>
```

```tsx
<GlareHover duration="1000ms" className="rounded-xl p-6">
  <Card>...</Card>
</GlareHover>
```

## 禁忌 / 坑

- reduced-motion 偏好下扫光被弱化/停用，不要把关键信息只放在反光动画里。
- 它是包裹件而非覆盖件——直接给它布局/样式 className，无需额外 `relative` 容器。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
