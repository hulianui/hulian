// CodeEditor 的编辑引擎：纯函数，无 React / 无 DOM 依赖 → 可单独单测。
//
// 设计核心：每个键盘增强**不直接算出新 value**，而是产出一条 EditorEdit
// ——「把 [rangeStart, rangeEnd) 换成 text，然后把光标放到 selection*」。
// 之所以绕这一圈：组件侧要用 document.execCommand("insertText" | "delete") 落笔，
// 才能让浏览器把这次改动压进 textarea 的**原生 undo 栈**（Cmd+Z 可撤销）。
// 如果直接 setState 覆盖整篇 value，undo 栈会被清空，Cmd+Z 直接失效——
// 这是 textarea 方案最容易做错的一点，故编辑意图与落笔手法在此彻底分离。

export interface EditorState {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface EditorEdit {
  /** 待替换区间起点（组件先 setSelectionRange 到这里再落笔） */
  rangeStart: number;
  /** 待替换区间终点 */
  rangeEnd: number;
  /** 替换成的文本；空串 + 非空区间 = 纯删除 */
  text: string;
  /** 落笔后要恢复的选区起点（整篇绝对下标） */
  selectionStart: number;
  /** 落笔后要恢复的选区终点 */
  selectionEnd: number;
}

export interface EditorLanguageRules {
  /** 一级缩进单位（本组件统一用空格，见 md「禁忌」） */
  indent: string;
  /** 行注释符；null = 该语言没有行注释（如 JSON） */
  lineComment: string | null;
  /** 块注释符对；行注释缺席时按「逐行包裹」降级使用（如 CSS） */
  blockComment: [string, string] | null;
  /** 成对符号：开 → 闭 */
  pairs: Record<string, string>;
  /** 引号类（既是开也是闭，需额外的 type-over 判断） */
  quotes: string[];
}

const JSON_LIKE = new Set(["json", "json5", "jsonc"]);
const CSS_LIKE = new Set(["css", "scss", "less", "postcss"]);
const SHELL_LIKE = new Set(["bash", "sh", "shell", "zsh", "console"]);

const BASE_PAIRS: Record<string, string> = { "{": "}", "[": "]", "(": ")" };

/** 按语言产出编辑规则。未知语言按 JS 家族处理（与 tokenizeCode 的兜底一致）。 */
export function getLanguageRules(lang: string | undefined, indentSize: number): EditorLanguageRules {
  const indent = " ".repeat(Math.max(1, Math.floor(indentSize)));
  const l = (lang ?? "").toLowerCase();
  if (JSON_LIKE.has(l)) {
    // JSON 规范无注释：不提供注释切换（写进去就是非法 JSON），引号只认双引号。
    return { indent, lineComment: null, blockComment: null, pairs: { ...BASE_PAIRS }, quotes: ['"'] };
  }
  if (CSS_LIKE.has(l)) {
    return {
      indent,
      lineComment: null,
      blockComment: ["/*", "*/"],
      pairs: { ...BASE_PAIRS },
      quotes: ['"', "'"],
    };
  }
  if (SHELL_LIKE.has(l)) {
    return {
      indent,
      lineComment: "#",
      blockComment: null,
      pairs: { ...BASE_PAIRS },
      quotes: ['"', "'"],
    };
  }
  return {
    indent,
    lineComment: "//",
    blockComment: ["/*", "*/"],
    pairs: { ...BASE_PAIRS },
    quotes: ['"', "'", "`"],
  };
}

/** 把一条 EditorEdit 套用到状态上（纯计算；组件在 execCommand 缺席时走这条降级路径，测试也用它断言结果）。 */
export function applyEdit(state: EditorState, edit: EditorEdit): EditorState {
  return {
    value: state.value.slice(0, edit.rangeStart) + edit.text + state.value.slice(edit.rangeEnd),
    selectionStart: edit.selectionStart,
    selectionEnd: edit.selectionEnd,
  };
}

/** 下标所在行的行首下标 */
export function lineStartAt(value: string, index: number): number {
  return value.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
}

/** 下标所在行的行尾下标（不含换行符） */
export function lineEndAt(value: string, index: number): number {
  const i = value.indexOf("\n", index);
  return i === -1 ? value.length : i;
}

/** 选区覆盖到的整行区间。选区正好停在下一行行首时不把那一行算进来（与主流编辑器一致）。 */
export function selectedLineBlock(state: EditorState): { start: number; end: number } {
  const { value, selectionStart, selectionEnd } = state;
  let tail = selectionEnd;
  if (selectionEnd > selectionStart && lineStartAt(value, selectionEnd) === selectionEnd) tail -= 1;
  return { start: lineStartAt(value, selectionStart), end: lineEndAt(value, tail) };
}

const WORD_RE = /[\w$]/;
const isWordChar = (ch: string | undefined) => ch != null && WORD_RE.test(ch);

/**
 * Tab：跨行选区 → 逐行加一级缩进；否则在光标处插入缩进（有选区则替换掉）。
 * 空行不加缩进（避免留下一堆尾随空格）。
 */
export function indentEdit(state: EditorState, rules: EditorLanguageRules): EditorEdit {
  const { value, selectionStart, selectionEnd } = state;
  const spansLines = value.slice(selectionStart, selectionEnd).includes("\n");
  if (!spansLines) {
    const caret = selectionStart + rules.indent.length;
    return {
      rangeStart: selectionStart,
      rangeEnd: selectionEnd,
      text: rules.indent,
      selectionStart: caret,
      selectionEnd: caret,
    };
  }
  const { start, end } = selectedLineBlock(state);
  const lines = value.slice(start, end).split("\n");
  let added = 0;
  let firstAdded = 0;
  const next = lines.map((line, i) => {
    if (line.length === 0) return line;
    if (i === 0) firstAdded = rules.indent.length;
    added += rules.indent.length;
    return rules.indent + line;
  });
  // 选区起点正好在行首时不跟着右移，否则第一行会掉出选区（与主流编辑器一致）
  const anchoredAtLineStart = selectionStart === start;
  return {
    rangeStart: start,
    rangeEnd: end,
    text: next.join("\n"),
    selectionStart: anchoredAtLineStart ? start : selectionStart + firstAdded,
    selectionEnd: selectionEnd + added,
  };
}

/** 从一行开头剥掉最多一级缩进，返回剥掉的字符数。 */
function outdentAmount(line: string, indent: string): number {
  if (line.startsWith(indent)) return indent.length;
  if (line.startsWith("\t")) return 1;
  const spaces = /^ */.exec(line)![0].length;
  return Math.min(spaces, indent.length);
}

/** Shift+Tab：对选区覆盖的每一行反缩进（无选区也作用于当前行）。一行都没动 → null。 */
export function outdentEdit(state: EditorState, rules: EditorLanguageRules): EditorEdit | null {
  const { value, selectionStart, selectionEnd } = state;
  const { start, end } = selectedLineBlock(state);
  const lines = value.slice(start, end).split("\n");
  let removed = 0;
  let firstRemoved = 0;
  const next = lines.map((line, i) => {
    const cut = outdentAmount(line, rules.indent);
    if (cut === 0) return line;
    if (i === 0) firstRemoved = cut;
    removed += cut;
    return line.slice(cut);
  });
  if (removed === 0) return null;
  const nextStart = Math.max(start, selectionStart - firstRemoved);
  return {
    rangeStart: start,
    rangeEnd: end,
    text: next.join("\n"),
    selectionStart: nextStart,
    selectionEnd: Math.max(nextStart, selectionEnd - removed),
  };
}

/**
 * Enter：沿用上一行缩进；在 `{` `[` `(` 之后再多缩一级；
 * 若紧跟着就是对应闭合符，把闭合符推到再下一行并回退一级（形成标准的三行块）。
 */
export function newlineEdit(state: EditorState, rules: EditorLanguageRules): EditorEdit {
  const { value, selectionStart, selectionEnd } = state;
  const start = lineStartAt(value, selectionStart);
  const lineIndent = /^[ \t]*/.exec(value.slice(start, lineEndAt(value, selectionStart)))![0];
  // 光标停在缩进中间时只沿用光标之前的那截，避免凭空补出比原行更深的缩进
  const indent = lineIndent.slice(0, Math.max(0, selectionStart - start));
  const before = selectionStart > 0 ? value[selectionStart - 1] : undefined;
  const after = value[selectionEnd];
  const opened = before != null && rules.pairs[before] != null;
  if (opened && after != null && after === rules.pairs[before!]) {
    const inner = indent + rules.indent;
    const caret = selectionStart + 1 + inner.length;
    return {
      rangeStart: selectionStart,
      rangeEnd: selectionEnd,
      text: `\n${inner}\n${indent}`,
      selectionStart: caret,
      selectionEnd: caret,
    };
  }
  const text = opened ? `\n${indent}${rules.indent}` : `\n${indent}`;
  const caret = selectionStart + text.length;
  return {
    rangeStart: selectionStart,
    rangeEnd: selectionEnd,
    text,
    selectionStart: caret,
    selectionEnd: caret,
  };
}

/**
 * 成对符号：
 * - 有选区 → 用符号**包裹**选区（不替换掉选中文本），并保持内部文本仍被选中
 * - 无选区且下一个字符是标识符 → 不自动闭合（`(foo` 后面补 `)` 只会碍事）
 * - 已经贴着一个同款闭合符 → type-over，只挪光标不插字符
 * 返回 null 表示「交给浏览器默认插入」。
 */
export function autoPairEdit(
  state: EditorState,
  ch: string,
  rules: EditorLanguageRules,
): EditorEdit | null {
  const { value, selectionStart, selectionEnd } = state;
  const isQuote = rules.quotes.includes(ch);
  const closer = isQuote ? ch : rules.pairs[ch];
  const isCloser = Object.values(rules.pairs).includes(ch);

  if (selectionStart !== selectionEnd) {
    if (closer == null) return null;
    const inner = value.slice(selectionStart, selectionEnd);
    return {
      rangeStart: selectionStart,
      rangeEnd: selectionEnd,
      text: ch + inner + closer,
      selectionStart: selectionStart + ch.length,
      selectionEnd: selectionStart + ch.length + inner.length,
    };
  }

  const next = value[selectionStart];
  const prev = selectionStart > 0 ? value[selectionStart - 1] : undefined;

  // 贴着同款闭合符 → 直接跨过去（引号与括号同理）
  if (next === ch && (isCloser || isQuote)) {
    return {
      rangeStart: selectionStart,
      rangeEnd: selectionStart,
      text: "",
      selectionStart: selectionStart + 1,
      selectionEnd: selectionStart + 1,
    };
  }
  if (closer == null) return null;
  // 引号紧邻单词（it's / foo"）→ 不闭合，否则撇号会被当成开引号
  if (isQuote && (isWordChar(prev) || isWordChar(next) || prev === ch)) return null;
  if (isWordChar(next)) return null;

  return {
    rangeStart: selectionStart,
    rangeEnd: selectionStart,
    text: ch + closer,
    selectionStart: selectionStart + 1,
    selectionEnd: selectionStart + 1,
  };
}

/** 退格：光标正好夹在一对空括号/空引号中间 → 两个一起删。否则 null（走默认退格）。 */
export function backspacePairEdit(
  state: EditorState,
  rules: EditorLanguageRules,
): EditorEdit | null {
  const { value, selectionStart, selectionEnd } = state;
  if (selectionStart !== selectionEnd || selectionStart === 0) return null;
  const prev = value[selectionStart - 1];
  const next = value[selectionStart];
  const paired = rules.pairs[prev] === next || (rules.quotes.includes(prev) && prev === next);
  if (!paired) return null;
  return {
    rangeStart: selectionStart - 1,
    rangeEnd: selectionStart + 1,
    text: "",
    selectionStart: selectionStart - 1,
    selectionEnd: selectionStart - 1,
  };
}

function commentOneLine(line: string, rules: EditorLanguageRules, column: number): string {
  if (rules.lineComment) return line.slice(0, column) + rules.lineComment + " " + line.slice(column);
  const [open, close] = rules.blockComment!;
  return `${line.slice(0, column)}${open} ${line.slice(column)} ${close}`;
}

function uncommentOneLine(line: string, rules: EditorLanguageRules): string {
  const lead = /^[ \t]*/.exec(line)![0];
  let body = line.slice(lead.length);
  if (rules.lineComment) {
    body = body.slice(rules.lineComment.length);
    if (body.startsWith(" ")) body = body.slice(1);
    return lead + body;
  }
  const [open, close] = rules.blockComment!;
  body = body.slice(open.length, body.length - close.length).trim();
  return lead + body;
}

function isCommented(line: string, rules: EditorLanguageRules): boolean {
  const body = line.trimStart();
  if (rules.lineComment) return body.startsWith(rules.lineComment);
  const [open, close] = rules.blockComment!;
  return body.startsWith(open) && body.trimEnd().endsWith(close) && body.length >= open.length + close.length;
}

/**
 * Cmd/Ctrl + /：按 language 选注释符切换整选区的行注释。
 * 语言没有行注释但有块注释（CSS）→ 降级为逐行 `/* … *\/` 包裹。
 * 语言两者都没有（JSON）→ 返回 null，什么都不做。
 * 判据：选区内**非空行全部已注释**才取消注释，否则一律加注释（与主流编辑器一致）。
 */
export function toggleCommentEdit(
  state: EditorState,
  rules: EditorLanguageRules,
): EditorEdit | null {
  if (!rules.lineComment && !rules.blockComment) return null;
  const { value, selectionStart, selectionEnd } = state;
  const { start, end } = selectedLineBlock(state);
  const lines = value.slice(start, end).split("\n");
  const meaningful = lines.filter((l) => l.trim() !== "");
  if (meaningful.length === 0) return null;

  const removing = meaningful.every((l) => isCommented(l, rules));
  // 加注释时统一对齐到最小缩进列，注释符竖着排齐
  const column = removing
    ? 0
    : Math.min(...meaningful.map((l) => /^[ \t]*/.exec(l)![0].length));

  const caretLineIndex = value.slice(start, selectionStart).split("\n").length - 1;
  let caretDelta = 0;
  const next = lines.map((line, i) => {
    if (line.trim() === "") return line;
    const out = removing ? uncommentOneLine(line, rules) : commentOneLine(line, rules, column);
    if (i === caretLineIndex) caretDelta = out.length - line.length;
    return out;
  });
  const text = next.join("\n");

  if (selectionStart === selectionEnd) {
    const caret = Math.max(start, Math.min(start + text.length, selectionStart + caretDelta));
    return { rangeStart: start, rangeEnd: end, text, selectionStart: caret, selectionEnd: caret };
  }
  // 有选区时整块重选，避免逐行增删长度后端点漂到奇怪的位置
  return {
    rangeStart: start,
    rangeEnd: end,
    text,
    selectionStart: start,
    selectionEnd: start + text.length,
  };
}
