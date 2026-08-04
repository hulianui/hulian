---
slug: math
name: Formula
category: typography
group: text
tags: []
exports: [Formula, QuestionCard, formulaToPlain, mathToPlain, splitMathSegments, splitBareMath, hasBareMath]
status: enriched
---

# Formula

> KaTeX 驱动的数学排版，本库唯一的数学渲染路径 · 走 `@hulianui/ui/math` 独立 subpath 不压主包体积 · 分段函数/矩阵/大型定界符真二维排版 · 认 `$…$` 分隔符，上游没包 `$` 的题库数据退到裸记号切分 · 填空槽 `____` 渲染成空位 · RSC 安全 · typography/text

## 何时用

**判据：这段文本里有没有 `\frac{}{}` / `x^{2}` / `____` 这类记号。** 有就用它，没有就用普通 `<p>`。典型场景是题干、选项、解析、公式说明；数据多半来自 PDF/Word 抽取的题库，那种串直接当纯文本渲染，屏幕上就是字面的 `\frac{3}{8}` 而不是上下叠放的分数。

**不要**用它渲染整段富文本（用 [Markdown](../markdown/markdown.md)）或代码（用 [Code](../code/code.md)）。

### 0.25.0 起这是本库唯一的数学渲染路径

此前还有个零依赖的 `MathText`，用 CSS 拼行内版式（`inline-flex` 叠分数、`border-t` 当根号横线）。它在 0.25.0 **退役并从主 barrel 移除**了。原因不是「能力不够」，是**排出来的东西不对**：

- `√` 是个定高字符，而横线是旁边兄弟盒的 `border-t`。被开方数一旦含上标（`\sqrt{a^{2}+b^{2}}`），内容盒变高变宽，横线就接不上根号顶点，末尾那个指数还顶到线外；
- 弧与帽子（`\overset{\frown}{AB}`、`\widehat{ABC}`）不跟随内容宽度，中文教材里跨 AB 两个字母的弧被排成 A 头上一顶帽子；
- 这类缺陷是 CSS 拼贴的固有极限 —— 分数线粗细、上下标基线、定界符高度，修完一处还有下一处。

而它当初的卖点「零依赖换不撑乱中文行高」，实测在 KaTeX 下**同样成立**：行内公式不会撑开行距。那个差异一直是假的，代价却是全线错误的排版。

**从 MathText 迁移**：

| 原来 | 现在 |
|---|---|
| `import { MathText } from "@hulianui/ui"` | `import { Formula } from "@hulianui/ui/math"` |
| `import { QuestionCard } from "@hulianui/ui"` | `import { QuestionCard } from "@hulianui/ui/math"` |
| `<MathText>{stem}</MathText>` | `<Formula>{stem}</Formula>` |
| `mathToPlain(src)` | `mathToPlain(src)`（同名同义，改从 `@hulianui/ui/math` 引） |
| `parseMath` / `parseMathDocument` | 不再导出 —— 它们是给 MathText 自定义渲染用的，排版已由 KaTeX 接管 |
| `delimiters={true}` | 不需要了：`mixed` 模式默认就认 `$`，没有 `$` 时自动退到裸记号切分 |
| `scriptScale` | 不再有 —— 上下标尺寸由 TeX 的排版规则决定，不该由调用方拨 |

`blankWidth`（填空槽宽度）原样保留。视觉上会有两处变化，都是**改对了**而不是回归：变量按 TeX 规矩显示为斜体；公式比周围正文约大 1.21 倍（见「禁忌 / 坑」）。

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

### 没有 `$` 的存量数据

**整串一个成对分隔符都没有时，自动退到裸记号切分**：扫出 `\frac{3}{8}`、`x^{2}`、`\angle ABC` 这类片段交给 KaTeX，其余按文本原样输出。PDF/Word/OCR 直出的题面就是这样，上游还没来得及包 `$` 时不该整题露出字面记号。

切分只认一条判据：**没有 `\` / `^` / `_` 这类触发字符就不是公式**。所以 `P(2,3)`、选项标号 `A.`、`(a+b)` 一律留作文本 —— 宁可少排也不误排，把中文正文喂给 KaTeX 会得到一串红色报错，比不排版糟糕得多。

**它是兜底，不是推荐做法。** 只要有一处成对分隔符，整串就走精确路径、不再猜边界；同一串里半带半不带 `$`，没包的那半会原样露出 —— 这是有意的，数据不一致要看得见。规范做法始终是让上游把公式包成 `$…$`。

需要自己处理切分结果时用 `splitBareMath(src)`，判断要不要走 KaTeX 这条贵路径用 `hasBareMath(src)`。

### 填空槽

`____`（2 个及以上连续下划线）渲染成可书写的空位，宽度由 `blankWidth` 控制（默认 2.5em）。**分隔符内外都认** —— `$\frac{3}{8}$ 化成小数为 ____` 里那四个下划线同样会变成空位，而不是四个字面字符。单个 `_` 仍是下标。

它不走 KaTeX：那边只能用 `\rule` / `\hspace` 之类凑，宽度还改不动，也挂不上 `aria-label`。填空槽是真 DOM，读屏读到的是「填空」而不是一串下划线。

## Props

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `children` | `string` | — | LaTeX 源，或含 LaTeX 段落的正文 |
| `mode` | `"mixed" \| "math"` | `"mixed"` | `mixed` 认分隔符、只排版分隔符内；`math` 整串都是 LaTeX |
| `display` | `boolean` | `false` | 块级排版。**仅 `mode="math"` 生效** —— `mixed` 下由各段自己的分隔符决定 |
| `blankWidth` | `number` | `2.5` | 填空槽（`____`）最小宽度，单位 em |
| `macros` | `Record<string, string>` | — | 自定义宏，透传给 KaTeX |
| `className` | `string` | — | — |

## 配套纯函数

- `splitMathSegments(src)` → `MathSegment[]`，把正文切成 `{ type: "text" \| "math", content, display }`。**Word/OMML 导出链路要的就是它** —— 拿原始 LaTeX 切段，再逐段转换。
- `splitBareMath(src)` → `BareSegment[]`，把**没有 `$`** 的正文切成 `{ type: "text" | "math" | "blank", content }`。
- `hasBareMath(src)` → `boolean`，整串有没有可切出来的公式或填空槽。
- `formulaToPlain(src)` → `string`，转成可检索的朴素文本（`$\frac{3}{8}$` → `3/8`），分隔符不进结果。
- `mathToPlain(src, { delimiters })` → `string`，同一套降级的底层实现，`delimiters` 决定认不认 `$`。

**检索、导出、纯文本比对一律用 `formulaToPlain`**，别把带记号的原串直接甩给搜索框 —— 用户搜「3/8」应该能命中。

## 坏数据怎么显示

KaTeX 配了 `throwOnError: false`，出错分两档，**都不静默吞、都不抛异常拆掉整棵树**：

- **认不出的控制序列** → 就地标红、原样露出（`\y` 显示成红色的 `\y`），其余部分照常排版；
- **整体解析失败**（如花括号没闭合）→ 整条原文红色显示，带 `katex-error` 类。

立场是**损坏的公式必须看得见**。安静地把损坏的 `\begin{cases}x=my\y^2=6x\end{cases}` 渲染成看起来正常的一行，比直接报错危险得多 —— 那种「最像真的」的产物没人会发现它错了。

## 禁忌 / 坑

- **别把 Formula 加进 `@hulianui/ui` 主 barrel**。subpath 的全部意义就是让 KaTeX 只落在用得上它的页面。一旦进主 barrel，所有消费者都开始付这 86KB —— 体积门禁里 `math` 入口的基线就是拿来盯它的。
- **一屏几十个实例时，KaTeX 排版是页面上最贵的一步**。组件已经是 memo 的，但父级传新对象（尤其 `macros`）照样会让它整屏重排。真到瓶颈时的出路是服务端预渲染（本件 RSC 安全，排版可以整段发生在服务端）或列表虚拟滚动，**不是**换一个「更轻的排版」—— 那条路走过了，省下的成本换来的是错的版式。
- **`macros` 要提到模块级常量**。组件是 memo 的，行内字面量每次渲染都是新对象，memo 每次失效 —— 而失效的代价正是最贵的那一步。（组件内部会浅拷贝 `macros` 再交给 KaTeX：KaTeX 把它当**可变**宏表用，`\def` 会写回去，不拷贝的话一道题里的 `\def` 就漏到后面所有公式上。）
- **`textContent` 里带着原始 LaTeX**。KaTeX 会把源码原样塞进 MathML 的 `<annotation>`（读屏与复制用），所以 `container.textContent` 会同时包含排版结果与 `\begin{cases}…` 原文。写测试或做文本提取时对 `.katex-html` 取，别对整个容器取。
- **公式比周围正文大约 1.21 倍**。这是 KaTeX（也是 TeX）的标准视觉尺寸，不是 bug。要压平就自己覆盖 `.katex { font-size: 1em }`，代价是符号相对中文会偏小。
- **块级公式别塞进 `<p>` 的中间**。`$$…$$` 会渲染出 `display:block` 的盒子，夹在一行中文里会把这行劈成三段。块级公式应当独占一个段落。
- **`mode="math"` 时 `display` 才有效**。`mixed` 下传 `display` 不报错也不生效 —— 混排里每段的行内/块级由它自己的分隔符决定，**看版式发现不了你传错了**（行内公式照常渲染，只是你以为的块级没出现）。要块级就写 `$$…$$`。
- **`formulaToPlain` 的输出别拿去做 OMML 导出的输入**。它底层走的是零依赖的轻量解析器，`\begin{cases}` 会被拍平 —— 而导出链路要的恰恰是被拍掉的行结构。导出请用 `splitMathSegments` 切段 + 原始 LaTeX。
- **`strict` 关着**。KaTeX 默认会对数学模式里的裸中日韩字符 console.warn，一屏几十道题就是几百条警告，因此本组件设了 `strict: "ignore"`。渲染结果不受影响，但也意味着 KaTeX 不会再提醒你「这段中文应该包 `\text{}`」。
- 组件返回 `<span>`；KaTeX 输出 HTML + MathML 双份，HTML 那半带 `aria-hidden`，读屏读的是 MathML，无需额外配 aria。

## 相关

- [QuestionCard](../question-card/question-card.md) —— 题目卡片，题干/选项内部就是本组件；同住 `@hulianui/ui/math`
- [Prose](../prose/prose.md) —— 长文排版容器
- [Markdown](../markdown/markdown.md) —— 整段富文本
