---
slug: balatro
name: Balatro
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Balatro]
status: enriched
---

# Balatro

> 螺旋油彩 WebGL 背景 · 像素旋涡 + 5 次正弦迭代油画混色 + 可选鼠标交互/自转(ogl·三色吃 chart token·reduced-motion conic 兜底) · decoration/backdrop · #animated #webgl

## 何时用

需要浓墨油画质感、有旋涡流动感的满铺背景时用（登录页、Hero、卡片底纹）。要规则几何点阵/网格底纹用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)；要轻量纯色光晕用 [Spotlight](../spotlight/spotlight.md)；Balatro 是重 GPU 的有机色块旋涡，适合做主视觉而非细节装饰。

## 导入
```ts
import { Balatro } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| spinRotation | `number` | `-2.0` | 旋涡静态旋转量（isRotate=false 时生效），正负决定旋向 |
| spinSpeed | `number` | `7.0` | 油彩内部流动速度因子，越大旋涡翻涌越剧烈 |
| offset | `[number, number]` | `[0, 0]` | 旋涡中心相对屏幕中点的偏移 [x, y] |
| color1 | `string` | `--color-chart-1` | 主色（旋涡亮带），CSS 颜色字符串，默认取主题色明暗自适应 |
| color2 | `string` | `--color-chart-2` | 次色（旋涡中段），CSS 颜色字符串 |
| color3 | `string` | `--color-chart-5` | 底色（旋涡暗部/缝隙），CSS 颜色字符串 |
| contrast | `number` | `3.5` | 对比度，越大三色分界越锐利 |
| lighting | `number` | `0.4` | 高光强度，越大旋涡峰值越亮；0=无额外高光 |
| spinAmount | `number` | `0.25` | 旋转随半径的衰减量，越大螺旋拖尾越明显 |
| pixelFilter | `number` | `745` | 像素化强度，越大像素块越小（越精细），越小越复古马赛克 |
| spinEase | `number` | `1.0` | 旋转缓动系数，整体缩放旋转量与速度作微调 |
| isRotate | `boolean` | `false` | 是否随时间持续自转；true 时 spinRotation 改为驱动旋转速度 |
| mouseInteraction | `boolean` | `true` | 是否开启鼠标交互；关闭后 pointer-events-none |
| className | `string` | — | 透传到根容器（或 fallback div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容（默认 conic 旋涡兜底） |

## 示例
```tsx
// 满铺背景：放在 relative 容器内，组件自带 absolute inset-0 z-0
<div className="relative h-64 overflow-hidden rounded-xl">
  <Balatro />
  <div className="relative z-10 flex h-full items-center justify-center text-white">
    Balatro
  </div>
</div>
```
```tsx
// 自定义暖橙旋涡 + 持续自转
<Balatro
  color1="oklch(0.72 0.2 40)"
  color2="oklch(0.6 0.18 25)"
  color3="oklch(0.18 0.04 30)"
  isRotate
  spinSpeed={5}
  lighting={0.6}
/>
```

## 禁忌 / 坑

- **WebGL 客户端渲染**：组件依赖 ogl + WebGL，须在客户端挂载（`"use client"` 链路），SSR 阶段降级到 `fallback`（conic-gradient 兜底）。Next.js 服务端文件勿直接导入到 server component 树顶。
- **token 颜色须带 `--color-` 前缀**：自定义 color1/2/3 传 CSS 变量时必须写完整名（如 `var(--color-chart-1)`），裸 `var(--chart-1)` 不解析 → 旋涡变黑。见 [[hulian-token-color-var-needs-color-prefix]]。
- 父容器须 `relative` + `overflow-hidden`，否则 `absolute inset-0` 铺不住或溢出。
- 持续自转 + 大 `lighting` 在低端设备上吃 GPU，慎在长列表里多实例叠加。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
