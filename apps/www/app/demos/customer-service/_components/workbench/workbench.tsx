"use client";
import { conversations as seed } from "../../_data/conversations";
import { customerById } from "../../_data/customers";
import { useLiveConversations } from "./use-live-conversations";
import { ConversationList } from "./conversation-list";
import { ChatThread } from "./chat-thread";
import { CustomerPanel } from "./customer-panel";

// 三栏会话工作台：左=会话列表 / 中=对话流 / 右=客户档案。
// 数据与实时节奏由 useLiveConversations 统一驱动。
export function Workbench() {
  const { conversations, active, activeId, typing, select, send } = useLiveConversations(seed);
  const customer = active ? customerById(active.customerId) : undefined;

  return (
    <div className="grid h-full min-h-0 grid-cols-[clamp(240px,22vw,300px)_1fr_clamp(280px,24vw,340px)]">
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        typingId={typing ? activeId : null}
        onSelect={select}
      />
      <ChatThread conversation={active} customer={customer} typing={typing} onSend={send} />
      <CustomerPanel customer={customer} />
    </div>
  );
}
