---
slug: cubes
name: Cubes
category: decoration
group: overlay-fx
tags: [animated]
exports: [Cubes]
status: enriched
---

# Cubes

> 3D 立方体阵列交互背景 · 指针靠近按距离衰减倾斜 + 空闲自动游走 + 点击环形涟漪高亮（零依赖去 gsap·token 配色·reduced-motion） · decoration/overlay-fx · #animated

## 何时用

需要一块有 3D 立体感、随鼠标倾斜响应的网格背景/装饰板时用，适合 hero 区、控制台空态、活动落地页的视觉点缀。它是规则网格阵列；如果想要更柔和的粒子/光斑类氛围背景，看其他 effects 背景件；要单元素悬停发光用 [GlareHover](../glare-hover/glare-hover.md)。

## 导入
```ts
import { Cubes } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| gridSize | `number` | `8` | 网格边长（行=列），生成 gridSize² 个立方体；DOM 为平方级，建议 ≤ 12 |
| cubeSize | `number` | — | 单个立方体边长（px）；传入时容器固定尺寸，不传则容器自适应（width 100%·1:1） |
| maxAngle | `number` | `45` | 指针处立方体最大倾斜角（度），越近越大越远越接近 0 |
| radius | `number` | `3` | 倾斜影响半径（以「格」为单位），范围内参与倾斜、之外回正 |
| cellGap | `number \| { row?: number \| string; col?: number \| string }` | `"5%"` | 单元间距，数字按 px，对象分别指定行列（百分比字符串随容器缩放） |
| faceColor | `string` | `var(--color-surface)` | 立方体面背景色，须带 `--color-` 前缀 |
| edgeColor | `string` | `var(--color-border)` | 立方体面边框色 |
| rippleColor | `string` | `var(--color-primary)` | 点击时从命中点向外扩散的涟漪高亮色 |
| rippleSpeed | `number` | `2` | 涟漪扩散速度倍率，越大越快 |
| autoAnimate | `boolean` | `true` | 空闲时是否自动游走倾斜（reduced-motion 下自动禁用保持静止） |
| rippleOnClick | `boolean` | `true` | 是否启用点击涟漪 |
| className | `string` | — | 透传根容器额外类名 |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## 示例
```tsx
// 默认 8×8，由父容器约束尺寸
<div className="h-56 w-56">
  <Cubes />
</div>

// 品牌色涟漪 + 加速（点击试试）
<Cubes
  gridSize={8}
  faceColor="var(--color-surface)"
  edgeColor="var(--color-primary)"
  rippleColor="var(--color-chart-2)"
  rippleSpeed={3}
/>
```

## 禁忌 / 坑

- 不传 `cubeSize` 时容器自适应宽高比 1:1，须由父级约束尺寸（如包一层固定宽高的 div），否则可能塌缩。
- 所有颜色 prop（faceColor/edgeColor/rippleColor）走 token 必须带 `--color-` 前缀。见 [[hulian-token-color-var-needs-color-prefix]]。
- DOM 数量是 `gridSize²`，`gridSize` 别开太大（建议 ≤ 12），否则节点数与重排成本飙升。
- reduced-motion 下 `autoAnimate` 自动失效、立方体静止。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
