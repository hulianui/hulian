"use client";
import { useRef, useState } from "react";
import { Avatar, Button, Citation, Conversation, ChatMessage, Markdown, MessageActions, PromptInput, ThinkingBlock, ToolCall, TypingDots, StreamingText, toast, } from "@hulianui/ui";
import { Bot } from "lucide-react";
interface UserMsg {
    id: string;
    role: "user";
    text: string;
}
interface AsstMsg {
    id: string;
    role: "assistant";
    thinking?: string;
    toolName?: string;
    toolInput?: string;
    toolOutput?: string;
    text: string;
    citations?: Array<{
        index: number;
        title: string;
        source: string;
        href?: string;
    }>;
}
type Msg = UserMsg | AsstMsg;
const INITIAL_MESSAGES: Msg[] = [
    {
        id: "u1",
        role: "user",
        text: "Analyze Hulian UI's architecture and compare it with leading component libraries.",
    },
    {
        id: "a1",
        role: "assistant",
        thinking: "The user wants to compare Hulian UI's architecture with leading component libraries. Search the latest documentation, then prepare a structured comparison.",
        toolName: "web_search",
        toolInput: JSON.stringify({ query: "Hulian UI @hulianui component library architecture 2026", max_results: 5 }, null, 2),
        toolOutput: JSON.stringify([
            { title: "Hulian UI official documentation", url: "https://hulianui.com/docs" },
            { title: "hulianui GitHub repository", url: "https://github.com/hulianui/ui" },
        ], null, 2),
        text: `## Hulian UI architecture overview Hulian UI combines **Tailwind CSS v4 with headless Base UI primitives**. Its core principle is token-driven theming over unstyled, accessible behavior: - **Design tokens**: Colors, spacing, and shadows live in CSS custom properties and are exposed through \`@theme inline\`, including runtime dark mode. - **Accessibility first**: Base UI provides accessible interaction semantics while Tailwind owns the visual layer, without a JavaScript animation tax. - **Tree shaking**: Every component has an independent entry point, so consumers bundle only what they use. ### Competitive overview | Dimension | Hulian UI | shadcn/ui | HeroUI | | --- | --- | --- | --- | | Styling | Tailwind v4 | Tailwind v3 | Tailwind + Framer | | Theme switching | Runtime CSS variables | CSS variables | Class switching | | AI components | Built in | None | None | | Enterprise components | ProTable / AdminLayout | None | Partial |`,
        citations: [
            {
                index: 1,
                title: "Hulian UI official documentation",
                source: "hulianui.com",
                href: "https://hulianui.com/docs",
            },
            {
                index: 2,
                title: "hulianui GitHub repository",
                source: "github.com",
                href: "https://github.com/hulianui/ui",
            },
        ],
    },
];
const MOCK_REPLY = `Here is some additional context. Hulian UI provides a broad **AI component** toolkit for conversations, reasoning states, tool calls, streaming text, and citations, so teams can assemble complete AI product interfaces quickly. Tell me which component you want to explore next.`;
function useStream() {
    const [phase, setPhase] = useState<"idle" | "typing" | "streaming" | "done">("idle");
    const [text, setText] = useState("");
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const start = (onDone: (full: string) => void) => {
        setPhase("typing");
        setText("");
        timerRef.current = setTimeout(() => {
            setPhase("streaming");
            let i = 0;
            const tick = () => {
                i += 4;
                setText(MOCK_REPLY.slice(0, i));
                if (i < MOCK_REPLY.length) {
                    timerRef.current = setTimeout(tick, 18);
                }
                else {
                    setText(MOCK_REPLY);
                    setPhase("done");
                    onDone(MOCK_REPLY);
                }
            };
            tick();
        }, 900);
    };
    const reset = () => {
        if (timerRef.current)
            clearTimeout(timerRef.current);
        setPhase("idle");
        setText("");
    };
    return { phase, text, start, reset };
}
function AsstBody({ msg }: {
    msg: AsstMsg;
}) {
    return (<div className="space-y-3">
      {msg.thinking && (<ThinkingBlock thinking={false} duration="Thought for 2.1s">
          {msg.thinking}
        </ThinkingBlock>)}
      {msg.toolName && (<ToolCall name={msg.toolName} status="success" input={<pre className="text-xs whitespace-pre-wrap">{msg.toolInput}</pre>} output={<pre className="text-xs whitespace-pre-wrap">{msg.toolOutput}</pre>}/>)}
      <Markdown size="sm">{msg.text}</Markdown>
      {msg.citations && msg.citations.length > 0 && (<div className="flex flex-wrap gap-2">
          {msg.citations.map((c) => (<Citation key={c.index} index={c.index} title={c.title} source={c.source} href={c.href}/>))}
        </div>)}
      <MessageActions content={msg.text} onCopy={() => toast({ title: "Copied", tone: "info" })} onRegenerate={() => toast({ title: "Regenerating...", tone: "info" })} onLike={() => toast({ title: "Thanks for the feedback \uD83D\uDC4D", tone: "info" })} onDislike={() => toast({ title: "Recorded", tone: "info" })}/>
    </div>);
}
export function ChatPanelBlock() {
    const [messages, setMessages] = useState<Msg[]>(INITIAL_MESSAGES);
    const { phase, text, start, reset } = useStream();
    const streaming = phase === "typing" || phase === "streaming";
    const handleSend = (input: string) => {
        if (streaming)
            return;
        reset();
        const uid = `u${Date.now()}`;
        const aid = `a${Date.now()}`;
        setMessages((prev) => [...prev, { id: uid, role: "user", text: input }]);
        start((full) => {
            setMessages((prev) => prev.map((m) => m.id === aid ? ({ ...m, text: full } as AsstMsg) : m));
        });
        setMessages((prev) => [
            ...prev,
            { id: aid, role: "assistant", text: "" } as AsstMsg,
        ]);
    };
    return (<div className="mx-auto w-full max-w-3xl">
      <div className="flex h-[34rem] flex-col overflow-hidden rounded-xl border border-border bg-bg shadow-md">

        <Conversation className="flex-1 overflow-y-auto px-4 py-4">
          {messages.map((m) => m.role === "user" ? (<ChatMessage key={m.id} role="user" avatar={<Avatar size="sm" fallback="me"/>}>
                {m.text}
              </ChatMessage>) : (<ChatMessage key={m.id} role="assistant" name="Hulian Assistant" avatar={<Avatar size="sm" fallback={<Bot className="size-4"/>}/>}>
                {m.text ? (<AsstBody msg={m as AsstMsg}/>) : phase === "typing" ? (<TypingDots />) : phase === "streaming" ? (<StreamingText text={text} streaming className="text-sm leading-relaxed"/>) : null}
              </ChatMessage>))}
        </Conversation>


        <div className="border-t border-border bg-bg px-3 py-3">
          <PromptInput placeholder="Send a message to Hulian Assistant..." loading={streaming} onSubmit={handleSend} onStop={reset}/>
        </div>
      </div>
    </div>);
}
