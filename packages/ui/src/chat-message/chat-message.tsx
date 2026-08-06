"use client";

import { memo } from "react";
import { cn } from "../lib/cn";
import { Avatar } from "../avatar";
import { TypingDots } from "../typing-dots";
import { Check, CheckCheck, Loader2 } from "../_icons";
import type { ChatMessageProps, ChatRole } from "./chat-message.types";

import { useComponentLocale } from "../config/locale-context";

// 对话气泡：复用 Avatar(头像) + TypingDots(加载态)。纯皮肤·RSC（无 hook）。
// 正文 children 不强制 Prose——markdown 由消费侧外包 <Prose/>，纯文本直接传。
// 已读回执（仅右气泡）：发送中转圈 / 已送达单勾 / 已读双蓝勾。
function Receipt({
  status,
  labels,
}: {
  status: NonNullable<ChatMessageProps["status"]>;
  labels: { sending: string; sent: string; read: string };
}) {
  if (status === "sending") {
    return <Loader2 aria-label={labels.sending} className="size-3.5 animate-spin text-muted" />;
  }
  if (status === "sent") {
    return <Check aria-label={labels.sent} className="size-3.5 text-muted" />;
  }
  return <CheckCheck aria-label={labels.read} className="size-3.5 text-primary" />;
}

function ChatMessageImpl({
  role,
  avatar,
  name,
  timestamp,
  loading,
  actions,
  status,
  className,
  children,
  ...props
}: ChatMessageProps) {
  const copy = useComponentLocale().chatMessage ?? {
    me: "我",
    sending: "发送中",
    sent: "已送达",
    read: "已读",
  };
  const fallbackByRole: Record<ChatRole, string> = { user: copy.me, assistant: "AI", system: "⚙" };
  // system 消息：居中弱化通告，不进气泡/头像体系
  if (role === "system") {
    return (
      <div
        className={cn("mx-auto max-w-prose text-center text-xs text-muted", className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse", className)} {...props}>
      <div className="shrink-0">{avatar ?? <Avatar fallback={fallbackByRole[role]} />}</div>
      <div className={cn("flex min-w-0 flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {(name || timestamp) && (
          <div className="flex items-center gap-2 text-xs text-muted">
            {name && <span className="font-medium text-foreground">{name}</span>}
            {timestamp && <span>{timestamp}</span>}
          </div>
        )}
        <div
          className={cn(
            // prose 上限同时受可用宽度约束：窄屏（移动端）气泡不得溢出消息列
            "w-fit max-w-[min(65ch,100%)] rounded-[var(--radius)] px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-surface text-foreground",
          )}
        >
          {loading ? <TypingDots /> : children}
        </div>
        {isUser && status && (
          <div className="px-0.5 leading-none">
            <Receipt status={status} labels={copy} />
          </div>
        )}
        {actions && <div className="px-0.5">{actions}</div>}
      </div>
    </div>
  );
}
ChatMessageImpl.displayName = "ChatMessage";

// 会话流是「已定稿的历史消息 + 一条正在流式输出的尾消息」，尾消息每个 token 都让整列表重渲染；
// 历史消息的 props 是稳定原语（role/name/timestamp/纯文本 children）时 React 无法自己 bailout，
// 只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const ChatMessage = memo(ChatMessageImpl);
ChatMessage.displayName = "ChatMessage";
