---
slug: wavy-background
name: WavyBackground
category: decoration
group: backdrop
tags: [animated]
exports: [WavyBackground, valueNoise2D]
status: enriched
---

# WavyBackground

> 噪声波浪 · canvas 多彩波浪带叠加 + 内联零依赖 value noise + chart token + reduced-motion 静态 · decoration/backdrop · #animated

## 何时用

需要柔和流动的彩色波浪带背景（Hero / 营销区块）时用。基于 canvas + 内联零依赖噪声，自带 reduced-motion 静帧降级；相比纯 CSS 的 [Aurora](../aurora/aurora.md) 质感更"液态"但有 canvas 开销；若要规则几何底纹用 [GridPattern](../grid-pattern/grid-pattern.md) / [DotPattern](../dot-pattern/dot-pattern.md)。`valueNoise2D` 为内部噪声函数导出，自定义波形时可复用。

## 导入
```ts
import { WavyBackground, valueNoise2D } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors | string[] | chart token | 波浪颜色列表，任意 CSS 颜色字符串（含 `var(--…)`）。挂载后 getComputedStyle 解析再绘制 |
| waveWidth | number | 50 | 每条波浪绘制宽度（px），越大波带越粗 |
| backgroundFill | string | `--color-background` / `--color-bg` | 背景填充色，每帧半透明绘制产生拖影 |
| blur | number | 10 | canvas filter blur（px），0=不模糊 |
| speed | `"slow" \| "fast"` | "fast" | 动画速度 |
| waveOpacity | number | 0.5 | 每条波浪整体透明度（0–1） |
| className | string | — | 内容容器类（覆盖在波浪上的 wrapper div） |
| containerClassName | string | — | 外层根容器类 |
| containerProps | `Omit<HTMLAttributes<HTMLDivElement>, "className"> & Record<\`data-${string}\`, …>` | — | 透传至外层根 div（含 data-* 自定义属性） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | ReactNode | 波浪上方内容（absolute 居中覆盖） |

## 示例
```tsx
// 默认 fast + chart token，铺满父容器
<div className="relative h-48 overflow-hidden rounded-xl border">
  <WavyBackground containerClassName="h-full w-full">
    <span className="text-sm font-medium text-foreground">WavyBackground</span>
  </WavyBackground>
</div>
```
```tsx
// 自定义品牌色带 + 慢速 + 轻模糊
<WavyBackground
  colors={["#a855f7", "#6366f1", "#c084fc", "#818cf8"]}
  speed="slow"
  blur={8}
  containerClassName="h-full w-full"
/>
```

## 禁忌 / 坑

- 基于 canvas，须客户端渲染；`prefers-reduced-motion` 下自动降为静帧，验证动画时记得关闭该系统开关。
- 容器尺寸用 `containerClassName`（如 `h-full w-full`）撑开，外层父级需 `relative` + `overflow-hidden`。
- `colors`/`backgroundFill` 支持 `var(--…)`，挂载后解析——SSR 首帧不会有色彩，属正常。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
