import type { HTMLAttributes } from "react";

export interface ConversationProps extends HTMLAttributes<HTMLDivElement> {
  /** 内容变化时自动滚到底（贴合聊天流 / 流式 token 追加）。@default true */
  autoScroll?: boolean;
  /** 隐藏滚动条（内容仍可滚动，ChatGPT 式沉浸聊天区）。@default false */
  hideScrollbar?: boolean;
}
