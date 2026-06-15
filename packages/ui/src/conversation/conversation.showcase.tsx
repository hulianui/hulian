"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Conversation } from "./conversation";
import { ChatMessage } from "../chat-message";

const Demo = () => (
  <Conversation className="h-72 w-full max-w-lg rounded-[var(--radius)] border border-border p-4">
    <ChatMessage role="user" name="我">
      瑚琏支持暗色吗？
    </ChatMessage>
    <ChatMessage role="assistant" name="瑚琏 AI">
      支持，明暗双主题 0 闪烁，SSR 注入变量先于绘制。
    </ChatMessage>
    <ChatMessage role="user" name="我">
      怎么切换？
    </ChatMessage>
    <ChatMessage role="assistant" name="瑚琏 AI" loading>
      占位
    </ChatMessage>
  </Conversation>
);

export const conversationShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "给定高度即获得独立滚动的消息流；内部纵向堆叠 ChatMessage，内容增长自动贴底。",
      code: `<Conversation className="h-72 max-w-lg">
  <ChatMessage role="user" name="我">瑚琏支持暗色吗？</ChatMessage>
  <ChatMessage role="assistant" name="瑚琏 AI">
    支持，明暗双主题 0 闪烁，SSR 注入变量先于绘制。
  </ChatMessage>
  <ChatMessage role="user" name="我">怎么切换？</ChatMessage>
  <ChatMessage role="assistant" name="瑚琏 AI" loading>占位</ChatMessage>
</Conversation>`,
      render: () => <Demo />,
    },
    {
      title: "隐藏滚动条",
      description: "hideScrollbar 隐藏滚动条（内容仍可滚动），适合 ChatGPT 式沉浸聊天区。",
      code: `<Conversation hideScrollbar className="h-72 max-w-lg">
  <ChatMessage role="user" name="我">这条很长……</ChatMessage>
  <ChatMessage role="assistant" name="瑚琏 AI">收到。</ChatMessage>
</Conversation>`,
      render: () => (
        <Conversation
          hideScrollbar
          className="h-72 w-full max-w-lg rounded-[var(--radius)] border border-border p-4"
        >
          <ChatMessage role="user" name="我">
            列一下瑚琏的核心特性。
          </ChatMessage>
          <ChatMessage role="assistant" name="瑚琏 AI">
            明暗双主题、零依赖原语、AI 智能体品类、全套企业中后台组件。
          </ChatMessage>
          <ChatMessage role="user" name="我">
            收到，谢谢。
          </ChatMessage>
        </Conversation>
      ),
    },
  ],
  controls: [],
  states: [{ name: "对话流（自动贴底）", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<Conversation className="h-72">\n  <ChatMessage role="user">…</ChatMessage>\n  <ChatMessage role="assistant">…</ChatMessage>\n</Conversation>`,
};
