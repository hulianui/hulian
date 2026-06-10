import { cn } from "../lib/cn";
import { Avatar } from "../avatar";
import { TypingDots } from "../typing-dots";
import { Check, CheckCheck, Loader2 } from "../_icons";
import type { ChatMessageProps, ChatRole } from "./chat-message.types";

// 对话气泡：复用 Avatar(头像) + TypingDots(加载态)。纯皮肤·RSC（无 hook）。
// 正文 children 不强制 Prose——markdown 由消费侧外包 <Prose/>，纯文本直接传。
const fallbackByRole: Record<ChatRole, string> = {
  user: "我",
  assistant: "AI",
  system: "⚙",
};

// 已读回执（仅右气泡）：发送中转圈 / 已送达单勾 / 已读双蓝勾。
function Receipt({ status }: { status: NonNullable<ChatMessageProps["status"]> }) {
  if (status === "sending") {
    return <Loader2 aria-label="发送中" className="size-3.5 animate-spin text-muted" />;
  }
  if (status === "sent") {
    return <Check aria-label="已送达" className="size-3.5 text-muted" />;
  }
  return <CheckCheck aria-label="已读" className="size-3.5 text-primary" />;
}

export function ChatMessage({
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
            <Receipt status={status} />
          </div>
        )}
        {actions && <div className="px-0.5">{actions}</div>}
      </div>
    </div>
  );
}
