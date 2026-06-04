import type { ElementType } from "react";
import { cn } from "../lib/cn";
import type { StreamingTextProps } from "./streaming-text.types";

// 流式文本：渲染父级累积的 text（随 token 增长）+ 流式中尾随闪烁光标（hulian-blink，同 TypingAnimation）。
// 与 TypingAnimation 区别：后者自驱定时打一段已知字符串；本件被动渲染外部流入的增量。纯皮肤·RSC。
// markdown 渲染由消费侧外包 <Prose/>；whitespace-pre-wrap 保留换行。
export function StreamingText({
  text,
  streaming,
  as,
  cursor,
  className,
  ...props
}: StreamingTextProps) {
  const Comp = (as ?? "span") as ElementType;
  return (
    <Comp className={cn("whitespace-pre-wrap break-words", className)} {...props}>
      {text}
      {streaming &&
        (cursor ?? (
          <span
            aria-hidden
            className="ml-0.5 inline-block [animation:hulian-blink_1s_step-end_infinite] motion-reduce:[animation:none]"
          >
            |
          </span>
        ))}
    </Comp>
  );
}
