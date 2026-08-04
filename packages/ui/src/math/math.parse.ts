// Formula 的配套纯函数 —— 与组件同一套分隔符语义，但不碰 DOM、不引 KaTeX，
// 因此服务端脚本（检索入库、导出、比对）可以单独引它。
import { mathToPlain } from "../math-text/math-text.parse";

/**
 * 转成可搜索/可导出的朴素文本：`$\frac{3}{8}$` → `3/8`，分隔符本身不进结果。
 *
 * 检索、导出、纯文本比对一律用它，别把带记号的原串直接甩给搜索框 ——
 * 用户搜「3/8」应该能命中。这是 MathText 的 `mathToPlain` 在分隔符语义下的等价物，
 * 两种 `mode` 都适用（`mode="math"` 的串没有分隔符，会整串按数学处理）。
 *
 * **有损，且只损在无关紧要的地方**：底层走 MathText 的轻量解析器，
 * `\begin{cases}` 这类二维环境会被拍平成一行、`\\` 变成分号。
 * 检索与比对本来就是一维的，这个降级不影响命中；
 * 但**别拿它的输出去做 Word/OMML 导出的输入** —— 那条链路需要的恰恰是被拍掉的行结构，
 * 应当拿原始 LaTeX 加 `splitMathSegments` 自己切段。
 */
export function formulaToPlain(src: string): string {
  return mathToPlain(src, { delimiters: true });
}
