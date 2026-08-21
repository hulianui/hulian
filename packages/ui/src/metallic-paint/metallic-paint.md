---
slug: metallic-paint
name: MetallicPaint
category: decoration
group: overlay-fx
tags: [animated]
exports: [MetallicPaint]
status: enriched
---

# MetallicPaint

> 液态金属漆面 · WebGL 装饰背景 · fbm 液态扰动 + RGB 折射色散 + 多段金属条纹梯度(ogl·token·reduced-motion 降级) · decoration/overlay-fx · #animated

## 何时用

需要一块流动的「液态金属/水银漆面」背景（hero、品牌页、卡片底），自带折射虹彩与条纹梯度。要的是规整的发光描边选 [BorderBeam](../border-beam/border-beam.md) / [ShineBorder](../shine-border/shine-border.md)；要的是融合分裂的黏液球选 [MetaBalls](../meta-balls/meta-balls.md)；MetallicPaint 偏「整面金属质感铺底」，常叠一层居中文案。

## 导入
```ts
import { MetallicPaint } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| lightColor | `string` | `var(--color-chart-1)` | 高光金属色（亮部峰值）。CSS 颜色或带 `--color-` 前缀的 token |
| darkColor | `string` | `var(--color-foreground)` | 暗部金属色（低谷阴影） |
| speed | `number` | `1` | 金属流动速度因子，0≈静止（仍有极慢漂移） |
| scale | `number` | `1` | 纹理缩放，越大纹路越密 |
| refraction | `number` | `1` | 折射强度，越大 RGB 错位色散/虹彩越明显 |
| liquid | `number` | `0.6` | 液态扰动强度，越大越像流动水银，0=平整镜面 |
| blur | `number` | `0.6` | 色带边缘模糊，建议 0.2-1.5；过小条纹生硬、过大金属感消散 |
| angle | `number` | `-45` | 整体旋转角度（度），改变光线入射方向 |
| className | `string` | - | 透传到容器（或 fallback div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代（默认 token 金属渐变 div） |

## 示例
```tsx
// 默认金属漆 + 居中文案（容器需 relative + overflow-hidden）
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.01 255)" }}>
  <MetallicPaint className="opacity-95" />
  <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
    Metallic Paint
  </div>
</div>
```
```tsx
// 强折射虹彩
<MetallicPaint refraction={1.8} lightColor="var(--color-chart-2)" className="opacity-95" />
```

## 禁忌 / 坑

- token 色喂 `lightColor` / `darkColor` 必须带 `--color-` 前缀，裸 `var(--primary)` shader 解析不到。见 [[hulian-token-color-var-needs-color-prefix]]。
- WebGL/ogl 组件，`"use client"` 仅客户端渲染；StrictMode 双挂载下 canvas context 复用风险见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]。
- 父容器需 `overflow-hidden` 裁掉超出的金属纹；叠文案记得给文字层 `relative z-10`。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
