import { cn } from "../lib/cn";
import { segmentMentions } from "./mentions.logic";

export interface MentionTextProps {
  /** 含 @提及 的纯文本。 */
  text: string;
  /** 触发符（与输入端口径一致），默认 "@"。 */
  prefix?: string;
  /** 透传到每个提及 chip 的额外类。 */
  markClassName?: string;
}

// 把含 @提及 的纯文本渲染为「普通文本 + 彩色 mention chip」（与 Mentions 输入端同口径解析）。
// 无 hook / 无状态 → 可在 RSC 中直接用（如 Comment 正文）。与输入端不同：此处是静态展示，
// chip 自带轻微横向内边距更像标签（输入端背板因需与 textarea 字符对齐故不能加 padding）。
export function MentionText({ text, prefix = "@", markClassName }: MentionTextProps) {
  const segments = segmentMentions(text, prefix);
  return (
    <>
      {segments.map((seg, i) =>
        seg.mention ? (
          <mark
            key={i}
            className={cn(
              "rounded-[0.25rem] bg-primary/12 px-0.5 font-medium text-primary",
              markClassName,
            )}
          >
            {seg.text}
          </mark>
        ) : (
          seg.text
        ),
      )}
    </>
  );
}
