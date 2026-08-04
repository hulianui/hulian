---
slug: math
name: Formula
category: typography
group: text
tags: []
exports: [Formula, formulaToPlain, splitMathSegments]
status: enriched
---

# Formula

> KaTeX 驱动的数学排版 · 走 `@hulianui/ui/math` 独立 subpath 不压主包体积 · 分段函数/矩阵/大型定界符真二维排版 · 认 `$…$` 分隔符让公式边界由数据显式携带 · RSC 安全 · typography/text

## 何时用

要**二维排版结构**时用：分段函数 `\begin{cases}`、矩阵、对齐环境、跟着内容长高的 `\left…\right`、上下限落在符号正上下方的求和/积分。

正文里只是混几个分数、根号、上下标 —— 用 [MathText](../math-text/math-text.md)，它零依赖。

### 跟 MathText 怎么选

| | MathText | Formula |
|---|---|---|
| 包 | `@hulianui/ui` | `@hulianui/ui/math` |
| 依赖 | 零 | KaTeX：JS 86KB gzip（`pnpm size` 实测），另加样式表与按需字体 |
| 覆盖 | 教辅题面高频的一维记号（分数/根号/上下标/向量/符号表） | 完整 LaTeX |
| `\begin{cases}` | 拍平成一行、`\\` 变分号 | 真排版 |
| `\left…\right` | 丢命令留定高括号 | 高度跟随内容 |
| 渲染成本 | 一次字符串解析 | KaTeX 排版，贵一个数量级 |

**判据是有没有二维结构，不是「哪个更强」**：一屏几十道题的题面用 Formula 排纯行内分数，等于为用不上的能力付了排版成本和这 86KB。反过来，分段函数交给 MathText 会得到一行拍扁的 `x, x<0；-x, x≥0` —— 而这道题恰恰考的是分段，题干读不懂，题就废了。

两件可以同页混用：题干用 MathText、遇到分段函数那道用 Formula。

## 导入

```ts
import { Formula, formulaToPlain, splitMathSegments } from "@hulianui/ui/math"
```

**subpath 是刻意的**：KaTeX 只有 import 了这条路径的页面才会打进包，`@hulianui/ui` 主入口的消费者一分体积都不付。别把它加进主 barrel。

样式**不用你管** —— 组件自己 `import "katex/dist/katex.min.css"`，字体随之被打包器接管。不需要在应用入口引 CSS，也不需要往 CDN 挂 `<link>`。

## 用法

```tsx
// 混排（默认）：只有分隔符里的内容被排版
<Formula>{"已知 $f(x)=x^{2}$，求 $f(1)$。"}</Formula>

// 分段函数
<Formula>{"$$f(x)=\\begin{cases} -x^{2}, & x<0 \\\\ e^{x}, & x \\geq 0 \\end{cases}$$"}</Formula>

// 写死一条公式，省掉包 $ 的仪式
<Formula mode="math" display>{"\\int_{0}^{1} x^{2}\\,dx = \\frac{1}{3}"}</Formula>
```

## 分隔符

`mode="mixed"`（默认）下认四种，分隔符本身不进渲染结果：

| 写法 | 排版 |
|---|---|
| `$…$` | 行内 |
| `\(…\)` | 行内 |
| `$$…$$` | 块级（独立成行、居中） |
| `\[…\]` | 块级 |

三条边界规则：

- **`\$` 是字面美元符号**，不参与配对，渲染成 `$`。
- **找不到闭分隔符时，开分隔符按字面文本处理**。`定价 $100 元` 整句原样输出，不会把后半段吞成公式。
- **行内分隔符不跨空行**。这是 TeX 自己的规则（`$` 内出现空行是 `Missing $ inserted`），顺带把 `售价 $100\n\n成本 $80` 这类跨段误配对挡在外面。块级 `$$` / `\[` 不受此限。

### 为什么渲染层必须认 `$`

中文与公式混排时，「哪一段是式子」是上游**已经知道**的信息。渲染层不认，上游就只能在入库时把 `$` 剥掉来迁就它 —— 而剥 `$` 是有损的：

- `$\{a_n\}$` 剥完变成 `{a_n}`，`{}` 是集合还是 LaTeX 分组再也分不出来；
- 喂给 LLM 时公式与中文粘成一片，模型只能猜哪一段是式子；
- 要做 Word 导出（LaTeX→MathML→OMML）时，切不出公式段就无从转换。

边界是必须显式携带的信息，不该由渲染层猜、更不该逼上游把它删掉。**上游有 `$` 就别剥**。

MathText 也补上了同一套分隔符，走它的 `delimiters` prop（默认关，因为它的存量消费者正文里可能有货币金额）。

## Props

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `children` | `string` | — | LaTeX 源，或含 LaTeX 段落的正文 |
| `mode` | `"mixed" \| "math"` | `"mixed"` | `mixed` 认分隔符、只排版分隔符内；`math` 整串都是 LaTeX |
| `display` | `boolean` | `false` | 块级排版。**仅 `mode="math"` 生效** —— `mixed` 下由各段自己的分隔符决定 |
| `macros` | `Record<string, string>` | — | 自定义宏，透传给 KaTeX |
| `className` | `string` | — | — |

## 配套纯函数

- `splitMathSegments(src)` → `MathSegment[]`，把正文切成 `{ type: "text" \| "math", content, display }`。**Word/OMML 导出链路要的就是它** —— 拿原始 LaTeX 切段，再逐段转换。
- `formulaToPlain(src)` → `string`，转成可检索的朴素文本（`$\frac{3}{8}$` → `3/8`），分隔符不进结果。

**检索、导出、纯文本比对一律用 `formulaToPlain`**，别把带记号的原串直接甩给搜索框 —— 用户搜「3/8」应该能命中。

## 坏数据怎么显示

KaTeX 配了 `throwOnError: false`，出错分两档，**都不静默吞、都不抛异常拆掉整棵树**：

- **认不出的控制序列** → 就地标红、原样露出（`\y` 显示成红色的 `\y`），其余部分照常排版；
- **整体解析失败**（如花括号没闭合）→ 整条原文红色显示，带 `katex-error` 类。

这跟 MathText「不认识的记号原样显示」是同一立场。安静地把损坏的 `\begin{cases}x=my\y^2=6x\end{cases}` 渲染成看起来正常的一行，比直接报错危险得多 —— 那种「最像真的」的产物没人会发现它错了。

## 禁忌 / 坑

- **别把 Formula 加进 `@hulianui/ui` 主 barrel**。subpath 的全部意义就是让 KaTeX 只落在用得上它的页面。一旦进主 barrel，所有消费者都开始付这 86KB —— 体积门禁里 `math` 入口的基线就是拿来盯它的。
- **别用它排整屏行内分数**。一屏几十个实例时 KaTeX 排版是页面上最贵的一步，这种场景 MathText 的一次字符串解析就够了。
- **`macros` 要提到模块级常量**。组件是 memo 的，行内字面量每次渲染都是新对象，memo 每次失效 —— 而失效的代价正是最贵的那一步。（组件内部会浅拷贝 `macros` 再交给 KaTeX：KaTeX 把它当**可变**宏表用，`\def` 会写回去，不拷贝的话一道题里的 `\def` 就漏到后面所有公式上。）
- **`textContent` 里带着原始 LaTeX**。KaTeX 会把源码原样塞进 MathML 的 `<annotation>`（读屏与复制用），所以 `container.textContent` 会同时包含排版结果与 `\begin{cases}…` 原文。写测试或做文本提取时对 `.katex-html` 取，别对整个容器取。
- **公式比周围正文大约 1.21 倍**。这是 KaTeX（也是 TeX）的标准视觉尺寸，不是 bug；与 MathText 混排在同一段里能看出差别。要压平就自己覆盖 `.katex { font-size: 1em }`，代价是符号相对中文会偏小。
- **块级公式别塞进 `<p>` 的中间**。`$$…$$` 会渲染出 `display:block` 的盒子，夹在一行中文里会把这行劈成三段。块级公式应当独占一个段落。
- **`mode="math"` 时 `display` 才有效**。`mixed` 下传 `display` 不报错也不生效 —— 混排里每段的行内/块级由它自己的分隔符决定，**看版式发现不了你传错了**（行内公式照常渲染，只是你以为的块级没出现）。要块级就写 `$$…$$`。
- **`formulaToPlain` 的输出别拿去做 OMML 导出的输入**。它底层走 MathText 的轻量解析器，`\begin{cases}` 会被拍平 —— 而导出链路要的恰恰是被拍掉的行结构。导出请用 `splitMathSegments` 切段 + 原始 LaTeX。
- **`strict` 关着**。KaTeX 默认会对数学模式里的裸中日韩字符 console.warn，一屏几十道题就是几百条警告，因此本组件设了 `strict: "ignore"`。渲染结果不受影响，但也意味着 KaTeX 不会再提醒你「这段中文应该包 `\text{}`」。
- 组件返回 `<span>`；KaTeX 输出 HTML + MathML 双份，HTML 那半带 `aria-hidden`，读屏读的是 MathML，无需额外配 aria。

## 相关

- [MathText](../math-text/math-text.md) —— 零依赖行内数学排版，正文混排的默认选择
- [QuestionCard](../question-card/question-card.md) —— 题目卡片
- [Markdown](../markdown/markdown.md) —— 整段富文本
