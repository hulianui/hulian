"use client";
import { copy } from "./chat-thread.content";
import { channelLabel } from "../../_data/labels";

import { useState } from "react";
import { Phone, MoreHorizontal, UserPlus, X } from "lucide-react";
import {
  Avatar,
  Button,
  ChatMessage,
  Conversation,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  ListSkeleton,
  Popconfirm,
  PromptInput,
  PromptSuggestions,
  Tag,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
} from "@hulianui/ui";
import type { Conversation as Conv, Customer, Message } from "../../_data/types";
import { quickReplies } from "../../_data/labels";

const STATUS_TAG: Record<Conv["status"], { tone: "success" | "warning" | "neutral"; label: string }> = {
  active: { tone: "success", label: copy("inProgress") },
  waiting: { tone: "warning", label: copy("waitingForAccess") },
  closed: { tone: "neutral", label: copy("ended") },
};

const LEVEL_TONE: Record<string, "neutral" | "brand" | "warning" | "success"> = {
  普通: "neutral",
  银卡: "brand",
  金卡: "warning",
  黑卡: "success",
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
  onTransfer?: (convId: string) => void;
  onClose?: (convId: string) => void;
}

// 会话加载中占位
function ChatLoadingSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
        <ListSkeleton rows={1} />
      </header>
      <div className="min-h-0 flex-1 px-5 py-4">
        <ListSkeleton rows={4} />
      </div>
    </div>
  );
}

export function ChatThread({ conversation, customer, typing, onSend, onTransfer, onClose }: Props) {
  const [historyLoading] = useState(false); // 切换会话时短暂 loading 占位（模拟加载历史）

  if (!conversation) {
    return (
      <div className="grid h-full place-items-center bg-bg text-sm text-muted-foreground">{copy("selectTheSessionOnTheLeftTo")}</div>
    );
  }

  if (historyLoading) {
    return <ChatLoadingSkeleton />;
  }

  const statusTag = STATUS_TAG[conversation.status];
  const disabled = conversation.status === "closed";

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      {/* 顶部：客户名 + 状态 + 操作 */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar fallback={customer?.name.slice(0, 1) ?? "?"} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {/* 客户名 → HoverCard 资料卡预览 */}
              <HoverCard>
                <HoverCardTrigger
                  render={
                    <span className="cursor-pointer truncate text-sm font-semibold hover:text-primary hover:underline">
                      {customer?.name ?? copy("visitor")}
                    </span>
                  }
                />
                <HoverCardContent>
                  {customer ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar fallback={customer.name.slice(0, 1)} size="sm" />
                        <div>
                          <div className="text-sm font-semibold">{customer.name}</div>
                          <Tag tone={LEVEL_TONE[customer.level] ?? "neutral"} size="sm" variant="soft">
                            {customer.level}
                          </Tag>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{copy("mobile")}{customer.phone}</span>
                        <span>{copy("region")}{customer.region}</span>
                        <span>{copy("register")}{customer.since}</span>
                        <span>{copy("order")}{customer.orders}{copy("pen")}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.map((t) => (
                          <Tag key={t} tone="neutral" size="sm" variant="outline">
                            {t}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">{copy("visitorNoProfileYet")}</span>
                  )}
                </HoverCardContent>
              </HoverCard>
              <Tag tone={statusTag.tone} size="sm" dot pulse={conversation.status === "active"}>
                {statusTag.label}
              </Tag>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {channelLabel[conversation.channel]} · {conversation.subject}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {/* 转接：Popconfirm 二次确认 */}
          {!disabled && (
            <Popconfirm
              title={copy("confirmToTransferThisConversation")}
              description={copy("theSessionWillBeHandedOverTo")}
              okText={copy("transfer")}
              onConfirm={() => onTransfer?.(conversation.id)}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="sm" aria-label={copy("transfer2")} className="size-9 px-0">
                      <UserPlus className="size-[18px]" />
                    </Button>
                  }
                />
                <TooltipContent>{copy("transferSession")}</TooltipContent>
              </Tooltip>
            </Popconfirm>
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={copy("call")}
                  className="size-9 px-0"
                  onClick={() => toast({ title: copy("callFunction"), description: copy("theDemoEnvironmentDoesNotCurrentlySupport"), tone: "neutral" })}
                >
                  <Phone className="size-[18px]" />
                </Button>
              }
            />
            <TooltipContent>{copy("callCustomer")}</TooltipContent>
          </Tooltip>
          {/* 关闭会话：Popconfirm 二次确认 */}
          {!disabled && (
            <Popconfirm
              title={copy("areYouSureYouWantToClose")}
              description={copy("afterClosingTheConversationEntersTheEnded")}
              danger
              okText={copy("close")}
              onConfirm={() => onClose?.(conversation.id)}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="sm" aria-label={copy("closeSession")} className="size-9 px-0">
                      <X className="size-[18px]" />
                    </Button>
                  }
                />
                <TooltipContent>{copy("closeSession2")}</TooltipContent>
              </Tooltip>
            </Popconfirm>
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="sm" aria-label={copy("more")} className="size-9 px-0">
                  <MoreHorizontal className="size-[18px]" />
                </Button>
              }
            />
            <TooltipContent>{copy("moreActions")}</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* 对话流 */}
      <Conversation className="min-h-0 flex-1 px-5 py-4">
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
                  <Avatar fallback={customer?.name.slice(0, 1) ?? "?"} size="sm" />
                ) : (
                  <Avatar fallback={copy("lian")} size="sm" />
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
            avatar={<Avatar fallback={customer?.name.slice(0, 1) ?? "?"} size="sm" />}
            loading
          >{copy("entering")}</ChatMessage>
        )}
      </Conversation>

      {/* 底部：快捷回复 + 输入 */}
      <div className="shrink-0 border-t border-border bg-surface px-5 py-3">
        {!disabled && (
          <PromptSuggestions
            className="mb-2"
            suggestions={quickReplies}
            onSelect={(v) => onSend(v)}
          />
        )}
        <PromptInput
          placeholder={disabled ? copy("sessionEnded") : copy("enterTheReplyAndPressEnterTo")}
          disabled={disabled}
          onSubmit={(v) => onSend(v)}
        />
      </div>
    </div>
  );
}
