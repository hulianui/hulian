---
slug: dot-field
name: DotField
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [DotField]
status: enriched
---

# DotField

> 交互式点阵背景 · 光标推挤点阵鼓胀 + 移动泛起径向辉光，可选波浪起伏/星点闪烁（canvas2d 零依赖·token 配色·reduced-motion 静态降级） · decoration/backdrop · #animated #webgl

## 何时用

需要可交互、随光标鼓胀发光的点阵背景时用（科技产品 Hero、控制台底纹、空状态）。要纯静态 CSS 点阵底纹用 [DotPattern](../dot-pattern/dot-pattern.md)（轻量、不吃 GPU）；要光幕/旋涡用 [Beams](../beams/beams.md) / [Balatro](../balatro/balatro.md)；DotField 是 canvas2d 实时交互场，强调光标涟漪与隆起，比 DotPattern 重但有交互。

## 导入
```ts
import { DotField } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| dotRadius | `number` | `1.5` | 单个点的绘制半径（px），建议 1–3 |
| dotSpacing | `number` | `14` | 相邻点间距（px），越大越稀疏，建议 8–24 |
| cursorRadius | `number` | `220` | 光标影响半径（px），鼠标周围多大范围内的点被推挤 |
| bulgeStrength | `number` | `56` | 鼓胀强度（px），点被推离原位的最大位移；0=仅随光标发光 |
| color | `string` | `--color-chart-1` | 点阵基色，CSS 颜色字符串；token 须带 `--color-` 前缀 |
| glowColor | `string` | `--color-primary` | 光标处径向辉光颜色 |
| glowRadius | `number` | `160` | 辉光半径（px）；0=关闭辉光 |
| waveAmplitude | `number` | `0` | 波浪振幅（px），全局正弦起伏的「呼吸」感；0=无波浪 |
| sparkle | `boolean` | `false` | 是否开启随机闪烁（少量点偶尔放大成星点） |
| className | `string` | — | 透传到根容器的额外 className |
| style | `CSSProperties` | — | 透传到根容器的内联样式 |

## 示例
```tsx
// 默认点阵：移动鼠标推挤 + 辉光
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 280)" }}>
  <DotField />
</div>
```
```tsx
// 波浪起伏 + 星点闪烁 + 自定义配色
<DotField
  waveAmplitude={5}
  sparkle
  dotSpacing={16}
  color="oklch(0.75 0.2 50)"
  glowColor="oklch(0.7 0.18 200)"
/>
```

## 禁忌 / 坑

- **token 颜色须带 `--color-` 前缀**：喂给 canvas 的 `color`/`glowColor` 传 CSS 变量必须写完整名（如 `var(--color-chart-1)`），裸 `var(--chart-1)` canvas 不解析 → 点画成黑色/辉光消失。见 [[hulian-token-color-var-needs-color-prefix]]。
- **客户端渲染**：依赖 canvas2d + `requestAnimationFrame`，SSR/reduced-motion 下降级静态点阵；勿在 server component 直接挂载实时逻辑。
- 父容器须 `relative` + `overflow-hidden`（组件自带 absolute 铺满逻辑）。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
