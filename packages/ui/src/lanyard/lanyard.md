---
slug: lanyard
name: Lanyard
category: decoration
group: overlay-fx
tags: [animated]
exports: [Lanyard]
status: enriched
---

# Lanyard

> 可拖拽的挂绳工牌 · 单摆+阻尼弹簧物理回弹(原生 PointerEvents+RAF·零三方依赖) + SVG 二次贝塞尔挂绳随摆角实时弯折 + token 配色(挂绳 primary·工牌 surface/border)·reduced-motion 松手即静止归位 · decoration/overlay-fx · #animated

## 何时用

需要一个有物理感的「挂绳工牌」装饰交互——可拖拽、松手单摆阻尼回弹、挂绳随摆角实时弯折时用，适合个人站/团队页/趣味 hero。要做眩光悬停高光用 [GlareHover](../glare-hover/glare-hover.md)；要做静态边框光带用 [BorderBeam](../border-beam/border-beam.md)。Lanyard 是「会甩动的物理工牌」，工牌正面可放任意 children。

## 导入
```ts
import { Lanyard } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| ropeLength | `number` | `120` | 挂绳长度 px（顶部锚点到工牌钩扣的静止距离），越大摆幅越舒展回弹越慢 |
| ropeColor | `string` | `var(--color-primary)` | 挂绳颜色，喂 SVG stroke 的 token 须带 `--color-` 前缀 |
| stiffness | `number` | `0.045` | 回弹刚度（弹簧常数），越大回正越快越硬，建议 0.02–0.12 |
| damping | `number` | `0.92` | 阻尼（每帧速度衰减），越接近 1 余摆越久，建议 0.85–0.97 |
| children | `ReactNode` | — | 工牌正面内容；不传则渲染占位工牌 |
| title | `string` | `"瑚琏 · HULIAN"` | 占位工牌标题（仅未传 children 时显示） |
| subtitle | `string` | `"拖动摆一摆"` | 占位工牌副标题（仅未传 children 时显示） |
| className | `string` | — | 透传根容器 className |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## 示例

```tsx
// 默认占位工牌（在固定高度的相对定位舞台内绝对铺满）
<div className="relative h-80 overflow-hidden rounded-xl">
  <Lanyard className="absolute inset-0" />
</div>

// 长绳·绵软余摆
<Lanyard
  className="absolute inset-0"
  ropeLength={160}
  stiffness={0.025}
  damping={0.965}
  title="慢摇工牌"
  subtitle="拖一下放手看余摆"
/>
```

## 禁忌 / 坑

- 工牌靠绝对定位悬挂，根容器需是 `relative overflow-hidden` 且有明确高度，否则工牌会溢出或定位错乱（showcase 一律传 `className="absolute inset-0"` 配固定高舞台）。
- `ropeColor` 喂 SVG stroke，token 必须带 `--color-` 前缀，裸 `var(--primary)` 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- 客户端组件（PointerEvents + RAF 物理循环），SSR 下不摆动；reduced-motion 下松手立即静止归位，不做余摆。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
