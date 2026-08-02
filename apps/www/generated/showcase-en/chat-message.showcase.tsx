"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ChatMessage } from "../../../../packages/ui/src/chat-message/chat-message";
import { Avatar } from "../../../../packages/ui/src/avatar";
import { MessageActions } from "../../../../packages/ui/src/message-actions";
export const chatMessageShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Users and Assistants",
            description: "role determines the alignment and bubble background color: user right-aligned primary bottom / assistant left-aligned surface bottom. name appears above the text.",
            code: `<>
  <ChatMessage role="user" name="me">Help me rewrite the homepage to 100% dogfood</ChatMessage>
  <ChatMessage role="assistant" name="Hulian AI">Okay, I'll take a look at the existing structure before starting. </ChatMessage>
</>`,
            render: () => (<div className="flex w-full max-w-lg flex-col gap-5">
          <ChatMessage role="user" name="Me">
            Help me rewrite the homepage to 100% dogfood
          </ChatMessage>
          <ChatMessage role="assistant" name="Hulian AI">
            Okay, let me take a look at the existing structure before starting.
          </ChatMessage>
        </div>),
        },
        {
            title: "Loading state",
            description: "loading renders TypingDots at the text position (agent is being generated), and children is ignored as a placeholder.",
            code: `<ChatMessage role="assistant" name="Hulian AI" loading>Placeholder</ChatMessage>`,
            render: () => (<ChatMessage role="assistant" name="Hulian AI" loading>
          Placeholder
        </ChatMessage>),
        },
        {
            title: "Read receipt",
            description: "status Rendering only at role=user (right bubble): sending circle / sent single hook / read double blue hook.",
            code: `<>
  <ChatMessage role="user" name="Agent\u00B7Xiao Lian" timestamp="Just now" status="sent">A work order has been submitted for you. </ChatMessage>
  <ChatMessage role="user" name="Agent\u00B7Xiao Lian" timestamp="Just" status="read">Refund expected 1-3 Arrival within working days. </ChatMessage>
</>`,
            render: () => (<div className="flex w-full max-w-lg flex-col gap-5">
          <ChatMessage role="user" name="Agent·Xiao Lian" timestamp="Just now" status="sent">
            A work order has been submitted for you.
          </ChatMessage>
          <ChatMessage role="user" name="Agent·Xiao Lian" timestamp="Just now" status="read">
            Refunds are expected to arrive in 1-3 working days.
          </ChatMessage>
        </div>),
        },
        {
            title: "Avatar and operation area",
            description: "avatar slot customization <Avatar/>, actions slot <MessageActions/> (copy/like/dislike, etc., press callback and content to show or hide).",
            code: `<ChatMessage
  role="assistant"
  name="Hulian AI"
  avatar={<Avatar fallback="Jue" />}
  actions={
    <MessageActions
      content="Home page rewriting completed"
      onLike={() => {}}
      onDislike={() => {}}
    />
  }
>
  Completed home page rewrite, 100% dogfood @hulianui/ui.
</ChatMessage>`,
            render: () => (<ChatMessage role="assistant" name="Hulian AI" avatar={<Avatar fallback="Lian"/>} actions={<MessageActions content="Home page rewriting completed" onLike={() => { }} onDislike={() => { }}/>}>
          Completed home page rewrite, 100% dogfood @hulianui/ui.
        </ChatMessage>),
        },
        {
            title: "System Announcement",
            description: "role=system is centered and weakened, does not enter the bubble/avatar system, and is used for switching prompts, etc.",
            code: `<ChatMessage role="system">Switched to Opus 4.8</ChatMessage>`,
            render: () => <ChatMessage role="system">Switched to Opus 4.8</ChatMessage>,
        },
    ],
    controls: [
        { prop: "role", type: "select", options: ["user", "assistant", "system"], defaultValue: "assistant" },
        { prop: "children", type: "text", defaultValue: "Hello, how can I help you?", label: "Text" },
        { prop: "loading", type: "boolean", defaultValue: false },
        {
            prop: "status",
            type: "select",
            options: ["", "sending", "sent", "read"],
            defaultValue: "",
            label: "Receipt (right bubble only)",
        },
    ],
    states: [
        {
            name: "user",
            render: () => (<ChatMessage role="user" name="Me" timestamp="Just now">
          Help me rewrite the homepage to 100% dogfood
        </ChatMessage>),
        },
        {
            name: "Read receipt (sent by agent\u00B7read)",
            render: () => (<ChatMessage role="user" name="Agent·Xiao Lian" timestamp="Just now" status="read">
          Hello, the refund has been processed for you and is expected to arrive in your account within 1-3 working days.
        </ChatMessage>),
        },
        {
            name: "assistant",
            render: () => (<ChatMessage role="assistant" name="Hulian AI">
          Okay, let me take a look at the existing structure before starting.
        </ChatMessage>),
        },
        {
            name: "loading (generating)",
            render: () => (<ChatMessage role="assistant" name="Hulian AI" loading>
          Placeholder
        </ChatMessage>),
        },
        { name: "system", render: () => <ChatMessage role="system">Switched to Opus 4.8</ChatMessage> },
    ],
    renderWithProps: (p) => (<ChatMessage role={p.role as "user" | "assistant" | "system"} loading={p.loading as boolean} status={(p.status as "sending" | "sent" | "read" | "") || undefined}>
      {p.children as string}
    </ChatMessage>),
    toCode: (p) => `<ChatMessage role="${p.role}"${p.loading ? " loading" : ""}${p.status ? ` status="${p.status}"` : ""}>${p.children}</ChatMessage>`,
};
