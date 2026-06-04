"use client";
import { useMemo, useState, type KeyboardEvent } from "react";
import { Avatar, Badge, List, ListItem, ListItemMeta, Segmented } from "@hulian/ui";
import type { Conversation } from "../../_data/types";
import { customerById } from "../../_data/customers";

const STATUS_DOT: Record<Conversation["status"], string> = {
  waiting: "bg-warning",
  active: "bg-success",
  closed: "bg-muted",
};
const STATUS_LABEL: Record<Conversation["status"], string> = {
  waiting: "待接入",
  active: "进行中",
  closed: "已结束",
};

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  typingId: string | null; // 正在输入的会话（仅 active 会话）
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, activeId, typingId, onSelect }: Props) {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () => ({
      all: conversations.length,
      waiting: conversations.filter((c) => c.status === "waiting").length,
      active: conversations.filter((c) => c.status === "active").length,
    }),
    [conversations],
  );

  const visible = conversations.filter((c) =>
    filter === "all" ? true : filter === "waiting" ? c.status === "waiting" : c.status === "active",
  );

  const activate = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border bg-surface">
      <div className="shrink-0 border-b border-border p-3">
        <Segmented
          size="sm"
          aria-label="会话筛选"
          value={filter}
          onValueChange={setFilter}
          className="w-full"
          items={[
            { value: "all", label: `全部 ${counts.all}` },
            { value: "waiting", label: `待接入 ${counts.waiting}` },
            { value: "active", label: `进行中 ${counts.active}` },
          ]}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <List<Conversation>
          items={visible}
          empty={<div className="p-6 text-center text-sm text-muted">该分类暂无会话</div>}
          renderItem={(conv) => {
            const cust = customerById(conv.customerId);
            const last = conv.messages[conv.messages.length - 1];
            const isActive = conv.id === activeId;
            const isTyping = typingId === conv.id;
            const preview = isTyping
              ? "正在输入…"
              : last?.author === "agent"
                ? `我: ${last.text}`
                : (last?.text ?? "");
            return (
              <ListItem
                key={conv.id}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                onClick={() => onSelect(conv.id)}
                onKeyDown={(e) => activate(e, conv.id)}
                className={`cursor-pointer transition-colors outline-none hover:bg-surface-hover focus-visible:bg-surface-hover ${
                  isActive ? "bg-primary/8" : ""
                }`}
              >
                <ListItemMeta
                  avatar={
                    <span className="relative inline-flex">
                      <Avatar src={cust?.avatar} fallback={cust?.name.slice(0, 1) ?? "?"} />
                      <span
                        className={`absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-surface ${STATUS_DOT[conv.status]}`}
                        aria-label={STATUS_LABEL[conv.status]}
                      />
                    </span>
                  }
                  title={
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{cust?.name ?? "访客"}</span>
                      <span className="shrink-0 text-[11px] font-normal text-muted">{conv.lastAt}</span>
                    </span>
                  }
                  description={
                    <span className="flex flex-col gap-0.5">
                      <span className={`truncate ${isTyping ? "text-primary" : "text-muted"}`}>{preview}</span>
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] text-muted">
                          {conv.channel} · {conv.subject}
                        </span>
                        {conv.unread > 0 && (
                          <Badge
                            tone="danger"
                            size="sm"
                            className="grid h-4 min-w-4 shrink-0 place-items-center rounded-full px-1 text-[10px] leading-none"
                          >
                            {conv.unread}
                          </Badge>
                        )}
                      </span>
                    </span>
                  }
                />
              </ListItem>
            );
          }}
        />
      </div>
    </div>
  );
}
