---
slug: annotation
name: Annotation
category: data-display
group: info
tags: []
exports: [Annotation, annotationGeometry, ARROWS, sideVector, isDiagonal]
status: enriched
---

# Annotation

> 手写风格标注 · 荧光笔底色 + 手绘箭头 + 手写旁注就地讲解行内内容 · 八方位 + 6 语气 + 只圈不注 · data-display/info

## 何时用

要在文档、演示、组件解剖图里**贴着**一段行内内容讲「这一块是什么」时用它 —— 典型场景是把一行代码、一条配置、一个 URL 拆开逐块标注。

它和 [Callout](../callout/callout.md) 互补：Callout 是**打断**正文的块级提示框，Annotation 是**不占布局位置**的旁注。要指着某个 UI 元素做产品引导用 [Tour](../tour/tour.md)（带遮罩、分步、可交互）；要给一段文本挂可点击的悬停解释用 [Tooltip](../tooltip/tooltip.md)。

## 导入
```ts
import { Annotation } from "@hulianui/ui/annotation"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| note | `ReactNode` | — | 手写旁注的内容。省略或传空时只留荧光笔底色，不画箭头也不画标签。 |
| side | `"n"｜"ne"｜"e"｜"se"｜"s"｜"sw"｜"w"｜"nw"` | `ne` | **标签所在的方位**（与 Tooltip/Popover 的 side 同义），箭头自动从标签指回目标。 |
| tone | `"neutral"｜"primary"｜"success"｜"warning"｜"danger"｜"rainbow"` | `neutral` | 语气色。只染标注自身，被标注的正文保持原色。rainbow 为循环色相，纯装饰。 |
| mark | `boolean` | `true` | 荧光笔底色。外扩量见下方 `--hl-ann-spread`。 |
| rotate | `number` | `-4` | 标签倾斜角（deg）。传 `0` 摆正。 |
| labelWidth | `number` | `150` | 标签折行前的最大宽度（px）。 |
| gap | `number` | `5` | 目标与箭头之间的留白（px）。 |
| labelGap | `number` | `6` | 箭头与标签之间的留白（px）。 |
| offset | `{ x?: number; y?: number }` | — | 微调。side 占据的那根轴上正值 = 远离目标（左右两侧对称）；另一根轴上正值 = 向右 / 向下。 |
| handwritten | `boolean` | `true` | 标签是否套手写字体栈（见下方「中文手写体」）。 |
| as | `ElementType` | `span` | 宿主标签。需要语义高亮时可传 `mark`。 |
| className | `string` | — | 落在宿主（被标注的内容）上。 |
| labelClassName | `string` | — | 落在标签上，用来改字号 / 字重。 |

### CSS 变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `--hl-annotation-font` | 手写字体栈 | 全局的手写字体栈，定义在 `@hulianui/tokens` 的 `semantic.css`，可整站覆盖。 |
| `--hl-ann-spread` | `0.3em` | 荧光笔底色左右外扩量（模仿马克笔涂过头）。用 `className="[--hl-ann-spread:0.1em]"` 单条覆盖。 |

## 示例
```tsx
// 基础：side 说的是标签在哪，箭头自动指回来
<p>
  任务 ID 写成 <Annotation note="稳定 ID" side="ne">CLI-042</Annotation>，改标题也不会失联。
</p>

// 解剖一行：靠 side 错开方位，紧挨时收窄荧光笔避免底色连片
<code>
  - [ ] <Annotation note="稳定 ID" side="n" tone="primary">CLI-042</Annotation> Add export command{" "}
  <Annotation note="标签" side="n" tone="success" className="[--hl-ann-spread:0.1em]">#cli</Annotation>{" "}
  <Annotation note="优先级" side="s" tone="danger" className="[--hl-ann-spread:0.1em]">!high</Annotation>
</code>

// 只圈不注：不传 note 就只有荧光笔
<Annotation tone="warning">这一句才是重点</Annotation>

// 标签放 ReactNode —— 它是真实节点，不是 CSS 伪元素的 content
<Annotation note={<>见 <code>docs/specs</code></>} side="e" tone="primary">spec 文件</Annotation>

// 正式文档里更克制的形态
<Annotation note="补充说明" handwritten={false} rotate={0}>术语</Annotation>
```

## 禁忌 / 坑

**标签会被 `overflow: hidden` 的祖先裁掉。** 箭头与标签都是绝对定位、故意溢出目标盒子的。放进 ScrollArea、裁剪卡片、表格单元格时它们会被切掉半截 —— 给那个祖先留出内边距，或换一个 side。同理，容器四周要留够空间（示例里的 `py-16` 不是装饰）。

**相邻标注的荧光笔底色会连成一片。** 底色向左右各外扩 `0.3em` 模仿马克笔涂过头，同一行里几条标注紧挨着时就会糊成一整条。用 `className="[--hl-ann-spread:0.1em]"` 收窄，或 `0px` 完全断开 —— **单位不能省**：`calc(-1 * 0)` 得到的是 `<number>` 而非 `<length>`，`box-shadow` 会拒收整条声明，底色反而变成不外扩也不圆角的裸方块。

**中文手写体是系统字体，装了才有。** `--hl-annotation-font` 的字体栈里，拉丁部分（Shantell Sans / Comic Sans）与中文部分（手札体 / 翩翩体 / 行楷）都**不由本库打包** —— 中文手写体动辄数 MB，塞进设计系统不合理。一个都没命中时回落到正文字体：倾斜角与配色仍在，只是少了手写笔触。要保证中文也是手写体，自行 `@font-face` 引入后覆盖 `--hl-annotation-font` 即可。

**别把必读信息只写在 note 里。** 标签是真实 DOM 节点（不是 `::after` + `content`），读屏能读到，但它在视觉上是旁注、在阅读顺序上跟在目标后面。操作指令、校验错误、状态这类必须被感知的信息要有正文里的正式出处。

**tone 不会给被标注的正文染色**，这是刻意的：色只经 `--hl-ann-color` 下发给箭头与标签。想让目标本身也变色，自己在 `className` 上加 `text-*`。

## 相关
[Callout](../callout/callout.md) · [Tour](../tour/tour.md) · [Tooltip](../tooltip/tooltip.md) · [Tag](../tag/tag.md) · [CodeDiff](../code-diff/code-diff.md)
