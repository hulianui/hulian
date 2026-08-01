---
slug: floating-lines
name: FloatingLines
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [FloatingLines]
status: enriched
---

# FloatingLines

> 漂浮线束 · WebGL 背景 · 三组正弦波线束随时间漂浮 + log 半径扭曲旋转 + 渐变色带插值 + 可选指针径向弯曲(ogl 零新依赖·token 吃 chart·reduced-motion 降级静态渐变) · decoration/backdrop · #animated #webgl

## 何时用

需要轻盈、低干扰、能放文字在上面的线条流动背景（hero、登录页、营销区块）时用。要点阵/网格几何底纹用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)；要液态金属峰脊用 [Ferrofluid](../ferrofluid/ferrofluid.md)；要鼠标聚光用 [Spotlight](../spotlight/spotlight.md)。本组件线束细、对前景文字可读性友好。

## 导入
```ts
import { FloatingLines } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors | `string[]` | `--color-chart-1/2/4` | 线条渐变色带，沿线序首→尾插值，最多取前 5 段；任意 CSS 颜色 |
| lineCount | `number` | `6` | 三组波各自的线条数量，越多越密、开销越大，建议 3–12 |
| lineDistance | `number` | `5` | 相邻线条横向相位间距（疏密层叠感） |
| animationSpeed | `number` | `1` | 动画速度倍率，0=静止 |
| interactive | `boolean` | `true` | 指针靠近时线条径向弯曲牵引；reduced-motion / 无 WebGL 自动失效 |
| bendRadius | `number` | `5` | 指针弯曲影响半径系数，越大范围越小越聚焦 |
| bendStrength | `number` | `-0.5` | 指针弯曲强度（带符号，负值反向牵引） |
| className | `string` | — | 透传根容器，根自带 `absolute inset-0 z-0` |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 静态兜底层内的内容（如水印文案） |

## 示例
```tsx
// 默认：吃主题 chart token 渐变线束
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <FloatingLines />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    瑚琏组件库
  </div>
</div>
```
```tsx
// 密集慢速壁纸 + 关交互
<FloatingLines lineCount={10} animationSpeed={0.6} lineDistance={4} interactive={false} />
```

## 禁忌 / 坑

- WebGL/ogl 客户端渲染：放在 `"use client"` 边界内；SSR / 无 WebGL 仅出 fallback。
- 根自带 `absolute inset-0 z-0`，需放进 `relative` 容器；前景内容要 `relative z-10` 才压在线束之上。
- `lineCount` 是每组数量（共三组），实际线数约 3 倍，调高注意性能。
- `bendStrength` 默认负值是有意的反向牵引，改正值方向会反。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
