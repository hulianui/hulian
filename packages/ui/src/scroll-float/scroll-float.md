---
slug: scroll-float
name: ScrollFloat
category: typography
group: text
tags: [animated]
exports: [ScrollFloat]
status: enriched
---

# ScrollFloat

> 滚动浮现标题 · ：随容器滚过视口逐字符从「下沉 + 纵向拉伸横向压扁 + 透明」拔起到正常 · useScroll 绑进度 + 每字符 useTransform 派生 opacity/y/scaleX/scaleY（去 gsap·吃 text-foreground token·reduced-motion 直出清晰标题） · typography/text · #animated

## 何时用

长页面区块标题想随滚动逐字符「拔起」浮现时用。要通用块级（非逐字）入场用 Reveal；要平滑发光渐变标题用 AuroraText；ScrollFloat 专做随滚动进度逐字符变形浮现的大标题。

## 导入
```ts
import { ScrollFloat } from "@hulianui/ui"
```

## Props

继承 `h2` props（去 `children` 与 motion 冲突的 onDrag*/onAnimationStart）：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| scrollContainerRef | `RefObject<HTMLElement \| null>` | 自动探测 | 自定义滚动容器；不传时优先绑最近可滚动祖先，其次视口，完全无滚动上下文则降级为进入视口自动浮现 |
| offset | `[string, string]` | `["start 0.9", "start 0.35"]` | 进度映射区间(对应 useScroll offset)：顶进视口 90% 处开始、35% 处完成 |
| stagger | `number` | `0.4` | 字符间错峰强度(0~1)，每字符进度窗口相对整体的偏移比例 |
| yPercent | `number` | `120` | 初始下沉位移百分比(相对字高)，随进度回 0 |
| scaleY | `number` | `2.3` | 初始纵向拉伸倍率，随进度回 1 |
| scaleX | `number` | `0.7` | 初始横向压扁倍率，随进度回 1 |
| containerClassName | `string` | - | 外层容器类名(裁切溢出的滚动浮现) |
| textClassName | `string` | - | 文本层类名(控制字号/字重/对齐) |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `string` | 逐字符滚动浮现的文本(仅字符串，非字符串忽略为空) |

## 示例
```tsx
// 默认：在可滚动区域内逐字符拔起(组件自动绑最近可滚动祖先)
<div className="max-h-72 overflow-auto p-6">
  <div className="h-40" />
  <ScrollFloat>瑚琏组件库</ScrollFloat>
  <div className="h-56" />
</div>

// 强错峰 + 主色大标题
<ScrollFloat stagger={0.7} textClassName="text-primary text-3xl md:text-5xl">HULIAN</ScrollFloat>
```

## 禁忌 / 坑

- children 必须是字符串：传入非字符串会被忽略为空，逐字符拆分依赖纯文本。
- 需要可滚动上下文才有「随滚动浮现」效果：组件会自动绑最近可滚动祖先；完全没有滚动容器时降级为进入视口自动浮现（不会卡在 0 进度隐形态），但要逐字符随滚动播放仍需父级可滚动。
- reduced-motion 下直出清晰标题，不做变形动画。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
