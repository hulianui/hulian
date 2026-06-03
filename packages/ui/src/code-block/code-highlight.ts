// 零依赖语法着色器：单条多分支正则左→右扫描，按优先级吞 token，token 间补 plain。
// 因 comment/string 分支在前并整段吞掉，故字符串里的关键字/数字不会被二次着色（标准 mini-highlighter 技法）。
// 覆盖 JS 家族（js/jsx/ts/tsx/json）与 Shell；非这两类语言按 JS 家族处理（多数片段是 JS/JSX）。
// 纯函数无 React 依赖 → 可单测；产出 token 列表交由组件套 <span>（避免 dangerouslySetInnerHTML 转义风险）。

export type CodeTokenType =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "tag"
  | "attr";

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

const SH_KEYWORDS = [
  "if", "then", "else", "elif", "fi", "for", "in", "do", "done", "while",
  "case", "esac", "function", "return", "export", "local", "cd", "echo",
  "exit", "source", "set", "sudo",
];

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

const SH_RE = new RegExp(
  [
    /(?<comment>#[^\n]*)/.source,
    /(?<string>"(?:[^"\\]|\\.)*"|'[^']*')/.source,
    `(?<keyword>\\b(?:${SH_KEYWORDS.join("|")})\\b)`,
    /(?<number>\b\d+\b)/.source,
  ].join("|"),
  "g",
);

const SHELL_LANGS = new Set(["bash", "sh", "shell", "zsh", "console"]);

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

export function tokenizeCode(code: string, lang?: string): CodeToken[] {
  const re = lang && SHELL_LANGS.has(lang.toLowerCase()) ? SH_RE : JS_RE;
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
