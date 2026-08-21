---
slug: spotlight
name: Spotlight
category: decoration
group: backdrop
tags: []
exports: [Spotlight]
status: enriched
---

# Spotlight

> 在内容后面打一片跟随主题的径向辉光 · decoration/backdrop

## 何时用

给 Hero/卡片加柔和径向辉光（聚焦视线、营造氛围）。要辉光晕染用本组件；要规整纹理用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md) / [StripedPattern](../striped-pattern/striped-pattern.md)。

## 导入
```ts
import { Spotlight } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `string` | `var(--color-primary)` | 辉光色；可传任意 CSS 颜色/变量（如 `var(--color-success)`） |
| intensity | `number` | `14` | 辉光强度：辉光中心与底色 color-mix 的百分比，越大越亮 |
| x | `string` | `"50%"` | 辉光中心 X 位置 |
| y | `string` | `"0%"` | 辉光中心 Y 位置（顶部） |
| size | `string` | `"125%"` | 辉光椭圆尺寸（径向渐变范围） |
| fade | `number` | `55` | 渐隐到底色的位置百分比，越小辉光越聚拢 |

> 继承 `ComponentPropsWithoutRef<"div">`。

## 示例
```tsx
<div className="relative grid place-items-center overflow-hidden">
  <Spotlight intensity={18} x="20%" />
  <div className="relative z-10">…内容…</div>
</div>

<Spotlight color="var(--color-success)" y="50%" size="100%" intensity={16} />
```

## 禁忌 / 坑

- 内部 `absolute inset-0` 铺满父级，必须放在 `relative`（且通常 `overflow-hidden`）定位容器内；叠加内容须 `relative z-10` 才能盖在辉光之上。
- 自定义 `color` 用 token 变量（`var(--color-*)`，须带 `--color-` 前缀）而非裸 `var(--primary)`，否则 color-mix 不解析。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md) · [Meteors](../meteors/meteors.md)
