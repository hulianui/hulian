---
slug: text-reveal
name: TextReveal
category: typography
group: text
tags: [animated]
exports: [TextReveal]
status: enriched
---

# TextReveal

> 揭示扫光 · 一条多色带横扫，带过之处把文字从透明揭示成实色(repeat 循环表示「进行中」· 多串轮换按最宽串预留宽度不跳 · 减弱动效落静态终态而不是整串消失 · 纯 CSS 关键帧不引 motion) · typography/text · #animated

## 何时用

有两种用法，第二种才是它存在的理由：

1. **进场**：滚入视口扫一轮，停在全部揭示的终态（默认行为）。
2. **「进行中」的状态文字**：`repeat` 循环扫，表示后台长任务正在推进（「OCR 中」「解析中」「归档中」）。

第二种是库里此前的空白：20 多个字效件按用途只有「一次性进场」一类，播完就静。而「进行中」的动画**停下来本身就是错误信号**——用户是靠它还在动来判断后台没死（#255）。

与邻居的分界：[AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) 是在**已经可见**的文字上加一道单色高光，不做「从透明揭示成实色」；[StreamingText](../streaming-text/streaming-text.md) 的语义是「token 正在到达」，文本要由父级增长，而本件的文案是**整串已知**的阶段名；[SplitText](../split-text/split-text.md) / [BlurText](../blur-text/blur-text.md) 是一次性进场。

## 导入
```ts
import { TextReveal } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text * | `string ｜ string[]` | - | 要揭示的文字。传数组即多串轮换（配 `repeat`），容器宽度按最宽那串预留 |
| colors | `string[]` | chart-1..5 | 扫光带的颜色，吃主题。传单色即单色带 |
| textColor | `string` | `var(--color-foreground)` | 已揭示部分的文字色。**不能传 `currentColor`**，见下 |
| duration | `number` | `2` | 扫完一轮的秒数 |
| repeat | `boolean` | `false` | 循环扫。「进行中」语义必开 |
| startOnView | `boolean` | `true` | 滚入视口才开始。侧边栏里一开始就在视口内的标签传 `false` |
| once | `boolean` | `true` | 只扫一次；`false` 则每次滚回视口重扫。仅在 `startOnView` 为 `true` 时有意义 |

其余 `<span>` 原生属性（`className` / `title` / `style` 等）透传。

## 示例
```tsx
// 后台长任务的阶段名：一直扫到任务结束
<TextReveal text={statusTag} repeat startOnView={false} />

// 多串轮换，宽度按最宽那串预留，右边的元素不会跟着跳
<TextReveal text={["OCR 中", "解析中", "归档中"]} repeat startOnView={false} />

// 进场用法：滚入视口揭示一次
<TextReveal text="让开发更快更稳更美" className="text-2xl font-bold" />

// 单色带 + 快一点
<TextReveal text="正在同步" colors={["var(--color-primary)"]} duration={1.2} repeat startOnView={false} />
```

## 禁忌 / 坑

- **`textColor` 不能传 `currentColor`。** 文字本身是 `color: transparent`（靠背景渐变透过字形显色），`currentColor` 解析出来的就是那个 transparent，整串会消失。要跟随容器色请显式传一个 token，如 `textColor="var(--color-primary)"`。
- **颜色变量要带 `--color-` 前缀。** 本库 `@theme` 里的真名如此，裸 `var(--primary)` / `var(--chart-1)` 在渐变里不解析。
- **「进行中」用法必须 `repeat`。** 不开的话扫一轮就停在终态，看上去和普通静态文字没区别——而这类标签的信息量恰恰在「它还在动」。
- **减弱动效下不会整串消失。** 动画带 `fill-mode: both`，`prefers-reduced-motion: reduce` 时动画整条不存在，落回静态的 `background-position` = 整串 `textColor`。这是结构上排除的，不靠 JS 把扫光位置 set 到终点。
- **多串轮换的宽度预留是靠把所有串叠进同一个网格单元实现的**，不测量、不写死，换字体换字号都不会失准。占位串的文字挂在 `data-hulian-ghost-text` 上由伪元素渲染，不进 DOM 文本——否则这个标签的 `textContent` 会是所有阶段名连在一起。这条依赖库的 preset CSS，正常接入即可。
- 传单串时宽度跟着内容走（和普通文本一样）。父级切换阶段名导致宽度变化时若要固宽，把所有可能的阶段名作为数组传进来，或自己在 `className` 上给一个 `min-w-*`。

## 相关
[AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [StreamingText](../streaming-text/streaming-text.md) · [SplitText](../split-text/split-text.md) · [BlurText](../blur-text/blur-text.md) · [FlipText](../flip-text/flip-text.md) · [WordRotate](../word-rotate/word-rotate.md) · [Spinner](../spinner/spinner.md)
