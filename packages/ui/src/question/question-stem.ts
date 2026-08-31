// 题干的「图 / 非图」这一刀。顺序定死：**先切图，再解析公式**——storage key 里合法地带着
// `_` `^` `\`（`import/formula/a_1^2.png` 是真实形状），公式解析器看到它们就当下标/上标/命令，
// 图片引用会被吃成乱码公式。反之图片语法里不含 `$`，先摘图对公式分隔符零影响。
// 判据钉在 stem-figures.contract.json（消费方 Python 侧 docx 导出读同一份）。
// 非图部分内部的 `$…$` 切段由 math/math.parse.ts 的 splitMathSegments 负责，两把刀不重叠。

/** Markdown 图片语法。每次用都新建：带 /g 的正则有 lastIndex 状态，模块级共用会静默漏图。
 *  key 里不允许空白：storage key 从不含空格，而允许空格会让 `![](未闭合` 之后整段正文被吞。 */
const figurePattern = () => /!\[[^\]]*\]\(([^)\s]+)\)/g;

/** 题干里的插图 key，按出现顺序，重复保留。`accept` 只取某一类（如手工题图只认某前缀）。 */
export function stemFigureKeys(stem: string, accept?: (key: string) => boolean): string[] {
  const keys = [...stem.matchAll(figurePattern())].map((m) => m[1]);
  return accept ? keys.filter(accept) : keys;
}

/** 摘掉插图引用后的正文。三步收拾行尾空格 / 行内双空格 / 三连换行，否则渲染出忽宽忽窄的空隙。 */
export function stripStemFigures(stem: string, accept?: (key: string) => boolean): string {
  return stem
    .replace(figurePattern(), (whole, key: string) => (accept === undefined || accept(key) ? "" : whole))
    .replace(/[^\S\n]{2,}/g, " ")
    .replace(/[^\S\n]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface SplitStem {
  /** 可以交给 `<Formula>` 的正文（已不含任何图片语法）。 */
  text: string;
  /** 插图 storage key，按题干里的出现顺序。 */
  figures: string[];
}

export function splitStemFigures(stem: string, accept?: (key: string) => boolean): SplitStem {
  return { text: stripStemFigures(stem, accept), figures: stemFigureKeys(stem, accept) };
}
