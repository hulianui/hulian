---
slug: prism
name: Prism
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Prism]
status: enriched
---

# Prism

> 棱镜分光 WebGL 背景 · ray-march 八面体 SDF 折射出彩虹体积光 + rotate/3drotate/hover 三姿态(ogl·主题色相自适应·reduced-motion 降级) · decoration/backdrop · #animated #webgl

## 何时用

需要一个「3D 棱锥分光辉光」作为视觉焦点的背景（产品 Hero、品牌主视觉）时用它，单个发光棱镜居中、构图聚焦。要从中心放射的多瓣光爆选 [PrismaticBurst](../prismatic-burst/prismatic-burst.md)，要满铺流动纹理选 [Plasma](../plasma/plasma.md) / [PlasmaWave](../plasma-wave/plasma-wave.md)；本组件是单体棱镜实体，有体积感和折射彩虹边。

## 导入
```ts
import { Prism } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| height | `number` | `3.5` | 棱锥高度（沿 Y 轴）；越大越高耸光柱越细长 |
| baseWidth | `number` | `5.5` | 棱锥底边宽度；与 height 共定胖瘦比例 |
| animationType | `"rotate" \| "3drotate" \| "hover"` | `"rotate"` | rotate=XZ 正弦呼吸摆动（无整体旋转）/ 3drotate=三轴伪随机旋转 / hover=跟随全局指针倾斜（带惯性） |
| glow | `number` | `1` | 体积光辉强度；0=无辉光（暗轮廓） |
| offset | `{ x?: number; y?: number }` | `{ x: 0, y: 0 }` | 棱锥从画面正中平移（CSS 像素），构图避让内容 |
| noise | `number` | `0.5` | 颗粒噪声强度（电影感胶片颗粒）；0=纯净无颗粒 |
| transparent | `boolean` | `true` | true 时画布 alpha 透出底色，且自动提升饱和度更通透 |
| scale | `number` | `3.6` | 棱镜整体缩放；越大占视口越多 |
| hueShift | `number` | 主题推导（`--color-chart-1`） | 色相旋转（弧度）；显式传值在自动推导基础上叠加偏移 |
| colorFrequency | `number` | `1` | 分光色彩频率；越大彩虹条纹越密，越小色带越宽 |
| hoverStrength | `number` | `2` | hover 模式下跟随强度；越大倾斜幅度越大 |
| inertia | `number` | `0.05` | hover 模式惯性系数 0–1；越小越「黏滞」缓动越久 |
| bloom | `number` | `1` | 泛光叠加；与 glow 相乘放大整体亮度 |
| timeScale | `number` | `0.5` | 时间缩放（动画整体速度）；0=冻结为静态一帧 |
| className | `string` | — | 透传到根容器（或 reduced-motion fallback div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容；默认 chart token 径向辉光渐变 |

## 示例

```tsx
// 默认：rotate 呼吸摆动 + 主题色相（父容器须 relative）
<div className="relative h-64 overflow-hidden rounded-xl">
  <Prism />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">Prism</p>
  </div>
</div>
```

```tsx
// hover 跟随指针 + 三维旋转
<Prism animationType="hover" hoverStrength={2.4} inertia={0.06} />
```

## 禁忌 / 坑

- 组件自带 `absolute inset-0 z-0`，**父容器须 `relative`，叠加内容用 `relative z-10`**，否则盖住内容 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- `animationType="hover"` 跟随的是**全局指针**（不限于容器内），且仅此模式挂指针监听；rotate/3drotate 不响应鼠标。
- WebGL 客户端组件（`"use client"`）；SSR 阶段只渲染 fallback。
- `hueShift` 由 `--color-chart-1` 推导，主题色相经离屏 canvas 解析，**token 须带 `--color-` 前缀** [[oklch-css-var-color-must-parse-via-offscreen-canvas]]。
- headless 截图常拍到静止/空白帧（rAF 动画被饿死），真机或 Playwright 实测才能看到旋转 [[recharts-headless-screenshot-blank-clippath-animation-starved]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
