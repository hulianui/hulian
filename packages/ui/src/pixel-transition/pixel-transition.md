---
slug: pixel-transition
name: PixelTransition
category: decoration
group: overlay-fx
tags: [animated]
exports: [PixelTransition]
status: enriched
---

# PixelTransition

> 像素马赛克转场卡片：双层内容叠放，悬停/聚焦/点击触发一幕随机散入再散出的像素幕布完成切换 · 自定网格密度/过场时长/只进不退 + token 像素色（去 gsap·motion 减包驱动·reduced-motion 直切） · decoration/overlay-fx · #animated

## 何时用

需要两张内容（图/文案/封面）以「像素马赛克幕布」交互切换的卡片（作品集封面 hover 揭示、CTA 卡）。它是承载真实双层内容的交互件，不是纯背景——要纯背景铺底选 [PixelTrail](../pixel-trail/pixel-trail.md)；要鼠标擦亮高光选 [GlareHover](../glare-hover/glare-hover.md)。

## 导入
```ts
import { PixelTransition } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| gridSize | `number` | `7` | 像素网格边长（总块数 gridSize²），越大越细腻越软 |
| pixelColor | `string` | `"var(--color-foreground)"` | 像素块填色，建议 token 变量或 `currentColor` |
| animationStepDuration | `number` | `0.3` | 单次过场时长（秒），散入+散出各占一半，中点切换 |
| once | `boolean` | `false` | 只进不退：激活后停在 secondContent，离开/失焦不返回 |
| aspectRatio | `string` | `"4 / 3"` | 容器宽高比（CSS aspect-ratio 写法，如 `"1 / 1"`、`"16 / 9"`） |
| className | `string` | — | 透传到根元素，cn 合并 |
| style | `CSSProperties` | — | 透传到根元素 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| firstContent * | `ReactNode` | 默认（静止）态内容，通常一张图/一段文案，必填 |
| secondContent * | `ReactNode` | 激活态内容，悬停/聚焦/点击后透过像素幕布显露，必填 |

## 示例
```tsx
// 悬停 / 聚焦触发切换
<PixelTransition
  firstContent={<Face label="瑚琏" />}
  secondContent={<Face label="组件库" />}
/>
```
```tsx
// 只进不退（once）· 正方形
<PixelTransition
  once
  aspectRatio="1 / 1"
  firstContent={<Face label="点我" />}
  secondContent={<Face label="✓" />}
/>
```

## 禁忌 / 坑

- `firstContent` / `secondContent` 为必填双层内容，两层都要能 100% 撑满（用 `h-full w-full`），否则像素幕布揭示后露出空白。
- `pixelColor` 给 token 用带 `--color-` 前缀的变量（`var(--color-foreground)`），裸 var 在 Tailwind v4 下不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- motion 驱动（非 gsap）；reduced-motion 下直接硬切，无散入散出动画。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
