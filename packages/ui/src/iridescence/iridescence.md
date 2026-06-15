---
slug: iridescence
name: Iridescence
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Iridescence]
status: enriched
---

# Iridescence

> 虹彩光泽背景 · WebGL/ogl shader 连续光谱干涉 + 鼠标光流扰动 + chart token + 静态 fallback · decoration/backdrop · #animated #webgl

## 何时用

需要连续光谱/油膜般的虹彩光泽背景，且想要鼠标光流扰动交互时用。基于 WebGL/ogl，有 GPU 开销，自带无 WebGL fallback；与 [Silk](../silk/silk.md) 同为 WebGL 质感背景，Silk 偏丝绸流动、本组件偏虹彩光谱干涉；不愿引入 WebGL 则用纯 CSS 的 [Aurora](../aurora/aurora.md)。

## 导入
```ts
import { Iridescence } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `[number, number, number] \| string` | `--color-chart-3` | 基础色调。RGB 数组每分量 0..1，或任意 CSS 颜色字符串（hex/oklch/hsl/var）。不传则读主题 token 随明暗切换 |
| speed | number | 1.0 | 动画速度倍率，建议 0.1–5 |
| amplitude | number | 0.1 | 鼠标偏移幅度（扰动强度），建议 0.01–0.5 |
| mouseReact | boolean | true | 是否响应鼠标/触摸（驱动 uMouse）。关闭后固定 (0.5,0.5)，效果保持但不随指针 |
| className | string | — | 透传到 canvas 或 fallback 容器 |
| fallback | ReactNode | — | reduced-motion / 无 WebGL 时的静态降级内容 |

## 示例
```tsx
// 默认主题色，自带铺满 canvas，需 relative + overflow-hidden 父容器
<div className="relative h-56 overflow-hidden rounded-xl">
  <Iridescence />
</div>
```
```tsx
// 自定义冷蓝（RGB 数组）+ 高速强扰动
<Iridescence color={[0.3, 0.6, 1.0]} speed={1.5} amplitude={0.2} />
```

## 禁忌 / 坑

- WebGL 组件，须客户端渲染；`color` 既收 0..1 的 `[r,g,b]` 数组也收 CSS 字符串（含 `var(--…)`/oklch），由组件内部解析。
- ogl/WebGL 在 StrictMode 双挂载或 cleanup 时易踩 context 复用毒化坑——改源码时勿 cleanup 调 `loseContext` 后复用同一 canvas（参见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]）；headless 截图无 WebGL 时会走 fallback，视觉验证用真实浏览器。
- 父容器需 `relative` + `overflow-hidden`。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
