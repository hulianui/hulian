---
slug: shine-border
name: ShineBorder
category: decoration
group: overlay-fx
tags: [animated]
exports: [ShineBorder]
status: enriched
---

# ShineBorder

> 流光边框 · 渐变 mask 只留边框区 + chart token + RSC · decoration/overlay-fx · #animated

## 何时用

想让卡片/容器的整条边框持续流动渐变流光时用（纯 CSS、可在 RSC 服务端渲染）。它是绝对定位覆盖件，放进 `relative` 容器即可。要一个光点绕边而非整边流光用 [BorderBeam](../border-beam/border-beam.md)；要 hover 时斜向扫一道反光用 [GlareHover](../glare-hover/glare-hover.md)。

## 导入
```ts
import { ShineBorder } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| borderWidth | `number` | `1` | 边框宽度 px |
| duration | `number` | `14` | 流光一轮秒数 |
| shineColor | `string \| string[]` | 瑚琏 chart token | 流光色，单色或多色数组 |
| className | `string` | - | 透传 className |
| style | `CSSProperties` | - | 透传内联样式 |

## 示例

```tsx
<div className="relative overflow-hidden rounded-xl bg-surface">
  ...content
  <ShineBorder />
</div>
```

```tsx
// 粗边 · 单色
<div className="relative rounded-xl bg-surface">
  ...content
  <ShineBorder borderWidth={2} shineColor="var(--color-primary)" />
</div>
```

## 禁忌 / 坑

- 必须置于 `position:relative` 容器内，否则边框定位错乱。
- `shineColor` 喂 token 需带 `--color-` 前缀，裸 `var(--primary)` 不解析——参见 [[hulian-token-color-var-needs-color-prefix]]。
- 纯 CSS 实现，可在 RSC 直接用，无需 `"use client"`。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
