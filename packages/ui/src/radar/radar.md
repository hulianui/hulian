---
slug: radar
name: Radar
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Radar]
status: enriched
---

# Radar

> 雷达扫描 · WebGL 背景 · 同心环波纹 + 径向辐条 + 旋转扫描臂 + 边缘衰减 + 鼠标视差(ogl·主色吃 chart token·reduced-motion 降级静态盘) · decoration/backdrop · #animated #webgl

## 何时用

需要科技 / 监控 / 指挥中心氛围的动态背景，扫描臂旋转隐喻「实时探测」。要规整的几何点阵/线网用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)；只要单点同心扩散波用 [Ripple](../ripple/ripple.md)；Radar 是这一族里唯一带旋转扫描臂 + 同心环 + 辐条的「雷达盘」专项。

## 导入
```ts
import { Radar } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| speed | `number` | `1` | 整体动画速度因子（环波扩散 + 扫描臂共用基础时间），映射 GLSL uSpeed |
| scale | `number` | `0.5` | 雷达图缩放，越小盘越大（铺满），越大盘越小（留边距） |
| ringCount | `number` | `10` | 同心环数量，越大越密 |
| spokeCount | `number` | `10` | 辐条（径向分隔线）数量，0 = 无辐条 |
| ringThickness | `number` | `0.05` | 同心环线条粗细，越大越宽越柔 |
| spokeThickness | `number` | `0.01` | 辐条线条粗细 |
| sweepSpeed | `number` | `1` | 扫描臂旋转速度 |
| sweepWidth | `number` | `2` | 扫描臂宽度（幂次锐度），越大越窄越锐 |
| sweepLobes | `number` | `1` | 扫描臂瓣数，1=单束 / 2=对称双束 |
| color | `string` | `var(--color-chart-1)` | 雷达主色（环/辐条/扫描臂），任意 CSS 颜色串 |
| backgroundColor | `string` | - | 雷达底色（常驻基色），缺省透明透出宿主背景 |
| falloff | `number` | `2` | 边缘衰减幂次，越大中心越聚焦边缘消散越快 |
| brightness | `number` | `1` | 整体亮度倍率 |
| enableMouseInteraction | `boolean` | `true` | 是否开启鼠标视差（盘随指针平滑偏移） |
| mouseInfluence | `number` | `0.1` | 鼠标视差影响系数 |
| className | `string` | - | 透传到根容器（或 fallback div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容（默认径向渐变装饰 div） |

## 示例
```tsx
// 默认参数，主色吃 chart token，自动明暗适配
<div className="relative h-64 overflow-hidden rounded-xl">
  <Radar />
</div>

// 密集环 + 双瓣快扫
<Radar ringCount={16} spokeCount={16} sweepSpeed={1.8} sweepLobes={2} />
```

## 禁忌 / 坑

- 须客户端渲染（WebGL/ogl），组件自带 `"use client"`；放进 RSC 页时确保挂在 client 子树或动态 import。
- 容器需自带定位 + `overflow-hidden`，组件以 `absolute inset-0` 铺满父级；父级无尺寸时雷达盘不可见。
- reduced-motion / 无 WebGL 环境自动降级为静态 `fallback`，不要依赖扫描臂动画做关键信息表达。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
