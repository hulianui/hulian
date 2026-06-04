"use client";
import { useState } from "react";
import {
  Layout,
  NavMenu,
  type NavMenuNode,
  Avatar,
  Button,
  Toggle,
  Badge,
  Stack,
  Heading,
  Segmented,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  Conversation,
  ChatMessage,
  ThinkingBlock,
  ToolCall,
  StreamingText,
  Markdown,
  Citation,
  MessageActions,
  PromptInput,
  PromptSuggestions,
  TypingDots,
  Empty,
  CodeBlock,
} from "@hulian/ui";
import { Plus, Menu, Bot, Paperclip, Sparkles, Globe, Zap, Gem } from "lucide-react";
import { CONVERSATIONS, CONVERSATION_GROUPS, type ConversationStub } from "./conversations";
import { useChatStream } from "./use-chat-stream";
import type { AssistantMessage } from "./chat-types";

const MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude", label: "Claude Opus" },
  { value: "hulian", label: "瑚琏 1.0" },
];

const SUGGESTIONS = [
  "北京今天天气怎么样",
  "帮我写一个快速排序",
  "解释一下什么是闭包",
  "你能做什么？",
];

let convoSeq = 0;
const newConvoId = () => `new${++convoSeq}`;

// 左侧会话 rail：新建钮 + 按时间分组的会话导航（dogfood NavMenu：原生分组/选中态/点击切换，
// 仿 DeepSeek/ChatGPT 极简风）。空组自动跳过。桌面常驻 / 移动端进抽屉。
function Rail({
  convos,
  activeId,
  onSelect,
  onNew,
}: {
  convos: ConversationStub[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const navItems: NavMenuNode[] = CONVERSATION_GROUPS.map((group) => ({
    type: "group" as const,
    key: group,
    label: group,
    children: convos
      .filter((c) => c.group === group)
      .map((c) => ({ key: c.id, label: c.title })),
  })).filter((g) => g.children.length > 0);

  return (
    <Stack gap={3} className="p-3">
      <Button variant="outline" onClick={onNew} className="w-full justify-center gap-2 rounded-full">
        <Plus className="size-4" aria-hidden /> 新建对话
      </Button>
      <NavMenu items={navItems} selectedKeys={[activeId]} onSelect={(key) => onSelect(key)} />
    </Stack>
  );
}

// assistant 气泡正文：思考块 → 工具调用 → 正文(流式中 StreamingText 逐字 / done 后 Markdown 富文本)
// → 引用来源 → 消息操作。全部 @hulian/ui 组件。
function AssistantBody({ m }: { m: AssistantMessage }) {
  const idle = m.phase === "waiting" && !m.thinking && m.tools.length === 0;
  return (
    <Stack gap={3}>
      {m.thinking ? (
        <ThinkingBlock
          thinking={!m.thinkingDone}
          duration={m.thinkingDone && m.duration ? `思考 ${m.duration}s` : undefined}
        >
          {m.thinking}
        </ThinkingBlock>
      ) : null}

      {m.tools.map((t) => (
        <ToolCall
          key={t.id}
          name={t.name}
          status={t.status}
          input={<CodeBlock code={t.input} lang="json" />}
          output={t.output ? <CodeBlock code={t.output} lang="json" /> : undefined}
        />
      ))}

      {idle ? <TypingDots /> : null}

      {m.text ? (
        m.phase === "done" ? (
          <Markdown size="sm">{m.text}</Markdown>
        ) : (
          <StreamingText text={m.text} streaming className="text-sm leading-relaxed" />
        )
      ) : null}

      {m.citations.length > 0 ? (
        <Stack direction="row" wrap gap={2}>
          {m.citations.map((c) => (
            <Citation key={c.index} index={c.index} title={c.title} source={c.source} href={c.href} />
          ))}
        </Stack>
      ) : null}

      {m.phase === "done" ? (
        <MessageActions
          content={m.text}
          onLike={() => {}}
          onDislike={() => {}}
          onRegenerate={() => {}}
        />
      ) : null}
    </Stack>
  );
}

export default function AiChatDemo() {
  const [model, setModel] = useState("gpt-4o");
  const [mode, setMode] = useState("fast");
  const [deepThink, setDeepThink] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [convos, setConvos] = useState<ConversationStub[]>(CONVERSATIONS);
  const [activeId, setActiveId] = useState(
    CONVERSATIONS.find((c) => c.active)?.id ?? CONVERSATIONS[0].id,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { messages, loading, send, stop, reset } = useChatStream();

  const selectConvo = (id: string) => {
    setActiveId(id);
    reset();
    setDrawerOpen(false);
  };
  const newConvo = () => {
    const id = newConvoId();
    setConvos((cs) => [{ id, title: "新对话", group: "今天" }, ...cs]);
    setActiveId(id);
    reset();
    setDrawerOpen(false);
  };
  // 发消息：让会话列表“活”起来 —— 新对话的首条消息自动成为其标题（同 DeepSeek/ChatGPT）
  const handleSend = (text: string) => {
    send(text);
    setConvos((cs) =>
      cs.map((c) =>
        c.id === activeId && c.title === "新对话" ? { ...c, title: text.slice(0, 18) } : c,
      ),
    );
  };

  const header = (
    <Stack direction="row" align="center" justify="between" className="w-full">
      <Stack direction="row" align="center" gap={2}>
        <span className="md:hidden">
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger
              render={
                <Button variant="ghost" size="sm" aria-label="会话列表" className="size-8 px-0">
                  <Menu className="size-4" />
                </Button>
              }
            />
            <DrawerContent side="left" className="w-72 p-0">
              <Rail convos={convos} activeId={activeId} onSelect={selectConvo} onNew={newConvo} />
            </DrawerContent>
          </Drawer>
        </span>
        <Heading as="span" size="base" weight="semibold">
          AI 对话工具
        </Heading>
        <Badge variant="soft" size="sm">
          demo
        </Badge>
      </Stack>
      <Select items={MODELS} value={model} onValueChange={(v) => setModel(v as string)}>
        <SelectTrigger size="sm" className="w-36" />
        <SelectContent>
          {MODELS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Stack>
  );

  return (
    <div className="mx-auto h-[calc(100dvh-3.25rem)] max-w-[1280px] overflow-hidden">
      <Layout className="h-full">
        <Layout.Header className="px-4">{header}</Layout.Header>
        <Layout hasSider className="min-h-0 flex-auto">
          <Layout.Sider width={280} className="hidden md:block">
            <Rail convos={convos} activeId={activeId} onSelect={selectConvo} onNew={newConvo} />
          </Layout.Sider>
          <Layout.Content className="flex min-h-0 flex-col p-0">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
                <Empty
                  icon={<Bot className="size-10" aria-hidden />}
                  title="开始一段对话"
                  description="问我天气、让我写代码、或解释一个概念"
                />
                <Segmented
                  size="sm"
                  value={mode}
                  onValueChange={setMode}
                  aria-label="对话模式"
                  items={[
                    {
                      value: "fast",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <Zap className="size-3.5" aria-hidden /> 快速模式
                        </span>
                      ),
                    },
                    {
                      value: "expert",
                      label: (
                        <span className="flex items-center gap-1.5">
                          <Gem className="size-3.5" aria-hidden /> 专家模式
                        </span>
                      ),
                    },
                  ]}
                />
                <PromptSuggestions
                  suggestions={SUGGESTIONS}
                  onSelect={(v) => handleSend(v)}
                  className="max-w-xl"
                />
              </div>
            ) : (
              <Conversation className="flex-1 px-4 py-6 sm:px-6">
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
                      <AssistantBody m={m} />
                    </ChatMessage>
                  ),
                )}
              </Conversation>
            )}
            <div className="border-t border-border bg-bg px-3 py-3 sm:px-4">
              <div className="mx-auto max-w-3xl">
                <PromptInput
                  onSubmit={handleSend}
                  loading={loading}
                  onStop={stop}
                  placeholder="给瑚琏助手发消息…"
                  actions={
                    <>
                      <Toggle
                        variant="pill"
                        size="sm"
                        pressed={deepThink}
                        onPressedChange={setDeepThink}
                        aria-label="深度思考"
                      >
                        <Sparkles className="size-3.5" aria-hidden />
                        深度思考
                      </Toggle>
                      <Toggle
                        variant="pill"
                        size="sm"
                        pressed={webSearch}
                        onPressedChange={setWebSearch}
                        aria-label="智能搜索"
                      >
                        <Globe className="size-3.5" aria-hidden />
                        智能搜索
                      </Toggle>
                    </>
                  }
                  trailing={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 shrink-0 px-0 text-muted hover:text-foreground"
                      aria-label="添加附件"
                    >
                      <Paperclip className="size-4" />
                    </Button>
                  }
                />
                <p className="mt-2 text-center text-xs text-muted">
                  瑚琏助手可能会出错 · 本 demo 为纯前端交互演示，未接入真实模型
                </p>
              </div>
            </div>
          </Layout.Content>
        </Layout>
      </Layout>
    </div>
  );
}
