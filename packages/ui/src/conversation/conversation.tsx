"use client";
import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";
import type { ConversationProps } from "./conversation.types";

// 消息流容器：纵向堆叠 ChatMessage + 内容增长自动贴底（新消息 / 流式 token 追加时滚到底）。
// 无依赖布局滚动；消费者给定高度（如 h-[60vh]）即获得独立滚动区。
export function Conversation({
  autoScroll = true,
  hideScrollbar = false,
  className,
  children,
  ...props
}: ConversationProps) {
  const ref = useRef<HTMLDivElement>(null);
  // 每次渲染后贴底：children 变化（新消息 / 流式增量）即触发
  useEffect(() => {
    if (!autoScroll) return;
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  });
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-5 overflow-y-auto",
        hideScrollbar && "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
