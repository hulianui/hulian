// 行内数学记号解析器 —— 纯函数、零依赖、可单测。
//
// 只认一个刻意收窄的 LaTeX 子集（分数 / 根号 / 上下标 / 填空槽），
// 因为教辅题面 99% 的排版需求就这几样；引 KaTeX 会为了 1% 的场景
// 给每个消费方压上几百 KB，与本库零依赖取向相悖。
// 不认识的记号一律按字面文本输出，绝不吞内容。
import type { MathNode } from "./math-text.types";

/** 2 个及以上连续下划线 = 填空槽；单个下划线才是下标标记。 */
const BLANK_RE = /^_{2,}/;

/** 从 `src[start]`（必须是 `{`）起找到配对的 `}`，返回其下标；找不到返回 -1。 */
function matchBrace(src: string, start: number): number {
  if (src[start] !== "{") return -1;
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return i;
  }
  return -1;
}

/** 读一个「参数」：既支持 `{...}` 组，也支持紧跟的单个字符（x^2）。 */
function readArg(src: string, at: number): { nodes: MathNode[]; next: number } | null {
  if (at >= src.length) return null;
  if (src[at] === "{") {
    const end = matchBrace(src, at);
    if (end === -1) return null;
    return { nodes: parseMath(src.slice(at + 1, end)), next: end + 1 };
  }
  return { nodes: [{ kind: "text", text: src[at] }], next: at + 1 };
}

export function parseMath(src: string): MathNode[] {
  const out: MathNode[] = [];
  let buf = "";
  let i = 0;

  const flush = () => {
    if (buf) out.push({ kind: "text", text: buf });
    buf = "";
  };

  while (i < src.length) {
    const rest = src.slice(i);

    const blank = rest.match(BLANK_RE);
    if (blank) {
      flush();
      out.push({ kind: "blank", length: blank[0].length });
      i += blank[0].length;
      continue;
    }

    if (rest.startsWith("\\frac")) {
      const num = readArg(src, i + 5);
      const den = num ? readArg(src, num.next) : null;
      if (num && den) {
        flush();
        out.push({ kind: "frac", num: num.nodes, den: den.nodes });
        i = den.next;
        continue;
      }
    }

    if (rest.startsWith("\\sqrt")) {
      let at = i + 5;
      let index: MathNode[] | undefined;
      if (src[at] === "[") {
        const close = src.indexOf("]", at);
        if (close !== -1) {
          index = parseMath(src.slice(at + 1, close));
          at = close + 1;
        }
      }
      const radicand = readArg(src, at);
      if (radicand) {
        flush();
        out.push({ kind: "sqrt", radicand: radicand.nodes, index });
        i = radicand.next;
        continue;
      }
    }

    if (src[i] === "^" || src[i] === "_") {
      const arg = readArg(src, i + 1);
      if (arg) {
        flush();
        out.push({ kind: src[i] === "^" ? "sup" : "sub", children: arg.nodes });
        i = arg.next;
        continue;
      }
    }

    buf += src[i];
    i++;
  }

  flush();
  return out;
}

/**
 * 转成可搜索/可导出的朴素文本：分数写作 a/b，上下标写作 ^n / _n，填空写作下划线。
 * 检索、导出 Word、纯文本对比都该用它，而不是把带记号的原串直接甩出去。
 */
export function mathToPlain(src: string): string {
  const render = (nodes: MathNode[]): string =>
    nodes
      .map((n) => {
        switch (n.kind) {
          case "text":
            return n.text;
          case "frac":
            return `${render(n.num)}/${render(n.den)}`;
          case "sqrt":
            return `√(${render(n.radicand)})`;
          case "sup":
            return `^${render(n.children)}`;
          case "sub":
            return `_${render(n.children)}`;
          case "blank":
            return "_".repeat(n.length);
        }
      })
      .join("");
  return render(parseMath(src));
}
