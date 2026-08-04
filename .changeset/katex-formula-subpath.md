---
"@hulianui/ui": minor
---

新增 Formula（`@hulianui/ui/math`）：KaTeX 驱动的二维数学排版；MathText 补 `delimiters` 认 `$…$` 边界 <!-- parity-id: katex-formula-subpath -->

**新组件 Formula，走独立 subpath** — [#87](https://github.com/hulianui/hulian/issues/87)

MathText 刻意划了零依赖边界：`\begin{cases}` 被拍平成一行、`\\` 变分号、`\left…\right` 丢命令留定高括号，文档写着「请自行接 KaTeX」。问题是这句话意味着每个做题库/教辅的下游各接一遍：各写一套分隔符切分、各配一份 KaTeX CSS、各踩一遍 SSR 的坑。消费方实测 1324 道入库题里 `\begin{...}` 环境 23 处，其中 `cases` 占 78% —— 分段函数是高中函数题的主力题型，不是长尾，而拍平后的 `f(x)=x, x<0；-x, x≥0` 已经读不出「这是分段定义」，题干读不懂题就废了。

```tsx
import { Formula } from "@hulianui/ui/math";

<Formula>{"$$f(x)=\\begin{cases} -x^{2}-2ax-a, & x<0 \\\\ e^{x}+\\ln(x+1), & x \\geq 0 \\end{cases}$$"}</Formula>
```

走 subpath 而不是进主 barrel，是因为 KaTeX 要 86KB gzip 的 JS（体积门禁实测）外加样式表与字体：**MathText 的消费者不该为用不上的能力买单**，而需要重型排版的页面本来就愿意付这个体积。样式由组件自己 `import`，消费方无需在入口引 CSS；组件没有 `"use client"`，`katex.renderToString` 是确定性纯函数，可直接用在 RSC 里。

配套 `splitMathSegments`（切段，Word/OMML 导出链路要的就是它）与 `formulaToPlain`（可检索朴素文本）。坏数据分两档显示：认不出的控制序列就地标红、原样露出且不影响周围排版；整体解析失败则红色显示整条原文。

**MathText 新增 `delimiters`**

认 `$…$` / `$$…$$` / `\(…\)` / `\[…\]`，开了之后**只有分隔符内按数学解析，外面一律按纯文本原样输出**。

这条修的是「渲染层反向污染数据 SSOT」：渲染层不认 `$`，上游就只能在入库时把它剥掉，而剥 `$` 是有损的 —— `$\{a_n\}$` 剥完成了 `{a_n}`，集合还是 LaTeX 分组再也分不出来；喂给 LLM 时公式与中文粘成一片；要做 Word 导出时切不出公式段就无从转换。边界是必须显式携带的信息，不该由渲染层猜、更不该逼上游删掉。

默认 `false`，存量零改动 —— 因为开了之后 `售价 $100 起，成本 $80` 里的两个 `$` 会被当成一对分隔符，正文里有货币金额就别开。整串没有成对分隔符时自动回退到存量行为，半迁移的题库不会整题露出 `\frac`。`mathToPlain` 同步接受 `{ delimiters }`，检索口径必须与渲染传同一个值。
