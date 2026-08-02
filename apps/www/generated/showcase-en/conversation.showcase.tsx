"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Conversation } from "../../../../packages/ui/src/conversation/conversation";
import { ChatMessage } from "../../../../packages/ui/src/chat-message";
const Demo = () => (<Conversation className="h-72 w-full max-w-lg rounded-[var(--radius)] border border-border p-4">
    <ChatMessage role="user" name="Me">
      Does Hulian support dark colors?
    </ChatMessage>
    <ChatMessage role="assistant" name="Hulian AI">
      Yes. Light and dark themes render without a flash because SSR injects variables before first paint.
    </ChatMessage>
    <ChatMessage role="user" name="Me">
      How to switch?
    </ChatMessage>
    <ChatMessage role="assistant" name="Hulian AI" loading>
      Placeholder
    </ChatMessage>
  </Conversation>);
export const conversationShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Get an independent scrolling message flow at a given height; stack ChatMessage internally vertically, and the content will automatically stick to the bottom as it grows.",
            code: `<Conversation className="h-72 max-w-lg">
  <ChatMessage role="user" name="me">Does Hulian support dark colors? </ChatMessage>
  <ChatMessage role="assistant" name="Hulian AI">
    Yes. Light and dark themes render without a flash because SSR injects variables before first paint.
  </ChatMessage>
  <ChatMessage role="user" name="me">How to switch? </ChatMessage>
  <ChatMessage role="assistant" name="Hulian AI" loading>Placeholder</ChatMessage>
</Conversation>`,
            render: () => <Demo />,
        },
        {
            title: "Hide scroll bar",
            description: "hideScrollbar hides the scroll bar (the content can still be scrolled), suitable for ChatGPT-style immersive chat area.",
            code: `<Conversation hideScrollbar className="h-72 max-w-lg">
  <ChatMessage role="user" name="I">This is very long...</ChatMessage>
  <ChatMessage role="assistant" name="Hulian AI">Received. </ChatMessage>
</Conversation>`,
            render: () => (<Conversation hideScrollbar className="h-72 w-full max-w-lg rounded-[var(--radius)] border border-border p-4">
          <ChatMessage role="user" name="Me">
            List the core features of Hulian.
          </ChatMessage>
          <ChatMessage role="assistant" name="Hulian AI">
            Light and dark dual themes, zero-dependency primitives, AI intelligent agent category, and a full set of enterprise mid- and back-end components.
          </ChatMessage>
          <ChatMessage role="user" name="Me">
            Received, thank you.
          </ChatMessage>
        </Conversation>),
        },
    ],
    controls: [],
    states: [{ name: "Dialogue flow (automatic bottom)", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<Conversation className="h-72">
  <ChatMessage role="user">\u2026</ChatMessage>
  <ChatMessage role="assistant">\u2026</ChatMessage>
</Conversation>`,
};
