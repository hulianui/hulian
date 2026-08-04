// 裸记号切分 —— 把「没有 $ 包裹」的题库正文切成 文本 / 公式 / 填空槽 三种段。
//
// 为什么需要它：KaTeX 要求明确的 LaTeX 子串边界，而 PDF/Word/OCR 抽出来的题面是裸的 ——
// `将 \frac{3}{8} 化成小数为 ____`，没有一个 `$`。规范做法是让上游把公式包成 `$…$`
// （边界由数据显式携带，不用猜），本模块是**存量数据的兜底**：数据带分隔符时走精确路径，
// 一个分隔符都没有时才用这里的启发式。
//
// 判据只有一条：**没有 LaTeX 触发字符就不是公式**。`P(2,3)`、`A.`、`(a+b)` 这些
// 不含 `\` / `^` / `_` 的片段一律留作文本，宁可少排也不误排 —— 误把中文正文喂给 KaTeX
// 会得到一串红色报错，比不排版糟糕得多。

/** 一段切分结果。`blank` 是填空槽（`____`），它既不是文本也不是 LaTeX。 */
export interface BareSegment {
  type: "text" | "math" | "blank";
  /** `math` 段是可直接交给 KaTeX 的 LaTeX 源；`blank` 段的 content 是原始下划线串。 */
  content: string;
}

/** 数学片段允许包含的 ASCII 字符。不含 `.` —— 见 scanLeft 里选项标号那条。 */
const MATH_ASCII = /[A-Za-z0-9+\-*/=<>()[\]|,'!:;]/u;
/** 触发字符：只有它们能让一段文本升格成公式。 */
const TRIGGER = /[\\^_]/u;
const ASCII_LETTER = /[A-Za-z]/u;

/** 从 `src[start]`（必须是 open）起找配对的 close，返回配对符下标；找不到返回 -1。 */
function matchGroup(src: string, start: number, open: string, close: string): number {
  if (src[start] !== open) return -1;
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "\\") {
      i++; // 转义字符连同下一个字符整体跳过，`\{` 不参与配对
      continue;
    }
    if (src[i] === open) depth++;
    else if (src[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * 从触发点向左回溯，找出该公式片段真正的起点。
 *
 * `y=ax^{2}` 的触发字符是 `^`，但公式是从 `y` 开始的 —— 只取 `x^{2}` 会让 `y=ax` 用正文
 * 字体、指数用数学字体，同一个式子劈成两种字体比不排版还难看。
 */
function scanLeft(src: string, trigger: number): number {
  let i = trigger;
  while (i > 0) {
    const ch = src[i - 1];
    // `.` 是硬边界：选项标号 `A.\frac{1}{9}` 若把 `A.` 一起吞进去，KaTeX 会把编号排成斜体变量。
    if (ch === "." || !MATH_ASCII.test(ch)) break;
    i--;
  }
  return i;
}

/** 吃掉一个命令的全部参数：`{…}` 与 `[…]`，允许多个、允许嵌套。 */
function eatArguments(src: string, from: number): number {
  let i = from;
  for (;;) {
    const pair = src[i] === "{" ? ["{", "}"] : src[i] === "[" ? ["[", "]"] : null;
    if (!pair) return i;
    const close = matchGroup(src, i, pair[0], pair[1]);
    if (close === -1) return i; // 没闭合：就此打住，剩下的按文本走，绝不吞掉半个式子
    i = close + 1;
  }
}

/**
 * 从公式片段起点向右扫到边界，返回结束下标（不含）。
 *
 * 尾部的 `,` `;` `:` 与空格会被剥回文本段：中文题面里公式后面跟的这几个符号
 * 几乎总是句读而不是式子的一部分（`x\in A,则…`），排进公式会连标点一起变斜体。
 */
function scanRight(src: string, start: number): number {
  let i = scanRightRaw(src, start);
  while (i > start && /[,;:\s]/u.test(src[i - 1])) i--;
  return i;
}

function scanRightRaw(src: string, start: number): number {
  let i = start;
  while (i < src.length) {
    const ch = src[i];

    if (ch === "\\") {
      const next = src[i + 1];
      if (next && ASCII_LETTER.test(next)) {
        let j = i + 1;
        while (j < src.length && ASCII_LETTER.test(src[j])) j++;
        // 命令名后的单个空格在 TeX 里是命令终止符而非内容，吃掉它 ——
        // 否则 `\angle ABC` 会在 `\angle` 处断开，ABC 掉进文本段。
        // 但只在后面确实还是数学时才吃：`30^\circ 后` 那个空格是公式与中文之间的
        // 视觉间隔，吞掉会让中文直接贴上公式。
        const after = src[j + 1];
        if (src[j] === " " && after && (MATH_ASCII.test(after) || after === "\\")) j++;
        i = eatArguments(src, j);
        continue;
      }
      if (next) {
        i += 2; // `\{` `\%` 这类转义字符
        continue;
      }
      return i; // 串尾的孤立反斜杠
    }

    if (ch === "^" || ch === "_") {
      if (src[i + 1] === "_") return i; // `____` 是填空槽，不属于公式
      const next = src[i + 1];
      if (next === "{" || next === "[") {
        i = eatArguments(src, i + 1);
        continue;
      }
      // `x^\circ`：只前进一格，下一轮由 `\` 分支接管命令名与参数
      i++;
      continue;
    }

    if (MATH_ASCII.test(ch)) {
      i++;
      continue;
    }

    return i;
  }
  return i;
}

/**
 * 把裸正文切成段。不做任何 LaTeX 语义解释 —— 只负责划边界，排版交给 KaTeX。
 *
 * 切不出公式时返回单个 text 段（而不是空数组），调用方可以无脑 map。
 */
export function splitBareMath(src: string): BareSegment[] {
  const out: BareSegment[] = [];
  let text = "";
  let i = 0;

  const flush = () => {
    if (text) out.push({ type: "text", content: text });
    text = "";
  };

  while (i < src.length) {
    const ch = src[i];

    // 填空槽优先于下标判定：`____` 是 4 个下划线，不是 2 层下标
    if (ch === "_") {
      const run = /^_+/u.exec(src.slice(i))?.[0] ?? "";
      if (run.length >= 2) {
        flush();
        out.push({ type: "blank", content: run });
        i += run.length;
        continue;
      }
    }

    if (TRIGGER.test(ch)) {
      const start = scanLeft(src, i);
      const end = scanRight(src, start);
      if (end > start) {
        // 回溯可能已经把若干字符收进了 text，要吐回去
        text = text.slice(0, text.length - (i - start));
        flush();
        out.push({ type: "math", content: src.slice(start, end) });
        i = end;
        continue;
      }
    }

    text += ch;
    i++;
  }

  flush();
  return out.length ? out : [{ type: "text", content: src }];
}

/** 整串有没有可切出来的公式或填空槽。用来决定要不要走 KaTeX 这条贵路径。 */
export function hasBareMath(src: string): boolean {
  return splitBareMath(src).some((seg) => seg.type !== "text");
}
