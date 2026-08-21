---
slug: line-waves
name: LineWaves
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LineWaves]
status: enriched
---

# LineWaves

> 波纹线阵 · 流动波纹线阵 WebGL 背景 · 双正弦位移场 + 噪声脊线 + 三通道色相循环 + 鼠标局部隆起(ogl·chart token 配色·reduced-motion 静态线纹降级) · decoration/backdrop · #animated #webgl

## 何时用

需要一层「流动线条纹理」的氛围背景（Hero、登录页、空状态铺底）时用它。要点阵/网格几何感选 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)，要斜向条纹选 [StripedPattern](../striped-pattern/striped-pattern.md)，要鼠标聚光选 [Spotlight](../spotlight/spotlight.md)；本组件是有机的波动线场，运动感与色相漂移更强。

## 导入
```ts
import { LineWaves } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| speed | `number` | `0.3` | 动画速度因子；越大流动越快，0 = 静止纹理 |
| innerLineCount | `number` | `32` | 中心区线条密度；与 outerLineCount 共同决定疏密渐变 |
| outerLineCount | `number` | `36` | 边缘区线条密度；与 inner 不同时上下边缘到中心产生疏密过渡 |
| warpIntensity | `number` | `1` | 波纹扭曲强度；越大越「波涛汹涌」，0 = 笔直平行线 |
| rotation | `number` | `-45` | 整体纹理旋转角（度）；-45° 使波纹呈对角线走向 |
| edgeFadeWidth | `number` | `0` | 上下边缘渐隐起始宽度；增大可让中心线条区收窄 |
| colorCycleSpeed | `number` | `1` | 颜色循环速度；三通道色相随时间漂移，0 = 颜色恒定 |
| brightness | `number` | `0.2` | 整体亮度系数；因 alpha=颜色长度，同时影响透明度。建议 0.1-0.6 |
| color1 | `string` | `--color-chart-1` | 第一通道颜色，CSS 颜色串；默认取 chart token 明暗自适应 |
| color2 | `string` | `--color-chart-2` | 第二通道颜色 |
| color3 | `string` | `--color-chart-4` | 第三通道颜色；三色都传同一值（如 #ffffff）可还原原版白线 |
| enableMouseInteraction | `boolean` | `true` | 开启指针局部扭曲外推；关闭则纯自动流动 |
| mouseInfluence | `number` | `2` | 指针影响强度；仅 enableMouseInteraction=true 时生效 |
| className | `string` | - | 透传到根容器（或 reduced-motion fallback div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容；默认斜向 chart token 渐变线纹 |

## 示例

```tsx
// 默认：深底上的 chart token 波纹（父容器须 relative，内容叠更高 z）
<div className="relative h-64 overflow-hidden rounded-xl">
  <LineWaves />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">LineWaves</p>
  </div>
</div>
```

```tsx
// 还原经典白线：三色同 #ffffff + 关掉色相循环
<LineWaves color1="#ffffff" color2="#ffffff" color3="#ffffff" brightness={0.25} colorCycleSpeed={0} />
```

## 禁忌 / 坑

- 组件自带 `absolute inset-0 z-0`，**父容器必须 `relative` 且页面内容要叠更高 z-index**（如 `relative z-10`），否则线纹要么定位错乱、要么盖住内容 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- WebGL 客户端组件，在 Next App Router 下放进 RSC 树前注意它是 `"use client"`；SSR 阶段不渲染 canvas，只走 fallback。
- `color1/2/3` 传 `var(--color-…)` 时运行时经离屏 canvas 解析颜色，**裸 `var(--primary)` 不带 `--color-` 前缀会解析失败**（黑/透明） [[oklch-css-var-color-must-parse-via-offscreen-canvas]]。
- headless 截图常拍到空白/静止帧——rAF 驱动的动画在无头环境被饿死，属预期而非 bug，真机或 Playwright 实测可见 [[recharts-headless-screenshot-blank-clippath-animation-starved]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
