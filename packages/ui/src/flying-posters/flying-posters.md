---
slug: flying-posters
name: FlyingPosters
category: data-display
group: collection
tags: [animated]
exports: [FlyingPosters]
status: enriched
---

# FlyingPosters

> WebGL 海报飞行长廊 · 一列海报随滚轮/拖拽无限循环上下飞过，顶点着色器按 distortion 翻折"飞起"·离屏循环复用 + 透视相机景深(ogl·懒加载·StrictMode 安全·reduced-motion 静态海报网格 fallback·去 gsap 改 RAF lerp) · data-display/collection · #animated

## 何时用

需要把一组同比例海报/封面做成沉浸式的滚动飞行长廊（落地页 hero、画廊入口）时用。要的是"真 3D 倾斜翻折 + 透视景深"用本组件（WebGL/ogl）；只想要 2D 平面卡片的鼠标悬停倾斜用 [TiltedCard](../tilted-card/tilted-card.md)，要滚动逐张钉住堆叠用 [ScrollStack](../scroll-stack/scroll-stack.md)。

## 导入
```ts
import { FlyingPosters } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `string[]` | `[]` | 海报图片地址数组，按顺序首尾相接无限循环。建议同比例图，shader 内 cover 裁切不变形；空数组只渲空画布不抛错 |
| planeWidth | `number` | `320` | 单张海报平面宽度（世界单位），与 planeHeight 共定比例与密度 |
| planeHeight | `number` | `320` | 单张海报平面高度（世界单位） |
| distortion | `number` | `3` | 卷动时弯折扭曲强度，越大翻折越夸张；建议 1-6，0 近似平移 |
| scrollEase | `number` | `0.01` | 卷动缓动系数（0-1），越小越"重"惯性越长（showcase 默认演示用 0.05） |
| cameraFov | `number` | `45` | 透视相机视场角（度），越大透视越强、飞入飞出弧度越明显 |
| cameraZ | `number` | `20` | 相机 Z 轴距离，越大画面越远、可见海报越多 |
| autoScroll | `boolean` | `true` | 无交互时是否自动缓慢卷动；reduced-motion 下强制关闭 |
| autoScrollSpeed | `number` | `0.6` | 自动卷动速度（世界单位/秒），autoScroll 为真时生效 |
| className | `string` | - | 透传到根容器的额外 className |
| style | `CSSProperties` | - | 透传到根容器的内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion 或无 WebGL 时，静态备用层中央展示的内容 |

## 示例
```tsx
// 根容器需自带尺寸（组件填满父级），通常 absolute inset-0 铺满定位容器
<div className="relative h-80 w-full overflow-hidden rounded-xl">
  <FlyingPosters items={posters} className="absolute inset-0" />
</div>

// 强翻折 + 广角透视
<FlyingPosters items={posters} distortion={5} cameraFov={70} cameraZ={26} />
```

## 禁忌 / 坑

- 根容器**必须有明确尺寸**（如 `absolute inset-0` 铺满一个定高的相对定位父级）；否则画布为 0 不可见。
- WebGL 仅客户端可用：组件内部已懒加载 ogl 并做 SSR/StrictMode 安全降级，但仍应放在客户端渲染路径，无 WebGL/reduced-motion 时回退 `fallback` 静态层。
- [[webgl-canvas-loseContext-poisons-strictmode-remount]]：cleanup 调 loseContext 会永久毒化 canvas，StrictMode 双挂载复用即崩白屏——本组件应每次挂载新建 canvas，不要在外层缓存复用其 canvas 节点。
- [[mcp-browser-busy-launch-isolated-chromium-via-executablepath]] / [[recharts-headless-screenshot-blank-clippath-animation-starved]]：headless 截图验证时 WebGL 入场动画可能停在第 0 帧显空白，属正常现象，用真实浏览器或设 reduced-motion 再验。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
