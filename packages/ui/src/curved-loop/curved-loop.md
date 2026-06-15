---
slug: curved-loop
name: CurvedLoop
category: typography
group: text
tags: [animated]
exports: [CurvedLoop]
status: enriched
---

# CurvedLoop

> 沿二次贝塞尔曲线无缝循环滚动的弧形跑马灯文字 · SVG textPath + rAF 续滚 + 可拖拽拨动(零依赖·token/currentColor·reduced-motion) · typography/text · #animated

## 何时用

页眉 / 区块分隔带想要弯曲弧形走向的跑马灯横幅时用。需要随页面滚动加速变向的多行平排跑马灯用 ScrollVelocity；只要一条沿曲线无缝循环、还能手动拨动的弧形文字带就用 CurvedLoop。

## 导入
```ts
import { CurvedLoop } from "@hulianui/ui"
```

## Props

继承 `SVGProps<SVGSVGElement>`（去 `ref`），常用如下：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text | `string` | — | 跑马灯文案，内部去尾部空白并补不间断空格作词间隔，首尾无缝拼接铺满曲线 |
| speed | `number` | `2` | 滚动速度(px/帧，约 60fps)，越大越快 |
| curveAmount | `number` | `320` | 弯曲量(二次贝塞尔控制点垂直偏移，viewBox 像素)，正值向下弯/负值向上弯/0 近直线 |
| direction | `"left" \| "right"` | `"left"` | 自动滚动方向 |
| interactive | `boolean` | `true` | 是否允许鼠标/触控拖拽拨动文字(松手后沿拖拽方向续滚) |
| className | `string` | — | 文字颜色 token 类名(如 text-primary)；默认 fill 走 currentColor，可由父级 text-* 控制 |

## 示例
```tsx
// 默认：向下弯、左滚
<CurvedLoop text="瑚琏 · HULIAN · " className="text-white" />

// 向上弯(curveAmount 负值) + 主色
<CurvedLoop text="ENTERPRISE UI · " curveAmount={-220} className="text-[var(--color-chart-1)]" />

// 右滚高速、纯展示不可拖
<CurvedLoop text="瑚琏组件库 · " direction="right" speed={4} interactive={false} />
```

## 禁忌 / 坑

- 文案末尾习惯带分隔符（如 `" · "`），内部会补不间断空格做词间隔再首尾拼接，缺分隔符会让循环接缝读起来粘连。
- 颜色走 currentColor：用 className 的 `text-*` 控制色，不要直接传 `fill`。
- reduced-motion 下停止自动滚动；交互拨动仍可用，别用动画做核心信息载体。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
