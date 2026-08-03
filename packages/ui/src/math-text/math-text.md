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
| `\vec{}` / `\overrightarrow{}` | 向量箭头，宽度跟随内容 | `\overrightarrow{AB}` |
| `\underline{}` | 下划线（与填空槽不同，是给已有内容加线） | `\underline{甲}` |
| `\overset{}{}` | 把上方记号叠在内容上 | `\overset{\frown}{AB}` |
| `\mathbb{}` | 黑板粗体数集 | `\mathbb{R}` → ℝ |
| `\text{}` / `\mathrm{}` / `\mathbf{}` | 字体包装，剥壳保留内容 | `\text{甲组}` |
| `\left` / `\right` | 定界符尺寸，丢弃命令保留括号 | `\left(a\right)` |
| `\{` `\}` `\%` `\$` `\&` `\#` `\_` | 转义字符，还原成字面字符 | `\{x\mid x>0\}` |
| 符号命令 | 换成 Unicode，见下 | `\angle` → ∠ |

### 符号表

`\angle ∠`　`\triangle △`　`\parallel ∥`　`\perp ⊥`　`\cong ≌`　`\sim ∽`　`\odot ⊙`　`\circ °`
`\times ×`　`\div ÷`　`\cdot ·`　`\pm ±`　`\neq ≠`　`\leq(slant) ≤`　`\geq(slant) ≥`　`\approx ≈`
`\Rightarrow ⇒`　`\Leftrightarrow ⇔`　`\to →`　`\mid ∣`　`\forall ∀`　`\langle ⟨`　`\rangle ⟩`　`\frown ⌢`
希腊字母、集合运算符、`\therefore ∴` / `\because ∵`、`\ldots …` 等见 `math-text.symbols.ts`。

取值范围不是拍脑袋定的，是对真实题面统计命令频次后建的表，覆盖到长尾：

- 第一轮 22k 字符初中题面（PaddleOCR-VL 识别产物）。频次前列：`\angle` 140 · `\frac` 99 · `\circ` 80 · `\triangle` 60 · `\sqrt` 55 · `\times` 51。
- 第二轮把口径扩到全学段的 1324 道题（题干 + 解析）。向量与集合/逻辑记号是高中的主力，初中样本里几乎不出现：`\overrightarrow` 169 · `\vec` 113 · `\Rightarrow` 52 · `\mathbb` 16 · `\Leftrightarrow` 10。

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

## 禁忌 / 坑

- **别用 `a/b` 表示分数**。上游数据若用斜杠，`千米/时`、`元/千克` 这类单位会被误渲染成分数。用 `\frac{}{}` 把「这是分数」这个已知事实显式带过来，不要让渲染层再猜一遍。
- **`\mathbb{R}` 不要在上游剥壳成 `R`**。题面里实数集 ℝ 与变量 `R` 是两个东西，剥成同一个字母后「定义域为 ℝ」读起来就像「定义域为 R」，而且没人看得出信息已经丢了。原样交给本组件，它映射到黑板粗体。
- **弧的规范写法是 `\overset{\frown}{AB}`**，不是 `\frown{AB}`。后者在 LaTeX 里是「弧符号紧跟一个分组」，本组件按字面渲染成 `⌢{AB}` —— 看着不对正是设计意图，好过猜一个上游没表达的意思。
- **`\vec` 与 `\overrightarrow` 在本组件里渲染宽度相同**（都跟随内容）。TeX 里前者是定宽短箭头，这个差异被有意抹平：题面场景下两个记号都指向量，宽度不携带信息，而自适应能让 `\vec{AB}` 也盖得住。
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
