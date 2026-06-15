"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ChatMessage } from "./chat-message";
import { Avatar } from "../avatar";
import { MessageActions } from "../message-actions";

export const chatMessageShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "用户与助手",
      description: "role 决定对齐与气泡底色：user 右对齐 primary 底 / assistant 左对齐 surface 底。name 显示在正文上方。",
      code: `<>
  <ChatMessage role="user" name="我">帮我把首页重写成 100% dogfood</ChatMessage>
  <ChatMessage role="assistant" name="瑚琏 AI">好的，我先看下现有结构再动手。</ChatMessage>
</>`,
      render: () => (
        <div className="flex w-full max-w-lg flex-col gap-5">
          <ChatMessage role="user" name="我">
            帮我把首页重写成 100% dogfood
          </ChatMessage>
          <ChatMessage role="assistant" name="瑚琏 AI">
            好的，我先看下现有结构再动手。
          </ChatMessage>
        </div>
      ),
    },
    {
      title: "加载态",
      description: "loading 在正文位置渲染 TypingDots（agent 生成中），children 作占位被忽略。",
      code: `<ChatMessage role="assistant" name="瑚琏 AI" loading>占位</ChatMessage>`,
      render: () => (
        <ChatMessage role="assistant" name="瑚琏 AI" loading>
          占位
        </ChatMessage>
      ),
    },
    {
      title: "已读回执",
      description: "status 仅在 role=user（右气泡）渲染：sending 转圈 / sent 单勾 / read 双蓝勾。",
      code: `<>
  <ChatMessage role="user" name="坐席·小琏" timestamp="刚刚" status="sent">已为您提交工单。</ChatMessage>
  <ChatMessage role="user" name="坐席·小琏" timestamp="刚刚" status="read">退款预计 1-3 个工作日到账。</ChatMessage>
</>`,
      render: () => (
        <div className="flex w-full max-w-lg flex-col gap-5">
          <ChatMessage role="user" name="坐席·小琏" timestamp="刚刚" status="sent">
            已为您提交工单。
          </ChatMessage>
          <ChatMessage role="user" name="坐席·小琏" timestamp="刚刚" status="read">
            退款预计 1-3 个工作日到账。
          </ChatMessage>
        </div>
      ),
    },
    {
      title: "头像与操作区",
      description: "avatar 槽传自定义 <Avatar/>，actions 槽放 <MessageActions/>（复制 / 赞 / 踩等，按回调与 content 显隐）。",
      code: `<ChatMessage
  role="assistant"
  name="瑚琏 AI"
  avatar={<Avatar fallback="琏" />}
  actions={
    <MessageActions
      content="已完成首页重写"
      onLike={() => {}}
      onDislike={() => {}}
    />
  }
>
  已完成首页重写，全程 100% dogfood @hulianui/ui。
</ChatMessage>`,
      render: () => (
        <ChatMessage
          role="assistant"
          name="瑚琏 AI"
          avatar={<Avatar fallback="琏" />}
          actions={
            <MessageActions
              content="已完成首页重写"
              onLike={() => {}}
              onDislike={() => {}}
            />
          }
        >
          已完成首页重写，全程 100% dogfood @hulianui/ui。
        </ChatMessage>
      ),
    },
    {
      title: "系统通告",
      description: "role=system 居中弱化，不进气泡/头像体系，用于切换提示等。",
      code: `<ChatMessage role="system">已切换到 Opus 4.8</ChatMessage>`,
      render: () => <ChatMessage role="system">已切换到 Opus 4.8</ChatMessage>,
    },
  ],
  controls: [
    { prop: "role", type: "select", options: ["user", "assistant", "system"], defaultValue: "assistant" },
    { prop: "children", type: "text", defaultValue: "你好，我能帮你做什么？", label: "正文" },
    { prop: "loading", type: "boolean", defaultValue: false },
    {
      prop: "status",
      type: "select",
      options: ["", "sending", "sent", "read"],
      defaultValue: "",
      label: "回执(仅右气泡)",
    },
  ],
  states: [
    {
      name: "user",
      render: () => (
        <ChatMessage role="user" name="我" timestamp="刚刚">
          帮我把首页重写成 100% dogfood
        </ChatMessage>
      ),
    },
    {
      name: "已读回执（坐席发送·已读）",
      render: () => (
        <ChatMessage role="user" name="坐席·小琏" timestamp="刚刚" status="read">
          您好，已为您处理退款，预计 1-3 个工作日到账。
        </ChatMessage>
      ),
    },
    {
      name: "assistant",
      render: () => (
        <ChatMessage role="assistant" name="瑚琏 AI">
          好的，我先看下现有结构再动手。
        </ChatMessage>
      ),
    },
    {
      name: "loading（生成中）",
      render: () => (
        <ChatMessage role="assistant" name="瑚琏 AI" loading>
          占位
        </ChatMessage>
      ),
    },
    { name: "system", render: () => <ChatMessage role="system">已切换到 Opus 4.8</ChatMessage> },
  ],
  renderWithProps: (p) => (
    <ChatMessage
      role={p.role as "user" | "assistant" | "system"}
      loading={p.loading as boolean}
      status={(p.status as "sending" | "sent" | "read" | "") || undefined}
    >
      {p.children as string}
    </ChatMessage>
  ),
  toCode: (p) =>
    `<ChatMessage role="${p.role}"${p.loading ? " loading" : ""}${p.status ? ` status="${p.status}"` : ""}>${p.children}</ChatMessage>`,
};
