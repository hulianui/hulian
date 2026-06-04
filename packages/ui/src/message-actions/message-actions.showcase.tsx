"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { MessageActions } from "./message-actions";
import { ChatMessage } from "../chat-message";

export const messageActionsShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    {
      name: "全套（复制/重生成/赞/踩）",
      render: () => (
        <MessageActions
          content="瑚琏支持明暗双主题 0 闪烁。"
          onRegenerate={() => {}}
          onLike={() => {}}
          onDislike={() => {}}
        />
      ),
    },
    {
      name: "挂在 ChatMessage 下",
      render: () => (
        <div className="w-full max-w-lg">
          <ChatMessage
            role="assistant"
            name="瑚琏 AI"
            actions={
              <MessageActions
                content="支持，明暗双主题 0 闪烁，SSR 注入变量先于绘制。"
                onRegenerate={() => {}}
                onLike={() => {}}
                onDislike={() => {}}
              />
            }
          >
            支持，明暗双主题 0 闪烁，SSR 注入变量先于绘制。
          </ChatMessage>
        </div>
      ),
    },
  ],
  renderWithProps: () => (
    <MessageActions content="复制我" onRegenerate={() => {}} onLike={() => {}} onDislike={() => {}} />
  ),
  toCode: () =>
    `<MessageActions content={text} onRegenerate={regen} onLike={up} onDislike={down} />`,
};
