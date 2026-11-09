"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { SequenceDiagram } from "./sequence-diagram";
import type { SequenceMessage, SequenceParticipant } from "./sequence-diagram.types";

const participants: SequenceParticipant[] = [
  { id: "app", label: "小程序", description: "用户端" },
  { id: "gateway", label: "网关" },
  { id: "auth", label: "认证服务" },
  { id: "db", label: "用户库", description: "MySQL" },
];

const messages: SequenceMessage[] = [
  { id: "m1", from: "app", to: "gateway", label: "提交手机号和验证码" },
  { id: "m2", from: "gateway", to: "auth", label: "校验验证码" },
  { id: "m3", from: "auth", to: "db", label: "按手机号查用户" },
  { id: "m4", from: "db", to: "auth", label: "用户记录", kind: "reply" },
  { id: "m5", from: "auth", to: "auth", label: "签发登录令牌" },
  { id: "m6", from: "auth", to: "gateway", label: "令牌", kind: "reply" },
  { id: "m7", from: "gateway", to: "app", label: "登录成功", kind: "reply" },
  { id: "m8", from: "auth", to: "db", label: "写入登录日志", kind: "async" },
];

function StepDemo() {
  const [step, setStep] = useState(0);
  const current = messages[step];
  return (
    <div className="flex w-full flex-col gap-3">
      <SequenceDiagram
        title="手机号登录"
        participants={participants}
        messages={messages}
        autoNumber
        activeId={current.id}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          上一步
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={step === messages.length - 1}
          onClick={() => setStep((s) => s + 1)}
        >
          下一步
        </Button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {step + 1} / {messages.length} · {current.label}
        </span>
      </div>
    </div>
  );
}

const basicCode = `<SequenceDiagram
  title="手机号登录"
  participants={[
    { id: "app", label: "小程序", description: "用户端" },
    { id: "gateway", label: "网关" },
    { id: "auth", label: "认证服务" },
    { id: "db", label: "用户库", description: "MySQL" },
  ]}
  messages={[
    { id: "m1", from: "app", to: "gateway", label: "提交手机号和验证码" },
    { id: "m2", from: "gateway", to: "auth", label: "校验验证码" },
    { id: "m3", from: "auth", to: "db", label: "按手机号查用户" },
    { id: "m4", from: "db", to: "auth", label: "用户记录", kind: "reply" },
    { id: "m5", from: "auth", to: "auth", label: "签发登录令牌" },
    { id: "m6", from: "auth", to: "gateway", label: "令牌", kind: "reply" },
    { id: "m7", from: "gateway", to: "app", label: "登录成功", kind: "reply" },
    { id: "m8", from: "auth", to: "db", label: "写入登录日志", kind: "async" },
  ]}
/>`;

const stepCode = `const [step, setStep] = useState(0);

<SequenceDiagram
  title="手机号登录"
  participants={participants}
  messages={messages}
  autoNumber
  activeId={messages[step].id}
/>
<Button onClick={() => setStep((s) => s + 1)}>下一步</Button>`;

export const sequenceDiagramShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "参与者从左到右排开，消息自上而下。实线实心箭头是同步调用，开口箭头是异步消息，虚线是返回；起点和终点相同时画成回环。",
      code: basicCode,
      render: () => <SequenceDiagram title="手机号登录" participants={participants} messages={messages} />,
    },
    {
      title: "编号与逐步讲解",
      description: "autoNumber 给消息加序号；activeId 高亮当前一步，读屏会读到它是当前步骤。",
      code: stepCode,
      render: () => <StepDemo />,
    },
  ],
  controls: [{ prop: "autoNumber", type: "boolean", defaultValue: false, label: "显示序号" }],
  states: [
    {
      name: "基础",
      render: () => <SequenceDiagram title="手机号登录" participants={participants} messages={messages} />,
    },
    { name: "逐步讲解", render: () => <StepDemo /> },
  ],
  renderWithProps: (p) => (
    <SequenceDiagram
      title="手机号登录"
      participants={participants}
      messages={messages}
      autoNumber={p.autoNumber as boolean}
    />
  ),
  toCode: (p) =>
    `<SequenceDiagram\n  participants={participants}\n  messages={messages}${p.autoNumber ? "\n  autoNumber" : ""}\n/>`,
};
