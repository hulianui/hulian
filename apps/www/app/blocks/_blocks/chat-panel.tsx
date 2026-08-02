/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

// AI 对话面板 Block —— 自包含、可整段复制。
// 消息流：用户气泡 + 助手气泡（ThinkingBlock 推理 + ToolCall 工具调用 + Markdown 正文 + Citation 引用 + MessageActions 操作条）。
// 底部 PromptInput 输入框，发送后 TypingDots → StreamingText 流式模拟。固定高度内部滚动。

import { useRef, useState } from "react";
import {
  Avatar,
  Button,
  Citation,
  Conversation,
  ChatMessage,
  Markdown,
  MessageActions,
  PromptInput,
  ThinkingBlock,
  ToolCall,
  TypingDots,
  StreamingText,
  toast,
} from "../../../lib/fixture-ui";
import { Bot } from "lucide-react";

// ── 静态 mock 对话（复制时替换即可） ──────────────────────────
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
  citations?: Array<{ index: number; title: string; source: string; href?: string }>;
}
type Msg = UserMsg | AsstMsg;

const INITIAL_MESSAGES: Msg[] = [
  {
    id: "u1",
    role: "user",
    text: "帮我分析一下瑚琏 UI 组件库的技术架构，并对比主流竞品。",
  },
  {
    id: "a1",
    role: "assistant",
    thinking:
      "用户想了解瑚琏 UI 的技术架构与竞品对比。需要先搜索最新文档，再整理成对比分析。",
    toolName: "web_search",
    toolInput: JSON.stringify({ query: "瑚琏 UI @hulianui 组件库架构 2026", max_results: 5 }, null, 2),
    toolOutput: JSON.stringify(
      [
        { title: "瑚琏 UI 官方文档", url: "https://hulianui.com/docs" },
        { title: "hulianui GitHub 仓库", url: "https://github.com/hulianui/ui" },
      ],
      null,
      2,
    ),
    text: `## 瑚琏 UI 技术架构概览

瑚琏 UI 采用 **Tailwind v4 + Base UI headless** 双引擎驱动，核心设计原则是「令牌化主题 + 无样式原语」：

- **设计令牌**：所有颜色、间距、阴影统一写入 CSS 变量，通过 \`@theme inline\` 注入运行时，支持一键暗色切换
- **无障碍优先**：底层 Base UI 保证 ARIA 合规；上层皮肤完全由 Tailwind 类控制，零 JS 动画预算消耗
- **Tree-shaking**：每个组件独立入口，消费方只打包实际使用的部分

### 竞品对比

| 维度 | 瑚琏 UI | shadcn/ui | HeroUI |
|------|--------|-----------|--------|
| 样式引擎 | Tailwind v4 | Tailwind v3 | Tailwind + Framer |
| 主题切换 | CSS 变量运行时 | CSS 变量 | 类名切换 |
| AI 组件 | 原生支持 | 无 | 无 |
| 企业组件 | ProTable / AdminLayout | 无 | 部分 |`,
    citations: [
      {
        index: 1,
        title: "瑚琏 UI 官方文档",
        source: "hulianui.com",
        href: "https://hulianui.com/docs",
      },
      {
        index: 2,
        title: "hulianui GitHub 仓库",
        source: "github.com",
        href: "https://github.com/hulianui/ui",
      },
    ],
  },
];

// ── 流式回复模拟 ─────────────────────────────────────────────
const MOCK_REPLY = `好的，我来进一步补充说明。

瑚琏 UI 在 **AI 组件**方面是目前国内开源组件库中覆盖最全的：包含对话、推理、工具调用、流式文字、引用等完整链路组件，非常适合快速搭建 AI 应用界面。

如需了解某个具体组件的用法，随时告诉我！`;

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
        } else {
          setText(MOCK_REPLY);
          setPhase("done");
          onDone(MOCK_REPLY);
        }
      };
      tick();
    }, 900);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    setText("");
  };

  return { phase, text, start, reset };
}

// ── 助手气泡内容 ──────────────────────────────────────────────
function AsstBody({ msg }: { msg: AsstMsg }) {
  return (
    <div className="space-y-3">
      {msg.thinking && (
        <ThinkingBlock thinking={false} duration="思考 2.1s">
          {msg.thinking}
        </ThinkingBlock>
      )}
      {msg.toolName && (
        <ToolCall
          name={msg.toolName}
          status="success"
          input={<pre className="text-xs whitespace-pre-wrap">{msg.toolInput}</pre>}
          output={<pre className="text-xs whitespace-pre-wrap">{msg.toolOutput}</pre>}
        />
      )}
      <Markdown size="sm">{msg.text}</Markdown>
      {msg.citations && msg.citations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {msg.citations.map((c) => (
            <Citation
              key={c.index}
              index={c.index}
              title={c.title}
              source={c.source}
              href={c.href}
            />
          ))}
        </div>
      )}
      <MessageActions
        content={msg.text}
        onCopy={() => toast({ title: "已复制", tone: "info" })}
        onRegenerate={() => toast({ title: "重新生成中…", tone: "info" })}
        onLike={() => toast({ title: "感谢反馈 👍", tone: "info" })}
        onDislike={() => toast({ title: "已记录", tone: "info" })}
      />
    </div>
  );
}

// ── 区块主体 ─────────────────────────────────────────────────
export function ChatPanelBlock() {
  const [messages, setMessages] = useState<Msg[]>(INITIAL_MESSAGES);
  const { phase, text, start, reset } = useStream();
  const streaming = phase === "typing" || phase === "streaming";

  const handleSend = (input: string) => {
    if (streaming) return;
    reset();

    // 追加用户消息
    const uid = `u${Date.now()}`;
    const aid = `a${Date.now()}`;
    setMessages((prev) => [...prev, { id: uid, role: "user", text: input }]);

    // 追加占位助手消息（由 phase 驱动显示）
    start((full) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aid ? ({ ...m, text: full } as AsstMsg) : m,
        ),
      );
    });

    setMessages((prev) => [
      ...prev,
      { id: aid, role: "assistant", text: "" } as AsstMsg,
    ]);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex h-[34rem] flex-col overflow-hidden rounded-xl border border-border bg-bg shadow-md">
        {/* 消息流 */}
        <Conversation className="flex-1 overflow-y-auto px-4 py-4">
          {messages.map((m) =>
            m.role === "user" ? (
              <ChatMessage key={m.id} role="user" avatar={<Avatar size="sm" fallback="我" />}>
                {m.text}
              </ChatMessage>
            ) : (
              <ChatMessage
                key={m.id}
                role="assistant"
                name="瑚琏助手"
                avatar={<Avatar size="sm" fallback={<Bot className="size-4" />} />}
              >
                {m.text ? (
                  <AsstBody msg={m as AsstMsg} />
                ) : phase === "typing" ? (
                  <TypingDots />
                ) : phase === "streaming" ? (
                  <StreamingText text={text} streaming className="text-sm leading-relaxed" />
                ) : null}
              </ChatMessage>
            ),
          )}
        </Conversation>

        {/* 输入栏 */}
        <div className="border-t border-border bg-bg px-3 py-3">
          <PromptInput
            placeholder="给瑚琏助手发消息…"
            loading={streaming}
            onSubmit={handleSend}
            onStop={reset}
          />
        </div>
      </div>
    </div>
  );
}
