---
slug: fit-screen
name: FitScreen
category: layout
group: container
tags: []
exports: [FitScreen, computeFit]
status: enriched
---

# FitScreen

> 大屏适配 · 固定设计尺寸(默认 1920×1080)等比缩放铺满父容器并居中 + fit/cover/stretch 三模式(纯函数 computeFit 可测·ResizeObserver 监听·SSR 安全·数据可视化大屏刚需) · layout/container

## 何时用

按固定设计稿（如 1920×1080）画好的大屏内容，要整体等比缩放铺满任意父容器并居中时用——典型是数据可视化驾驶舱。它缩放的是「固定设计尺寸」；要按容器宽度重排（不缩放、内容自适应）用 [Viewport](../viewport/viewport.md)，只锁单元素宽高比用 [AspectRatio](../aspect-ratio/aspect-ratio.md)。

## 导入
```ts
import { FitScreen, computeFit } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| designWidth | `number` | `1920` | 设计稿宽。 |
| designHeight | `number` | `1080` | 设计稿高。 |
| mode | `"fit" \| "cover" \| "stretch"` | `"fit"` | fit=取 min(等比不裁切，四周可能留黑边)；cover=取 max(等比铺满，可能裁切)；stretch=非等比拉满(可能变形)。 |
| className | `string` | — | 外层容器类名。 |

`computeFit(input: FitInput)`：纯函数（`{ outerW, outerH, designW, designH, mode }` → 缩放结果），可单测，组件内部据 ResizeObserver 测量后调用它。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 你的固定设计尺寸大屏内容。 |

## 示例
```tsx
// 1920×1080 驾驶舱，等比不裁切铺满父容器
<FitScreen designWidth={1920} designHeight={1080} mode="fit">
  {/* 你的大屏内容，按 1920×1080 绝对布局 */}
</FitScreen>
```

```tsx
// 铺满不留黑边（可能裁切边缘）
<FitScreen mode="cover">
  <DesignBoard />
</FitScreen>
```

## 禁忌 / 坑

- **内部用 transform: scale 缩放**：headless/CDP 截图工具下，缩放后的几何坐标可能与真实点击错位，验证视觉/交互需注意（参见 [[recharts-headless-screenshot-blank-clippath-animation-starved]]、[[turbopack-dev-cold-route-blank-cdp-screenshot-warm-first]] 这类 headless 验证坑），FitScreen 下真实 click 失准时改用 `dispatchEvent`。
- **ref + style 写入的脱档崩溃**：组件在 effect 里向 ref 写 transform，遇 StrictMode 双挂载/`<Activity>`/Offscreen 重连时 `ref.current` 可能 truthy 但 `.style` 已脱档而崩 —— 见 [[react-offscreen-reconnect-detached-ref-style-crash]]，写前应 `if (!el?.style) return` 把守。
- 设计稿尺寸（designWidth/Height）须与 children 的实际绝对布局尺寸一致，否则缩放比算错、内容溢出或留白。

## 相关
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md)
