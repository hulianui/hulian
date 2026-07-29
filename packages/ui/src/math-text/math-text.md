---
slug: math-text
name: MathText
category: typography
group: text
tags: []
exports: [MathText, parseMath, mathToPlain]
status: enriched
---

# MathText

> 行内数学排版 · 零依赖解析 LaTeX 子集(分数/根号/上下标/填空槽)并渲染成真数学版式 · 分数用 inline-flex 竖排不撑乱中文行高 · 可检索朴素文本走 mathToPlain · RSC 安全 · typography/text

## 何时用

正文里要混排数学式子时用：题干、选项、解析、公式说明。典型来源是从 PDF/Word 抽取出来的题库数据 —— 那些数据里分数是 `\frac{3}{8}`、指数是 `x^{2}`、填空是 `____`，直接当纯文本渲染会得到 `\frac{3}{8}` 这种露馅的原始记号。

**不要**用它渲染整段富文本（用 [Markdown](../markdown/markdown.md)）或代码（用 [Code](../code/code.md)）。需要完整 LaTeX（矩阵、积分、求和、对齐环境）时本组件不够，请自行接 KaTeX —— 本组件刻意只覆盖教辅题面高频的那几样，以保持零依赖。

## 导入
```ts
import { MathText, parseMath, mathToPlain } from "@hulianui/ui"
```

## 支持的记号

| 记号 | 含义 | 例 |
|---|---|---|
| `\frac{a}{b}` | 分数，上下叠放并画分数线 | `\frac{16}{9}` |
| `\sqrt{a}` / `\sqrt[n]{a}` | 根号，被开方数带上横线 | `\sqrt{a^{2}+b^{2}}` |
| `^{...}` 或 `^a` | 上标 | `x^{2}`、`x^2` |
| `_{...}` 或 `_a` | 下标 | `a_{1}`、`a_1` |
| `____` | 填空槽（**2 个及以上**连续下划线） | `可记作____万元` |
| `\overline{}` / `\widehat{}` | 上划线 / 帽子 | `\overline{AB}` |
| `\text{}` / `\mathrm{}` | 字体包装，剥壳保留内容 | `\text{甲组}` |
| `\left` / `\right` | 定界符尺寸，丢弃命令保留括号 | `\left(a\right)` |
| 符号命令 | 换成 Unicode，见下 | `\angle` → ∠ |

### 符号表

`\angle ∠`　`\triangle △`　`\parallel ∥`　`\perp ⊥`　`\cong ≌`　`\sim ∽`　`\odot ⊙`　`\circ °`
`\times ×`　`\div ÷`　`\cdot ·`　`\pm ±`　`\neq ≠`　`\leq(slant) ≤`　`\geq(slant) ≥`　`\approx ≈`
希腊字母、集合运算符、`\therefore ∴` / `\because ∵`、`\ldots …` 等见 `math-text.symbols.ts`。

取值范围不是拍脑袋定的：对 22k 字符真实初中数学题面（PaddleOCR-VL 识别产物）统计命令频次后建表，
覆盖到长尾。频次前列：`\angle` 140 · `\frac` 99 · `\circ` 80 · `\triangle` 60 · `\sqrt` 55 · `\times` 51。

其余内容一律按字面文本输出。**不认识的记号不会被吞掉** —— `\oiint` 原样显示为 `\oiint`，残缺的 `\frac{3}` 也原样保留，绝不静默丢内容。

## 用法

```tsx
<MathText>{"将 \\frac{3}{8} 化成小数为 ____ 。"}</MathText>
```

选项并排：

```tsx
<MathText>{"A.\\frac{1}{9}　B.\\frac{5}{9}　C.\\frac{16}{9}　D.\\frac{80}{9}"}</MathText>
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `children` | `string` | — | 含数学记号的文本 |
| `blankWidth` | `number` | `2.5` | 填空槽最小宽度（em） |
| `scriptScale` | `number` | `0.75` | 上下标相对字号 |
| `className` | `string` | — | — |

## 配套纯函数

- `parseMath(src)` → `MathNode[]`，解析结果，可用于自定义渲染或做结构校验。
- `mathToPlain(src)` → `string`，转成朴素文本（`\frac{3}{8}` → `3/8`）。

**检索、导出、纯文本比对一律用 `mathToPlain`**，不要把带记号的原串直接甩给搜索框 —— 用户搜「3/8」应该能命中。

## 坑

- **别用 `a/b` 表示分数**。上游数据若用斜杠，`千米/时`、`元/千克` 这类单位会被误渲染成分数。用 `\frac{}{}` 把「这是分数」这个已知事实显式带过来，不要让渲染层再猜一遍。
- **单个 `_` 是下标，`__` 起才是填空**。`a_1` 渲染成下标；想要填空至少写两个下划线。
- **分数不是 `<sup>`/`<sub>` 拼的**。用 `inline-flex` 竖排 + `border-t` 画线，这样嵌在中文正文里行高不会被撑乱、分数线也对得齐。改样式时别退回 sup/sub。
- **命令名后的空格是终止符不是内容**。`\angle ABC` 里那个空格必须吃掉，否则题面里每个 `\angle` / `\triangle` 后都会多冒一个空格（本组件已处理，自行扩表时别忘）。
- **`30^{\circ}` 不套 `<sup>`**。`\circ` 本身就是上标位的字符，再抬一次会变成浮空小点。
- **矩阵/方程组是有损降级**。`\begin{array}…\end{array}` 会被拍平成一行、`\\` 变成分号。要真排版请接 KaTeX。
- 组件返回 `<span>`，可安全嵌进 `<p>`；填空槽带 `aria-label="填空"`，读屏不会读成一串下划线。

## 相关

- [QuestionCard](../question-card/question-card.md) —— 题目卡片，题干/选项内部就是用本组件渲染的
- [Markdown](../markdown/markdown.md) —— 整段富文本
- [Prose](../prose/prose.md) —— 长文排版容器
