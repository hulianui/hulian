---
slug: dither
name: Dither
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Dither]
status: enriched
---

# Dither

> 抖动波纹 · 复古有序抖动波纹 WebGL 背景 · Perlin/fbm 波纹场 + 8×8 Bayer 抖动 + 色阶量化/像素马赛克(ogl 单遍 shader·token·reduced-motion 降级) · decoration/backdrop · #animated #webgl

## 何时用

需要 8-bit / 像素艺术复古质感的波纹背景时用（怀旧风落地页、游戏类产品、品牌彩蛋页）。要油彩旋涡用 [Balatro](../balatro/balatro.md)，要光幕用 [Beams](../beams/beams.md)，要规则点阵用 [DotPattern](../dot-pattern/dot-pattern.md)；Dither 独有有序抖动（ordered dithering）+ 色阶量化的颗粒带状质感，是唯一主打复古像素观感的背景。

## 导入
```ts
import { Dither } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| waveSpeed | `number` | `0.05` | 波纹流动速度；reduced-motion 下冻结为静态画面 |
| waveFrequency | `number` | `3` | 波纹频率（fbm 倍频步长）；越大纹理越细碎 |
| waveAmplitude | `number` | `0.3` | 波纹振幅衰减因子（每 octave 衰减）；越大高频细节越强 |
| waveColor | `string` | `--color-chart-1` | 波纹主色，CSS 颜色字符串，默认取主题 token 明暗自适应 |
| colorNum | `number` | `4` | 量化色阶数，配合 Bayer 矩阵产生有序抖动；越小越 8-bit |
| pixelSize | `number` | `2` | 抖动像素块大小；越大马赛克越粗 |
| disableAnimation | `boolean` | `false` | 是否冻结波形为静帧（与 reduced-motion 等效，可显式控制） |
| className | `string` | - | 透传到 canvas（或 fallback div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容（默认棋盘格+渐变） |

## 示例
```tsx
// 默认抖动波纹
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Dither />
</div>
```
```tsx
// 粗马赛克像素艺术 + 自定义色 + 冻结静帧
<Dither
  waveColor="oklch(0.72 0.22 40)"
  pixelSize={6}
  colorNum={3}
  disableAnimation
/>
```

## 禁忌 / 坑

- **WebGL 客户端渲染**：依赖 ogl + 单遍 shader，SSR 阶段降级到 `fallback`（棋盘格+渐变）；勿在 server component 直接挂载。
- **token 颜色须带 `--color-` 前缀**：`waveColor` 传 CSS 变量须写 `var(--color-chart-1)` 完整名，裸 `var(--chart-1)` 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- `colorNum` 越小越「8-bit」颗粒感越强，但太小（如 2）会丢失细节层次。
- 父容器须 `relative` + `overflow-hidden`。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
