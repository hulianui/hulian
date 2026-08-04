// LaTeX 记号解析器 —— 纯函数、零依赖、可单测。
//
// 排版**不**走这里（那是 Formula/KaTeX 的活）。它现在只服务两件事：
//   1. mathToPlain / formulaToPlain —— 检索、导出、纯文本比对要的朴素文本
//   2. splitMathSegments —— 按 `$…$` 分隔符切段，供渲染层决定哪一段喂给 KaTeX
// 这两件都必须零依赖、服务端可跑（入库脚本会单独引），所以不把它们并进 KaTeX 那条路径。
//
// 认一个刻意收窄的 LaTeX 子集：分数 / 根号 / 上下标 / 填空槽 / 装饰线 +
// 一张按真实语料频次建的符号表（见 math.symbols.ts）。不认识的命令一律按字面输出，绝不静默吞掉。
import type { MathNode } from "./math.types";
import {
  BLACKBOARD_LETTERS,
  classifySymbol,
  DECORATE_COMMANDS,
  ESCAPED_CHARS,
  MATH_SYMBOLS,
  SIZING_COMMANDS,
  SPACING_COMMANDS,
  UNWRAP_COMMANDS,
} from "./math.symbols";

/** 2 个及以上连续下划线 = 填空槽；单个下划线才是下标标记。 */
const BLANK_RE = /^_{2,}/;

export interface MathParseOptions {
  /** Text used when a matrix/array row break is flattened into one line. */
  rowSeparator?: string;
}

/** 一段正文：`math` 是分隔符里的公式源（已去掉分隔符本身），`text` 是分隔符外的普通文本。 */
export interface MathSegment {
  type: "text" | "math";
  content: string;
  /** 公式段是否块级（`$$` / `\[`）。文本段恒为 false。 */
  display: boolean;
}

/**
 * 分隔符表。`$$` 必须排在 `$` 前面，否则 `$$x$$` 会被当成一个空的行内公式。
 * `allowBlankLine` 见 findClose 的注释。
 */
const DELIMITERS: { open: string; close: string; display: boolean; allowBlankLine: boolean }[] = [
  { open: "$$", close: "$$", display: true, allowBlankLine: true },
  { open: "\\[", close: "\\]", display: true, allowBlankLine: true },
  { open: "\\(", close: "\\)", display: false, allowBlankLine: false },
  { open: "$", close: "$", display: false, allowBlankLine: false },
];

const BLANK_LINE_RE = /\n[ \t]*\n/;

/**
 * 从 `from` 起找闭分隔符，返回其下标；找不到返回 -1。
 *
 * 先比 close 再跳转义：`\)` `\]` 这两个闭分隔符本身以反斜杠开头，
 * 顺序反了它们会被当成「转义序列」跳过去，公式永远闭合不了。
 * 反过来 `$` 的闭合要靠这条跳过 `\$`，否则 `$a\$b$` 会在中间断开。
 */
function findClose(src: string, from: number, close: string): number {
  let j = from;
  while (j < src.length) {
    if (src.startsWith(close, j)) return j;
    if (src[j] === "\\") {
      j += 2;
      continue;
    }
    j++;
  }
  return -1;
}

/**
 * 按 `$…$` / `$$…$$` / `\(…\)` / `\[…\]` 把正文切成文本段与公式段。纯函数。
 *
 * 为什么渲染层必须认这些分隔符：中文与公式混排时，「哪一段是式子」是上游**已经知道**的信息。
 * 渲染层不认，上游就只能在入库时把 `$` 剥掉迁就它 —— 而剥 `$` 是有损的：`$\{a_n\}$` 剥完
 * 变成 `{a_n}`，`{}` 是集合还是 LaTeX 分组再也分不出来，喂给 LLM 时公式与中文粘成一片，
 * 要做 Word 导出（LaTeX→MathML→OMML）时切不出公式段就无从转换。边界是必须显式携带的信息，
 * 不该由渲染层猜、更不该逼上游删掉。
 *
 * 三条边界处理：
 * - `\$` 是字面美元符号，不参与配对，且在文本段里被还原成 `$`；
 * - 找不到闭分隔符时，开分隔符按**字面文本**处理（`定价 $100` 不会把后半段吞成公式）；
 * - 行内分隔符不跨空行 —— 这是 TeX 自己的规则（`$` 内出现空行是 "Missing $ inserted"），
 *   同时也把 `售价 $100\n\n成本 $80` 这类跨段误配对挡在外面。块级 `$$` / `\[` 不受此限。
 */
export function splitMathSegments(src: string): MathSegment[] {
  const out: MathSegment[] = [];
  let buf = "";
  let i = 0;

  const flush = () => {
    if (buf) out.push({ type: "text", content: buf, display: false });
    buf = "";
  };

  while (i < src.length) {
    if (src[i] === "\\" && src[i + 1] === "$") {
      buf += "$";
      i += 2;
      continue;
    }

    const delim = DELIMITERS.find((d) => src.startsWith(d.open, i));
    if (delim) {
      const from = i + delim.open.length;
      const close = findClose(src, from, delim.close);
      const body = close === -1 ? "" : src.slice(from, close);
      if (close !== -1 && (delim.allowBlankLine || !BLANK_LINE_RE.test(body))) {
        flush();
        out.push({ type: "math", content: body, display: delim.display });
        i = close + delim.close.length;
        continue;
      }
      // 没闭合（或行内跨了空行）：开分隔符退化成字面文本，整体继续往下扫
      buf += delim.open;
      i += delim.open.length;
      continue;
    }

    buf += src[i];
    i++;
  }

  flush();
  return out;
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
 * 整段正文的解析入口：`delimiters` 决定「哪一段是式子」这件事由谁说了算。
 *
 * - `delimiters: false`（默认）：全串都按数学扫，裸记号也认 —— 组件的存量行为。
 * - `delimiters: true`：只有 `$…$` / `\[…\]` 里的内容按数学扫，**分隔符外一律按纯文本原样输出**。
 *   这才是「认边界」的完整语义：`$` 外的 `{a_n}` 就是三个字面字符，不再被猜成下标。
 *
 * 一条兜底：开了 `delimiters` 但整串一个成对分隔符都没有时，回退到全串按数学扫。
 * 题库往往是半迁移状态（有的题带 `$`、有的不带），没有这条，不带 `$` 的老题会整题不解析、
 * 满屏露出 `\frac`。规则是确定的 —— **有边界信息就用边界，没有才用旧启发式**，不是按内容猜。
 * 同一道题里半带半不带则会露出未包裹的那半，这是有意的：数据不一致要看得见，不该被兜底掩盖。
 */
export function parseMathDocument(
  src: string,
  options: MathParseOptions & { delimiters?: boolean } = {},
): MathNode[] {
  if (!options.delimiters) return parseMath(src, options);
  const segments = splitMathSegments(src);
  if (!segments.some((s) => s.type === "math")) return parseMath(src, options);
  return segments.flatMap((s) =>
    s.type === "math"
      ? parseMath(s.content, options)
      : ([{ kind: "text", text: s.content }] satisfies MathNode[]),
  );
}

/**
 * 转成可搜索/可导出的朴素文本：分数写作 a/b，上下标写作 ^n / _n，填空写作下划线。
 * 检索、导出 Word、纯文本对比都该用它，而不是把带记号的原串直接甩出去。
 *
 * `delimiters` 与组件同名 prop 同义，且**必须跟组件传同一个值**：渲染时按边界解析、
 * 检索时不按，`$` 就会跟着落进索引，用户搜「3/8」反而搜不到 `$\frac{3}{8}$`。
 */
export function mathToPlain(src: string, options: { delimiters?: boolean } = {}): string {
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
  return render(parseMathDocument(src, options));
}
