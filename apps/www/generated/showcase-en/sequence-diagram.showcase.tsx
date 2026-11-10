"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { SequenceDiagram } from "../../../../packages/ui/src/sequence-diagram/sequence-diagram";
import type { SequenceMessage, SequenceParticipant } from "../../../../packages/ui/src/sequence-diagram/sequence-diagram.types";
const participants: SequenceParticipant[] = [
    { id: "app", label: "Mini Program", description: "Customer app" },
    { id: "gateway", label: "Gateway" },
    { id: "auth", label: "Auth service" },
    { id: "db", label: "User DB", description: "MySQL" },
];
const messages: SequenceMessage[] = [
    { id: "m1", from: "app", to: "gateway", label: "Submit phone number and code" },
    { id: "m2", from: "gateway", to: "auth", label: "Verify code" },
    { id: "m3", from: "auth", to: "db", label: "Find user by phone" },
    { id: "m4", from: "db", to: "auth", label: "User record", kind: "reply" },
    { id: "m5", from: "auth", to: "auth", label: "Issue session token" },
    { id: "m6", from: "auth", to: "gateway", label: "Token", kind: "reply" },
    { id: "m7", from: "gateway", to: "app", label: "Signed in", kind: "reply" },
    { id: "m8", from: "auth", to: "db", label: "Write sign-in log", kind: "async" },
];
function StepDemo() {
    const [step, setStep] = useState(0);
    const current = messages[step];
    return (<div className="flex w-full flex-col gap-3">
      <SequenceDiagram title="Phone sign-in" participants={participants} messages={messages} autoNumber activeId={current.id}/>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Previous
        </Button>
        <Button size="sm" variant="outline" disabled={step === messages.length - 1} onClick={() => setStep((s) => s + 1)}>
          Next step
        </Button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {step + 1} / {messages.length} · {current.label}
        </span>
      </div>
    </div>);
}
const basicCode = `<SequenceDiagram
  title="Phone sign-in"
  participants={[
    { id: "app", label: "Mini program", description: "Customer app" },
    { id: "gateway", label: "Gateway" },
    { id: "auth", label: "Auth service" },
    { id: "db", label: "User DB", description: "MySQL" },
  ]}
  messages={[
    { id: "m1", from: "app", to: "gateway", label: "Submit phone number and code" },
    { id: "m2", from: "gateway", to: "auth", label: "Verify code" },
    { id: "m3", from: "auth", to: "db", label: "Find user by phone" },
    { id: "m4", from: "db", to: "auth", label: "User record", kind: "reply" },
    { id: "m5", from: "auth", to: "auth", label: "Issue session token" },
    { id: "m6", from: "auth", to: "gateway", label: "Token", kind: "reply" },
    { id: "m7", from: "gateway", to: "app", label: "Signed in", kind: "reply" },
    { id: "m8", from: "auth", to: "db", label: "Write sign-in log", kind: "async" },
  ]}
/>`;
const stepCode = `const [step, setStep] = useState(0);

<SequenceDiagram
  title="Phone sign-in"
  participants={participants}
  messages={messages}
  autoNumber
  activeId={messages[step].id}
/>
<Button onClick={() => setStep((s) => s + 1)}>Next step</Button>`;
export const sequenceDiagramShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Participants run left to right and messages run top to bottom. A solid line with a filled head is a synchronous call, an open head is an asynchronous message, and a dashed line is a reply. A message that starts and ends on the same participant draws a loop.",
            code: basicCode,
            render: () => <SequenceDiagram title="Phone sign-in" participants={participants} messages={messages}/>,
        },
        {
            title: "Numbering and step-through",
            description: "autoNumber numbers the messages. activeId highlights the current step, and screen readers announce it as the current step.",
            code: stepCode,
            render: () => <StepDemo />,
        },
    ],
    controls: [{ prop: "autoNumber", type: "boolean", defaultValue: false, label: "Show numbers" }],
    states: [
        {
            name: "Basics",
            render: () => <SequenceDiagram title="Phone sign-in" participants={participants} messages={messages}/>,
        },
        { name: "Step-through", render: () => <StepDemo /> },
    ],
    renderWithProps: (p) => (<SequenceDiagram title="Phone sign-in" participants={participants} messages={messages} autoNumber={p.autoNumber as boolean}/>),
    toCode: (p) => `<SequenceDiagram
  participants={participants}
  messages={messages}${p.autoNumber ? "\n  autoNumber" : ""}
/>`,
};
