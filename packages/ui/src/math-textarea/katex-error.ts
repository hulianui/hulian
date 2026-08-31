import katex from "katex";
import { blanksToLatex } from "../math/math";
import { mathSpans } from "./formula-editing";

/** KaTeX 解析不了的那一处。`index` 是整串 0 基下标，`message` 是 KaTeX 的原始错误信息。 */
export interface KatexParseIssue {
  index: number;
  message: string;
}

// `__parse` 是 KaTeX 的公开-但-未声明类型的入口（katex.d.ts 没有它，运行时一直有）。
// 只解析不排版，比 renderToString 便宜，且 throwOnError 默认 true 才拿得到 ParseError.position。
interface KatexParseSettings {
  macros?: Record<string, string>;
  strict?: "ignore" | "warn" | "error";
}
const parseOnly = (
  katex as unknown as { __parse: (tex: string, settings?: KatexParseSettings) => unknown }
).__parse;

interface KatexParseError {
  position?: number;
  rawMessage?: string;
  message?: string;
}

/**
 * 找出整串里第一处 KaTeX 解析不了的位置。`Formula` 用 `throwOnError:false` 把坏公式标红显示，
 * 但老师对着一行红色源码找不到错在哪；这里把 KaTeX 的 position 换算回整串下标，配上原始信息。
 *
 * - 只查闭合的 `$…$` / `$$…$$` 段（`mathSpans`）；未闭合由 `validateFormulaSyntax` 负责。
 * - 段内填空槽 `___` 先过与 `Formula` 同一条 `blanksToLatex`，否则合法题面会被误报。
 *   替换会改变长度，落在填空槽之后的位置会有几个字符的偏差，只影响提示不影响判定。
 * - `strict:"ignore"` 与 `Formula` 一致：数学模式里的中文不该刷 console.warn。
 * - `macros` 浅拷贝：KaTeX 把它当可变宏表写回（与 renderMath 同一个坑）。
 */
export function katexErrorAt(
  text: string,
  options: { macros?: Record<string, string> } = {},
): KatexParseIssue | null {
  for (const span of mathSpans(text)) {
    try {
      parseOnly(blanksToLatex(span.content, 2.5), {
        strict: "ignore",
        macros: options.macros ? { ...options.macros } : undefined,
      });
    } catch (error) {
      const e = error as KatexParseError;
      const offset = typeof e.position === "number" ? e.position : 0;
      return {
        index: span.contentStart + offset,
        message: e.rawMessage ?? e.message ?? String(error),
      };
    }
  }
  return null;
}
