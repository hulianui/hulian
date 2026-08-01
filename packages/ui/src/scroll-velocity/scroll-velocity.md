---
slug: scroll-velocity
name: ScrollVelocity
category: typography
group: text
tags: [animated]
exports: [ScrollVelocity]
status: enriched
---

# ScrollVelocity

> 滚动跑马灯 · 滚动速度跑马灯文字 · 多行交替方向视差 + 随页面滚动加速/变向、静止匀速漂移(motion 速度值驱动·零额外依赖·reduced-motion 冻结自走帧保留 DOM) · typography/text · #animated

## 何时用

页面区块想要多行平排、随页面滚动加速变向的视差跑马灯横幅时用。要单条沿曲线弯曲走向的跑马灯用 CurvedLoop；ScrollVelocity 专做多行交替方向、速度跟随滚动的水平滚动文字带。

## 导入
```ts
import { ScrollVelocity } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| texts | `string[]` | `[]` | 多行滚动文本，每行独立跑马灯；偶数行左移/奇数行右移形成视差 |
| velocity | `number` | `100`（showcase 演示 `80`） | 基础速度(px/秒)，静止也匀速漂移；负值整体反向 |
| damping | `number` | `50` | 弹簧阻尼，速度变化的黏滞感；越大越慢越稳 |
| stiffness | `number` | `400` | 弹簧刚度，速度跟手的劲道；越大越紧绷 |
| numCopies | `number` | `6` | 每行复制份数(无缝循环铺满)；文本越短需越多份 |
| velocityMapping | `{ input: [number, number]; output: [number, number] }` | `{ input: [0,1000], output: [0,5] }` | 滚动速度→加速因子映射(clamp:false 允许外推) |
| scrollContainerRef | `RefObject<HTMLElement \| null>` | window | 自定义滚动容器；不传监听 window 滚动 |
| className | `string` | — | 透传每行文本 span 的 className(字号/字色/字重) |
| containerClassName | `string` | — | 透传根 section 的 className |
| parallaxStyle | `CSSProperties` | — | 透传每行外层(parallax)容器内联样式 |
| scrollerStyle | `CSSProperties` | — | 透传每行滚动轨(scroller)内联样式 |

## 示例
```tsx
// 单行匀速漂移
<ScrollVelocity texts={["瑚琏组件库"]} velocity={80} />

// 双行交替方向(视差)
<ScrollVelocity texts={["企业级 · 高质量", "原生适配 · 主题感知"]} velocity={70} />
```

## 禁忌 / 坑

- 文本越短越要调大 numCopies：份数不足时铺不满视口宽度会露出空隙。
- 字色/字号走 `className`（作用于每行文本 span），容器整体样式走 `containerClassName`，别混用。
- 默认监听 window 滚动：内嵌在自定义可滚动区时要传 scrollContainerRef，否则速度感应绑错滚动源。
- reduced-motion 下冻结跟滚加速、保留匀速自走帧与 DOM，文本仍可读。

## 相关
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
