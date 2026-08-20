---
slug: animated-beam
name: AnimatedBeam
category: decoration
group: overlay-fx
tags: [animated]
exports: [AnimatedBeam]
status: enriched
---

# AnimatedBeam

> 动效光束 · 连接两元素的流光曲线(motion 渐变 + SVG + ResizeObserver) · decoration/overlay-fx · #animated

## 何时用

想在画布里把两个 DOM 节点用一条会流光的曲线连接起来（架构图、集成示意、AI 数据流、"汇聚到中枢"动效）时用。它靠 `containerRef`/`fromRef`/`toRef` 测量端点几何并画 SVG 曲线，可叠多条组合成网络。要绕单个容器边框的光点用 [BorderBeam](../border-beam/border-beam.md)；要图标沿圆周公转用 [OrbitingCircles](../orbiting-circles/orbiting-circles.md)。

## 导入
```ts
import { AnimatedBeam } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| containerRef* | `RefObject<HTMLElement \| null>` | — | 定位基准容器，须 `position:relative` |
| fromRef* | `RefObject<HTMLElement \| null>` | — | 起点元素 ref |
| toRef* | `RefObject<HTMLElement \| null>` | — | 终点元素 ref |
| curvature | `number` | `0` | 曲率（>0 上凸） |
| reverse | `boolean` | `false` | 光束反向流动 |
| duration | `number` | — | 一趟时长(s) |
| delay | `number` | — | 起始延迟 |
| pathColor | `string` | border token | 底线颜色 |
| pathWidth | `number` | — | 底线宽度 |
| pathOpacity | `number` | — | 底线不透明度 |
| gradientStartColor | `string` | chart token | 流光渐变起色 |
| gradientStopColor | `string` | chart token | 流光渐变止色 |
| startXOffset / startYOffset | `number` | — | 起点偏移 |
| endXOffset / endYOffset | `number` | — | 终点偏移 |
| className | `string` | — | 透传 className |

## 示例

```tsx
"use client";
function Demo() {
  const container = useRef<HTMLDivElement>(null);
  const from = useRef<HTMLDivElement>(null);
  const to = useRef<HTMLDivElement>(null);
  return (
    <div ref={container} className="relative flex items-center justify-between">
      <div ref={from} className="size-12 rounded-full bg-surface" />
      <div ref={to} className="size-12 rounded-full bg-surface" />
      {/* 流向用 reverse 控制：false=左→右、true=右→左 */}
      <AnimatedBeam containerRef={container} fromRef={from} toRef={to} reverse={false} />
    </div>
  );
}
```

## 禁忌 / 坑

- 客户端组件，依赖 ref 测量，必须 `"use client"`；`containerRef` 容器必须 `position:relative`，否则曲线坐标错位。
- 流光扫描方向由 `reverse` 决定（沿容器水平方向，与 path 端点顺序无关）：`false` 左→右、`true` 右→左；做"四周汇聚到中枢"时需让右侧光束 `reverse`。
- 颜色 prop 喂 token 需带 `--color-` 前缀——参见 [[hulian-token-color-var-needs-color-prefix]]。
- 端点元素与光束同处容器，记得给端点 `z-10` 之类层级使其压在光束上。
- 系统开启「减少动态效果」时，流光与渐变不渲染，只留静态连线。连线表达的「A 连到 B」是信息，不随动效一起去掉。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
