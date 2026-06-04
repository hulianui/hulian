"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ChatMessage } from "./chat-message";

export const chatMessageShowcase: ShowcaseSpec = {
  controls: [
    { prop: "role", type: "select", options: ["user", "assistant", "system"], defaultValue: "assistant" },
    { prop: "children", type: "text", defaultValue: "你好，我能帮你做什么？", label: "正文" },
    { prop: "loading", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "user",
      render: () => (
        <ChatMessage role="user" name="我" timestamp="刚刚">
          帮我把首页重写成 100% dogfood
        </ChatMessage>
      ),
    },
    {
      name: "assistant",
      render: () => (
        <ChatMessage role="assistant" name="瑚琏 AI">
          好的，我先看下现有结构再动手。
        </ChatMessage>
      ),
    },
    {
      name: "loading（生成中）",
      render: () => (
        <ChatMessage role="assistant" name="瑚琏 AI" loading>
          占位
        </ChatMessage>
      ),
    },
    { name: "system", render: () => <ChatMessage role="system">已切换到 Opus 4.8</ChatMessage> },
  ],
  renderWithProps: (p) => (
    <ChatMessage role={p.role as "user" | "assistant" | "system"} loading={p.loading as boolean}>
      {p.children as string}
    </ChatMessage>
  ),
  toCode: (p) => `<ChatMessage role="${p.role}"${p.loading ? " loading" : ""}>${p.children}</ChatMessage>`,
};
