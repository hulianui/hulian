---
slug: liquid-chrome
name: LiquidChrome
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LiquidChrome]
status: enriched
---

# LiquidChrome

> 液态铬背景 · WebGL/ogl 金属流动反光 + 鼠标涟漪 + chart token 基色 + 静态金属渐变 fallback · decoration/backdrop · #animated #webgl

## 何时用

需要一层铺满区域、缓慢流动的液态金属/铬反光背景（hero、登录页、卡片底）时用。它 `absolute inset-0` 铺满父容器，是背景层而非焦点元素。若要的是聚焦视线、随指针交互的发光能量球用 [Orb](../orb/orb.md)；只要静态、零成本的几何底纹用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md) / [StripedPattern](../striped-pattern/striped-pattern.md)。

## 导入
```ts
import { LiquidChrome } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| baseColor | `[number, number, number] \| string` | `var(--color-chart-2)` | 液态铬基础色。`[r,g,b]` 为 0..1 浮点数组（兼容 react-bits 原版），或任意 CSS 颜色串；默认读 chart-2 token 跟随明暗主题 |
| speed | `number` | `0.2` | 流动速度乘子，越大越快 |
| amplitude | `number` | `0.6` | 波形振幅（0 平静 → 1 强烈），控制液面扭曲幅度 |
| frequencyX | `number` | `2.5` | X 方向空间频率 |
| frequencyY | `number` | `1.5` | Y 方向空间频率 |
| interactive | `boolean` | `true` | 是否响应鼠标 / 触摸推动液面涟漪 |
| className | `string` | — | 透传到 canvas（正常）或 fallback div（降级）的 className |
| fallback | `ReactNode` | — | reduced-motion / 无 WebGL 时叠加在金属渐变背景上的静态内容 |

## 示例

```tsx
// 背景层：父容器须 relative，LiquidChrome 自身 absolute inset-0 铺满
<div className="relative h-48 w-full overflow-hidden rounded-xl">
  <LiquidChrome />
</div>
```

```tsx
// 做 hero 背景层，内容叠在上方
<div className="relative h-72 w-full overflow-hidden rounded-xl">
  <LiquidChrome speed={0.18} amplitude={0.55} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
    <p className="text-2xl font-bold text-white drop-shadow-md">Liquid Chrome</p>
  </div>
</div>
```

## 禁忌 / 坑

- WebGL 组件，须客户端渲染；SSR / 无 WebGL / reduced-motion 时降级为静态金属渐变 fallback，注意首屏视觉差异。
- cleanup 别调 `loseContext` 毒化 canvas，否则 StrictMode 双挂载复用 canvas 会崩成空白——参见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]，每次挂载新建 canvas。
- 自身 `absolute inset-0`，父容器必须 `position:relative` 且有确定高度，否则不可见；内容叠加层记得加 `relative z-10`。
- 传 `baseColor` 字符串走 CSS 颜色解析，喂裸 `var(--primary)` 可能不解析，token 需带 `--color-` 前缀——参见 [[hulian-token-color-var-needs-color-prefix]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
