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
  // 是否处于「贴底」状态：用户停在底部附近时为 true，向上翻阅历史后为 false。
  // 初始 true —— 首屏与新消息默认贴底。
  const stickRef = useRef(true);

  // 监听滚动，记录用户意图：只要离底部超过阈值即视为「主动上滚」，停止自动贴底。
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      // distanceFromBottom 容差 8px：抵消子像素/惯性滚动误差，避免误判为上滚。
      const distanceFromBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
      stickRef.current = distanceFromBottom <= 8;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // 每次渲染后按需贴底：仅当用户仍停在底部（未主动上滚）才追底，
  // 否则任意父级 re-render 都不会把正在翻阅历史的用户拽回底部。
  useEffect(() => {
    if (!autoScroll) return;
    if (!stickRef.current) return;
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
