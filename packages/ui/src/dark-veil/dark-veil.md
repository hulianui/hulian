---
slug: dark-veil
name: DarkVeil
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [DarkVeil]
status: enriched
---

# DarkVeil

> CPPN 神经场暗色流动帷幕 WebGL 背景 · 色相旋转/扫描线/颗粒/空间扭曲(ogl·懒加载·reduced-motion 降级静态渐变) · decoration/backdrop · #animated #webgl

## 何时用

需要深邃、克制的暗色流动帷幕背景时用（暗色落地页、控制台 Hero、沉浸式封面）。要多彩色带用 [ColorBends](../color-bends/color-bends.md)，要明亮光幕用 [Beams](../beams/beams.md)，要油彩旋涡用 [Balatro](../balatro/balatro.md)；DarkVeil 是单一暗调神经场，主打深邃氛围而非鲜艳色彩，并自带扫描线/颗粒等复古显示器质感。

## 导入
```ts
import { DarkVeil } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| hueShift | `number` | `0` | 色相偏移（0–360 度），YIQ 色相旋转调出冷蓝/暖紫/青绿基调 |
| noiseIntensity | `number` | `0` | 颗粒噪声强度，CRT/胶片质感；建议 0–0.1，过大发雪花 |
| scanlineIntensity | `number` | `0` | 扫描线强度，复古显示器观感；建议 0–0.5，需配合频率 |
| speed | `number` | `0.5` | 动画速度因子；0=静止（仍渲染一帧静态画面） |
| scanlineFrequency | `number` | `0` | 扫描线频率（疏密）；需 scanlineIntensity > 0 才可见 |
| warpAmount | `number` | `0` | 空间扭曲量，UV 正余弦扰动产生波动/折射；建议 0–0.2 |
| resolutionScale | `number` | `1` | 渲染分辨率缩放；<1 降采样省电，>1 超采样换清晰度 |
| className | `string` | — | 透传到根容器（或 fallback div），自带 absolute inset-0 z-0 |
| fallback | `ReactNode` | 暗色径向渐变 | reduced-motion / 无 WebGL 时的静态替代内容 |

## 示例
```tsx
// 默认冷调帷幕
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 280)" }}>
  <DarkVeil />
</div>
```
```tsx
// 复古显示器：扫描线 + 颗粒
<DarkVeil
  hueShift={200}
  scanlineIntensity={0.35}
  scanlineFrequency={1.6}
  noiseIntensity={0.04}
  speed={0.4}
/>
```

## 禁忌 / 坑

- **WebGL 客户端渲染 + 懒加载**：依赖 ogl + WebGL，SSR 阶段降级到 `fallback`（暗色径向渐变）；勿在 server component 直接挂载。
- **联动参数**：`scanlineFrequency` 须搭配 `scanlineIntensity > 0` 才可见；`noiseIntensity` 超 0.1 会发雪花。
- **性能旋钮**：低端设备或多实例叠加时调小 `resolutionScale`（如 0.6）降采样省电。
- 父容器须 `relative` + `overflow-hidden`。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
