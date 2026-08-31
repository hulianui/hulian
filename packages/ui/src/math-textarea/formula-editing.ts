/**
 * 公式输入的编辑期纯函数：模板插入的落点、光标上下文、提交前的语法自检。
 *
 * 边界：**不排版、不解析**。排版是 `Formula`（KaTeX），分隔符切段的权威口径是
 * `splitMathSegments`。这里只回答三个编辑器的问题：「插进去之后光标落哪」「光标现在
 * 在不在公式里」「这串还没闭合的地方在哪」。不引 KaTeX，服务端脚本也能单独引。
 *
 * 一切插入都产出 `$…$` / `$$…$$`，与库内既有写法一致，不引入新的公式表示。
 *
 * 不产出任何语言的文案：问题以 code + 位置返回，由组件按 Locale 拼句。
 */

/** 一个可点击的公式模板。
 *
 * `latex` 里的**第一个空花括号 / 空方括号**是光标落点；有选中文本时，选中的内容会被放进
 * 那一对括号里，光标再跳到下一对空括号（没有就落在整段之后）。「选中 x 点分式」得到
 * `\frac{x}{}` 且光标在分母，这是老师真正想要的动作。
 */
export interface FormulaTemplate {
  /** 稳定标识。内置模板的显示名从 Locale 的 `templates[id]` 取。 */
  id: string;
  latex: string;
  /** 面板上的示例渲染（`$` 包好，直接喂 Formula）。 */
  sample: string;
  /** 显示名。不给则查 Locale（内置模板），再查不到就显示 id。自定义模板直接给。 */
  label?: string;
}

export interface FormulaTemplateGroup {
  id: string;
  /** 分组标题。不给则查 Locale 的 `templateGroups[id]`。 */
  title?: string;
  items: readonly FormulaTemplate[];
}

/** 默认模板：上下标、分式、根式、括号、绝对值、集合、不等号、希腊字母、求和/积分。
 *  `as const` 让 id 成为字面量类型，Locale 的两张名字表据此钉死：加模板不加词条 tsc 当场红。 */
export const FORMULA_TEMPLATE_GROUPS = [
  {
    id: "scripts",
    items: [
      { id: "superscript", latex: "{}^{}", sample: "$x^{2}$" },
      { id: "subscript", latex: "{}_{}", sample: "$a_{n}$" },
      { id: "fraction", latex: "\\frac{}{}", sample: "$\\frac{a}{b}$" },
      { id: "sqrt", latex: "\\sqrt{}", sample: "$\\sqrt{x}$" },
      { id: "nthRoot", latex: "\\sqrt[]{}", sample: "$\\sqrt[3]{x}$" },
    ],
  },
  {
    id: "brackets",
    items: [
      { id: "parentheses", latex: "\\left( \\right)", sample: "$\\left( x \\right)$" },
      { id: "absolute", latex: "\\left| \\right|", sample: "$\\left| x \\right|$" },
      { id: "set", latex: "\\{  \\}", sample: "$\\{ 1, 2, 3 \\}$" },
    ],
  },
  {
    id: "relations",
    items: [
      { id: "leq", latex: "\\leq ", sample: "$a \\leq b$" },
      { id: "geq", latex: "\\geq ", sample: "$a \\geq b$" },
      { id: "neq", latex: "\\neq ", sample: "$a \\neq b$" },
      { id: "approx", latex: "\\approx ", sample: "$a \\approx b$" },
      { id: "in", latex: "\\in ", sample: "$x \\in A$" },
      { id: "subseteq", latex: "\\subseteq ", sample: "$A \\subseteq B$" },
      { id: "cup", latex: "\\cup ", sample: "$A \\cup B$" },
      { id: "cap", latex: "\\cap ", sample: "$A \\cap B$" },
    ],
  },
  {
    id: "greek",
    items: [
      { id: "alpha", latex: "\\alpha ", sample: "$\\alpha$" },
      { id: "beta", latex: "\\beta ", sample: "$\\beta$" },
      { id: "theta", latex: "\\theta ", sample: "$\\theta$" },
      { id: "pi", latex: "\\pi ", sample: "$\\pi$" },
      { id: "delta", latex: "\\Delta ", sample: "$\\Delta$" },
      { id: "degree", latex: "^{\\circ}", sample: "$60^{\\circ}$" },
    ],
  },
  {
    id: "calculus",
    items: [
      { id: "sum", latex: "\\sum_{}^{}", sample: "$\\sum_{i=1}^{n} i$" },
      { id: "integral", latex: "\\int_{}^{}", sample: "$\\int_{a}^{b} f(x)\\,dx$" },
      { id: "limit", latex: "\\lim_{}", sample: "$\\lim_{x \\to 0} f(x)$" },
    ],
  },
] as const satisfies readonly FormulaTemplateGroup[];

export type BuiltinTemplateGroupId = (typeof FORMULA_TEMPLATE_GROUPS)[number]["id"];
export type BuiltinTemplateId = (typeof FORMULA_TEMPLATE_GROUPS)[number]["items"][number]["id"];

/** 一段闭合的 `$…$` / `$$…$$` 在整串里的位置。`end` 是闭合符之后的下标（半开区间）。 */
export interface MathSpan {
  start: number;
  end: number;
  /** 公式正文的起点（开分隔符之后）。KaTeX 报的 position 加上它就是整串里的位置。 */
  contentStart: number;
  content: string;
  display: boolean;
}

interface MathScan {
  spans: MathSpan[];
  /** 第一个没闭合的开分隔符位置；全部闭合则为 null。 */
  openAt: number | null;
}

/** 与 `splitMathSegments` 保持一致的两条规则：`\$`（以及任何 `\x`）整体跳过不参与配对；`$$` 优先于 `$`。
 *  只认 `$` 系：编辑器产出永远是 `$` 系，`\(` / `\[` 不在这里处理。 */
function scanMath(text: string): MathScan {
  const spans: MathSpan[] = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === "\\") {
      i += 2;
      continue;
    }
    if (text[i] !== "$") {
      i += 1;
      continue;
    }
    const fence = text[i + 1] === "$" ? "$$" : "$";
    const contentStart = i + fence.length;
    let j = contentStart;
    let close = -1;
    while (j < text.length) {
      if (text[j] === "\\") {
        j += 2;
        continue;
      }
      if (text.startsWith(fence, j)) {
        close = j;
        break;
      }
      j += 1;
    }
    if (close === -1) return { spans, openAt: i };
    spans.push({
      start: i,
      end: close + fence.length,
      contentStart,
      content: text.slice(contentStart, close),
      display: fence === "$$",
    });
    i = close + fence.length;
  }
  return { spans, openAt: null };
}

/** 整串里每个闭合的公式段。给 `katexErrorAt` 这类「要知道第 N 个字符落在哪一段」的调用方。 */
export function mathSpans(text: string): MathSpan[] {
  return scanMath(text).spans;
}

/**
 * 光标此刻在不在公式内部。只用来决定「插进去的片段要不要自己带一对 `$`」，不是渲染口径。
 *
 * 落在开分隔符之后、闭合符之前（含紧贴闭合符）算在里面；落在未闭合的 `$` 之后一律算在里面。
 */
export function isInsideMath(text: string, caret: number): boolean {
  const at = Math.max(0, Math.min(caret, text.length));
  const { spans, openAt } = scanMath(text);
  if (spans.some((s) => at > s.start && at <= s.end - (s.display ? 2 : 1))) return true;
  return openAt !== null && at > openAt;
}

export interface TemplateInsertion {
  text: string;
  /** 插入后光标应落的位置。 */
  caret: number;
}

/** 空花括号 / 空方括号（模板里的落点标记）。`\{` 是集合的花括号，不是落点。 */
const EMPTY_SLOT_RE = /(?<!\\)\{\}|(?<!\\)\[\]/u;

function clampRange(text: string, selectionStart: number, selectionEnd: number) {
  const start = Math.max(0, Math.min(selectionStart, text.length));
  const end = Math.max(start, Math.min(selectionEnd, text.length));
  return { start, end };
}

/**
 * 把一个模板插到输入框里，并算出光标该落哪。纯函数，与 DOM 无关。
 *
 * `wrapInMath` 由调用方按 `isInsideMath` 决定：已经在公式里就不能再套一层 `$`
 * （套出来的 `$x$$y$` 会把中间那段变成正文）。
 */
export function applyFormulaTemplate(params: {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  latex: string;
  wrapInMath: boolean;
}): TemplateInsertion {
  const { text, latex, wrapInMath } = params;
  const { start, end } = clampRange(text, params.selectionStart, params.selectionEnd);
  const selected = text.slice(start, end);

  let snippet = latex;
  let caretInSnippet: number;

  const firstSlot = EMPTY_SLOT_RE.exec(snippet);
  if (firstSlot === null) {
    // 没有落点的模板（`\leq ` 这类符号）：选中的内容原样留在前面，光标落在符号之后。
    snippet = selected + snippet;
    caretInSnippet = snippet.length;
  } else if (selected === "") {
    caretInSnippet = firstSlot.index + 1;
  } else {
    // 有选中：选中的内容进第一个空槽，光标跳到下一个空槽（没有就落在末尾）。
    snippet =
      snippet.slice(0, firstSlot.index + 1) +
      selected +
      snippet.slice(firstSlot.index + firstSlot[0].length - 1);
    const afterFilled = firstSlot.index + selected.length + 2;
    const nextSlot = EMPTY_SLOT_RE.exec(snippet.slice(afterFilled));
    caretInSnippet = nextSlot === null ? snippet.length : afterFilled + nextSlot.index + 1;
  }

  if (wrapInMath) {
    snippet = `$${snippet}$`;
    caretInSnippet += 1;
  }

  return {
    text: text.slice(0, start) + snippet + text.slice(end),
    caret: start + caretInSnippet,
  };
}

/** 用行内 / 块级公式把选中的内容框起来（没选中就插一对空的，光标落中间）。 */
export function wrapSelectionInMath(params: {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  display: boolean;
}): TemplateInsertion {
  const { text, display } = params;
  const { start, end } = clampRange(text, params.selectionStart, params.selectionEnd);
  const fence = display ? "$$" : "$";
  const selected = text.slice(start, end);
  return {
    text: `${text.slice(0, start)}${fence}${selected}${fence}${text.slice(end)}`,
    caret: start + fence.length + selected.length,
  };
}

export type FormulaSyntaxCode = "unclosed-math" | "unclosed-brace" | "unmatched-close-brace";

/** 提交前自检发现的问题。`index` 是整串下标，`line` / `column` 从 1 数。文案由组件按 Locale 拼。 */
export interface FormulaSyntaxIssue {
  code: FormulaSyntaxCode;
  index: number;
  line: number;
  column: number;
}

/** 「第 N 行第 M 个字符」：只报位置，不截原文（题干可能很长，截出来反而看不懂）。 */
export function textPosition(text: string, index: number): { line: number; column: number } {
  const before = text.slice(0, index);
  return { line: before.split("\n").length, column: index - before.lastIndexOf("\n") };
}

function issueAt(code: FormulaSyntaxCode, text: string, index: number): FormulaSyntaxIssue {
  return { code, index, ...textPosition(text, index) };
}

/**
 * 提交前的语法自检。返回 `null` = 没发现问题。
 *
 * **刻意只查两件能确定说错的事**：分隔符不闭合、花括号不配对。这两条的判据是形式的，
 * 不会误伤；「这个命令拼错了没有」要靠 KaTeX 才知道，那件事由 `katexErrorAt` 承担。
 */
export function validateFormulaSyntax(text: string): FormulaSyntaxIssue | null {
  const stack: number[] = [];
  let openAt: number | null = null;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      // 转义序列整体跳过：`\$` `\{` `\}` `\\` 都不参与配对。
      i += 2;
      continue;
    }
    if (ch === "$") {
      openAt = openAt === null ? i : null;
      i += text[i + 1] === "$" ? 2 : 1;
      continue;
    }
    if (ch === "{") stack.push(i);
    if (ch === "}") {
      if (stack.length === 0) return issueAt("unmatched-close-brace", text, i);
      stack.pop();
    }
    i += 1;
  }
  if (openAt !== null) return issueAt("unclosed-math", text, openAt);
  const lastOpen = stack[stack.length - 1];
  if (lastOpen !== undefined) return issueAt("unclosed-brace", text, lastOpen);
  return null;
}
