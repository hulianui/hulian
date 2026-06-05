"use client";
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
import { QUICK_REPLIES } from "../../_data/types";

const STATUS_TAG: Record<Conv["status"], { tone: "success" | "warning" | "neutral"; label: string }> = {
  active: { tone: "success", label: "进行中" },
  waiting: { tone: "warning", label: "待接入" },
  closed: { tone: "neutral", label: "已结束" },
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
      <div className="grid h-full place-items-center bg-bg text-sm text-muted">选择左侧会话开始接待</div>
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
                      {customer?.name ?? "访客"}
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
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
                        <span>手机：{customer.phone}</span>
                        <span>地区：{customer.region}</span>
                        <span>注册：{customer.since}</span>
                        <span>订单：{customer.orders} 笔</span>
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
                    <span className="text-sm text-muted">访客，暂无档案</span>
                  )}
                </HoverCardContent>
              </HoverCard>
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
          {/* 转接：Popconfirm 二次确认 */}
          {!disabled && (
            <Popconfirm
              title="确认转接此会话？"
              description="会话将移交给其他在线坐席，请确认后操作。"
              okText="转接"
              onConfirm={() => onTransfer?.(conversation.id)}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="sm" aria-label="转接" className="size-9 px-0">
                      <UserPlus className="size-[18px]" />
                    </Button>
                  }
                />
                <TooltipContent>转接会话</TooltipContent>
              </Tooltip>
            </Popconfirm>
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="呼叫"
                  className="size-9 px-0"
                  onClick={() => toast({ title: "呼叫功能", description: "demo 环境暂不支持实际通话", tone: "neutral" })}
                >
                  <Phone className="size-[18px]" />
                </Button>
              }
            />
            <TooltipContent>呼叫客户</TooltipContent>
          </Tooltip>
          {/* 关闭会话：Popconfirm 二次确认 */}
          {!disabled && (
            <Popconfirm
              title="确认关闭此会话？"
              description="关闭后对话进入已结束状态，客户将无法继续发送消息。"
              danger
              okText="关闭"
              onConfirm={() => onClose?.(conversation.id)}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="sm" aria-label="关闭会话" className="size-9 px-0">
                      <X className="size-[18px]" />
                    </Button>
                  }
                />
                <TooltipContent>关闭会话</TooltipContent>
              </Tooltip>
            </Popconfirm>
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="sm" aria-label="更多" className="size-9 px-0">
                  <MoreHorizontal className="size-[18px]" />
                </Button>
              }
            />
            <TooltipContent>更多操作</TooltipContent>
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
                  <Avatar fallback="琏" size="sm" />
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
          >
            正在输入
          </ChatMessage>
        )}
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
