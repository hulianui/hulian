"use client";
import { useState } from "react";
import {
  Layout,
  List,
  ListItem,
  Avatar,
  Button,
  Badge,
  Stack,
  Heading,
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
import { Plus, Menu, Bot } from "lucide-react";
import { CONVERSATIONS } from "./conversations";
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

// 左侧会话 rail：新建钮 + 会话列表（dogfood List/ListItem.Meta/Avatar）。桌面常驻 / 移动端进抽屉。
function Rail() {
  return (
    <Stack gap={3} className="p-3">
      <Button variant="outline" className="w-full justify-start gap-2">
        <Plus className="size-4" aria-hidden /> 新建对话
      </Button>
      <List
        items={CONVERSATIONS}
        split={false}
        renderItem={(c) => (
          <ListItem className={c.active ? "rounded-[var(--radius)] bg-surface-hover" : undefined}>
            <ListItem.Meta
              avatar={<Avatar size="sm" fallback={c.title.slice(0, 1)} />}
              title={c.title}
              description={c.preview}
            />
          </ListItem>
        )}
      />
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
  const { messages, loading, send, stop } = useChatStream();

  const header = (
    <Stack direction="row" align="center" justify="between" className="w-full">
      <Stack direction="row" align="center" gap={2}>
        <span className="md:hidden">
          <Drawer>
            <DrawerTrigger
              render={
                <Button variant="ghost" size="sm" aria-label="会话列表" className="size-8 px-0">
                  <Menu className="size-4" />
                </Button>
              }
            />
            <DrawerContent side="left" className="w-72 p-0">
              <Rail />
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
            <Rail />
          </Layout.Sider>
          <Layout.Content className="flex min-h-0 flex-col p-0">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
                <Empty
                  icon={<Bot className="size-10" aria-hidden />}
                  title="开始一段对话"
                  description="问我天气、让我写代码、或解释一个概念"
                />
                <PromptSuggestions
                  suggestions={SUGGESTIONS}
                  onSelect={(v) => send(v)}
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
            <div className="border-t border-border p-3 sm:p-4">
              <PromptInput
                onSubmit={(t) => send(t)}
                loading={loading}
                onStop={stop}
                placeholder="给瑚琏助手发消息…"
                className="mx-auto max-w-3xl"
              />
            </div>
          </Layout.Content>
        </Layout>
      </Layout>
    </div>
  );
}
