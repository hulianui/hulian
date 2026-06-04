"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Conversation, Message, MessageStatus } from "../../_data/types";

// 客服会话实时引擎：纯 reducer（可测）+ 定时器 hook（进线 / 客户输入 / 已读回执）。
// 全部前端 mock，无后端。Math.random 仅用于进线/输入的随机节奏。

export interface LiveState {
  conversations: Conversation[];
  activeId: string | null;
  typing: Record<string, boolean>; // convId -> 客户是否正在输入
}

export type LiveAction =
  | { type: "SELECT"; id: string }
  | { type: "SEND"; convId: string; msgId: string; text: string; at: string }
  | { type: "RECEIPT"; convId: string; msgId: string; status: MessageStatus }
  | { type: "DELIVER_QUEUED"; convId: string }
  | { type: "INCOMING"; convId: string }
  | { type: "SET_TYPING"; convId: string; value: boolean };

export function createInitialState(seed: Conversation[]): LiveState {
  // 深拷贝，避免 reducer 不可变更新时改到模块级 mock 数据
  return {
    conversations: seed.map((c) => ({
      ...c,
      messages: c.messages.map((m) => ({ ...m })),
      queued: c.queued.map((m) => ({ ...m })),
    })),
    activeId: null,
    typing: {},
  };
}

/** 把某会话的首条 queued 消息搬进 messages；非 active 时未读 +1。返回新 conversation（队列空则原样返回）。 */
function deliverOne(conv: Conversation, isActive: boolean): Conversation {
  if (conv.queued.length === 0) return conv;
  const [next, ...rest] = conv.queued;
  return {
    ...conv,
    messages: [...conv.messages, { ...next }],
    queued: rest,
    lastAt: next.at,
    unread: isActive ? conv.unread : conv.unread + 1,
  };
}

const mapConv = (
  state: LiveState,
  convId: string,
  fn: (c: Conversation) => Conversation,
): Conversation[] => state.conversations.map((c) => (c.id === convId ? fn(c) : c));

export function reducer(state: LiveState, action: LiveAction): LiveState {
  switch (action.type) {
    case "SELECT":
      return {
        ...state,
        activeId: action.id,
        conversations: mapConv(state, action.id, (c) => ({ ...c, unread: 0 })),
      };

    case "SEND": {
      const msg: Message = { id: action.msgId, author: "agent", text: action.text, at: action.at, status: "sending" };
      return {
        ...state,
        conversations: mapConv(state, action.convId, (c) => ({
          ...c,
          messages: [...c.messages, msg],
          lastAt: action.at,
          unread: 0,
          status: c.status === "closed" ? c.status : "active",
        })),
      };
    }

    case "RECEIPT":
      return {
        ...state,
        conversations: mapConv(state, action.convId, (c) => ({
          ...c,
          messages: c.messages.map((m) => (m.id === action.msgId ? { ...m, status: action.status } : m)),
        })),
      };

    case "DELIVER_QUEUED":
      return {
        ...state,
        conversations: mapConv(state, action.convId, (c) => deliverOne(c, state.activeId === action.convId)),
      };

    case "INCOMING": {
      const updated = mapConv(state, action.convId, (c) => deliverOne(c, state.activeId === action.convId));
      // 移到列表首位（坐席视线焦点）
      const target = updated.find((c) => c.id === action.convId);
      if (!target) return { ...state, conversations: updated };
      return {
        ...state,
        conversations: [target, ...updated.filter((c) => c.id !== action.convId)],
      };
    }

    case "SET_TYPING":
      return { ...state, typing: { ...state.typing, [action.convId]: action.value } };

    default:
      return state;
  }
}

function nowHHmm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 坐席会话工作台的实时数据源。 */
export function useLiveConversations(seed: Conversation[]) {
  const [state, dispatch] = useReducer(reducer, seed, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // 首次默认选中第一个会话
  useEffect(() => {
    const first = stateRef.current.conversations[0];
    if (first) dispatch({ type: "SELECT", id: first.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 进线：每 ~12s 把一个仍有排队消息的「待接入」会话推到顶部并投递一条
  useEffect(() => {
    const timer = setInterval(() => {
      const { conversations, activeId } = stateRef.current;
      const candidates = conversations.filter(
        (c) => c.status === "waiting" && c.queued.length > 0 && c.id !== activeId,
      );
      if (candidates.length === 0) return;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      dispatch({ type: "INCOMING", convId: pick.id });
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // 当前会话：客户偶发「正在输入」后落一条新消息（队列耗尽即停；conversations 变更自驱动下一轮）
  useEffect(() => {
    const { activeId, conversations } = state;
    if (!activeId) return;
    const conv = conversations.find((c) => c.id === activeId);
    if (!conv || conv.queued.length === 0) return;

    const typingDelay = 2200 + Math.random() * 2600;
    const deliverDelay = typingDelay + 1300 + Math.random() * 1600;
    const t1 = setTimeout(() => dispatch({ type: "SET_TYPING", convId: activeId, value: true }), typingDelay);
    const t2 = setTimeout(() => {
      dispatch({ type: "SET_TYPING", convId: activeId, value: false });
      dispatch({ type: "DELIVER_QUEUED", convId: activeId });
    }, deliverDelay);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [state]);

  const select = useCallback((id: string) => dispatch({ type: "SELECT", id }), []);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    const activeId = stateRef.current.activeId;
    if (!trimmed || !activeId) return;
    const msgId = `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    dispatch({ type: "SEND", convId: activeId, msgId, text: trimmed, at: nowHHmm() });
    setTimeout(() => dispatch({ type: "RECEIPT", convId: activeId, msgId, status: "sent" }), 500);
    setTimeout(() => dispatch({ type: "RECEIPT", convId: activeId, msgId, status: "read" }), 1700);
  }, []);

  const active = state.activeId
    ? (state.conversations.find((c) => c.id === state.activeId) ?? null)
    : null;

  return {
    conversations: state.conversations,
    active,
    activeId: state.activeId,
    typing: state.activeId ? !!state.typing[state.activeId] : false,
    select,
    send,
  };
}
