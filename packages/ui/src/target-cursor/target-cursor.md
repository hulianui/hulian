---
slug: target-cursor
name: TargetCursor
category: decoration
group: overlay-fx
tags: [animated]
exports: [TargetCursor]
status: enriched
---

# TargetCursor

> 准星光标 · 跟随鼠标的准星自定义光标 · 中心圆点 + 四角括号空闲自转、悬停命中元素时展开包裹其包围盒(去 gsap·裸 rAF lerp·token 着色·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

想给页面/某块区域换上准星式自定义光标、悬停到目标元素时四角括号自动框住它，做游戏化或炫技交互时用。它接管光标本身；如果只是想让某个元素在悬停时发光/变形（不改光标），用 [GlareHover](../glare-hover/glare-hover.md)；要鼠标跟随的局部放大镜则用 [Lens](../lens/lens.md)。

## 导入
```ts
import { TargetCursor } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| targetSelector | `string` | `".cursor-target"` | 命中目标的 CSS 选择器，悬停匹配元素时四角括号展开包裹它 |
| spinDuration | `number` | `2` | 空闲态四角括号绕中心自转一圈的秒数，越小越快 |
| hideDefaultCursor | `boolean` | `true` | 是否隐藏系统默认光标（容器作用域只隐藏父容器内；fullScreen 接管 body cursor，卸载还原） |
| fullScreen | `boolean` | `false` | 是否升级为整页全屏光标（fixed 铺满 viewport、监听挂 window）；默认容器作用域（absolute 锚父容器、离开即隐藏、多实例并存） |
| color | `string` | `var(--color-foreground)` | 光标主色（dot 背景 + 四角描边），须带 `--color-` 前缀才解析 |
| hoverDuration | `number` | `0.2` | 四角括号包裹目标的缓动跟随时长（秒），越大越「黏」 |
| className | `string` | - | 透传根容器额外类名 |
| style | `CSSProperties` | - | 透传根容器内联样式 |

## 示例
```tsx
// 容器作用域：把准星限制在某块区域内，移入 .cursor-target 即被框住
<div className="relative">
  <div className="cursor-target">瞄准我</div>
  <TargetCursor />
</div>

// 主色 + 快速自转 + 黏性包裹
<TargetCursor color="var(--color-primary)" spinDuration={0.8} hoverDuration={0.6} />
```

## 禁忌 / 坑

- `color` 走 token 必须带 `--color-` 前缀（如 `var(--color-primary)`），裸 `var(--primary)` 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- 容器作用域要求父元素是定位上下文；若父元素 `position: static`，组件会就地补 `position: relative` 并在卸载时还原——别依赖父元素自身的 static 定位。
- `fullScreen` 模式接管 `document.body` 的 cursor，全页只该放一个实例；容器作用域才能多实例并存。
- 监听挂 window/容器、隐藏系统光标都是浏览器行为，须客户端运行（组件已标 `"use client"`）。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
