---
slug: flip-text
name: FlipText
category: typography
group: text
tags: [animated]
exports: [FlipText]
status: enriched
---

# FlipText

> 翻面标题 · 鼠标移入时逐字 3D 翻面(收 children 不收 text · as 参与类型推导让它自己就是 h1/h2 · 一次性播完不跟随 hover 回退 · 纯 CSS 关键帧不引 motion · 背面走伪元素不污染 textContent) · typography/text · #animated

## 何时用

页面/卡片的**主标题**需要一点「摸上去有反应」的交互时用：鼠标移入，标题逐字翻面。

它与库里其它字效件的分界很清楚——那些是**进场**动画（滚入视口播一次就静止），本件是**悬停交互**（每次移入都会再翻一次）。要首屏逐字位移淡入用 [SplitText](../split-text/split-text.md)；要从模糊解析到清晰用 [BlurText](../blur-text/blur-text.md)；要表示「这件事正在进行」用 [TextReveal](../text-reveal/text-reveal.md)；普通静态标题用 [Heading](../heading/heading.md)。

配 [PageHeader](../page-header/page-header.md) 的 `titleAs` 用：那个 prop 要的正是「自带动画、并且自己就是那个标签」的标题组件。

## 导入
```ts
import { FlipText } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| direction | `"top" ｜ "bottom" ｜ "left" ｜ "right"` | `"top"` | 新字面从哪一侧翻上来（说的是新字面**进入**的方向） |
| splitType | `"char" ｜ "word"` | `"char"` | 切分粒度：char 逐字（中文友好）/ word 逐词（按空白切，避免西文单词被拆断行） |
| duration | `number` | `0.5` | 单字翻面时长（秒） |
| stagger | `number` | `30` | 相邻字的错峰毫秒，等价于 SplitText 的 `delay` |
| as | `ElementType` | `"span"` | 渲染标签。事件与属性类型跟着它走 |

其余对应标签的原生属性（`className` / `id` / `data-*` / `ref` 等）透传。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onMouseEnter | `(e: MouseEvent<HTMLElement>) => void` | 翻转就挂在这个事件上，但组件**先调用你传的这个**再触发翻转，不会顶掉它 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 标题内容。内部递归取纯文本再切分，**嵌套标记不保留**；取不出文字时原样渲染 children |

## 示例
```tsx
// 标题自己就是 h1，不套壳
<FlipText as="h1" className="text-lg font-semibold tracking-tight">AI 状态</FlipText>

// 变量/表达式直接传（这正是收 children 而不是 text: string 的原因）
<FlipText as="h2">{name || "未命名客户"}</FlipText>

// 配 PageHeader 的 titleAs
<PageHeader title={templateName} titleAs={FlipText} />

// 换方向、放慢节奏
<FlipText direction="left" duration={0.8} stagger={90}>慢一点的波浪</FlipText>

// 西文标题按词切，避免长单词逐字后断行
<FlipText splitType="word" as="h2">Deploy in seconds</FlipText>
```

## 禁忌 / 坑

- **别套在 `<h1>` 里，用 `as`。** `<h1><FlipText/></h1>` 既是多余嵌套，也会让读屏读出两条 heading（一条来自 h1，一条来自本件的 `aria-label`）。`as` 参与类型推导，`as="h1"` 之后事件与属性类型都跟着 `h1` 走。
- **`children` 里的嵌套标记会被摊平。** 内部递归取纯文本再逐字切分，`<em>` / `<span>` 之类的结构留不下来。真需要富文本标题，说明它不该逐字翻转。
- **一轮播完不跟随 hover 回退。** 指针中途划走不会把动画停在斜面上——那一帧是能看出来的。移入即完整播一轮，播放中重复移入不重开（重入保护）。
- **翻转是正交投影，不带透视。** 视觉上是翻页板而不是立方体。想要纵深自己在 `className` 上加 `[perspective:800px]`，背面的 `translateZ(0.5lh)` 已经按半个行高摆好了。
- **背面的字不进 DOM 文本。** 它靠 `[data-hulian-flip-back]::after { content: attr(…) }`（规则在 `preset-core.css`）渲染，所以标题的 `textContent` 就是标题本身。写成真节点的话会变成「状状态态」，框选复制与爬虫读到的文案一起被污染。这也意味着**必须引入库的 preset CSS**，否则翻到一半是空白。
- 读屏读整句不读碎字：根挂 `aria-label`（取自 children 的纯文本），各字段 `aria-hidden`。传自己的 `aria-label` 可以覆盖它。
- `prefers-reduced-motion: reduce` 下不翻转，正面常驻——两面渲染的是同一个字，静息态本来就是完整可读的。

## 相关
[SplitText](../split-text/split-text.md) · [BlurText](../blur-text/blur-text.md) · [TextReveal](../text-reveal/text-reveal.md) · [ScrollReveal](../scroll-reveal/scroll-reveal.md) · [WordRotate](../word-rotate/word-rotate.md) · [PageHeader](../page-header/page-header.md) · [Heading](../heading/heading.md)
