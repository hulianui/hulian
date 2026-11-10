"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { SequenceDiagram } from "./sequence-diagram";
import { validateSequence } from "./sequence-diagram-layout";
import type { SequenceItem, SequenceParticipant } from "./sequence-diagram.types";

// ── 1. 三方登录：同步、异步、返回、注释、自调用各出现一次 ──
const loginParticipants: SequenceParticipant[] = [
  { id: "app", label: "小程序", description: "用户端" },
  { id: "auth", label: "认证服务" },
  { id: "sms", label: "短信服务" },
];

const loginMessages: SequenceItem[] = [
  { id: "m1", from: "app", to: "auth", label: "请求验证码" },
  { id: "m2", from: "auth", to: "sms", label: "发送短信", kind: "async" },
  { id: "n1", type: "note", over: "auth", label: "同一手机号 60 秒内只发一次" },
  { id: "m3", from: "auth", to: "app", label: "已发送", kind: "reply" },
  { id: "m4", from: "app", to: "auth", label: "提交验证码" },
  { id: "m5", from: "auth", to: "auth", label: "签发令牌" },
  { id: "m6", from: "auth", to: "app", label: "登录成功", kind: "reply" },
];

// ── 2. 多参与者往返：下单 → 支付回调 ──
const orderParticipants: SequenceParticipant[] = [
  { id: "web", label: "前端" },
  { id: "order", label: "订单服务" },
  { id: "stock", label: "库存服务" },
  { id: "pay", label: "支付服务" },
  { id: "mq", label: "消息队列" },
];

const orderMessages: SequenceItem[] = [
  { id: "o1", from: "web", to: "order", label: "创建订单" },
  { id: "o2", from: "order", to: "stock", label: "锁定库存" },
  { id: "o3", from: "stock", to: "order", label: "已锁定", kind: "reply" },
  { id: "o4", from: "order", to: "pay", label: "生成支付单" },
  { id: "o5", from: "pay", to: "order", label: "支付链接", kind: "reply" },
  { id: "o6", from: "order", to: "web", label: "订单号与支付链接", kind: "reply" },
  { id: "n1", type: "note", over: ["web", "pay"], label: "用户在支付页完成付款" },
  { id: "o7", from: "pay", to: "order", label: "支付成功回调", kind: "async" },
  { id: "o8", from: "order", to: "stock", label: "扣减库存" },
  { id: "o9", from: "stock", to: "order", label: "已扣减", kind: "reply" },
  { id: "o10", from: "order", to: "mq", label: "发布 order.paid", kind: "async" },
];

// ── 3. 压力：长中英文名称、多行文案、URL 一类不可断的长串 ──
const longParticipants: SequenceParticipant[] = [
  { id: "mini", label: "微信小程序（门店扫码下单入口）", description: "WeChat Mini Program" },
  {
    id: "orch",
    label: "OrderFulfillmentOrchestrationService",
    description: "k8s · ns: fulfillment-prod",
  },
  { id: "carrier", label: "第三方物流平台开放接口网关" },
];

const longMessages: SequenceItem[] = [
  {
    id: "l1",
    from: "mini",
    to: "orch",
    label: "提交订单：12 个商品行、2 张优惠券、配送地址与期望送达时间段，附门店编号用于分账",
  },
  {
    id: "l2",
    from: "orch",
    to: "orch",
    label: "重新计算分单策略：按仓库库存、距离和承运商时效综合打分，拆成 3 个包裹",
  },
  {
    id: "l3",
    from: "orch",
    to: "carrier",
    label: "POST /api/v2/fulfillment/orders/{orderId}/shipments?expand=items,packages,trackingEvents",
  },
  {
    id: "n1",
    type: "note",
    over: ["mini", "carrier"],
    label: "整条履约链路要求 3 秒内返回，超时转入异步补偿任务，由对账服务在 T+1 兜底",
  },
  { id: "l4", from: "carrier", to: "orch", label: "运单号 SF1234567890123 与预计揽收时间", kind: "reply" },
  { id: "l5", from: "carrier", to: "carrier", label: "回写轨迹", kind: "async" },
  { id: "l6", from: "orch", to: "mini", label: "下单成功，展示 3 个包裹的物流信息", kind: "reply" },
];

// ── 4. 空数据与边界 ──
const brokenParticipants: SequenceParticipant[] = [
  { id: "a", label: "客户端" },
  { id: "b", label: "服务端" },
  { id: "a", label: "重复的客户端" },
];

const brokenMessages: SequenceItem[] = [
  { id: "x1", from: "a", to: "b", label: "正常请求" },
  { id: "x2", from: "a", to: "ghost", label: "发给不存在的参与者" },
  { id: "x1", from: "b", to: "a", label: "重复 id 的消息" },
  { id: "x3", from: "b", to: "a", label: "正常返回", kind: "reply" },
];

function Boundaries() {
  const issues = validateSequence(brokenParticipants, brokenMessages);
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h4 className="m-0 text-sm font-medium">没有消息</h4>
        <SequenceDiagram title="没有消息" participants={loginParticipants} messages={[]} />
      </section>
      <section className="flex flex-col gap-2">
        <h4 className="m-0 text-sm font-medium">只有一个参与者</h4>
        <SequenceDiagram
          title="只有一个参与者"
          participants={[{ id: "job", label: "定时任务" }]}
          messages={[
            { id: "s1", from: "job", to: "job", label: "扫描超时订单" },
            { id: "s2", type: "note", over: "job", label: "每 5 分钟一次" },
            { id: "s3", from: "job", to: "job", label: "关闭并释放库存", kind: "async" },
          ]}
        />
      </section>
      <section className="flex flex-col gap-2">
        <h4 className="m-0 text-sm font-medium">无效数据</h4>
        <SequenceDiagram title="无效数据" participants={brokenParticipants} messages={brokenMessages} />
        <ul className="m-0 list-disc pl-5 text-sm text-muted-foreground">
          {issues.map((issue) => (
            <li key={`${issue.code}-${issue.index}`}>
              {issue.code === "duplicate-participant"
                ? `参与者 ${issue.id} 重复，第二个不成列`
                : issue.code === "duplicate-item"
                  ? `消息 ${issue.id} 重复，第二条不画`
                  : `消息 ${issue.id} 引用了不存在的参与者 ${issue.ref}，不画`}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StepDemo() {
  const steps = orderMessages;
  const [step, setStep] = useState(0);
  const current = steps[step];
  return (
    <div className="flex w-full flex-col gap-3">
      <SequenceDiagram
        title="下单与支付回调"
        participants={orderParticipants}
        messages={orderMessages}
        autoNumber
        activeId={current.id}
        minColumnWidth={128}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          上一步
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={step === steps.length - 1}
          onClick={() => setStep((s) => s + 1)}
        >
          下一步
        </Button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {step + 1} / {steps.length} · {current.label}
        </span>
      </div>
    </div>
  );
}

const basicCode = `<SequenceDiagram
  title="短信验证码登录"
  participants={[
    { id: "app", label: "小程序", description: "用户端" },
    { id: "auth", label: "认证服务" },
    { id: "sms", label: "短信服务" },
  ]}
  messages={[
    { id: "m1", from: "app", to: "auth", label: "请求验证码" },
    { id: "m2", from: "auth", to: "sms", label: "发送短信", kind: "async" },
    { id: "n1", type: "note", over: "auth", label: "同一手机号 60 秒内只发一次" },
    { id: "m3", from: "auth", to: "app", label: "已发送", kind: "reply" },
    { id: "m4", from: "app", to: "auth", label: "提交验证码" },
    { id: "m5", from: "auth", to: "auth", label: "签发令牌" },
    { id: "m6", from: "auth", to: "app", label: "登录成功", kind: "reply" },
  ]}
/>`;

const stepCode = `const [step, setStep] = useState(0);

<SequenceDiagram
  title="下单与支付回调"
  participants={participants}
  messages={[
    // …
    { id: "n1", type: "note", over: ["web", "pay"], label: "用户在支付页完成付款" },
    { id: "o7", from: "pay", to: "order", label: "支付成功回调", kind: "async" },
    // …
  ]}
  autoNumber
  activeId={messages[step].id}
  minColumnWidth={128}
/>
<Button onClick={() => setStep((s) => s + 1)}>下一步</Button>`;

const longCode = `<SequenceDiagram
  participants={[
    { id: "mini", label: "微信小程序（门店扫码下单入口）" },
    { id: "orch", label: "OrderFulfillmentOrchestrationService" },
    { id: "carrier", label: "第三方物流平台开放接口网关" },
  ]}
  messages={[
    { id: "l3", from: "orch", to: "carrier", label: "POST /api/v2/fulfillment/orders/{orderId}/shipments?expand=…" },
    { id: "n1", type: "note", over: ["mini", "carrier"], label: "整条履约链路要求 3 秒内返回…" },
    // …
  ]}
/>`;

const boundaryCode = `<SequenceDiagram participants={participants} messages={[]} />

const issues = validateSequence(participants, messages);
// [{ code: "duplicate-participant", index: 2, id: "a" },
//  { code: "unknown-participant", index: 1, id: "x2", ref: "ghost" },
//  { code: "duplicate-item", index: 2, id: "x1" }]`;

export const sequenceDiagramShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "参与者从左到右排开，消息自上而下，数组顺序就是时间顺序。实线实心箭头是同步调用，实线开口箭头是异步消息，虚线开口箭头是返回；起点和终点相同时画成回环。注释和消息排在同一条时间轴上。",
      code: basicCode,
      render: () => (
        <SequenceDiagram title="短信验证码登录" participants={loginParticipants} messages={loginMessages} />
      ),
    },
    {
      title: "多参与者往返与逐步讲解",
      description:
        "五个服务之间来回调用，minColumnWidth 调到 128 让五列在桌面上放得下。autoNumber 给消息加序号（注释不编号）；activeId 高亮当前一步，读屏会读到它是当前步骤。over 传两个参与者时，注释横跨这两条生命线。",
      code: stepCode,
      render: () => <StepDemo />,
    },
    {
      title: "长名称与多行文案",
      description:
        "名称和文案按列宽换行、撑高所在的行，不截断也不缩小字号；不带空格的长英文和 URL 也会断开。列放不下时整张图在自己的区域里横向滚动，此时它可以用 Tab 聚焦、用方向键滚动。",
      code: longCode,
      render: () => <SequenceDiagram title="门店下单履约" participants={longParticipants} messages={longMessages} />,
    },
    {
      title: "空数据与边界",
      description:
        "没有消息时显示空态。重复的参与者 id、重复的消息 id、引用不存在的参与者，这些项都不画，开发环境会在控制台告警；用 validateSequence 可以拿到明细显示在图外。",
      code: boundaryCode,
      render: () => <Boundaries />,
    },
  ],
  controls: [{ prop: "autoNumber", type: "boolean", defaultValue: false, label: "显示序号" }],
  states: [
    {
      name: "基础",
      render: () => (
        <SequenceDiagram title="短信验证码登录" participants={loginParticipants} messages={loginMessages} />
      ),
    },
    { name: "逐步讲解", render: () => <StepDemo /> },
    {
      name: "长文案",
      render: () => <SequenceDiagram title="门店下单履约" participants={longParticipants} messages={longMessages} />,
    },
    { name: "空数据与边界", render: () => <Boundaries /> },
  ],
  renderWithProps: (p) => (
    <SequenceDiagram
      title="短信验证码登录"
      participants={loginParticipants}
      messages={loginMessages}
      autoNumber={p.autoNumber as boolean}
    />
  ),
  toCode: (p) =>
    `<SequenceDiagram\n  participants={participants}\n  messages={messages}${p.autoNumber ? "\n  autoNumber" : ""}\n/>`,
};
