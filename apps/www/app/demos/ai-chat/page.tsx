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
  Text,
  Dot,
  User,
  Segmented,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  toast,
  ToastProvider,
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
import {
  Plus,
  Menu as MenuIcon,
  Bot,
  Paperclip,
  Sparkles,
  Globe,
  Zap,
  Gem,
  Search,
  PanelLeft,
  MoreHorizontal,
} from "lucide-react";
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

// 左侧会话 rail（全高列）：顶部品牌+工具 / 新建钮 / 时间分组会话导航(NavMenu·滚动) / 底部用户档。
// 仿 DeepSeek/ChatGPT。dogfood NavMenu/User/Avatar/Dot/Button。桌面常驻 / 移动端进抽屉。
function Rail({
  convos,
  activeId,
  onSelect,
  onNew,
  onCollapse,
}: {
  convos: ConversationStub[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onCollapse: () => void;
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
    <div className="flex h-full flex-col">
      {/* 顶部：品牌 + 搜索 + 折叠 */}
      <Stack
        direction="row"
        align="center"
        justify="between"
        className="px-3 py-3"
      >
        <Stack direction="row" align="center" gap={2}>
          <Dot tone="brand" />
          <Text as="span" weight="semibold" className="tracking-tight">
            瑚琏助手
          </Text>
        </Stack>
        <Stack direction="row" align="center" gap={1}>
          <Button variant="ghost" size="iconSm" aria-label="搜索对话" className="text-muted hover:text-foreground">
            <Search className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onCollapse}
            aria-label="收起侧栏"
            className="text-muted hover:text-foreground"
          >
            <PanelLeft className="size-4" />
          </Button>
        </Stack>
      </Stack>

      {/* 新建 + 会话导航（滚动区） */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-2">
        <Button variant="outline" onClick={onNew} className="w-full justify-center gap-2 rounded-full">
          <Plus className="size-4" aria-hidden /> 新建对话
        </Button>
        <NavMenu
          className="w-full"
          items={navItems}
          selectedKeys={[activeId]}
          onSelect={(key) => onSelect(key)}
        />
      </div>

      {/* 底部用户档：用户信息区 + 账户菜单 各自独立可点（非一体） */}
      <div className="flex items-center gap-1 border-t border-border p-2">
        <button
          type="button"
          onClick={() => toast({ title: "账户", description: "demo 演示，未接入真实账户体系" })}
          className="flex flex-1 items-center rounded-lg px-1.5 py-1.5 text-left outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <User name="瑚琏用户" description="免费版" avatarProps={{ size: "sm", fallback: "瑚" }} />
        </button>
        <Menu>
          <MenuTrigger
            render={
              <Button
                variant="ghost"
                size="iconSm"
                aria-label="账户菜单"
                className="text-muted hover:text-foreground"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <MenuContent side="top" align="end">
            <MenuItem onClick={() => toast({ title: "个人设置", tone: "info" })}>个人设置</MenuItem>
            <MenuItem onClick={() => toast({ title: "升级到 Pro", tone: "info" })}>升级到 Pro</MenuItem>
            <MenuItem onClick={() => toast({ title: "帮助与反馈", tone: "info" })}>帮助与反馈</MenuItem>
            <MenuSeparator />
            <MenuItem variant="danger" onClick={() => toast({ title: "已退出登录", tone: "info" })}>
              退出登录
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
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
          onCopy={() => toast({ title: "已复制到剪贴板", tone: "info" })}
          onRegenerate={() => toast({ title: "重新生成中…", tone: "info" })}
          onLike={() => toast({ title: "感谢你的反馈 👍", tone: "info" })}
          onDislike={() => toast({ title: "已记录，我们会继续改进", tone: "info" })}
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
  const [railCollapsed, setRailCollapsed] = useState(false);
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
                <Button variant="ghost" size="iconSm" aria-label="会话列表">
                  <MenuIcon className="size-4" />
                </Button>
              }
            />
            <DrawerContent side="left" className="w-72 p-0">
              <Rail
                convos={convos}
                activeId={activeId}
                onSelect={selectConvo}
                onNew={newConvo}
                onCollapse={() => setDrawerOpen(false)}
              />
            </DrawerContent>
          </Drawer>
        </span>
        {/* 桌面：侧栏收起时显示展开钮 */}
        {railCollapsed ? (
          <span className="hidden md:block">
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => setRailCollapsed(false)}
              aria-label="展开侧栏"
              className="text-muted hover:text-foreground"
            >
              <PanelLeft className="size-4" />
            </Button>
          </span>
        ) : null}
        <Heading as="span" size="base" weight="semibold">
          AI 对话工具
        </Heading>
        <Badge variant="soft" size="sm">
          demo
        </Badge>
      </Stack>
      <Select
        items={MODELS}
        value={model}
        onValueChange={(v) => {
          setModel(v as string);
          const picked = MODELS.find((x) => x.value === v);
          toast({ title: `已切换到 ${picked?.label ?? v}`, tone: "info" });
        }}
      >
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
      {/* 命令式 toast 单挂：模型切换 / 消息操作 / 账户菜单的反馈都进此 Viewport */}
      <ToastProvider />
      <Layout className="h-full">
        <Layout.Header className="px-4">{header}</Layout.Header>
        <Layout hasSider className="min-h-0 flex-auto">
          {railCollapsed ? null : (
            // 聊天侧栏壳：用 aside 布局容器(顶/底固定 + 中间滚动)，Layout.Sider 的整体 ScrollArea
            // 模型无法固定底部用户档，故此处用布局原语自管；内容全是 hulian 组件(Rail)。
            <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border bg-surface md:flex">
              <Rail
                convos={convos}
                activeId={activeId}
                onSelect={selectConvo}
                onNew={newConvo}
                onCollapse={() => setRailCollapsed(true)}
              />
            </aside>
          )}
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
                      size="iconSm"
                      className="shrink-0 text-muted hover:text-foreground"
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
