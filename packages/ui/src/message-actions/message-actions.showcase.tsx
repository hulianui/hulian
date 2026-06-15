"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { MessageActions } from "./message-actions";
import { ChatMessage } from "../chat-message";

export const messageActionsShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "全套操作",
      description: "提供 content + 各回调，渲染复制/重新生成/赞/踩四键。",
      code: `<MessageActions
  content="瑚琏支持明暗双主题 0 闪烁。"
  onRegenerate={() => regenerate()}
  onLike={() => rate("up")}
  onDislike={() => rate("down")}
/>`,
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
      title: "仅复制",
      description: "只传 content 时单独显示复制键，点击后 Check 反馈 1.5s。",
      code: `<MessageActions content="只读片段，仅供复制。" />`,
      render: () => <MessageActions content="只读片段，仅供复制。" />,
    },
    {
      title: "追加自定义键",
      description: "children 在末尾追加任意操作（如收藏、分享）。",
      code: `<MessageActions content={text} onRegenerate={regen}>
  <button
    type="button"
    className="inline-flex h-7 items-center rounded-[var(--radius)] px-2 text-xs text-muted hover:bg-surface-hover hover:text-foreground"
  >
    收藏
  </button>
</MessageActions>`,
      render: () => (
        <MessageActions content="支持追加自定义操作。" onRegenerate={() => {}}>
          <button
            type="button"
            className="inline-flex h-7 items-center rounded-[var(--radius)] px-2 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            收藏
          </button>
        </MessageActions>
      ),
    },
    {
      title: "挂在 ChatMessage 下",
      description: "作为 ChatMessage 的 actions 槽，跟随气泡显示在消息下方。",
      code: `<ChatMessage
  role="assistant"
  name="瑚琏 AI"
  actions={<MessageActions content={text} onRegenerate={regen} onLike={up} onDislike={down} />}
>
  支持，明暗双主题 0 闪烁，SSR 注入变量先于绘制。
</ChatMessage>`,
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
