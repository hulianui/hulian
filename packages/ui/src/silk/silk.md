---
slug: silk
name: Silk
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Silk, silkShowcase]
status: enriched
---

# Silk

> 丝绸流动背景 · WebGL/ogl 懒加载 shader(复刻 react-bits) + chart token 主色 + reduced-motion 渐变兜底 · decoration/backdrop · #animated #webgl

## 何时用

需要高质感的流动丝绸光泽背景时用，视觉档次高于纯 CSS 背景。基于 WebGL/ogl（懒加载），有 GPU 开销，但自带 reduced-motion / 无 WebGL 时的渐变 fallback；若不愿引入 WebGL，退而求其次用纯 CSS 的 [Aurora](../aurora/aurora.md)；想要虹彩光谱质感用 [Iridescence](../iridescence/iridescence.md)，想要丝线网格用 [Threads](../threads/threads.md)。

## 导入
```ts
import { Silk, silkShowcase } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| speed | number | 5 | 动画速度因子，映射 GLSL uniform uSpeed，越大越快 |
| scale | number | 1 | 噪声/纹理缩放，越大细节越密，越小越宏观 |
| color | string | `--color-chart-1` | 丝绸主色，CSS 颜色字符串（hex/oklch/rgb/var）。默认吃主题 token |
| noiseIntensity | number | 1.5 | 颗粒噪声强度，0=无颗粒（纯色带） |
| rotation | number | 0 | 纹理旋转角度（弧度），如 `Math.PI/4`=45° |
| className | string | - | 透传到 canvas（或 fallback div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | ReactNode | reduced-motion / 无 WebGL 时渲染的静态替代内容（默认 chart token 渐变 div） |

## 示例
```tsx
// 默认深色底 chart-1 token，自带 absolute inset-0 z-0，需 relative 父容器
<div className="relative h-64 overflow-hidden rounded-xl">
  <Silk />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">Silk</p>
  </div>
</div>
```
```tsx
// 自定义暖金色 + 慢速细腻
<Silk color="oklch(0.78 0.18 55)" speed={2} scale={1.5} />
```

## 禁忌 / 坑

- WebGL 组件，须客户端渲染；`color` 支持 `var(--…)`/oklch，组件内部负责解析后喂 shader。
- 自带 `absolute inset-0 z-0`，叠加内容须用 `relative z-10`，父容器需 `relative` + `overflow-hidden`。
- ogl shader 在 StrictMode 双挂载或 cleanup 时易踩 context 复用毒化坑——若改源码勿在 cleanup 调 `loseContext` 后复用同一 canvas（参见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]）；headless 截图可能因 WebGL 不可用而走 fallback，验证视觉用真实浏览器。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
