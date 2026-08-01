---
slug: galaxy
name: Galaxy
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Galaxy]
status: enriched
---

# Galaxy

> 视差星河 · 程序化生成的多层视差星河 WebGL 背景 · Hash 铺点+十字辉光+HSV 调色+三角波闪烁+自转/鼠标斥力，4 层尺度叠加深空纵深(ogl·懒加载·StrictMode 安全·reduced-motion 降级 chart token 径向渐变) · decoration/backdrop · #animated #webgl

## 何时用

需要深空 / 繁星 / 科技感纵深背景（hero、启动页、数据大屏）时用。要液态金属流体用 [Ferrofluid](../ferrofluid/ferrofluid.md)；要纯点阵底纹（非闪烁星星）用 [DotPattern](../dot-pattern/dot-pattern.md)；要鼠标聚光不要星河用 [Spotlight](../spotlight/spotlight.md)。本组件主打多层视差 + 星点闪烁 + 鼠标斥力的"宇宙"质感。

## 导入
```ts
import { Galaxy } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| focal | `[number, number]` | `[0.5, 0.5]` | 星空聚焦点（归一化），星河发散中心 |
| rotation | `[number, number]` | `[1, 0]` | 取景旋转（cos/sin 向量），`[0.707,0.707]`≈45° |
| starSpeed | `number` | `0.5` | 星点漂移速度因子 |
| density | `number` | `1` | 星点密度，0.5 稀疏、2 繁星 |
| hueShift | `number` | `140` | 色相偏移（0–360），默认偏青蓝 |
| speed | `number` | `1` | 总动画速度倍率（漂移+闪烁） |
| mouseInteraction | `boolean` | `true` | 鼠标移动时星河偏移 / 斥力 |
| glowIntensity | `number` | `0.3` | 星点辉光强度 |
| saturation | `number` | `0` | 饱和度，0=接近白星；调高配 hueShift 出彩色 |
| mouseRepulsion | `boolean` | `true` | true=星点被推开，false=星河整体平移；仅交互开时生效 |
| repulsionStrength | `number` | `2` | 鼠标斥力强度，仅 mouseRepulsion=true 生效 |
| twinkleIntensity | `number` | `0.3` | 星点闪烁强度，0=不闪 |
| rotationSpeed | `number` | `0.1` | 星河自动旋转速度，0=不自转 |
| autoCenterRepulsion | `number` | `0` | 中心自动斥力，>0 形成空洞中心"星环" |
| transparent | `boolean` | `true` | true=alpha 随亮度过渡可叠底色；false=纯黑底深空 |
| className | `string` | — | 透传根容器（或兜底 div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容（默认径向渐变 div） |

## 示例
```tsx
// 默认：青蓝星河，鼠标斥力交互
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 265)" }}>
  <Galaxy />
</div>
```
```tsx
// 中心星环 + 暖紫调
<Galaxy autoCenterRepulsion={2} density={1.2} hueShift={200} mouseInteraction={false} />
```

## 禁忌 / 坑

- WebGL/ogl 客户端渲染（懒加载、StrictMode 安全）：放在 `"use client"` 边界内；SSR / 无 WebGL 仅出径向渐变 fallback。
- 根需放进 `relative overflow-hidden` 定位容器并自带高度（如 `h-64`）。
- `transparent={true}` 时本身无黑底，需容器铺深色才出深空感；要经典纯黑深空传 `transparent={false}`。
- `mouseRepulsion` / `repulsionStrength` 仅在 `mouseInteraction=true` 时有效。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
