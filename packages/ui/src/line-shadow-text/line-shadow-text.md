---
slug: line-shadow-text
name: LineShadowText
category: typography
group: text
tags: []
exports: [LineShadowText]
status: enriched
---

# LineShadowText

> 在标题文字背后错开一层硬边条纹投影 · typography/text

## 何时用

给 2-4 字的品牌词 / 首屏大标题加一层斜向的硬边投影。它是文字特效族里**最克制的一档**：默认不动、无 RAF、纯 CSS，所以打印页、企业官网、`prefers-reduced-motion` 环境都能放心用。

要流动渐变用 [AuroraText](../aurora-text/aurora-text.md)；要扫光徽标用 [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)；要逐字入场用 [SplitText](../split-text/split-text.md)。普通正文用 [Text](../text/text.md)。

## 导入
```ts
import { LineShadowText } from "@hulianui/ui"
```

## Props

继承原生 `<span>` 属性（`children` 被下方收窄）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children * | `string` | - | 要加投影的文字。**只接受字符串**：投影层是同一段文字的副本，非文本节点没法复刻 |
| shadowColor | `string` | `var(--color-foreground)` | 投影色。喂 token 必须带 `--color-` 前缀，裸 `var(--primary)` 在 Tailwind v4 的 `@theme` 里不解析 |
| offset | `string` | `"0.04em"` | 投影相对本体的偏移量。用 `em` 所以随字号成比例 |
| lineWidth | `string` | `"0.06em"` | 斜线的粗细 / 间距。调大变粗条纹，调小接近实心影 |
| animated | `boolean` | `false` | 让斜线沿对角缓慢流动。默认关闭见「禁忌 / 坑」 |
| duration | `string` | `"15s"` | 一轮流动的秒数；仅 `animated` 为真时生效 |

## 示例
```tsx
<LineShadowText className="text-5xl font-bold">瑚琏</LineShadowText>
```
```tsx
{/* 投影换主色 */}
<LineShadowText className="text-5xl font-bold" shadowColor="var(--color-primary)">
  Hulian
</LineShadowText>
```
```tsx
{/* 首屏标题里只点缀品牌词 */}
<h1 className="text-4xl font-bold text-foreground">
  用 <LineShadowText shadowColor="var(--color-primary)">瑚琏</LineShadowText> 搭中后台
</h1>
```

## 禁忌 / 坑

- **默认静态是刻意的**，不是没做完。这一档的价值恰恰在于「有设计感但没有动效」，把 `animated` 当默认会让它和族里其它件失去区分。开了动效也仍然尊重系统的 `prefers-reduced-motion`。
- **`children` 只收字符串**。投影层要把同一段文字再渲染一遍并用 `bg-clip-text` 裁进字形，塞进图标或嵌套元素得到的是一份视觉噪音。要给富节点加效果请换别的件。
- 投影层是**真 DOM 节点 + `aria-hidden`**，不是 `::after` + `content: attr(data-text)`。伪元素的 `content` 会被部分读屏当文本念，同一个词念两遍；真节点能明确标记为装饰。
- 不要用在大段正文上：斜线投影在小字号下会糊成一团灰边，且每个字都多一层绘制。
- 别写死投影色为 `black`（上游默认值就是它）——暗色主题下那是一团看不见的黑。用 token。

## 相关
[AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [SparklesText](../sparkles-text/sparkles-text.md) · [GlitchText](../glitch-text/glitch-text.md) · [SplitText](../split-text/split-text.md) · [Text](../text/text.md)
