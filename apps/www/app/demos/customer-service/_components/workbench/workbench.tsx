"use client";
import { useState } from "react";
import { Alert, toast } from "@hulian/ui";
import { conversations as seed } from "../../_data/conversations";
import { customerById } from "../../_data/customers";
import { liveStats } from "../../_data/metrics";
import { useLiveConversations } from "./use-live-conversations";
import { ConversationList } from "./conversation-list";
import { ChatThread } from "./chat-thread";
import { CustomerPanel } from "./customer-panel";

// 三栏会话工作台：左=会话列表 / 中=对话流 / 右=客户档案。
// 数据与实时节奏由 useLiveConversations 统一驱动。
export function Workbench() {
  const { conversations, active, activeId, typing, select, send } = useLiveConversations(seed);
  const customer = active ? customerById(active.customerId) : undefined;

  // 进线高峰告警：排队数 ≥ 3 时展示
  const [peakAlertDismissed, setPeakAlertDismissed] = useState(false);
  const showPeakAlert = !peakAlertDismissed && liveStats.waiting >= 3;

  const handleTransfer = (convId: string) => {
    toast({ title: "已转接", description: `会话 ${convId} 已转交其他坐席处理`, tone: "info" });
  };

  const handleCloseConv = (convId: string) => {
    toast({ title: "会话已关闭", description: `会话 ${convId} 已结束并归档`, tone: "info" });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 进线高峰告警条 */}
      {showPeakAlert && (
        <Alert
          tone="warning"
          title={`当前排队 ${liveStats.waiting} 人`}
          className="shrink-0 rounded-none border-x-0 border-t-0"
          onClose={() => setPeakAlertDismissed(true)}
        >
          进线高峰，请加快处理速度或呼叫备班坐席上线。
        </Alert>
      )}
      <div className="grid min-h-0 flex-1 grid-cols-[clamp(240px,22vw,300px)_1fr_clamp(280px,24vw,340px)]">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          typingId={typing ? activeId : null}
          onSelect={select}
        />
        <ChatThread
          conversation={active}
          customer={customer}
          typing={typing}
          onSend={send}
          onTransfer={handleTransfer}
          onClose={handleCloseConv}
        />
        <CustomerPanel customer={customer} />
      </div>
    </div>
  );
}
