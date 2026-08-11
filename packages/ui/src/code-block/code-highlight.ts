// 零依赖语法着色器：单条多分支正则左→右扫描，按优先级吞 token，token 间补 plain。
// 因 comment/string 分支在前并整段吞掉，故字符串里的关键字/数字不会被二次着色（标准 mini-highlighter 技法）。
// 覆盖 JS 家族（js/jsx/ts/tsx/json）、Shell 与 Python；不在这三类里的语言按 JS 家族处理
// （多数片段是 JS/JSX）——注意那是「近似」而不是「支持」：`#` 注释族（yaml/toml/ini/dockerfile）
// 与 SQL 的 `--` 注释都不认，注释正文会被当代码再扫一遍。CSS 另有 code-editor/tokenizeCss。
// 纯函数无 React 依赖 → 可单测；产出 token 列表交由组件套 <span>（避免 dangerouslySetInnerHTML 转义风险）。

export type CodeTokenType =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "tag"
  | "attr"
  | "command"
  | "flag";

export interface CodeToken {
  type: CodeTokenType;
  value: string;
}

const JS_KEYWORDS = [
  "import", "export", "from", "default", "const", "let", "var", "function",
  "return", "if", "else", "for", "while", "do", "switch", "case", "break",
  "continue", "new", "class", "extends", "implements", "async", "await", "try",
  "catch", "finally", "throw", "typeof", "instanceof", "in", "of", "void",
  "delete", "yield", "this", "super", "null", "true", "false", "undefined",
  "interface", "type", "enum", "public", "private", "protected", "static",
  "readonly", "abstract", "as", "is", "namespace", "declare", "satisfies",
  "keyof", "infer",
];

// Shell 控制字（着 keyword 色）。注意「命令名」走专门的 command 着色（见 tokenizeShell），
// 这里只列真正的语法控制字（流程/声明），不含 ls/cd/echo 等普通命令——后者按命令位推断。
const SH_KEYWORDS = new Set([
  "if", "then", "else", "elif", "fi", "for", "in", "do", "done", "while", "until",
  "case", "esac", "function", "return", "export", "local", "declare", "readonly",
  "set", "unset", "alias", "source",
]);

// 出现在命令前、自身不占命令槽的前缀词：其后仍期待一个命令（sudo npm … 里 npm 才是命令）。
const SH_CMD_PREFIX = new Set([
  "sudo", "env", "time", "command", "exec", "nohup", "xargs", "builtin",
  "then", "do", "else", "elif",
]);

// 分支顺序即优先级：comment > string > tag > attr > keyword > number。
const JS_RE = new RegExp(
  [
    /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)/.source,
    /(?<string>"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)/.source,
    /(?<tag><\/?[A-Za-z][\w.-]*)/.source,
    // 属性名：标识符紧跟 =（无空格）→ 命中 JSX 属性 zoom=/src=，避开带空格的赋值 x = 1
    /(?<attr>[A-Za-z_$][\w$]*(?==))/.source,
    `(?<keyword>\\b(?:${JS_KEYWORDS.join("|")})\\b)`,
    /(?<number>\b(?:0[xXbBoO][0-9a-fA-F]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b)/.source,
  ].join("|"),
  "g",
);

// Python 关键字（含 True/False/None 这三个字面量常量——高亮惯例里它们与关键字同档）。
// 刻意不收 match / case：它们是软关键字，当变量名用是合法且常见的，收进来就是新的误着色。
const PY_KEYWORDS = [
  "False", "None", "True", "and", "as", "assert", "async", "await", "break",
  "class", "continue", "def", "del", "elif", "else", "except", "finally",
  "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal",
  "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
];

// 常用内置名：不是关键字，但读代码时和关键字一样是「语言给的」。借 tag 档与 keyword 区分开。
const PY_BUILTINS = [
  "print", "input", "int", "str", "float", "list", "dict", "set", "tuple",
  "len", "range", "open", "enumerate", "zip", "sorted", "sum", "min", "max",
  "abs", "type", "isinstance",
];

// 分支顺序即优先级：comment > string > decorator(attr) > keyword > builtin(tag) > number。
// 字符串分支的要点：
//   1. 三引号必须排在单引号前，否则 `"""x"""` 会被拆成 `""` + `x` + `""`（issue #167）；
//   2. 前缀 f/r/b/u（及 rb/fr 组合、大小写任意）要吞进 string token 里，否则 f 掉在外面变 plain；
//      前缀整组可选并自带 (?<![\w"'])，这样 `printf"x"` 的 f 不算前缀，而裸引号仍能从 `"` 起匹配
//      （把 lookbehind 写在整条 string 分支最前面会连裸引号一起否掉）；
//   3. 未闭合的三引号用 `$` 兜底整段吞掉，避免把后半个文件当代码扫。
// f-string 内的 `{expr}` 不再拆开着色——保持整段 string 与「字符串里不二次着色」的既有取舍一致。
const PY_RE = new RegExp(
  [
    /(?<comment>#[^\n]*)/.source,
    /(?<string>(?:(?<![\w"'])[rRbBuUfF]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'))/
      .source,
    /(?<attr>@[A-Za-z_]\w*(?:\.\w+)*)/.source,
    `(?<keyword>\\b(?:${PY_KEYWORDS.join("|")})\\b)`,
    `(?<tag>\\b(?:${PY_BUILTINS.join("|")})\\b)`,
    // 0b/0o/0x、下划线分隔、指数、虚数后缀 j
    /(?<number>\b(?:0[bB][01_]+|0[oO][0-7_]+|0[xX][0-9a-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?[jJ]?)\b)/
      .source,
  ].join("|"),
  "g",
);

const SHELL_LANGS = new Set(["bash", "sh", "shell", "zsh", "console"]);
const PYTHON_LANGS = new Set(["py", "python", "python3"]);

function pick(groups: Record<string, string | undefined> | undefined): CodeTokenType {
  if (!groups) return "plain";
  if (groups.comment != null) return "comment";
  if (groups.string != null) return "string";
  if (groups.tag != null) return "tag";
  if (groups.attr != null) return "attr";
  if (groups.keyword != null) return "keyword";
  if (groups.number != null) return "number";
  return "plain";
}

function tokenizeWithRegex(code: string, re: RegExp): CodeToken[] {
  re.lastIndex = 0;
  const out: CodeToken[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m[0].length === 0) {
      re.lastIndex++; // 防零宽匹配死循环
      continue;
    }
    if (m.index > last) out.push({ type: "plain", value: code.slice(last, m.index) });
    out.push({ type: pick(m.groups), value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push({ type: "plain", value: code.slice(last) });
  return out;
}

// Shell 走逐 token 扫描而非单条正则：命令着色依赖「命令位」状态（行首 / 管道·列表操作符后），
// 单条无状态正则无法表达。每轮按 空白 > 注释 > 字符串 > 操作符 > 提示符 > flag > 词 取一段。
const SH_STRING_RE = /^("(?:[^"\\]|\\.)*"|'[^']*')/;
const SH_OP_RE = /^(\|\||&&|>>|<<|[|;&<>])/; // 管道 / 逻辑 / 重定向 → 之后回到命令位
const SH_FLAG_RE = /^-{1,2}[A-Za-z][\w-]*/; // -x / --filter
const SH_WORD_RE = /^[^\s|;&<>]+/; // 一段词（含 @scope/pkg、路径、=赋值等）

function tokenizeShell(code: string): CodeToken[] {
  const out: CodeToken[] = [];
  let i = 0;
  let expectCmd = true; // 当前是否处于「命令位」（行首或管道/列表操作符之后）
  while (i < code.length) {
    const rest = code.slice(i);
    const take = (type: CodeTokenType, value: string) => {
      out.push({ type, value });
      i += value.length;
    };

    const ws = /^[ \t\r\n]+/.exec(rest);
    if (ws) {
      if (ws[0].includes("\n")) expectCmd = true; // 换行回到命令位
      take("plain", ws[0]);
      continue;
    }
    if (rest[0] === "#") {
      const nl = rest.indexOf("\n");
      take("comment", nl === -1 ? rest : rest.slice(0, nl));
      continue;
    }
    const str = SH_STRING_RE.exec(rest);
    if (str) {
      take("string", str[0]);
      expectCmd = false;
      continue;
    }
    const op = SH_OP_RE.exec(rest);
    if (op) {
      take("plain", op[0]);
      expectCmd = true;
      continue;
    }
    // 提示符 `$ ` 仅作装饰，不占命令位（CodeBlock 里可能直接写在命令前）。
    if (rest[0] === "$" && /^\$\s/.test(rest)) {
      take("plain", "$");
      continue;
    }
    const flag = SH_FLAG_RE.exec(rest);
    if (flag) {
      take("flag", flag[0]);
      continue;
    }
    const w = SH_WORD_RE.exec(rest)![0];
    if (/^\d+$/.test(w)) {
      take("number", w);
      expectCmd = false;
    } else if (expectCmd) {
      take(SH_KEYWORDS.has(w) ? "keyword" : "command", w);
      expectCmd = SH_CMD_PREFIX.has(w); // sudo/env 等前缀词后仍期待命令
    } else {
      take(SH_KEYWORDS.has(w) ? "keyword" : "plain", w);
    }
  }
  return out;
}

export function tokenizeCode(code: string, lang?: string): CodeToken[] {
  const key = lang?.toLowerCase();
  if (key && SHELL_LANGS.has(key)) return tokenizeShell(code);
  if (key && PYTHON_LANGS.has(key)) return tokenizeWithRegex(code, PY_RE);
  return tokenizeWithRegex(code, JS_RE);
}

/**
 * 把 token 流按换行切成「每行一个 token 数组」。
 * 行号、当前行底色这类逐行渲染都依赖「一行一个盒子」，而着色器产出的 token
 * （块注释、模板串、三引号文档串）会横跨多行，所以要在这里再切一刀。
 * 保证：返回的行数恒等于 code.split("\n").length（空行返回空数组），行内不含 "\n"。
 */
export function splitTokensByLine(tokens: CodeToken[]): CodeToken[][] {
  const lines: CodeToken[][] = [[]];
  for (const token of tokens) {
    const parts = token.value.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part.length > 0) lines[lines.length - 1].push({ type: token.type, value: part });
    });
  }
  return lines;
}
