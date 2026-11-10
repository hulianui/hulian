"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { SequenceDiagram } from "../../../../packages/ui/src/sequence-diagram/sequence-diagram";
import { validateSequence } from "../../../../packages/ui/src/sequence-diagram/sequence-diagram-layout";
import type { SequenceItem, SequenceParticipant } from "../../../../packages/ui/src/sequence-diagram/sequence-diagram.types";
const loginParticipants: SequenceParticipant[] = [
    { id: "app", label: "Mini Program", description: "Customer app" },
    { id: "auth", label: "Auth service" },
    { id: "sms", label: "SMS service" },
];
const loginMessages: SequenceItem[] = [
    { id: "m1", from: "app", to: "auth", label: "Request code" },
    { id: "m2", from: "auth", to: "sms", label: "Send SMS", kind: "async" },
    { id: "n1", type: "note", over: "auth", label: "One code per number per 60 s" },
    { id: "m3", from: "auth", to: "app", label: "Sent", kind: "reply" },
    { id: "m4", from: "app", to: "auth", label: "Submit code" },
    { id: "m5", from: "auth", to: "auth", label: "Issue token" },
    { id: "m6", from: "auth", to: "app", label: "Signed in", kind: "reply" },
];
const orderParticipants: SequenceParticipant[] = [
    { id: "web", label: "Frontend" },
    { id: "order", label: "Order service" },
    { id: "stock", label: "Inventory service" },
    { id: "pay", label: "Payment service" },
    { id: "mq", label: "Message queue" },
];
const orderMessages: SequenceItem[] = [
    { id: "o1", from: "web", to: "order", label: "Create order" },
    { id: "o2", from: "order", to: "stock", label: "Reserve stock" },
    { id: "o3", from: "stock", to: "order", label: "Reserved", kind: "reply" },
    { id: "o4", from: "order", to: "pay", label: "Create payment" },
    { id: "o5", from: "pay", to: "order", label: "Payment link", kind: "reply" },
    { id: "o6", from: "order", to: "web", label: "Order number and payment link", kind: "reply" },
    { id: "n1", type: "note", over: ["web", "pay"], label: "The user pays on the payment page" },
    { id: "o7", from: "pay", to: "order", label: "Payment succeeded callback", kind: "async" },
    { id: "o8", from: "order", to: "stock", label: "Deduct stock" },
    { id: "o9", from: "stock", to: "order", label: "Deducted", kind: "reply" },
    { id: "o10", from: "order", to: "mq", label: "Publish order.paid", kind: "async" },
];
const longParticipants: SequenceParticipant[] = [
    { id: "mini", label: "WeChat mini program (in-store scan-to-order entry)", description: "WeChat Mini Program" },
    {
        id: "orch",
        label: "OrderFulfillmentOrchestrationService",
        description: "k8s \u00B7 ns: fulfillment-prod",
    },
    { id: "carrier", label: "Third-party logistics platform open API gateway" },
];
const longMessages: SequenceItem[] = [
    {
        id: "l1",
        from: "mini",
        to: "orch",
        label: "Submit order: 12 line items, 2 coupons, a delivery address and a preferred delivery window, plus the store number for revenue split",
    },
    {
        id: "l2",
        from: "orch",
        to: "orch",
        label: "Recalculate the split strategy: score warehouses by stock, distance and carrier speed, then split into 3 parcels",
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
        label: "The whole fulfillment chain must answer within 3 seconds; on timeout it falls back to an async compensation job, and reconciliation settles it on T+1",
    },
    { id: "l4", from: "carrier", to: "orch", label: "Waybill SF1234567890123 and estimated pickup time", kind: "reply" },
    { id: "l5", from: "carrier", to: "carrier", label: "Write back tracking", kind: "async" },
    { id: "l6", from: "orch", to: "mini", label: "Order placed; show tracking for 3 parcels", kind: "reply" },
];
const brokenParticipants: SequenceParticipant[] = [
    { id: "a", label: "Client" },
    { id: "b", label: "Server" },
    { id: "a", label: "Duplicate client" },
];
const brokenMessages: SequenceItem[] = [
    { id: "x1", from: "a", to: "b", label: "Valid request" },
    { id: "x2", from: "a", to: "ghost", label: "Sent to a missing participant" },
    { id: "x1", from: "b", to: "a", label: "Message with a duplicate id" },
    { id: "x3", from: "b", to: "a", label: "Valid reply", kind: "reply" },
];
function Boundaries() {
    const issues = validateSequence(brokenParticipants, brokenMessages);
    return (<div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h4 className="m-0 text-sm font-medium">No messages</h4>
        <SequenceDiagram title="No messages" participants={loginParticipants} messages={[]}/>
      </section>
      <section className="flex flex-col gap-2">
        <h4 className="m-0 text-sm font-medium">A single participant</h4>
        <SequenceDiagram title="A single participant" participants={[{ id: "job", label: "Scheduled job" }]} messages={[
            { id: "s1", from: "job", to: "job", label: "Scan expired orders" },
            { id: "s2", type: "note", over: "job", label: "Every 5 minutes" },
            { id: "s3", from: "job", to: "job", label: "Close and release stock", kind: "async" },
        ]}/>
      </section>
      <section className="flex flex-col gap-2">
        <h4 className="m-0 text-sm font-medium">Invalid data</h4>
        <SequenceDiagram title="Invalid data" participants={brokenParticipants} messages={brokenMessages}/>
        <ul className="m-0 list-disc pl-5 text-sm text-muted-foreground">
          {issues.map((issue) => (<li key={`${issue.code}-${issue.index}`}>
              {issue.code === "duplicate-participant"
                ? `Participant ${issue.id} is repeated; the second one gets no column`
                : issue.code === "duplicate-item"
                    ? `Message ${issue.id} is repeated; the second one is not drawn`
                    : `Message ${issue.id} points to missing participant ${issue.ref}; not drawn`}
            </li>))}
        </ul>
      </section>
    </div>);
}
function StepDemo() {
    const steps = orderMessages;
    const [step, setStep] = useState(0);
    const current = steps[step];
    return (<div className="flex w-full flex-col gap-3">
      <SequenceDiagram title="Order and payment callback" participants={orderParticipants} messages={orderMessages} autoNumber activeId={current.id} minColumnWidth={128}/>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Previous
        </Button>
        <Button size="sm" variant="outline" disabled={step === steps.length - 1} onClick={() => setStep((s) => s + 1)}>
          Next step
        </Button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {step + 1} / {steps.length} · {current.label}
        </span>
      </div>
    </div>);
}
const basicCode = `<SequenceDiagram
  title="SMS code sign-in"
  participants={[
    { id: "app", label: "Mini program", description: "Customer app" },
    { id: "auth", label: "Auth service" },
    { id: "sms", label: "SMS service" },
  ]}
  messages={[
    { id: "m1", from: "app", to: "auth", label: "Request code" },
    { id: "m2", from: "auth", to: "sms", label: "Send SMS", kind: "async" },
    { id: "n1", type: "note", over: "auth", label: "One code per number per 60 s" },
    { id: "m3", from: "auth", to: "app", label: "Sent", kind: "reply" },
    { id: "m4", from: "app", to: "auth", label: "Submit code" },
    { id: "m5", from: "auth", to: "auth", label: "Issue token" },
    { id: "m6", from: "auth", to: "app", label: "Signed in", kind: "reply" },
  ]}
/>`;
const stepCode = `const [step, setStep] = useState(0);

<SequenceDiagram
  title="Order and payment callback"
  participants={participants}
  messages={[
    // \u2026
    { id: "n1", type: "note", over: ["web", "pay"], label: "The user pays on the payment page" },
    { id: "o7", from: "pay", to: "order", label: "Payment succeeded callback", kind: "async" },
    // \u2026
  ]}
  autoNumber
  activeId={messages[step].id}
  minColumnWidth={128}
/>
<Button onClick={() => setStep((s) => s + 1)}>Next step</Button>`;
const longCode = `<SequenceDiagram
  participants={[
    { id: "mini", label: "WeChat mini program (in-store scan-to-order entry)" },
    { id: "orch", label: "OrderFulfillmentOrchestrationService" },
    { id: "carrier", label: "Third-party logistics platform open API gateway" },
  ]}
  messages={[
    { id: "l3", from: "orch", to: "carrier", label: "POST /api/v2/fulfillment/orders/{orderId}/shipments?expand=\u2026" },
    { id: "n1", type: "note", over: ["mini", "carrier"], label: "The whole fulfillment chain must answer within 3 seconds\u2026" },
    // \u2026
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
            title: "Basic usage",
            description: "Participants run left to right and messages run top to bottom; array order is time order. A solid line with a filled head is a synchronous call, a solid line with an open head is an asynchronous message, and a dashed line with an open head is a reply. A message that starts and ends on the same participant draws a loop. Notes share the same timeline as messages.",
            code: basicCode,
            render: () => (<SequenceDiagram title="SMS code sign-in" participants={loginParticipants} messages={loginMessages}/>),
        },
        {
            title: "Round trips across services, step by step",
            description: "Five services call back and forth; minColumnWidth is lowered to 128 so five columns fit on desktop. autoNumber numbers the messages (notes are not numbered). activeId highlights the current step, and screen readers announce it as the current step. When over names two participants, the note spans both lifelines.",
            code: stepCode,
            render: () => <StepDemo />,
        },
        {
            title: "Long names and multi-line text",
            description: "Names and text wrap to the column width and grow their row, with no truncation and no smaller font. Long words and URL strings without spaces break too. When the columns do not fit, the figure scrolls horizontally inside its own area; it can then take Tab focus and scroll with the arrow keys.",
            code: longCode,
            render: () => <SequenceDiagram title="In-store order fulfillment" participants={longParticipants} messages={longMessages}/>,
        },
        {
            title: "Empty data and edge cases",
            description: "With no messages the figure shows an empty state. Items with a repeated participant id, a repeated message id, or a reference to a missing participant are not drawn, and development builds warn in the console. validateSequence returns the details so you can show them outside the figure.",
            code: boundaryCode,
            render: () => <Boundaries />,
        },
    ],
    controls: [{ prop: "autoNumber", type: "boolean", defaultValue: false, label: "Show numbers" }],
    states: [
        {
            name: "Basics",
            render: () => (<SequenceDiagram title="SMS code sign-in" participants={loginParticipants} messages={loginMessages}/>),
        },
        { name: "Step-through", render: () => <StepDemo /> },
        {
            name: "Long copy",
            render: () => <SequenceDiagram title="In-store order fulfillment" participants={longParticipants} messages={longMessages}/>,
        },
        { name: "Empty data and edge cases", render: () => <Boundaries /> },
    ],
    renderWithProps: (p) => (<SequenceDiagram title="SMS code sign-in" participants={loginParticipants} messages={loginMessages} autoNumber={p.autoNumber as boolean}/>),
    toCode: (p) => `<SequenceDiagram
  participants={participants}
  messages={messages}${p.autoNumber ? "\n  autoNumber" : ""}
/>`,
};
