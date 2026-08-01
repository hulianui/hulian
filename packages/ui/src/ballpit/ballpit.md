---
slug: ballpit
name: Ballpit
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Ballpit]
status: enriched
---

# Ballpit

> 彩球球池 · 一坑彩色小球的可交互物理球池 · 重力下落+墙壁回弹+球球弹性碰撞+光标排斥(零依赖 canvas2d·chart token·reduced-motion) · decoration/backdrop · #animated #webgl

## 何时用

需要俏皮、可触碰的物理交互背景时用（落地页 Hero、空状态、品牌玩味区）。要静态规则底纹用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)；要油彩流场用 [Balatro](../balatro/balatro.md)；Ballpit 是 canvas2d 实时物理模拟（O(n²) 碰撞），强调交互而非细腻纹理，球多了会掉帧。

## 导入
```ts
import { Ballpit } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| count | `number` | `80` | 小球数量上限；实际随容器面积自适应缩减。碰撞 O(n²)，建议 ≤ 200 |
| colors | `string[]` | chart token ×5 | 小球配色，按索引循环分配；可传任意 CSS 颜色字符串，默认吃明暗主题 |
| gravity | `number` | `900` | 重力强度（px/s²）；0=失重漂浮，越大越快下沉 |
| bounce | `number` | `0.86` | 墙壁/互撞能量保留系数（0–1）；1=完全弹性永不停 |
| sizeRange | `[number, number]` | `[10, 26]` | 小球半径范围 [最小,最大]（px）；另受容器短边约束 |
| followCursor | `boolean` | `true` | 是否跟随光标形成排斥球推开周围小球；关闭后光标无交互 |
| className | `string` | — | 透传到根容器；组件自带 absolute inset-0 z-0 |
| style | `CSSProperties` | — | 透传到根容器的内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 canvas 时的静态兜底（默认一组静态排布的小球占位） |

## 示例
```tsx
// 默认球池：放在 relative 容器内，移动光标推开小球
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Ballpit />
</div>
```
```tsx
// 失重漂浮 + 完全弹性
<Ballpit gravity={0} bounce={1} count={60} />
```

## 禁忌 / 坑

- **球数 vs 容器面积**：`count` 是上限，组件按「球总面积 ≤ 容器约 42%」自适应缩减；窄卡里硬塞大球（如 count=28 / r∈[24,44]）会触发超填充抖动 —— 让组件自适应，或自己把 count/sizeRange 调小。
- **O(n²) 碰撞**：球数过大（>200）实时碰撞检测会卡顿，背景场景建议小半径多球而非大球。
- **客户端渲染**：依赖 canvas2d 与 `requestAnimationFrame`，SSR 阶段渲染 `fallback` 静态占位；勿在 server component 直接挂载实时逻辑。
- 父容器须 `relative` + `overflow-hidden`。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
