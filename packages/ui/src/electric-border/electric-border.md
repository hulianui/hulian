---
slug: electric-border
name: ElectricBorder
category: decoration
group: overlay-fx
tags: [animated]
exports: [ElectricBorder]
status: enriched
---

# ElectricBorder

> 通电边框 · 通电跳动的边框装饰 · SVG 湍流位移描边 + 多层模糊光晕模拟放电辉光(零依赖·token·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

给一块内容（按钮、卡片、CTA）包一圈持续放电跳动的电弧描边，营造科技/赛博氛围。要静态柔光描边用 [ShineBorder](../shine-border/shine-border.md)，要单点环绕流光用 [BorderBeam](../border-beam/border-beam.md)；本组件是「整条边都在抖动放电」的强动效，最吸睛但也最重。

## 导入
```ts
import { ElectricBorder } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `string` | `var(--color-primary)` | 电流描边颜色，吃明暗主题。任意 CSS 颜色串均可；喂 SVG stroke 的 CSS 变量须带 `--color-` 前缀才解析 |
| speed | `number` | `1` | 电流抖动速度倍率，越大跳动越快（speed=1 ≈ 2s 一轮 `<animate>`） |
| chaos | `number` | `1` | 紊乱程度（湍流位移强度），越大描边被撕扯越剧烈，映射 `feDisplacementMap` 的 scale |
| thickness | `number` | `2` | 边框外发光柔边的厚度（px） |
| borderRadius | `number` | `16` | 圆角半径（px），同时应用到容器与电流描边 |
| className | `string` | - | 透传根容器额外 className |
| style | `CSSProperties` | - | 透传根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 被电流边框包裹的内容 |

## 示例
```tsx
<ElectricBorder borderRadius={16}>
  <div className="px-8 py-6 text-sm font-medium text-white/85">
    Electric Border
  </div>
</ElectricBorder>
```

暖色圆形按钮（高自定义）：
```tsx
<ElectricBorder color="var(--color-chart-3)" borderRadius={999} thickness={2}>
  <button type="button" className="px-6 py-3 text-sm font-semibold text-white">
    立即体验
  </button>
</ElectricBorder>
```

## 禁忌 / 坑

- 自定义 `color` 用 CSS 变量时务必带 `--color-` 前缀（如 `var(--color-chart-3)`），裸 `var(--primary)` 喂给 SVG stroke 不解析、描边会变黑或消失，见 [[hulian-token-color-var-needs-color-prefix]]。
- 描边电弧需要深色底才显眼，浅色背景上辉光几乎不可见。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
