/// <reference path="./katex-css.d.ts" />
// ↑ 别删、也别挪到任何语句下面 —— 三斜线指令只在**任何语句之前**才生效，
//   而它是把 katex-css.d.ts 带进消费方 program 的唯一途径（详见该文件）。
import "katex/dist/katex.min.css";
import { Fragment, memo } from "react";
import katex from "katex";

import { cn } from "../lib/cn";
import { splitMathSegments } from "../math-text/math-text.parse";
import type { FormulaProps } from "./math.types";

// KaTeX 驱动的重型数学排版。与 MathText 的分工是**能力边界**，不是新旧替代：
//
//   MathText（@hulianui/ui）    零依赖，行内混排，认教辅题面高频的那几样记号
//   Formula （@hulianui/ui/math）KaTeX，多行环境 / 大型定界符 / 真排版，代价是 KaTeX 的 86KB gzip（JS）加样式表与字体
//
// 走独立 subpath 就是为了这 86KB：MathText 的消费者不该为用不上的能力买单，
// 而需要 \begin{cases} 真排版的页面本来就愿意付这个体积。选型判据写在 math.md。
//
// 没有 "use client"：katex.renderToString 是确定性纯函数，服务端能跑、SSR 与 hydration 结果一致，
// 因此本组件可以直接用在 RSC 里。这正是「每个下游各接一遍 KaTeX」时最容易踩的那个坑。

/**
 * 把一段 LaTeX 排成 HTML 字符串。
 *
 * `throwOnError: false` 是刻意的：出错时 KaTeX 把**原文**红色显示并把错误挂在 title 上，
 * 而不是抛异常拆掉整棵树、也不是静默吐个空白。这与 MathText「不认识的记号原样显示」同一立场 ——
 * 损坏的公式必须看得见。安静地把 `\begin{cases}x=my\y^2=6x\end{cases}` 渲染成一行，
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

function FormulaImpl({ children, mode = "mixed", display = false, macros, className }: FormulaProps) {
  const src = children ?? "";
  const segments =
    mode === "math"
      ? [{ type: "math" as const, content: src, display }]
      : splitMathSegments(src);

  return (
    <span className={cn(className)}>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <Fragment key={i}>{seg.content}</Fragment>
        ) : (
          <span
            key={i}
            // eslint-disable-next-line react/no-danger -- KaTeX 输出，安全依据见 renderMath 注释
            dangerouslySetInnerHTML={{ __html: renderMath(seg.content, seg.display, macros) }}
          />
        ),
      )}
    </span>
  );
}

// memo 不是可选的优化：KaTeX 排版比 MathText 的解析贵一个数量级，而题库页面一屏就有几十个实例，
// 父级任何一次无关更新都会把它们全部重排一遍。props 全是原始值（macros 除外，见其文档注释）。
export const Formula = memo(FormulaImpl);
Formula.displayName = "Formula";
