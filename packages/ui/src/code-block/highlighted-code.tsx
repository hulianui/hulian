import type { CSSProperties } from "react";
import { tokenizeCode, type CodeTokenType } from "./code-highlight";

// 各 token 类型的着色（吃 --code-* 语义 token → 明暗主题自动跟随）。plain 不着色。
const TOKEN_STYLE: Partial<Record<CodeTokenType, CSSProperties>> = {
  comment: { color: "var(--code-comment)", fontStyle: "italic" },
  string: { color: "var(--code-string)" },
  keyword: { color: "var(--code-keyword)" },
  number: { color: "var(--code-number)" },
  tag: { color: "var(--code-tag)" },
  attr: { color: "var(--code-attr)" },
};

// 把代码文本切分着色，逐段套 <span>（纯文本段直接返回，避免无谓节点）。
// 无 hook / 无状态 → 既能被 client 组件用，也不阻碍 SSR。
export function HighlightedCode({ code, lang }: { code: string; lang?: string }) {
  return (
    <>
      {tokenizeCode(code, lang).map((t, i) =>
        t.type === "plain" ? (
          t.value
        ) : (
          <span key={i} style={TOKEN_STYLE[t.type]}>
            {t.value}
          </span>
        ),
      )}
    </>
  );
}
