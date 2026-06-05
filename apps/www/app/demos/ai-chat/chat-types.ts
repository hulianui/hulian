// 对话状态机：消费 ChatEvent 流，累积成可渲染的消息列表。纯函数 reducer，便于推理与测试。
import type { ChatEvent } from "@hulianui/mocks";

export type TurnPhase = "waiting" | "thinking" | "tool" | "streaming" | "done";

export interface ToolInvocation {
  id: string;
  name: string;
  input: string;
  output?: string;
  status: "running" | "success";
}
export interface CitationItem {
  index: number;
  title: string;
  source: string;
  href: string;
}
export interface UserMessage {
  id: string;
  role: "user";
  text: string;
}
export interface AssistantMessage {
  id: string;
  role: "assistant";
  phase: TurnPhase;
  thinking: string;
  thinkingDone: boolean;
  duration?: number;
  tools: ToolInvocation[];
  text: string;
  citations: CitationItem[];
}
export type ChatMsg = UserMessage | AssistantMessage;

export type ChatAction =
  | { kind: "user_send"; id: string; text: string }
  | { kind: "assistant_start"; id: string }
  | { kind: "event"; id: string; event: ChatEvent }
  | { kind: "aborted"; id: string }
  | { kind: "reset" };

export function emptyAssistant(id: string): AssistantMessage {
  return {
    id,
    role: "assistant",
    phase: "waiting",
    thinking: "",
    thinkingDone: false,
    tools: [],
    text: "",
    citations: [],
  };
}

export function chatReducer(state: ChatMsg[], action: ChatAction): ChatMsg[] {
  switch (action.kind) {
    case "reset":
      return [];
    case "user_send":
      return [...state, { id: action.id, role: "user", text: action.text }];
    case "assistant_start":
      return [...state, emptyAssistant(action.id)];
    case "aborted":
      return state.map((m) =>
        m.id === action.id && m.role === "assistant" ? { ...m, phase: "done" } : m,
      );
    case "event":
      return state.map((m) => {
        if (m.id !== action.id || m.role !== "assistant") return m;
        return applyEvent(m, action.event);
      });
    default:
      return state;
  }
}

function applyEvent(m: AssistantMessage, e: ChatEvent): AssistantMessage {
  switch (e.type) {
    case "thinking_delta":
      return { ...m, phase: "thinking", thinking: m.thinking + e.text };
    case "thinking_done":
      return { ...m, thinkingDone: true, duration: e.duration };
    case "tool":
      return {
        ...m,
        phase: "tool",
        tools: [...m.tools, { id: e.id, name: e.name, input: e.input, status: "running" }],
      };
    case "tool_result":
      return {
        ...m,
        tools: m.tools.map((t) =>
          t.id === e.id ? { ...t, output: e.output, status: "success" } : t,
        ),
      };
    case "text_delta":
      return { ...m, phase: "streaming", text: m.text + e.text };
    case "citation":
      return {
        ...m,
        citations: [
          ...m.citations,
          { index: e.index, title: e.title, source: e.source, href: e.href },
        ],
      };
    case "done":
      return { ...m, phase: "done" };
    default:
      return m;
  }
}
