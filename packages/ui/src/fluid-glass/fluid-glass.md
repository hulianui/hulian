---
slug: fluid-glass
name: FluidGlass
category: decoration
group: overlay-fx
tags: [animated]
exports: [FluidGlass]
status: enriched
---

# FluidGlass

> 跟随指针的流体玻璃折射背景 · 程序化流动渐变底图 + 圆形玻璃透镜实时折射/放大/边缘色散/菲涅尔高光(ogl 单 shader·零 3D 依赖·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

需要一整块「流体玻璃」背景——程序化流动渐变底图 + 一个跟随指针的圆形玻璃透镜实时折射放大底图时用，适合 hero/区块背景。要做固定尺寸的玻璃面板（药丸/卡片）用 [GlassSurface](../glass-surface/glass-surface.md)；要做局部静态放大镜用 [Lens](../lens/lens.md)。FluidGlass 是「会流动的整屏玻璃背景」，靠 ogl WebGL shader 渲染。

## 导入
```ts
import { FluidGlass } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `number` | `0.26` | 透镜半径占容器短边比例 0–1，越大折射区越广，建议 0.15–0.4 |
| refraction | `number` | `0.5` | 折射强度（IOR 映射），越大中心放大/扭曲越强，0=几乎透明，建议 0–1 |
| dispersion | `number` | `0.3` | 色散强度，模拟边缘 RGB 分光彩边，0=关闭，建议 0–1 |
| speed | `number` | `1` | 背景流动速度倍率，0=背景静止（透镜仍跟随指针） |
| colors | `string[]` | chart-1/2/4 | 背景渐变色组，取前 3 个，可传任意 CSS 颜色 |
| followPointer | `boolean` | `true` | 透镜跟随指针；关闭时停在中心缓慢漂移 |
| className | `string` | — | 透传根容器 className（根为 `relative overflow-hidden`，canvas 自带 `absolute inset-0`） |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 覆盖在玻璃背景上方的内容（relative z-10 层叠于画布之上） |

## 示例

```tsx
// 默认：移动指针看透镜跟随
<div className="relative h-64 overflow-hidden rounded-xl">
  <FluidGlass className="absolute inset-0">
    <div className="flex h-full items-center justify-center text-lg font-semibold text-white">
      Fluid Glass
    </div>
  </FluidGlass>
</div>

// 强折射强色散厚玻璃
<FluidGlass size={0.32} refraction={0.85} dispersion={0.7} className="absolute inset-0" />
```

## 禁忌 / 坑

- WebGL 组件（ogl 单 shader），必须客户端渲染，SSR 出空壳；放进固定高度的 `relative overflow-hidden` 容器并给 `className="absolute inset-0"`。
- `colors` 喂 token 须带 `--color-` 前缀；shader 取色经组件解析，裸 `var(--primary)` 不解析。
- WebGL 背景在 headless 截图中常因 shader/context 未就绪而空白，验视觉用真实浏览器或留意 [[webgl-canvas-loseContext-poisons-strictmode-remount]]（cleanup 调 loseContext 会毒化 StrictMode 重挂载的 canvas，本组件如复用 canvas 需警惕）。
- reduced-motion 下停止背景流动动画（透镜折射仍在）。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
