"use client";
import { useState } from "react";
import {
  Layout,
  NavMenu,
  type NavMenuNode,
  Avatar,
  Button,
  Toggle,
  Tag,
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  Popconfirm,
  Kbd,
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
  Trash2,
} from "lucide-react";
import { CONVERSATIONS, CONVERSATION_GROUPS, type ConversationStub } from "./conversations";
import { useChatStream } from "./use-chat-stream";
import { useMockData } from "../lib/async";
import { ListSkeleton } from "../lib/skeletons";
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
  onDelete,
  loadingConvos,
}: {
  convos: ConversationStub[];
  activeId: string;
  onSelect: (id: string) => void | Promise<void>;
  onNew: () => void;
  onCollapse: () => void;
  onDelete: (id: string) => void;
  loadingConvos: boolean;
}) {
  const navItems: NavMenuNode[] = CONVERSATION_GROUPS.map((group) => ({
    type: "group" as const,
    key: group,
    label: group,
    children: convos
      .filter((c) => c.group === group)
      .map((c) => ({
        key: c.id,
        label: (
          <span className="group/item flex w-full items-center justify-between gap-1">
            <span className="truncate">{c.title}</span>
            {/* 删除按钮：hover 才显；Popconfirm 二次确认 */}
            <Popconfirm
              title="删除对话？"
              description="此操作不可撤销，对话记录将永久删除。"
              danger
              okText="删除"
              onConfirm={async () => {
                await new Promise<void>((r) => setTimeout(r, 400));
                onDelete(c.id);
                toast({ title: "对话已删除", tone: "info" });
              }}
            >
              <button
                type="button"
                aria-label={`删除对话：${c.title}`}
                onClick={(e) => e.stopPropagation()}
                className="invisible shrink-0 rounded p-0.5 text-muted opacity-0 transition-opacity hover:text-danger group-hover/item:visible group-hover/item:opacity-100 focus-visible:visible focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Trash2 className="size-3.5" />
              </button>
            </Popconfirm>
          </span>
        ),
      })),
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
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="iconSm" aria-label="搜索对话" className="text-muted hover:text-foreground">
                  <Search className="size-4" />
                </Button>
              }
            />
            <TooltipContent>搜索对话</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={onCollapse}
                  aria-label="收起侧栏"
                  className="text-muted hover:text-foreground"
                >
                  <PanelLeft className="size-4" />
                </Button>
              }
            />
            <TooltipContent>收起侧栏</TooltipContent>
          </Tooltip>
        </Stack>
      </Stack>

      {/* 新建 + 会话导航（滚动区） */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-2">
        <Button variant="outline" onClick={onNew} className="w-full justify-center gap-2 rounded-full">
          <Plus className="size-4" aria-hidden /> 新建对话
        </Button>
        {/* 加载态：useMockData 驱动骨架，模拟初始会话列表加载 */}
        {loadingConvos ? (
          <ListSkeleton rows={4} />
        ) : (
          <NavMenu
            className="w-full"
            items={navItems}
            selectedKeys={[activeId]}
            onSelect={(key) => { void onSelect(key); }}
          />
        )}
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
            // HoverCard 悬浮预览：hover 在 Citation chip 上时，弹出卡片显示引用原文摘要
            <HoverCard key={c.index}>
              <HoverCardTrigger render={<span />}>
                <Citation index={c.index} title={c.title} source={c.source} href={c.href} />
              </HoverCardTrigger>
              <HoverCardContent side="top" className="w-72 p-3">
                <Stack gap={1.5}>
                  <Text as="p" size="xs" weight="semibold" className="line-clamp-1">
                    {c.title}
                  </Text>
                  {c.source && (
                    <Text as="p" size="xs" className="text-muted">
                      来源：{c.source}
                    </Text>
                  )}
                  <Text as="p" size="xs" className="line-clamp-4 text-muted leading-relaxed">
                    {/* demo 占位原文摘要——真实场景接引用正文 */}
                    这是引用来源的原文摘要。悬停在引用标签上可预览文章摘要，帮助读者快速判断引用内容的相关性和可信度，无需跳转即可获得上下文。
                  </Text>
                  {c.href && (
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline-offset-2 hover:underline"
                    >
                      查看原文 →
                    </a>
                  )}
                </Stack>
              </HoverCardContent>
            </HoverCard>
          ))}
        </Stack>
      ) : null}

      {m.phase === "done" ? (
        // MessageActions 组件内置 title 属性（原生 tooltip），此处包裹 TooltipProvider
        // 以确保多个图标钮共享 delay 分组，改善快速扫过时的体验
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

  // 模拟初始会话列表异步加载（驱动 Rail 的 ListSkeleton 骨架）
  const { loading: loadingConvos } = useMockData(CONVERSATIONS, { delay: 700 });

  // 切换会话时有短暂 loading 态，模拟历史消息加载
  const [switchingConvo, setSwitchingConvo] = useState(false);

  const selectConvo = async (id: string) => {
    if (id === activeId) return;
    setSwitchingConvo(true);
    reset();
    await new Promise<void>((r) => setTimeout(r, 450));
    setActiveId(id);
    setSwitchingConvo(false);
    setDrawerOpen(false);
  };
  const newConvo = () => {
    const id = newConvoId();
    setConvos((cs) => [{ id, title: "新对话", group: "今天" }, ...cs]);
    setActiveId(id);
    reset();
    setDrawerOpen(false);
  };

  // 删除会话：若删除的是当前活跃会话则切到第一条剩余会话
  const deleteConvo = (id: string) => {
    setConvos((cs) => {
      const next = cs.filter((c) => c.id !== id);
      if (id === activeId && next.length > 0) {
        setActiveId(next[0].id);
        reset();
      }
      return next;
    });
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
                onDelete={deleteConvo}
                loadingConvos={loadingConvos}
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
        <Tag variant="soft" size="sm">
          demo
        </Tag>
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
                onDelete={deleteConvo}
                loadingConvos={loadingConvos}
              />
            </aside>
          )}
          <Layout.Content className="flex min-h-0 flex-col p-0">
            {/* 切换会话时：气泡骨架占位，模拟历史消息加载 */}
            {switchingConvo ? (
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="mx-auto max-w-3xl space-y-6">
                  {/* 助手气泡骨架 */}
                  <div className="flex gap-3">
                    <div className="size-8 shrink-0 rounded-full bg-surface-hover" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-16 rounded bg-surface-hover" />
                      <div className="h-4 w-full rounded bg-surface-hover" />
                      <div className="h-4 w-4/5 rounded bg-surface-hover" />
                      <div className="h-4 w-2/3 rounded bg-surface-hover" />
                    </div>
                  </div>
                  {/* 用户气泡骨架 */}
                  <div className="flex justify-end">
                    <div className="h-10 w-48 rounded-2xl bg-surface-hover" />
                  </div>
                  {/* 助手气泡骨架 */}
                  <div className="flex gap-3">
                    <div className="size-8 shrink-0 rounded-full bg-surface-hover" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-16 rounded bg-surface-hover" />
                      <div className="h-4 w-full rounded bg-surface-hover" />
                      <div className="h-4 w-3/4 rounded bg-surface-hover" />
                    </div>
                  </div>
                </div>
              </div>
            ) : messages.length === 0 ? (
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
                    <Tooltip>
                      <TooltipTrigger
                        render={
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
                      <TooltipContent>添加附件</TooltipContent>
                    </Tooltip>
                  }
                />
                <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                  <span>瑚琏助手可能会出错 · 本 demo 为纯前端交互演示，未接入真实模型</span>
                  <span className="hidden items-center gap-1 sm:inline-flex">
                    ·
                    <Kbd>⌘</Kbd>
                    <span>+</span>
                    <Kbd>↵</Kbd>
                    <span>发送</span>
                  </span>
                </p>
              </div>
            </div>
          </Layout.Content>
        </Layout>
      </Layout>
    </div>
  );
}
