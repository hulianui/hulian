"use client";
import { Phone, MoreHorizontal, UserPlus } from "lucide-react";
import {
  Avatar,
  Button,
  ChatMessage,
  Conversation,
  PromptInput,
  PromptSuggestions,
  Tag,
} from "@hulian/ui";
import type { Conversation as Conv, Customer, Message } from "../../_data/types";
import { QUICK_REPLIES } from "../../_data/types";

const STATUS_TAG: Record<Conv["status"], { tone: "success" | "warning" | "neutral"; label: string }> = {
  active: { tone: "success", label: "进行中" },
  waiting: { tone: "warning", label: "待接入" },
  closed: { tone: "neutral", label: "已结束" },
};

// 客户消息 → 左/surface（assistant）；坐席 → 右/primary（user）；系统 → 居中。
function roleOf(author: Message["author"]): "user" | "assistant" | "system" {
  if (author === "agent") return "user";
  if (author === "system") return "system";
  return "assistant";
}

interface Props {
  conversation: Conv | null;
  customer?: Customer;
  typing: boolean;
  onSend: (text: string) => void;
}

export function ChatThread({ conversation, customer, typing, onSend }: Props) {
  if (!conversation) {
    return (
      <div className="grid h-full place-items-center bg-bg text-sm text-muted">选择左侧会话开始接待</div>
    );
  }

  const statusTag = STATUS_TAG[conversation.status];
  const disabled = conversation.status === "closed";

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      {/* 顶部：客户名 + 状态 + 操作 */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={customer?.avatar} fallback={customer?.name.slice(0, 1) ?? "?"} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold">{customer?.name ?? "访客"}</span>
              <Tag tone={statusTag.tone} size="sm" dot pulse={conversation.status === "active"}>
                {statusTag.label}
              </Tag>
            </div>
            <div className="truncate text-xs text-muted">
              {conversation.channel} · {conversation.subject}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" aria-label="转接" className="size-9 px-0">
            <UserPlus className="size-[18px]" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="呼叫" className="size-9 px-0">
            <Phone className="size-[18px]" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="更多" className="size-9 px-0">
            <MoreHorizontal className="size-[18px]" />
          </Button>
        </div>
      </header>

      {/* 对话流 */}
      <Conversation className="min-h-0 flex-1 px-5 py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {conversation.messages.map((m) => {
            const role = roleOf(m.author);
            if (role === "system") {
              return (
                <ChatMessage key={m.id} role="system">
                  {m.text}
                </ChatMessage>
              );
            }
            return (
              <ChatMessage
                key={m.id}
                role={role}
                timestamp={m.at}
                status={role === "user" ? m.status : undefined}
                avatar={
                  role === "assistant" ? (
                    <Avatar src={customer?.avatar} fallback={customer?.name.slice(0, 1) ?? "?"} size="sm" />
                  ) : (
                    <Avatar src="https://i.pravatar.cc/80?img=15" fallback="琏" size="sm" />
                  )
                }
              >
                {m.text}
              </ChatMessage>
            );
          })}
          {typing && (
            <ChatMessage
              role="assistant"
              avatar={<Avatar src={customer?.avatar} fallback={customer?.name.slice(0, 1) ?? "?"} size="sm" />}
              loading
            >
              正在输入
            </ChatMessage>
          )}
        </div>
      </Conversation>

      {/* 底部：快捷回复 + 输入 */}
      <div className="shrink-0 border-t border-border bg-surface px-5 py-3">
        {!disabled && (
          <PromptSuggestions
            className="mb-2"
            suggestions={QUICK_REPLIES}
            onSelect={(v) => onSend(v)}
          />
        )}
        <PromptInput
          placeholder={disabled ? "会话已结束" : "输入回复，回车发送…"}
          disabled={disabled}
          onSubmit={(v) => onSend(v)}
        />
      </div>
    </div>
  );
}
