// 终端专用零依赖着色器（不复用 code-block 的 JS/Shell 着色，那套不认命令名/URL/flag）。
// 终端真正该高亮的元素：引号串、URL、--flag、数字。命令名（行首词）由组件单独着色。
// 纯函数无 React 依赖 → 可单测；token 间补 plain，套 <span> 由组件负责（避开 innerHTML 转义风险）。

export type TermTokenType = "plain" | "string" | "url" | "flag" | "number";

export interface TermToken {
  type: TermTokenType;
  value: string;
}

// 分支顺序即优先级：string > url > flag > number。url 整段吞，故 URL 内的数字不会二次着色。
const TERM_RE = new RegExp(
  [
    /(?<string>"(?:[^"\\\n]|\\.)*"|'[^'\n]*')/.source,
    /(?<url>https?:\/\/[^\s]+)/.source,
    // flag：前导空白后的 -x / --xxx（定长 lookbehind，避开把命令名当 flag）
    /(?<flag>(?<=\s)--?[A-Za-z][\w-]*)/.source,
    /(?<number>\b\d[\d.]*\b)/.source,
  ].join("|"),
  "g",
);

function pick(groups: Record<string, string | undefined> | undefined): TermTokenType {
  if (!groups) return "plain";
  if (groups.string != null) return "string";
  if (groups.url != null) return "url";
  if (groups.flag != null) return "flag";
  if (groups.number != null) return "number";
  return "plain";
}

export function tokenizeTerminal(text: string): TermToken[] {
  TERM_RE.lastIndex = 0;
  const out: TermToken[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = TERM_RE.exec(text)) !== null) {
    if (m[0].length === 0) {
      TERM_RE.lastIndex++; // 防零宽死循环
      continue;
    }
    if (m.index > last) out.push({ type: "plain", value: text.slice(last, m.index) });
    out.push({ type: pick(m.groups), value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "plain", value: text.slice(last) });
  return out;
}
