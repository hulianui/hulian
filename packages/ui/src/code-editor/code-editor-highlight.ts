// CodeEditor 的着色适配层：纯函数，无 React 依赖 → 可单独单测。
//
// JS 家族 / JSON / Shell 直接复用 code-block 的零依赖着色器 tokenizeCode（不重造轮子，
// 也不修改那个共享文件）。CSS 是 tokenizeCode 不认的语言（非 Shell 一律按 JS 处理，
// 结果是选择器和属性名全成 plain），所以在本目录内补一个 CSS 扫描器，
// 沿用同一套 CodeTokenType 词汇表 → 复用 code-block 既有的 --code-* 配色，明暗自动跟随。

import { tokenizeCode, type CodeToken, type CodeTokenType } from "../code-block/code-highlight";

export type { CodeToken, CodeTokenType };

const CSS_LANGS = new Set(["css", "scss", "less", "postcss"]);

const CSS_COMMENT_RE = /^\/\*[\s\S]*?(?:\*\/|$)/;
const CSS_STRING_RE = /^("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)/;
const CSS_AT_RE = /^@[\w-]+/;
const CSS_HEX_RE = /^#[0-9a-fA-F]{3,8}\b/;
const CSS_NUM_RE = /^-?(?:\d+\.?\d*|\.\d+)(?:[a-zA-Z%]{0,4})/;
const CSS_IDENT_RE = /^-{0,2}[A-Za-z_][\w-]*/;
const CSS_WS_RE = /^\s+/;

/**
 * CSS 近似着色：带状态的逐段扫描（不是 CSS 解析器）。
 * 状态三个维度——是否在声明块内、块内是否已越过 `:`、以及块的嵌套栈：
 *   块外 → 选择器 / @规则；块内冒号前 → 属性名(attr)；冒号后 → 值（数字/颜色/字符串着色，其余 plain）。
 * 因此 `a:hover` 这类块外伪类不会被误判成属性名。
 * `@media` / `@supports` / `@layer` 等条件组规则的 `{}` 里装的仍是**规则**而不是声明，
 * 所以用一个栈记住每层块的性质：条件组内部回到选择器语境（否则 `@media { .panel { … } }`
 * 里的 `.panel` 会被当成属性名着色）。
 */
export function tokenizeCss(code: string): CodeToken[] {
  const out: CodeToken[] = [];
  const stack: boolean[] = []; // 每层记「进入这层前是否处于声明块」
  let i = 0;
  let inBlock = false;
  let inValue = false;
  let atGroupPending = false; // 刚读到 @规则、还没遇到 { 或 ;
  const push = (type: CodeTokenType, value: string) => {
    out.push({ type, value });
    i += value.length;
  };

  while (i < code.length) {
    const rest = code.slice(i);

    const ws = CSS_WS_RE.exec(rest);
    if (ws) {
      push("plain", ws[0]);
      continue;
    }
    const comment = CSS_COMMENT_RE.exec(rest);
    if (comment) {
      push("comment", comment[0]);
      continue;
    }
    const str = CSS_STRING_RE.exec(rest);
    if (str && str[0].length > 0) {
      push("string", str[0]);
      continue;
    }
    const ch = rest[0];
    if (ch === "{") {
      stack.push(inBlock);
      // 条件组规则（@media 等）的花括号里仍是规则 → 保持选择器语境
      inBlock = !atGroupPending;
      atGroupPending = false;
      inValue = false;
      push("plain", ch);
      continue;
    }
    if (ch === "}") {
      inBlock = stack.pop() ?? false;
      inValue = false;
      push("plain", ch);
      continue;
    }
    if (ch === ";") {
      inValue = false;
      atGroupPending = false;
      push("plain", ch);
      continue;
    }
    if (ch === ":" && inBlock) {
      inValue = true;
      push("plain", ch);
      continue;
    }
    if (ch === "!") {
      // !important
      const bang = /^![\w-]*/.exec(rest)![0];
      push("keyword", bang);
      continue;
    }
    const at = CSS_AT_RE.exec(rest);
    if (at) {
      // @import / @charset 之类以 ; 收尾的不开块，靠上面的 ";" 分支清掉这个标记
      atGroupPending = true;
      push("keyword", at[0]);
      continue;
    }
    const hex = CSS_HEX_RE.exec(rest);
    if (hex) {
      push("number", hex[0]);
      continue;
    }
    const num = CSS_NUM_RE.exec(rest);
    if (num && /^-?[\d.]/.test(num[0])) {
      push("number", num[0]);
      continue;
    }
    const ident = CSS_IDENT_RE.exec(rest);
    if (ident) {
      if (inBlock && !inValue) push("attr", ident[0]);
      else if (!inBlock) push("tag", ident[0]);
      else push("plain", ident[0]);
      continue;
    }
    // 单个标点（. # , > ( ) 等）：块外并入选择器色，块内保持 plain
    push(!inBlock && (ch === "." || ch === "#") ? "tag" : "plain", ch);
  }
  return out;
}

/** 按 language 选着色器：CSS 走本目录扫描器，其余交给 code-block 的 tokenizeCode。 */
export function tokenizeEditorCode(code: string, lang?: string): CodeToken[] {
  if (lang && CSS_LANGS.has(lang.toLowerCase())) return tokenizeCss(code);
  return tokenizeCode(code, lang);
}

/**
 * 把 token 流按换行切成「每行一个 token 数组」。
 * 高亮层必须逐行渲染成块级元素——当前行底色、行号对齐都依赖「一行一个盒子」，
 * 而着色器产出的 token（尤其块注释、模板串）会横跨多行，所以要在这里再切一刀。
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
