import type { ReactNode } from "react";

export interface TerminalLine {
  /** 行文本。 */
  text: ReactNode;
  /** 行首提示符（如 "$"、">"；缺省无）。 */
  prompt?: string;
  /** 该行语气：command(前景) / muted(次要输出)。 */
  tone?: "command" | "muted" | "success";
}

export interface TerminalProps {
  lines: TerminalLine[];
  /** 相邻行揭示间隔(s)。 */
  lineDelay?: number;
  /** 标题栏文字。 */
  title?: string;
  /** 命令行/输出行语法着色（命令名/--flag/URL/数字/引号串走 --code-* token）。默认 true；
   *  仅对 text 为字符串的 command/muted 行生效，success 等整行 tone 色不拆。 */
  highlight?: boolean;
  className?: string;
}
