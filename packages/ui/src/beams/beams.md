---
slug: beams
name: Beams
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Beams]
status: enriched
---

# Beams

> 流动体积光柱 WebGL 背景 · perlin 噪声扰动起伏 + 方向光受光梯度 + 倾斜光幕 + 胶片颗粒(ogl·token·reduced-motion 降级静态渐变) · decoration/backdrop · #animated #webgl

## 何时用

需要冷感、有纵深的斜射体积光背景时用（科技产品 Hero、暗色落地页）。要规则点阵/网格底纹用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)；要油彩旋涡用 [Balatro](../balatro/balatro.md)；Beams 是条带状流动光幕，强调方向感与胶片质感，适合做主视觉满铺背景。

## 导入
```ts
import { Beams } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| beamNumber | `number` | `12` | 光束数量（纵向条带数），建议 4–24，过大低端设备糊成一片 |
| beamWidth | `number` | `2` | 单束光的相对宽度，越大束间缝隙越窄 |
| speed | `number` | `2` | 光束沿轴流动速度；0=静止（仍保留静态纹理） |
| lightColor | `string` | `--color-chart-1` | 光束颜色，CSS 颜色字符串，默认取主题 token 明暗自适应 |
| noiseIntensity | `number` | `1.75` | 颗粒噪声强度，模拟胶片质感；0=纯净无颗粒 |
| scale | `number` | `0.2` | 噪声纹理缩放，越小波纹越舒展，越大越细碎 |
| rotation | `number` | `30` | 整组光束旋转角度（度）；0=垂直，正值顺时针斜射 |
| className | `string` | — | 透传到根容器（根自带 absolute inset-0 z-0） |
| fallback | `ReactNode` | 渐变兜底 | reduced-motion / 无 WebGL 时降级的静态内容 |

## 示例
```tsx
// 默认光束背景
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Beams />
</div>
```
```tsx
// 暖橙宽束斜射光幕
<Beams
  lightColor="oklch(0.78 0.18 55)"
  beamNumber={8}
  beamWidth={3}
  rotation={20}
  scale={0.3}
/>
```

## 禁忌 / 坑

- **WebGL 客户端渲染**：依赖 ogl + WebGL，SSR 阶段降级到 `fallback`（静态渐变）；勿在 server component 直接挂载。
- **token 颜色须带 `--color-` 前缀**：`lightColor` 传 CSS 变量须写 `var(--color-chart-1)` 完整名，裸 `var(--chart-1)` 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- `beamNumber` 过大（>24）在低性能设备会糊成一片，且吃 GPU。
- 父容器须 `relative` + `overflow-hidden`。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
