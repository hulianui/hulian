---
slug: pixel-trail
name: PixelTrail
category: decoration
group: overlay-fx
tags: [animated]
exports: [PixelTrail]
status: enriched
---

# PixelTrail

> 像素余晖拖尾 · 鼠标划过点亮背后的像素网格、拖尾随时间淡灭的颗粒余晖背景 · 自维护 CPU 拖尾缓冲 + ogl data texture 着色 + 可选 gooey 液态融合(ogl·token·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

需要一块「鼠标划过点亮像素格、余晖淡灭」的交互背景（hero、404、空状态铺底），可切硬边像素或 gooey 液态团块。要的是流体溅彩跟随光标选 [SplashCursor](../splash-cursor/splash-cursor.md)；要的是弹性飘带跟随选 [Ribbons](../ribbons/ribbons.md)；PixelTrail 是其中「复古像素颗粒感」的一档。

## 导入
```ts
import { PixelTrail } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| gridSize | `number` | `40` | 横向像素格子数（纵向按比例自动推算保持方格），建议 16–120 |
| trailSize | `number` | `0.1` | 拖尾影响半径（占容器短边比例 0–1），越大拖尾越粗 |
| maxAge | `number` | `320` | 单格点亮后存活时长（ms），越大余晖越久 |
| color | `string` | `var(--color-chart-1)` | 像素点颜色，token 必须带 `--color-` 前缀 |
| gooey | `boolean` | `false` | 启用黏液滤镜：相邻点融合成液态团块而非硬边方格 |
| gooeyStrength | `number` | `8` | gooey 融合强度（高斯模糊半径 px），仅 gooey=true 生效 |
| className | `string` | — | 透传到根容器（默认 block h-full w-full，由外层控尺寸） |
| style | `CSSProperties` | — | 透传到根容器 |

## 示例
```tsx
// 默认像素拖尾（容器需 relative + overflow-hidden，进区域移动鼠标点亮）
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <PixelTrail className="absolute inset-0" />
</div>
```
```tsx
// gooey 黏液融合 + 自定义色
<PixelTrail gridSize={48} trailSize={0.14} gooey gooeyStrength={9}
  color="var(--color-chart-1)" className="absolute inset-0" />
```

## 禁忌 / 坑

- `color` 喂 token 必须带 `--color-` 前缀，裸 `var(--primary)` shader 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- WebGL/ogl 组件，仅客户端渲染；StrictMode 双挂载 canvas context 复用风险见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]。
- 父容器需 `relative` + `overflow-hidden`，组件铺 `absolute inset-0`；深色底上像素余晖最清晰。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
