---
slug: border-glow
name: BorderGlow
category: decoration
group: overlay-fx
tags: [animated]
exports: [BorderGlow]
status: enriched
---

# BorderGlow

> 发光边框卡 · 指针感应发光边框卡片 · 沿光锥点亮彩色网格边框 + 外层霓虹光晕(随边缘贴近度渐变) + 可选挂载自动扫光(零依赖·token·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

需要一张内容容器，指针靠近时沿光锥点亮彩色边框 + 外层霓虹光晕的卡片时用，自带可选挂载自动扫光。要给任意现有元素加旋转边框光带用 [BorderBeam](../border-beam/border-beam.md) 或 [ShineBorder](../shine-border/shine-border.md)；要做悬停眩光高光用 [GlareHover](../glare-hover/glare-hover.md)。BorderGlow 偏「整卡 + 指针追踪光锥」，是有内容承载的容器型。

## 导入
```ts
import { BorderGlow } from "@hulianui/ui"
```

## Props

继承 `<div>` 属性（已 `Omit` 掉 `color`）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| className | `string` | — | 透传根容器 className（合并进 `.border-glow`） |
| edgeSensitivity | `number` | `30` | 边缘灵敏度 0–100，越小越早触发外层光晕 |
| glowColor | `string` | `var(--color-chart-1)` | 外层光晕色（box-shadow），token 须带 `--color-` 前缀 |
| backgroundColor | `string` | 深色(surface 暗调) | 卡片底色，发光依赖深底对比，浅底下变弱 |
| borderRadius | `number` | `28` | 圆角半径 px |
| glowRadius | `number` | `40` | 外层光晕溢出内边距 px，越大扩散越远 |
| glowIntensity | `number` | `1` | 光晕强度倍率 0–2 |
| coneSpread | `number` | `25` | 光锥角度宽度 0–50，越大高亮弧越宽 |
| animated | `boolean` | `false` | 挂载时自动播一圈扫光；reduced-motion 下跳过 |
| colors | `string[]` | chart-1/3/4 | 彩色网格边框取色，循环映射到 7 个 radial 锚点 |
| fillOpacity | `number` | `0.5` | 边缘彩色填充层透明度 0–1 |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 卡片内容，层叠在所有发光层之上 |

## 示例

```tsx
// 默认：移入卡片沿指针点亮边框
<BorderGlow>
  <div className="w-64 p-7">
    <p className="text-base font-semibold">瑚琏组件库</p>
    <p className="mt-1.5 text-sm text-white/55">把指针移到卡片上，边框会沿光锥点亮。</p>
  </div>
</BorderGlow>

// 挂载自动扫光 + 自定义青调发光
<BorderGlow
  animated
  glowColor="var(--color-chart-2)"
  colors={["var(--color-chart-2)", "var(--color-chart-4)", "var(--color-chart-5)"]}
  glowRadius={56}
>
  {children}
</BorderGlow>
```

## 禁忌 / 坑

- 发光边框依赖深色底对比，放在浅色背景上效果显著变弱；用 `backgroundColor` 保持深底。
- `glowColor`/`colors` 喂 token 必须带 `--color-` 前缀（Tailwind v4 真名），裸 `var(--primary)` 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- 指针追踪与 `animated` 扫光均受 reduced-motion 影响：用户偏好减少动画时自动跳过扫光（DOM 不变）。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
