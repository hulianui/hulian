import { cn } from "../lib/cn";
import { Avatar } from "../avatar";
import { TypingDots } from "../typing-dots";
import type { ChatMessageProps, ChatRole } from "./chat-message.types";

// 对话气泡：复用 Avatar(头像) + TypingDots(加载态)。纯皮肤·RSC（无 hook）。
// 正文 children 不强制 Prose——markdown 由消费侧外包 <Prose/>，纯文本直接传。
const fallbackByRole: Record<ChatRole, string> = {
  user: "我",
  assistant: "AI",
  system: "⚙",
};

export function ChatMessage({
  role,
  avatar,
  name,
  timestamp,
  loading,
  actions,
  className,
  children,
  ...props
}: ChatMessageProps) {
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
            "w-fit max-w-prose rounded-[var(--radius)] px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-surface text-foreground",
          )}
        >
          {loading ? <TypingDots /> : children}
        </div>
        {actions && <div className="px-0.5">{actions}</div>}
      </div>
    </div>
  );
}
