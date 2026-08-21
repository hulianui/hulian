---
slug: letter-glitch
name: LetterGlitch
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LetterGlitch]
status: enriched
---

# LetterGlitch

> 字符故障雨 · 终端字符故障雨背景 · canvas 等宽字符矩阵按节拍随机翻字翻色 + 颜色逐帧插值平滑 + 内/外缘暗角(零依赖 canvas2d·token 调色板·reduced-motion) · decoration/backdrop · #animated #webgl

## 何时用

需要黑客终端 / Matrix 风格的字符故障雨背景时用。要纯几何点阵底纹用 [DotPattern](../dot-pattern/dot-pattern.md)；要科技感网格扫描用 [GridPattern](../grid-pattern/grid-pattern.md)。本组件是 canvas2d 字符矩阵，主打"翻字翻色"故障感。

## 导入
```ts
import { LetterGlitch } from "@hulianui/ui"
```

## Props

> 继承 `HTMLAttributes<HTMLDivElement>`（除 `color`），可透传 `id` / 事件等。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| glitchColors | `string[]` | `["var(--color-chart-2)", "var(--color-chart-1)", "var(--color-chart-4)"]` | 字符闪变调色板，任意 CSS 颜色，内部离屏 canvas 解析为 RGB 插值 |
| glitchSpeed | `number` | `50` | 相邻刷新最小间隔(ms)，越小越躁动，建议 20-200 |
| smooth | `boolean` | `true` | 颜色平滑过渡（逐帧插值）；关闭后硬切，更生硬故障感 |
| outerVignette | `boolean` | `true` | 外缘暗角（四周径向渐隐） |
| centerVignette | `boolean` | `false` | 中心暗角（中部压暗→边缘透亮），用于反衬置入内容 |
| characters | `string` | 大写字母+符号+数字 | 参与闪变的字符集，内部按码点拆分，支持任意 Unicode |
| className | `string` | - | 透传根容器 className |
| style | `CSSProperties` | - | 透传根容器内联样式 |

## 示例
```tsx
// 容器定高 + overflow-hidden，组件 absolute inset-0 铺满
<div className="relative h-56 overflow-hidden rounded-xl">
  <LetterGlitch className="absolute inset-0" />
</div>
```
```tsx
// 中心暗角 + 置入内容
<div className="relative h-56 overflow-hidden rounded-xl">
  <LetterGlitch className="absolute inset-0" outerVignette={false} centerVignette />
  <div className="absolute inset-0 flex items-center justify-center">
    <p className="text-lg font-semibold tracking-widest text-white">GLITCH</p>
  </div>
</div>
```

## 禁忌 / 坑

- canvas2d 仅客户端，需在 client 组件树内使用；SSR 首帧空白属正常。reduced-motion 下降级。
- 字符矩阵在深色底上才有终端观感，浅色容器对比度差。
- `glitchColors` 传 CSS 变量须用 `--color-` 前缀 token，裸 `var(--primary)` 不解析，见 [[hulian-token-color-var-needs-color-prefix]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
