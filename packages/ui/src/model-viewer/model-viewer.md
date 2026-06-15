---
slug: model-viewer
name: ModelViewer
category: decoration
group: overlay-fx
tags: [animated]
exports: [ModelViewer]
status: enriched
---

# ModelViewer

> 交互式 3D 模型查看舞台 · 拖拽旋转(惯性) + 鼠标视差 + 悬停倾斜 + 自动旋转 + 接触阴影(零依赖 CSS 3D · RAF · reduced-motion) · decoration/overlay-fx · #animated

## 何时用

需要把任意 React 节点（产品图/卡片/SVG/emoji）放进一个可拖拽旋转、带惯性/视差/悬停倾斜/接触阴影的 3D 舞台时用——瑚琏化用纯 CSS 3D 替代了 three.js，不加载真实 GLTF/FBX 模型。要做局部放大镜用 [Lens](../lens/lens.md)；要做眩光悬停用 [GlareHover](../glare-hover/glare-hover.md)。ModelViewer 是「给 children 施加 3D 交互的舞台」。

## 导入
```ts
import { ModelViewer } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | `ReactNode` | — | 放进 3D 舞台中央的「模型」，由组件统一施加旋转/视差/倾斜 |
| width | `number ｜ string` | `"100%"` | 舞台宽度，由外层容器约束 |
| height | `number ｜ string` | `360` | 舞台高度 |
| defaultRotationY | `number` | `-20` | 初始偏航角（绕 Y，°），拖拽时累加 |
| defaultRotationX | `number` | `12` | 初始俯仰角（绕 X，°），拖拽时累加 |
| perspective | `number` | `1000` | 透视景深 px，越小透视越夸张 |
| enableManualRotation | `boolean` | `true` | 允许鼠标拖拽旋转，松手带惯性缓停 |
| enableMouseParallax | `boolean` | `true` | 鼠标视差（指针移动时模型轻微位移） |
| enableHoverRotation | `boolean` | `true` | 悬停倾斜（模型朝指针方向倾斜） |
| autoRotate | `boolean` | `false` | 自动绕 Y 轴匀速旋转，与手动拖拽叠加 |
| autoRotateSpeed | `number` | `24` | 自转角速度（°/s），仅 `autoRotate` 时生效 |
| showResetButton | `boolean` | `true` | 右上角「重置视角」工具按钮 |
| showContactShadow | `boolean` | `true` | 底部柔和接触阴影 |
| className | `string` | — | 透传根容器 className |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## 示例

```tsx
// 默认：拖拽旋转 + 视差 + 悬停倾斜 + 接触阴影
<ModelViewer>
  <YourModel />
</ModelViewer>

// 自动旋转展台
<ModelViewer autoRotate autoRotateSpeed={24} showContactShadow>
  <ProductCard />
</ModelViewer>
```

## 禁忌 / 坑

- 这是 CSS 3D 舞台，不渲染真实 GLTF/FBX/OBJ；`children` 应是平面/伪 3D 内容，深度感来自外层 `preserve-3d` 子层自行用 `translateZ`。
- 客户端组件（拖拽 + RAF 惯性循环），SSR 下静止；reduced-motion 下关惯性/自转等动画。
- 多层立方面等需 `transform-style: preserve-3d` 的内容须自己在 children 里设置，组件只负责整体旋转/视差容器。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
