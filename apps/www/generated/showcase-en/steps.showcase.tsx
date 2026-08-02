"use client";
import { useState } from "react";
import { Button } from "../../../../packages/ui/src/button";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Steps } from "../../../../packages/ui/src/steps/steps";
import type { StepsItem } from "../../../../packages/ui/src/steps/steps.types";
const ORDER: StepsItem[] = [
    { title: "Submit application", description: "Fill in the reimbursement document" },
    { title: "Department Approval", description: "Amount reviewed by supervisor" },
    { title: "Financial payment", description: "Corporate transfer" },
    { title: "Complete", description: "Archived and closed" },
];
function Interactive() {
    const [current, setCurrent] = useState(1);
    return (<div className="flex w-full max-w-xl flex-col gap-5">
      <Steps items={ORDER} current={current} onChange={setCurrent}/>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          Previous
        </Button>
        <Button size="sm" disabled={current === ORDER.length - 1} onClick={() => setCurrent((c) => c + 1)}>
          Next step
        </Button>
      </div>
    </div>);
}
export const stepsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "items provides a title/description and current specifies the current step - previous steps are automatically marked as complete.",
            code: `const items = [
  { title: "Submit application", description: "Fill in reimbursement document" },
  { title: "Department Approval", description: "Supervisor Review Amount" },
  { title: "Financial transfer", description: "Business transfer" },
  { title: "Complete", description: "Archive and close" },
];

<Steps items={items} current={1} />`,
            render: () => (<div className="w-full max-w-xl">
          <Steps items={ORDER} current={1}/>
        </div>),
        },
        {
            title: "Error status",
            description: "status=\"error\" Mark the current step in red, indicating that the step failed to verify or was rejected.",
            code: `<Steps items={items} current={2} status="error" />`,
            render: () => (<div className="w-full max-w-xl">
          <Steps items={ORDER} current={2} status="error"/>
        </div>),
        },
        {
            title: "Vertical orientation",
            description: "direction=\"vertical\" Arrange vertically, suitable for side rails or narrow containers.",
            code: `<Steps direction="vertical" items={items} current={2} />`,
            render: () => (<div className="w-full max-w-md">
          <Steps direction="vertical" items={ORDER} current={2}/>
        </div>),
        },
        {
            title: "Small size",
            description: "size=\"sm\" Tighten the indicator and text, suitable for dense middle and backend layout.",
            code: `<Steps size="sm" items={items} current={1} />`,
            render: () => (<div className="w-full max-w-lg">
          <Steps size="sm" items={ORDER} current={1}/>
        </div>),
        },
        {
            title: "Clickable + Controlled",
            description: "After inputting onChange, each step can be clicked, and cooperate with useState to realize the previous/next step navigation.",
            code: `function Wizard() {
  const [current, setCurrent] = useState(1);
  return (
    <div className="flex flex-col gap-5">
      <Steps items={items} current={current} onChange={setCurrent} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}> Previous </Button>
        <Button size="sm" disabled={current === items.length - 1}
          onClick={() => setCurrent((c) => c + 1)}>Next </Button>
      </div>
    </div>
  );
}`,
            render: () => <Interactive />,
        },
    ],
    controls: [
        { prop: "current", type: "number", defaultValue: 1 },
        { prop: "direction", type: "select", options: ["horizontal", "vertical"], defaultValue: "horizontal" },
        { prop: "status", type: "select", options: ["process", "finish", "error"], defaultValue: "process" },
        { prop: "size", type: "select", options: ["md", "sm"], defaultValue: "md" },
    ],
    states: [
        {
            name: "Level (in progress)",
            render: () => (<div className="w-full max-w-xl">
          <Steps items={ORDER} current={1}/>
        </div>),
        },
        {
            name: "Error status",
            render: () => (<div className="w-full max-w-xl">
          <Steps items={ORDER} current={2} status="error"/>
        </div>),
        },
        {
            name: "Vertical",
            render: () => (<div className="w-full max-w-md">
          <Steps direction="vertical" items={ORDER} current={2}/>
        </div>),
        },
        {
            name: "Small size",
            render: () => (<div className="w-full max-w-lg">
          <Steps size="sm" items={ORDER} current={1}/>
        </div>),
        },
        {
            name: "Clickable + Controlled",
            render: () => <Interactive />,
        },
    ],
    renderWithProps: (p) => (<div className={(p.direction as string) === "vertical" ? "w-full max-w-xs" : "w-full max-w-xl"}>
      <Steps items={ORDER} current={Number(p.current ?? 1)} direction={(p.direction as "horizontal" | "vertical") ?? "horizontal"} status={(p.status as "process" | "finish" | "error") ?? "process"} size={(p.size as "md" | "sm") ?? "md"}/>
    </div>),
    toCode: (p) => `<Steps
  current={${Number(p.current ?? 1)}}${p.direction && p.direction !== "horizontal" ? `
  direction="${p.direction}"` : ""}${p.status && p.status !== "process" ? `
  status="${p.status}"` : ""}${p.size && p.size !== "md" ? `
  size="${p.size}"` : ""}
  items={[
    { title: "Submit application", description: "Fill in reimbursement document" },
    { title: "Department Approval", description: "Supervisor Review Amount" },
    { title: "Financial transfer", description: "Business transfer" },
    { title: "Complete", description: "Archive and close" },
  ]}
/>`,
};
