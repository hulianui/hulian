---
slug: border-beam
name: BorderBeam
category: decoration
group: overlay-fx
tags: [animated]
exports: [BorderBeam]
status: enriched
---

# BorderBeam

> 边框光束 · motion offsetPath 绕边 + mask 只露边框 · decoration/overlay-fx · #animated

## 何时用

想给卡片/容器边框加一段沿边匀速绕行的彩色光点（强调、加载中、AI 卡片高亮）时用。它是绝对定位的覆盖件，需放进 `relative` 容器内。要的是整条边框持续流光渐变（非一个光点绕圈）用 [ShineBorder](../shine-border/shine-border.md)；要连接两个元素的光束用 [AnimatedBeam](../animated-beam/animated-beam.md)；要 hover 斜扫反光用 [GlareHover](../glare-hover/glare-hover.md)。

## 导入
```ts
import { BorderBeam } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `number` | `50` | 光束方块边长 px（showcase 默认演示用 60） |
| duration | `number` | `6` | 绕行一轮秒数 |
| delay | `number` | `0` | 起始延迟秒 |
| colorFrom | `string` | `var(--color-primary)` | 光束起色 |
| colorTo | `string` | `var(--color-chart-2)` | 光束止色 |
| reverse | `boolean` | `false` | 反向绕行 |
| initialOffset | `number` | `0` | 起始偏移 0-100 |
| borderWidth | `number` | `1` | 边框宽度 px |
| className | `string` | - | 透传 className |
| style | `CSSProperties` | - | 透传内联样式 |

## 示例

```tsx
// 须放进 relative + overflow-hidden 容器
<div className="relative overflow-hidden rounded-xl border bg-surface">
  ...content
  <BorderBeam />
</div>
```

```tsx
<div className="relative overflow-hidden rounded-xl">
  ...content
  <BorderBeam reverse duration={10} size={80} />
</div>
```

## 禁忌 / 坑

- 必须置于 `position:relative` 容器内，且容器一般 `overflow-hidden`，否则光束绕到圆角外溢出。
- 颜色 prop 喂 token 时需带 `--color-` 前缀（默认值已带），裸 `var(--primary)` 不解析——参见 [[hulian-token-color-var-needs-color-prefix]]。
- 系统开启「减少动态效果」时整个组件不渲染。光束是纯装饰层（`absolute inset-0 pointer-events-none`），不渲染既不影响布局也不丢信息；让它静止在半途反而像渲染残留。

## 相关
[ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
