"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Timeline, TimelineItem } from "../../../../packages/ui/src/timeline/timeline";
import type { TimelineItemProps, TimelineMode } from "../../../../packages/ui/src/timeline/timeline.types";
const CheckIcon = (<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M5 10l3.5 3.5L15 6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>);
const approval: TimelineItemProps[] = [
    { label: "09:12", children: "Employee submits reimbursement application", color: "primary" },
    { label: "10:40", children: "Approved by the direct manager", color: "success" },
    { label: "14:05", children: "Financial review returned (missing invoice)", color: "danger" },
    { label: "16:20", children: "Employee supplements materials and resubmits", color: "warning" },
];
const logistics: TimelineItemProps[] = [
    { label: "06-01 08:00", children: "The package has been collected \u00B7 Hangzhou Transshipment Center", color: "success" },
    { label: "06-01 22:30", children: "In transit \u00B7 Sent to Shanghai", color: "primary" },
    { label: "06-02 09:15", children: "Arrived at Shanghai Pudong delivery point", color: "primary" },
];
export const timelineShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "items array driver, each item label is used as the timestamp, children is used as the text, and color controls the dot tone.",
            code: `<Timeline
  items={[
    { label: "09:12", children: "Employee submits reimbursement application", color: "primary" },
    { label: "10:40", children: "Approved by the direct manager", color: "success" },
    { label: "14:05", children: "Financial review returned (missing invoice)", color: "danger" },
    { label: "16:20", children: "Employee supplements materials and resubmits", color: "warning" },
  ]}
/>`,
            render: () => (<div className="max-w-md">
          <Timeline items={approval}/>
        </div>),
        },
        {
            title: "In progress (pending)",
            description: "pending Append the ongoing ghost item at the end (loading dot + dotted line connected).",
            code: `<Timeline items={logistics} pending="In transit\u00B7Estimated delivery tomorrow" />`,
            render: () => (<div className="max-w-md">
          <Timeline items={logistics} pending="In transit · Estimated delivery tomorrow"/>
        </div>),
        },
        {
            title: "Custom node",
            description: "The compound usage is directly transferred to <TimelineItem>, dot can be replaced by an icon (use currentColor to color with color).",
            code: `<Timeline>
  <TimelineItem label="Step 1" color="success" dot={CheckIcon}>Account registration completed</TimelineItem>
  <TimelineItem label="Step 2" color="success" dot={CheckIcon}>Real-name authentication passed</TimelineItem>
  <TimelineItem label="Step 3" color="primary">Bind the collection account (in progress)</TimelineItem>
</Timeline>`,
            render: () => (<div className="max-w-md">
          <Timeline>
            <TimelineItem label="Step 1" color="success" dot={CheckIcon}>
              Account registration completed
            </TimelineItem>
            <TimelineItem label="Step 2" color="success" dot={CheckIcon}>
              Real-name authentication passed
            </TimelineItem>
            <TimelineItem label="Step 3" color="primary">
              Binding payment account (in progress)
            </TimelineItem>
          </Timeline>
        </div>),
        },
        {
            title: "Layout direction",
            description: "mode Control node location: left (default) / right mirror / alternate left and right.",
            code: `<>
  <Timeline items={logistics} mode="right" />
  <Timeline items={approval} mode="alternate" />
</>`,
            render: () => (<div className="flex flex-col gap-6">
          <div className="max-w-md">
            <Timeline items={logistics} mode="right"/>
          </div>
          <div className="max-w-lg">
            <Timeline items={approval} mode="alternate"/>
          </div>
        </div>),
        },
    ],
    controls: [
        {
            prop: "mode",
            type: "select",
            options: ["left", "right", "alternate"],
            defaultValue: "left",
            label: "Layout direction",
        },
        { prop: "pending", type: "boolean", defaultValue: false, label: "Ending in progress" },
    ],
    states: [
        {
            name: "Approval flow (node on the left, colored tone)",
            render: () => (<div className="max-w-md">
          <Timeline items={approval}/>
        </div>),
        },
        {
            name: "In progress (pending loading state + dotted line connection)",
            render: () => (<div className="max-w-md">
          <Timeline items={logistics} pending="In transit · Estimated delivery tomorrow"/>
        </div>),
        },
        {
            name: "Custom node (icon) + compound usage",
            render: () => (<div className="max-w-md">
          <Timeline>
            <TimelineItem label="Step 1" color="success" dot={CheckIcon}>
              Account registration completed
            </TimelineItem>
            <TimelineItem label="Step 2" color="success" dot={CheckIcon}>
              Real-name authentication passed
            </TimelineItem>
            <TimelineItem label="Step 3" color="primary">
              Binding payment account (in progress)
            </TimelineItem>
          </Timeline>
        </div>),
        },
        {
            name: "Right node (mode=right)",
            render: () => (<div className="max-w-md">
          <Timeline items={logistics} mode="right"/>
        </div>),
        },
        {
            name: "Alternate left and right (mode=alternate)",
            render: () => (<div className="max-w-lg">
          <Timeline items={approval} mode="alternate"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="max-w-md">
      <Timeline items={approval} mode={(p.mode as TimelineMode) ?? "left"} pending={p.pending ? "Pending approval..." : undefined}/>
    </div>),
    toCode: (p) => {
        const mode = p.mode === "left" ? "" : ` mode="${p.mode as string}"`;
        const pending = p.pending ? ` pending="Approval pending..."` : "";
        return `<Timeline items={items}${mode}${pending} />`;
    },
};
