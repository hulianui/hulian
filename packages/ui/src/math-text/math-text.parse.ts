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
  BLACKBOARD_LETTERS,
  classifySymbol,
  DECORATE_COMMANDS,
  ESCAPED_CHARS,
  MATH_SYMBOLS,
  SIZING_COMMANDS,
  SPACING_COMMANDS,
  UNWRAP_COMMANDS,
} from "./math-text.symbols";

/** 2 个及以上连续下划线 = 填空槽；单个下划线才是下标标记。 */
const BLANK_RE = /^_{2,}/;

export interface MathParseOptions {
  /** Text used when a matrix/array row break is flattened into one line. */
  rowSeparator?: string;
}

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

/**
 * 读一个「参数」：`{...}` 组、紧跟的单个字符（x^2），或**一条完整命令**（90^\circ）。
 *
 * 命令那一档不是锦上添花：`90^\circ` 比 `90^{\circ}` 更常见（少打两个花括号），
 * 而 `\circ` 在初中题面频次里排第三。少了这一档，上标里只会落进一个反斜杠、
 * 命令名漏成正文，题面上就露出 `90^\circ` —— 正是本组件要消灭的东西。
 * 命令名自带边界，所以 `x^\alpha b` 的上标是 `\alpha`，`b` 仍是正文。
 */
function readArg(
  src: string,
  start: number,
  options: MathParseOptions,
): { nodes: MathNode[]; next: number } | null {
  const at = skipSpaces(src, start);
  if (at >= src.length) return null;
  if (src[at] === "{") {
    const end = matchBrace(src, at);
    if (end === -1) return null;
    return { nodes: parseMath(src.slice(at + 1, end), options), next: end + 1 };
  }
  if (src[at] === "\\") {
    const name = src.slice(at).match(/^\\([a-zA-Z]+)/)?.[1];
    const consumed = handleCommand(src, at, name, options);
    // 不认识的命令返回 null，落回单字符那档，于是 `x^\oiint` 原样露出而不是被吞
    if (consumed) return { nodes: consumed.nodes, next: consumed.next };
  }
  return { nodes: [{ kind: "text", text: src[at] }], next: at + 1 };
}

/**
 * 读一个参数的**原始文本**（不解析）。
 * \mathbb 要逐字符换字形，拿解析后的节点树反而做不了这件事。
 */
function readRawArg(src: string, start: number): { text: string; next: number } | null {
  const at = skipSpaces(src, start);
  if (at >= src.length) return null;
  if (src[at] === "{") {
    const end = matchBrace(src, at);
    if (end === -1) return null;
    return { text: src.slice(at + 1, end), next: end + 1 };
  }
  return { text: src[at], next: at + 1 };
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
  options: MathParseOptions,
): { nodes: MathNode[]; next: number } | null {
  if (!name) {
    // `\{` `\%` 之类的转义字符：正则取不到命令名（下一个字符不是字母），
    // 但它们确实是命令，不还原就会在集合构建式里露出反斜杠。
    const escaped = ESCAPED_CHARS[src[at + 1]];
    if (escaped) return { nodes: [{ kind: "text", text: escaped }], next: at + 2 };
    return null;
  }
  const after = at + 1 + name.length;

  if (name === "frac") {
    const num = readArg(src, after, options);
    const den = num ? readArg(src, num.next, options) : null;
    if (!num || !den) return null; // 残缺的 \frac 保持字面，不吞
    return { nodes: [{ kind: "frac", num: num.nodes, den: den.nodes }], next: den.next };
  }

  if (name === "sqrt") {
    let cursor = after;
    let index: MathNode[] | undefined;
    if (src[cursor] === "[") {
      const close = src.indexOf("]", cursor);
      if (close !== -1) {
        index = parseMath(src.slice(cursor + 1, close), options);
        cursor = close + 1;
      }
    }
    const radicand = readArg(src, cursor, options);
    if (!radicand) return null;
    return { nodes: [{ kind: "sqrt", radicand: radicand.nodes, index }], next: radicand.next };
  }

  if (name === "mathbb") {
    const arg = readRawArg(src, after);
    if (!arg) return null;
    // 表外字符逐个原样保留（\mathbb{R+} → ℝ+），不因为一个 + 就整体放弃
    const text = [...arg.text].map((ch) => BLACKBOARD_LETTERS[ch] ?? ch).join("");
    return { nodes: [{ kind: "text", text }], next: arg.next };
  }

  if (name === "overset") {
    const above = readArg(src, after, options);
    const base = above ? readArg(src, above.next, options) : null;
    if (!above || !base) return null; // 残缺的 \overset 保持字面，不吞
    return {
      nodes: [{ kind: "overset", above: above.nodes, children: base.nodes }],
      next: base.next,
    };
  }

  if (UNWRAP_COMMANDS.has(name)) {
    const arg = readArg(src, after, options);
    if (!arg) return null;
    return { nodes: arg.nodes, next: arg.next };
  }

  const decorate = DECORATE_COMMANDS[name];
  if (decorate) {
    const arg = readArg(src, after, options);
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
  if (symbol) return { nodes: [toSymbolNode(symbol)], next: skipSpaces(src, after) };

  return null;
}

/** 按排版类别决定这个符号是普通文本还是要留白的 op 节点。 */
function toSymbolNode(symbol: string): MathNode {
  const cls = classifySymbol(symbol);
  if (cls === "relation" || cls === "binary") return { kind: "op", text: symbol, spacing: cls };
  return { kind: "text", text: symbol };
}

/** 左侧是开定界符时，紧跟的 `±` 是正负号而非「加减」，见 precededByOperand。 */
const OPEN_DELIMITER_RE = /[([{⟨]$/;

/**
 * 前面有没有一个可运算的操作数。
 * 二元运算符**只在两个操作数之间**才留白：`a±b` 是加减号要留白，`±3` 是正负号
 * 要紧贴，`(±3)` 同理。关系符不走这条判据 —— 关系符没有一元用法。
 */
function precededByOperand(out: MathNode[], buf: string): boolean {
  const pending = buf.replace(/[ \t]+$/, "");
  if (pending) return !OPEN_DELIMITER_RE.test(pending);
  const prev = out[out.length - 1];
  if (!prev) return false;
  if (prev.kind === "op") return false;
  if (prev.kind === "text") {
    const text = prev.text.replace(/[ \t]+$/, "");
    return text !== "" && !OPEN_DELIMITER_RE.test(text);
  }
  // 分数 / 根号 / 上下标 / 装饰 / 填空槽本身就是完整的操作数
  return true;
}

export function parseMath(src: string, options: MathParseOptions = {}): MathNode[] {
  const out: MathNode[] = [];
  let buf = "";
  let i = 0;

  /**
   * `trimTrailingSpace` 用在 op 节点之前：关系符左右的留白由类别统一给，
   * 作者写的 `A ⇒ B` 与 `A⇒B` 必须落到同一个视觉结果，
   * 否则左边是文本空格 + 留白、右边只有留白，两侧仍然不对称。
   */
  const flush = (trimTrailingSpace = false) => {
    const text = trimTrailingSpace ? buf.replace(/[ \t]+$/, "") : buf;
    if (text) out.push({ kind: "text", text });
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
      const consumed = handleCommand(src, i, name, options);
      if (consumed) {
        let nodes = consumed.nodes;
        const first = nodes[0];
        // `\pm 3` 在行首是正负号，降级成普通文本，不留白
        if (first?.kind === "op" && first.spacing === "binary" && !precededByOperand(out, buf)) {
          nodes = [{ kind: "text", text: first.text }];
        }
        flush(nodes[0]?.kind === "op");
        out.push(...nodes);
        i = consumed.next;
        continue;
      }
    }

    if (src[i] === "^" || src[i] === "_") {
      const arg = readArg(src, i + 1, options);
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
      out.push({ kind: "text", text: options.rowSeparator ?? "；" });
      i += 2;
      continue;
    }
    if (src[i] === "&") {
      buf += " ";
      i++;
      continue;
    }

    // 裸 Unicode 关系符/运算符（`x=1`、OCR 直接给出的 `x≠0`）与命令写法同等对待，
    // 否则同一行里 `\leq` 有留白、手打的 `=` 没有，看起来更乱。
    const cls = classifySymbol(src[i]);
    if (cls === "relation" || (cls === "binary" && precededByOperand(out, buf))) {
      flush(true);
      out.push({ kind: "op", text: src[i], spacing: cls });
      // 右侧空格一并归一化：留白由类别给，不叠加作者打的空格
      i = skipSpaces(src, i + 1);
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
          // 朴素文本保持紧凑：`x≠0` 才是检索/导出/比对要的形态，留白只属于 DOM
          case "op":
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
          // 上方是有语义的记号（弧号等），不同于 decorate 的纯样式线，检索时要留住
          case "overset":
            return render(n.above) + render(n.children);
          case "blank":
            return "_".repeat(n.length);
        }
      })
      .join("");
  return render(parseMath(src));
}
