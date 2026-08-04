/// <reference path="./katex-css.d.ts" />
// ↑ 别删、也别挪到任何语句下面 —— 三斜线指令只在**任何语句之前**才生效，
//   而它是把 katex-css.d.ts 带进消费方 program 的唯一途径（详见该文件）。
import "katex/dist/katex.min.css";
import { Fragment, memo } from "react";
import katex from "katex";

import { cn } from "../lib/cn";
import { splitMathSegments } from "./math.latex-parse";
import { splitBareMath } from "./math.bare";
import { MathBlank } from "./math-blank";
import type { FormulaProps } from "./math.types";

// KaTeX 驱动的数学排版 —— 本库唯一的数学渲染路径。
//
// 曾经还有个零依赖的 MathText 用 CSS 拼行内版式（inline-flex 叠分数、border-t 当根号横线）。
// 它在 0.25.0 退役了，原因不是「能力不够」而是**排版是错的**：√ 是个定高字符而横线是兄弟盒的
// border，被开方数一旦含上标（`\sqrt{a^{2}+b^{2}}`）横线就接不上根号、末尾的指数还顶到线外；
// 弧与帽子也不跟随内容宽度。这类缺陷是 CSS 拼贴的固有极限，修完一处还有下一处。
// 而它当初的卖点「不撑乱中文行高」实测在 KaTeX 下同样成立 —— 那个差异一直是假的。
//
// 代价是 KaTeX 的 86KB gzip（JS）加样式表与字体，所以本件走 @hulianui/ui/math 独立 subpath：
// 不排数学的消费者一分体积都不付。QuestionCard 因为内部就是 Formula，也住这条路径。
//
// 没有 "use client"：katex.renderToString 是确定性纯函数，服务端能跑、SSR 与 hydration 结果一致，
// 因此本组件可以直接用在 RSC 里。这正是「每个下游各接一遍 KaTeX」时最容易踩的那个坑。

/**
 * 把一段 LaTeX 排成 HTML 字符串。
 *
 * `throwOnError: false` 是刻意的：出错时 KaTeX 把**原文**红色显示并把错误挂在 title 上，
 * 而不是抛异常拆掉整棵树、也不是静默吐个空白 —— 损坏的公式必须看得见。安静地把 `\begin{cases}x=my\y^2=6x\end{cases}` 渲染成一行，
 * 比直接报错危险得多，因为没人会发现它错了。
 *
 * `strict: "ignore"`：默认的 "warn" 会对数学模式里的裸中日韩字符 console.warn。题面里
 * 「$x>0$ 时」这种写法极常见，一屏几十道题就是几百条警告，噪音盖过真问题。渲染结果不受影响。
 *
 * 输出用 dangerouslySetInnerHTML 是安全的：KaTeX 默认 `trust: false`，`\href` / `\url` /
 * `\includegraphics` 这些能引入外部 URL 的命令一律被拒（渲染成红色错误文本），
 * 输出里不可能出现 javascript: 链接或 <script>。errorColor 传的是本文件里的常量，不来自用户输入。
 */
function renderMath(src: string, displayMode: boolean, macros?: Record<string, string>): string {
  return katex.renderToString(src, {
    displayMode,
    throwOnError: false,
    errorColor: "var(--color-danger)",
    strict: "ignore",
    output: "htmlAndMathml",
    // 浅拷贝不是洁癖：KaTeX 把 macros 当**可变**的宏表用，`\def` 定义的宏会被写回这个对象。
    // 直接把消费方的常量传进去，一条题面里的 \def 就会漏到后面所有公式上。
    macros: macros ? { ...macros } : undefined,
  });
}

/** 统一的段形状：分隔符切分与裸记号切分的结果都归一到这里。 */
interface Segment {
  type: "text" | "math" | "blank";
  content: string;
  display: boolean;
}

/**
 * 把文本段里的填空槽（`____`）拆出来。
 *
 * 两种模式都要过这一遍：填空槽在 `$…$` **外面**（`$\frac{3}{8}$ 化成小数为 ____`），
 * 分隔符切分只会把它当普通文本，四个下划线就那么露在题面上。
 */
function splitBlanks(content: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of content.matchAll(/_{2,}/gu)) {
    if (m.index > last) out.push({ type: "text", content: content.slice(last, m.index), display: false });
    out.push({ type: "blank", content: m[0], display: false });
    last = m.index + m[0].length;
  }
  if (last < content.length) out.push({ type: "text", content: content.slice(last), display: false });
  return out;
}

function segmentsOf(src: string, mode: "mixed" | "math", display: boolean): Segment[] {
  if (mode === "math") return [{ type: "math", content: src, display }];

  const byDelimiter = splitMathSegments(src);
  // 整串一个成对分隔符都没有 → 退到裸记号切分。PDF/Word/OCR 抽出来的题面就是这样的，
  // 上游还没来得及包 `$` 时不该整题露出 `\frac{3}{8}` 这种字面记号。
  const segments = byDelimiter.some((s) => s.type === "math")
    ? byDelimiter.map((s) => ({ type: s.type, content: s.content, display: s.display }) as Segment)
    : splitBareMath(src).map((s) => ({ ...s, display: false }));

  return segments.flatMap((seg) => (seg.type === "text" ? splitBlanks(seg.content) : [seg]));
}

function FormulaImpl({
  children,
  mode = "mixed",
  display = false,
  blankWidth = 2.5,
  macros,
  className,
}: FormulaProps) {
  const segments = segmentsOf(children ?? "", mode, display);

  return (
    <span className={cn(className)}>
      {segments.map((seg, i) => {
        if (seg.type === "text") return <Fragment key={i}>{seg.content}</Fragment>;
        // 填空槽不走 KaTeX：那边只能用 \rule / \hspace 之类凑，宽度还改不动
        if (seg.type === "blank") return <MathBlank key={i} width={blankWidth} />;
        return (
          <span
            key={i}
            // eslint-disable-next-line react/no-danger -- KaTeX 输出，安全依据见 renderMath 注释
            dangerouslySetInnerHTML={{ __html: renderMath(seg.content, seg.display, macros) }}
          />
        );
      })}
    </span>
  );
}

// memo 不是可选的优化：KaTeX 排版比纯字符串解析贵一个数量级，而题库页面一屏就有几十个实例，
// 父级任何一次无关更新都会把它们全部重排一遍。props 全是原始值（macros 除外，见其文档注释）。
export const Formula = memo(FormulaImpl);
Formula.displayName = "Formula";
