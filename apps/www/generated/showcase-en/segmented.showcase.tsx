"use client";
import { useState } from "react";
import { LayoutGrid, List, Map } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Tag } from "../../../../packages/ui/src/tag/tag";
import { Segmented } from "../../../../packages/ui/src/segmented/segmented";
import type { SegmentedItem } from "../../../../packages/ui/src/segmented/segmented.types";
const periodItems: SegmentedItem[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
];
function Demo(p: Record<string, unknown>) {
    const [v, setV] = useState("week");
    return (<Segmented items={periodItems} value={v} onValueChange={setV} size={(p.size as "sm" | "md") ?? "md"} disabled={p.disabled as boolean} aria-label="Cycle"/>);
}
export const segmentedShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in the items array, defaultValue sets the initial selection segment, and the slider transitions smoothly.",
            code: `<Segmented
  items={[
    { value: "day", label: "Day" },
    { value: "week", label: "week" },
    { value: "month", label: "month" },
  ]}
  defaultValue="week"
  aria-label="Period"
/>`,
            render: () => <Segmented items={periodItems} defaultValue="week" aria-label="Cycle"/>,
        },
        {
            title: "Icon segment",
            description: "label ariaLabel Provides accessible names when using icons.",
            code: `<Segmented
  items={[
    { value: "grid", ariaLabel: "Grid View", label: <LayoutGrid className="size-4" /> },
    { value: "list", ariaLabel: "List view", label: <List className="size-4" /> },
    { value: "map", ariaLabel: "Map View", label: <Map className="size-4" /> },
  ]}
  defaultValue="grid"
  aria-label="View"
/>`,
            render: () => (<Segmented items={[
                    { value: "grid", ariaLabel: "Grid View", label: <LayoutGrid className="size-4"/> },
                    { value: "list", ariaLabel: "List view", label: <List className="size-4"/> },
                    { value: "map", ariaLabel: "Map view", label: <Map className="size-4"/> },
                ]} defaultValue="grid" aria-label="View"/>),
        },
        {
            title: "Logo within paragraph",
            description: "label can be placed in rich nodes, such as embedding a discount Tag in the billing cycle.",
            code: `<Segmented
  items={[
    { value: "monthly", label: "Monthly payment" },
    {
      value: "yearly",
      ariaLabel: "Pay annually and save 2 months",
      label: (
        <>
          Paid annually
          <Tag variant="soft" tone="success" size="sm">Save 2 months</Tag>
        </>
      ),
    },
  ]}
  defaultValue="monthly"
  aria-label="Billing cycle"
/>`,
            render: () => (<Segmented items={[
                    { value: "monthly", label: "Pay monthly" },
                    {
                        value: "yearly",
                        ariaLabel: "Pay annually and save 2 months",
                        label: (<>
                  Paid annually
                  <Tag variant="soft" tone="success" size="sm">
                    Save 2 months
                  </Tag>
                </>),
                    },
                ]} defaultValue="monthly" aria-label="Billing cycle"/>),
        },
        {
            title: "Size",
            description: "size=\"sm\" is used for compact scenes such as toolbars.",
            code: `<>
  <Segmented size="sm" items={periodItems} defaultValue="day" aria-label="Period-Small" />
  <Segmented items={periodItems} defaultValue="day" aria-label="Cycle-Medium" />
</>`,
            render: () => (<div className="flex items-center gap-3">
          <Segmented size="sm" items={periodItems} defaultValue="day" aria-label="Cycle-Small"/>
          <Segmented items={periodItems} defaultValue="day" aria-label="Cycle-Medium"/>
        </div>),
        },
        {
            title: "Disabled",
            description: "Single segment disabled skips this item; overall disabled disables all.",
            code: `<>
  <Segmented
    items={[
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
      { value: "c", label: "C" },
    ]}
    defaultValue="a"
    aria-label="Example"
  />
  <Segmented items={periodItems} defaultValue="week" disabled aria-label="Period" />
</>`,
            render: () => (<div className="flex items-center gap-3">
          <Segmented items={[
                    { value: "a", label: "A" },
                    { value: "b", label: "B", disabled: true },
                    { value: "c", label: "C" },
                ]} defaultValue="a" aria-label="Example"/>
          <Segmented items={periodItems} defaultValue="week" disabled aria-label="Cycle"/>
        </div>),
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
        { prop: "disabled", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "default",
            render: () => <Segmented items={periodItems} defaultValue="week" aria-label="Cycle"/>,
        },
        {
            name: "two-options",
            render: () => (<Segmented items={[
                    { value: "off", label: "Close" },
                    { value: "on", label: "Turn on" },
                ]} defaultValue="on" aria-label="Switch"/>),
        },
        {
            name: "with-icon",
            render: () => (<Segmented items={[
                    { value: "grid", ariaLabel: "Grid View", label: <LayoutGrid className="size-4"/> },
                    { value: "list", ariaLabel: "List view", label: <List className="size-4"/> },
                    { value: "map", ariaLabel: "Map view", label: <Map className="size-4"/> },
                ]} defaultValue="grid" aria-label="View"/>),
        },
        {
            name: "with-badge",
            render: () => (<Segmented items={[
                    { value: "monthly", label: "Pay monthly" },
                    {
                        value: "yearly",
                        ariaLabel: "Pay annually and save 2 months",
                        label: (<>
                  Paid annually
                  <Tag variant="soft" tone="success" size="sm">
                    Save 2 months
                  </Tag>
                </>),
                    },
                ]} defaultValue="monthly" aria-label="Billing cycle"/>),
        },
        {
            name: "size-sm",
            render: () => <Segmented size="sm" items={periodItems} defaultValue="day" aria-label="Cycle"/>,
        },
        {
            name: "disabled-item",
            render: () => (<Segmented items={[
                    { value: "a", label: "A" },
                    { value: "b", label: "B", disabled: true },
                    { value: "c", label: "C" },
                ]} defaultValue="a" aria-label="Example"/>),
        },
        {
            name: "disabled",
            render: () => (<Segmented items={periodItems} defaultValue="week" disabled aria-label="Cycle"/>),
        },
    ],
    renderWithProps: (p) => <Demo {...p}/>,
    toCode: (p) => `<Segmented
  items={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "month" }]}
  defaultValue="week"${p.size && p.size !== "md" ? `
  size="${p.size}"` : ""}${p.disabled ? "\n  disabled" : ""}
/>`,
};
