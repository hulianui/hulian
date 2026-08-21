---
slug: orbit-images
name: OrbitImages
category: decoration
group: overlay-fx
tags: [animated]
exports: [OrbitImages]
status: enriched
---

# OrbitImages

> 轨道环绕 · 沿轨道环绕流转的子项编排组件 · 9 种形状预设(椭圆/圆/方/三角/星/心/无穷/波浪+custom path)+等距铺满/鱼贯出发+可倾斜+中心叠层(纯 CSS offset-path·零依赖·客户端组件·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

需要把一组头像/图标/Logo 沿某种形状轨道环绕流转（生态墙、合作伙伴、技术栈展示），且要任意形状（星/心/无穷）和中心叠层。要的是简单同心圆轨道的图标公转选 [OrbitingCircles](../orbiting-circles/orbiting-circles.md)；OrbitImages 形状更丰富（offset-path 驱动）、可承载任意 ReactNode 子项、零依赖。

## 导入
```ts
import { OrbitImages } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| shape | `"ellipse"｜"circle"｜"square"｜"rectangle"｜"triangle"｜"star"｜"heart"｜"infinity"｜"wave"｜"custom"` | `"ellipse"` | 轨道形状预设，custom 走 customPath |
| customPath | `string` | - | shape="custom" 时的 SVG path d（坐标基于 baseWidth 方形画布） |
| baseWidth | `number` | `1400` | 设计画布边长（px·方形 viewBox），只影响路径几何比例 |
| radiusX | `number` | `700` | 椭圆/矩形/无穷/波浪 的横向半径（px·基于 baseWidth） |
| radiusY | `number` | `170` | 椭圆/矩形/无穷/波浪 的纵向半径 |
| radius | `number` | `300` | 圆/方/三角/星/心 的半径 |
| starPoints | `number` | `5` | star 形状的角数 |
| starInnerRatio | `number` | `0.5` | star 内外半径比（0-1），越小星芒越尖 |
| rotation | `number` | `-8` | 轨道倾斜角（deg），子项反向自转保持正立 |
| duration | `number` | `40` | 跑完一圈时长（秒），越大越慢 |
| itemSize | `number` | `64` | 单个子项边长（px·CSS 像素） |
| direction | `"normal"｜"reverse"` | `"normal"` | 流转方向 |
| fill | `boolean` | `true` | true 等距铺满轨道，false 从同点鱼贯出发 |
| showPath | `boolean` | `false` | 描出轨道路径（调试/装饰） |
| pathColor | `string` | `"var(--color-border)"` | 轨道描边颜色 |
| pathWidth | `number` | `2` | 轨道描边宽度（px·基于 baseWidth） |
| className | `string` | - | 透传到根容器 |
| style | `CSSProperties` | - | 透传到根容器（默认 1:1 自适应铺满父宽） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| items * | `ReactNode[]` | 沿轨道环绕的子项（img/图标/头像/卡片皆可），必填 |
| centerContent | `ReactNode` | 居中内容（Logo/标题），不随轨道旋转 |

## 示例
```tsx
// 椭圆轨道 · 等距铺满 · 描出路径 · 中心标题
<OrbitImages
  items={chips}
  shape="ellipse"
  duration={24}
  itemSize={48}
  showPath
  centerContent={<span className="text-sm font-semibold">瑚琏</span>}
/>
```
```tsx
// 圆形轨道
<OrbitImages items={chips} shape="circle" radius={260} duration={30} itemSize={44} />
```

## 禁忌 / 坑

- 纯 CSS `offset-path` 驱动，零依赖；但 `offset-path` 在老浏览器/部分 WebKit 上有兼容差异，关键场景需验真机。
- 客户端组件（`"use client"`）：要在 layout effect 里量容器尺寸算缩放。SSR 期不量、不报错，首帧按未缩放渲染。
- `radiusX/Y/radius/baseWidth` 都是 baseWidth 坐标系内的设计像素，不是最终屏幕像素——容器靠 CSS 缩放铺满父宽，调几何比例改这些、调实际大小改父容器尺寸。
- `pathColor` 给 token 时用 `var(--color-border)` 这类带 `--color-` 前缀的语义色，避免裸 var 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
