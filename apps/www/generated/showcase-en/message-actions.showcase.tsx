"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { MessageActions } from "../../../../packages/ui/src/message-actions/message-actions";
import { ChatMessage } from "../../../../packages/ui/src/chat-message";
export const messageActionsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Full set of operations",
            description: "Provides content + each callback, rendering copy/regenerate/like/dislike four keys.",
            code: `<MessageActions
  content="Hulian supports light and dark dual themes with 0 flicker."
  onRegenerate={() => regenerate()}
  onLike={() => rate("up")}
  onDislike={() => rate("down")}
/>`,
            render: () => (<MessageActions content="Hulian supports light and dark dual themes with 0 flicker." onRegenerate={() => { }} onLike={() => { }} onDislike={() => { }}/>),
        },
        {
            title: "Copy only",
            description: "When only transmitting content, the copy button is displayed separately. After clicking, Check returns 1.5s.",
            code: `<MessageActions content="Read-only fragment, for copying only." />`,
            render: () => <MessageActions content="Read-only fragment, for copying only."/>,
        },
        {
            title: "Add custom keys",
            description: "children Append any operation (such as collection, sharing) at the end.",
            code: `<MessageActions content={text} onRegenerate={regen}>
  <button
    type="button"
    className="inline-flex h-7 items-center rounded-[var(--radius)] px-2 text-xs text-muted hover:bg-surface-hover hover:text-foreground"
  >
    Favorite
  </button>
</MessageActions>`,
            render: () => (<MessageActions content="Support additional custom operations." onRegenerate={() => { }}>
          <button type="button" className="inline-flex h-7 items-center rounded-[var(--radius)] px-2 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground">
            Favorite
          </button>
        </MessageActions>),
        },
        {
            title: "hangs under ChatMessage",
            description: "The actions slot as ChatMessage, with the following bubble displayed below the message.",
            code: `<ChatMessage
  role="assistant"
  name="Hulian AI"
  actions={<MessageActions content={text} onRegenerate={regen} onLike={up} onDislike={down} />}
>
  Yes. Light and dark themes render without a flash because SSR injects variables before first paint.
</ChatMessage>`,
            render: () => (<div className="w-full max-w-lg">
          <ChatMessage role="assistant" name="Hulian AI" actions={<MessageActions content="Yes. Light and dark themes render without a flash because SSR injects variables before first paint." onRegenerate={() => { }} onLike={() => { }} onDislike={() => { }}/>}>
            Yes. Light and dark themes render without a flash because SSR injects variables before first paint.
          </ChatMessage>
        </div>),
        },
    ],
    controls: [],
    states: [
        {
            name: "Full set (copy/regenerate/like/dislike)",
            render: () => (<MessageActions content="Hulian supports light and dark dual themes with 0 flicker." onRegenerate={() => { }} onLike={() => { }} onDislike={() => { }}/>),
        },
        {
            name: "hangs under ChatMessage",
            render: () => (<div className="w-full max-w-lg">
          <ChatMessage role="assistant" name="Hulian AI" actions={<MessageActions content="Yes. Light and dark themes render without a flash because SSR injects variables before first paint." onRegenerate={() => { }} onLike={() => { }} onDislike={() => { }}/>}>
            Yes. Light and dark themes render without a flash because SSR injects variables before first paint.
          </ChatMessage>
        </div>),
        },
    ],
    renderWithProps: () => (<MessageActions content="Copy me" onRegenerate={() => { }} onLike={() => { }} onDislike={() => { }}/>),
    toCode: () => `<MessageActions content={text} onRegenerate={regen} onLike={up} onDislike={down} />`,
};
