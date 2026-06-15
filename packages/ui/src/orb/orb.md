---
slug: orb
name: Orb
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Orb]
status: enriched
---

# Orb

> 指针交互光球 · WebGL/ogl 发光能量球 + hover 增亮/旋转 + hue 色相 + reduced-motion 径向渐变球 · decoration/backdrop · #animated #webgl

## 何时用

需要一个聚焦视线的发光能量球做 hero/卡片/空状态焦点元素，且希望随指针 hover 产生增亮、扭曲、旋转反馈时用。它是「焦点元素」——canvas 填满外层方形容器，尺寸由容器决定。若要的是铺满整面的流动金属背景层用 [LiquidChrome](../liquid-chrome/liquid-chrome.md)；只要静态点阵/网格底纹用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)。

## 导入
```ts
import { Orb } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| hue | `number` | `0` | 色相旋转（度）。0 = 原始蓝紫；正值顺时针旋转 YIQ 色相 |
| hoverIntensity | `number` | `0.2` | 悬停扭曲强度（0–1），越大变形越明显 |
| rotateOnHover | `boolean` | `true` | 悬停时是否自动旋转光球 |
| forceHoverState | `boolean` | `false` | 强制保持悬停激活态（演示 / 截图场景用） |
| className | `string` | — | 透传到 canvas（正常）或 fallback div（降级）的 className |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态备用内容（置于径向渐变球中央） |

## 示例

```tsx
// Orb 是焦点元素，需放进决定其尺寸的方形容器
<div className="relative overflow-hidden rounded-2xl" style={{ width: 280, height: 280 }}>
  <Orb />
</div>
```

```tsx
// 换色相 + 强制悬停态（适合截图）
<div className="relative" style={{ width: 280, height: 280 }}>
  <Orb hue={120} forceHoverState hoverIntensity={0.4} />
</div>
```

## 禁忌 / 坑

- WebGL 组件，必须在客户端渲染；SSR 环境下首屏走 reduced-motion / 无 WebGL 的径向渐变 fallback，需保证 `fallback` 或默认渐变球在服务端可见。
- cleanup 时不要主动调 `loseContext` 毒化 canvas，否则 React StrictMode 双挂载复用同一 canvas 会直接崩、空白——参见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]，正确做法是每次挂载新建 canvas。
- canvas 填满外层容器，外层必须有确定的宽高（方形最佳），否则光球塌缩不可见。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
