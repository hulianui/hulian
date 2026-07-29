// 行内数学记号解析器 —— 纯函数、零依赖、可单测。
//
// 认一个刻意收窄的 LaTeX 子集：分数 / 根号 / 上下标 / 填空槽 / 装饰线 +
// 一张按真实语料频次建的符号表（见 math-text.symbols.ts）。
// 不引 KaTeX：教辅题面的需求就这些，为长尾的 1% 给每个消费方压上几百 KB
// 与本库零依赖取向相悖；而中间格式是标准 LaTeX 子集，将来真要排矩阵/积分，
// 换成 KaTeX 几乎零数据迁移成本 —— 这扇门是特意留着的。
//
// 不认识的命令一律按字面输出（界面上看得见 `\foo`），绝不静默吞掉。
import type { MathNode } from "./math-text.types";
import {
  DECORATE_COMMANDS,
  MATH_SYMBOLS,
  SIZING_COMMANDS,
  SPACING_COMMANDS,
  UNWRAP_COMMANDS,
} from "./math-text.symbols";

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

/**
 * 跳过控制字后的空白。
 * LaTeX 里 `\angle ABC` 的那个空格是命令名的**终止符**，不是内容；
 * 不吃掉它，题面里每个 `\angle`/`\triangle` 后面都会多冒一个空格出来。
 */
function skipSpaces(src: string, at: number): number {
  let i = at;
  while (i < src.length && (src[i] === " " || src[i] === "\t")) i++;
  return i;
}

/** 读一个「参数」：既支持 `{...}` 组，也支持紧跟的单个字符（x^2）。 */
function readArg(src: string, start: number): { nodes: MathNode[]; next: number } | null {
  const at = skipSpaces(src, start);
  if (at >= src.length) return null;
  if (src[at] === "{") {
    const end = matchBrace(src, at);
    if (end === -1) return null;
    return { nodes: parseMath(src.slice(at + 1, end)), next: end + 1 };
  }
  return { nodes: [{ kind: "text", text: src[at] }], next: at + 1 };
}

/**
 * 处理一条反斜杠命令。返回 null 表示「不认识」——
 * 调用方会把它当普通字符走下去，于是 `\foo` 原样显示在界面上。
 * 这是刻意的：吞掉未知命令会让题面缺一块而没人察觉。
 */
function handleCommand(
  src: string,
  at: number,
  name: string | undefined,
): { nodes: MathNode[]; next: number } | null {
  if (!name) return null;
  const after = at + 1 + name.length;

  if (name === "frac") {
    const num = readArg(src, after);
    const den = num ? readArg(src, num.next) : null;
    if (!num || !den) return null; // 残缺的 \frac 保持字面，不吞
    return { nodes: [{ kind: "frac", num: num.nodes, den: den.nodes }], next: den.next };
  }

  if (name === "sqrt") {
    let cursor = after;
    let index: MathNode[] | undefined;
    if (src[cursor] === "[") {
      const close = src.indexOf("]", cursor);
      if (close !== -1) {
        index = parseMath(src.slice(cursor + 1, close));
        cursor = close + 1;
      }
    }
    const radicand = readArg(src, cursor);
    if (!radicand) return null;
    return { nodes: [{ kind: "sqrt", radicand: radicand.nodes, index }], next: radicand.next };
  }

  if (UNWRAP_COMMANDS.has(name)) {
    const arg = readArg(src, after);
    if (!arg) return null;
    return { nodes: arg.nodes, next: arg.next };
  }

  const decorate = DECORATE_COMMANDS[name];
  if (decorate) {
    const arg = readArg(src, after);
    if (!arg) return null;
    return { nodes: [{ kind: "decorate", style: decorate, children: arg.nodes }], next: arg.next };
  }

  // \left( \right] 只调定界符大小，丢掉命令保留后面的括号本身
  if (SIZING_COMMANDS.has(name)) return { nodes: [], next: skipSpaces(src, after) };

  // 矩阵/方程组环境本组件不排版，降级成一行可读文本：
  // 丢掉 \begin{env}{cols} 与 \end{env} 外壳，行分隔符 \\ 变成分号。
  // 是有损的，但比吐一串 \begin{array} 给老师看要好。
  if (name === "begin" || name === "end") {
    let cursor = after;
    while (src[cursor] === "{") {
      const close = matchBrace(src, cursor);
      if (close === -1) break;
      cursor = close + 1;
    }
    return { nodes: [], next: cursor };
  }

  const spacing = SPACING_COMMANDS[name];
  if (spacing !== undefined) return { nodes: [{ kind: "text", text: spacing }], next: after };

  const symbol = MATH_SYMBOLS[name];
  if (symbol) return { nodes: [{ kind: "text", text: symbol }], next: skipSpaces(src, after) };

  return null;
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

    if (src[i] === "\\") {
      const name = rest.match(/^\\([a-zA-Z]+)/)?.[1];
      const consumed = handleCommand(src, i, name);
      if (consumed) {
        flush();
        out.push(...consumed.nodes);
        i = consumed.next;
        continue;
      }
    }

    if (src[i] === "^" || src[i] === "_") {
      const arg = readArg(src, i + 1);
      if (arg) {
        flush();
        // 度数 30^{\circ}：\circ 已经是上标位的字符，再套一层 <sup> 会抬两次变成浮空小点
        const isDegree =
          src[i] === "^" &&
          arg.nodes.length === 1 &&
          arg.nodes[0].kind === "text" &&
          arg.nodes[0].text === "°";
        out.push(
          isDegree
            ? { kind: "text", text: "°" }
            : { kind: src[i] === "^" ? "sup" : "sub", children: arg.nodes },
        );
        i = arg.next;
        continue;
      }
    }

    // 数学模式里 \\ 是换行、& 是对齐制表符，都不是字面内容
    if (rest.startsWith("\\\\")) {
      flush();
      out.push({ kind: "text", text: "；" });
      i += 2;
      continue;
    }
    if (src[i] === "&") {
      buf += " ";
      i++;
      continue;
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
          case "decorate":
            return render(n.children);
          case "blank":
            return "_".repeat(n.length);
        }
      })
      .join("");
  return render(parseMath(src));
}
