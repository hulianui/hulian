---
slug: pixel-snow
name: PixelSnow
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [PixelSnow]
status: enriched
---

# PixelSnow

> 像素化体素雪场 WebGL 背景 · 光线步进逐格哈希生雪 + 景深淡出 · 方块/圆点/六臂雪花三变体（ogl 去 three.js·token 着色·reduced-motion 静态点阵降级） · decoration/backdrop · #animated #webgl

## 何时用

需要一层「飘雪」氛围背景（节日页、冬季活动、登录页）时用它，自带景深纵深感与明暗自适应取色。要规则点阵选 [DotPattern](../dot-pattern/dot-pattern.md)，要通用复古点阵翻涌选 [PixelBlast](../pixel-blast/pixel-blast.md)；本组件专做体素雪场，有飘落方向、密度和层次纵深。

## 导入
```ts
import { PixelSnow } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"square" \| "round" \| "snowflake"` | `"square"` | 雪花形状：方块像素 / 圆点 / 六臂雪花 |
| color | `string` | 自适应（`--color-foreground`，撞色时取反） | 雪花主色；默认按身后底色亮度自适应取色，保证深底亮雪、浅底暗雪 |
| flakeSize | `number` | `0.01` | 雪花基准尺寸（屏幕空间比例）；越大越粗 |
| minFlakeSize | `number` | `1.25` | 远处雪花最小投影尺寸，防止亚像素消失 |
| pixelResolution | `number` | `200` | 像素化分辨率（横向切多少「大像素」）；越小马赛克越大越复古 |
| speed | `number` | `1.25` | 飘落速度因子；越大穿越视野越快 |
| depthFade | `number` | `8` | 景深淡出强度；越大远雪衰减越快纵深越强 |
| farPlane | `number` | `20` | 光线步进最远裁剪距离；越大可见层数越多（性能成本越高） |
| brightness | `number` | `1` | 整体亮度倍率 |
| gamma | `number` | `0.4545` | 伽马校正指数（≈1/2.2 sRGB 近似） |
| density | `number` | `0.3` | 雪花密度（每格出雪概率阈值）；越大越密。建议 0.05–0.6 |
| direction | `number` | `125` | 风向角度（度），决定横向漂移方向 |
| className | `string` | — | 透传到根容器（或 reduced-motion fallback div） |
| fallback | `ReactNode` | 白点 + difference 混合静态点阵雪 | reduced-motion / 无 WebGL 时的静态替代内容 |

## 示例

```tsx
// 默认：方块像素雪（父容器须 relative + overflow-hidden）
<div className="relative h-56 overflow-hidden rounded-xl">
  <PixelSnow />
</div>
```

```tsx
// 自定义冷蓝色 + 慢速壁纸，内容叠更高 z
<div className="relative h-56 overflow-hidden rounded-xl">
  <PixelSnow color="oklch(0.85 0.08 230)" speed={0.7} density={0.3} />
  <div className="relative z-10 flex h-full items-center justify-center text-white">瑚琏组件库</div>
</div>
```

## 禁忌 / 坑

- 组件满铺画布，**父容器须 `relative`，叠加内容用 `relative z-10`**，否则盖住内容 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- `color` 缺省会按身后实际底色自适应取色，但若把组件放进与全局主题相反的容器（如亮色主题下塞深色盒子），自适应是按 token 推断的——撞色时显式传 `color` 更稳。
- WebGL 客户端组件（`"use client"`）；SSR 阶段只渲染 fallback。
- headless 截图常拍到静止/空白帧（rAF 动画被饿死），真机或 Playwright 实测才能看到飘落 [[recharts-headless-screenshot-blank-clippath-animation-starved]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
