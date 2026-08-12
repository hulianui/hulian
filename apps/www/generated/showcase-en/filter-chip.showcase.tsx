"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FilterChip, FilterChipGroup } from "../../../../packages/ui/src/filter-chip/filter-chip";
type Condition = {
    id: string;
    subject: string;
    operator?: string;
    value: string;
};
const initial: Condition[] = [
    { id: "status", subject: "Status", operator: "is any of", value: "2 selected" },
    { id: "owner", subject: "Person in charge", value: "Zhang San" },
    { id: "due", subject: "Due date", operator: "before", value: "2026-09-01" },
];
function FilterBar() {
    const [items, setItems] = useState(initial);
    return (<div className="space-y-2">
      <FilterChipGroup onClearAll={() => setItems([])}>
        {items.map((c) => (<FilterChip key={c.id} subject={c.subject} operator={c.operator} value={c.value} onRemove={() => setItems((s) => s.filter((x) => x.id !== c.id))}/>))}
      </FilterChipGroup>
      {items.length === 0 && (<span className="text-sm text-muted-foreground">No filters applied</span>)}
    </div>);
}
function StackedValue() {
    return (<span className="flex items-center">
      <span className="flex size-4 items-center justify-center rounded-full bg-primary/15 text-[9px] text-primary ring-1 ring-surface">
        Ann
      </span>
      <span className="-ml-1 flex size-4 items-center justify-center rounded-full bg-success/15 text-[9px] text-success ring-1 ring-surface">
        Bob
      </span>
      <span className="ml-1">2 people selected</span>
    </span>);
}
export const filterChipShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Three segments",
            description: "Subject | operator | value, split by vertical dividers; the subject is the heaviest and the operator one step lighter. The trailing remove button shows up only when onRemove is passed.",
            code: `<FilterChip
  subject="Status"
  operator="is any of"
  value="2 selected"
  onRemove={() => remove("status")}
/>`,
            render: () => (<FilterChip subject="Status" operator="is any of" value="2 selected" onRemove={() => { }}/>),
        },
        {
            title: "Omitting the operator falls back to two segments",
            description: "Conditions that carry only a subject and a value leave out operator, and the pill drops that column instead of keeping an empty one.",
            code: `<FilterChip subject="Person in charge" value="Zhang San" onRemove={remove} />`,
            render: () => (<div className="flex flex-wrap items-center gap-2">
          <FilterChip subject="Person in charge" value="Zhang San" onRemove={() => { }}/>
          <FilterChip subject="Priority" value="Urgent" onRemove={() => { }}/>
        </div>),
        },
        {
            title: "Rich value nodes",
            description: "value takes a ReactNode: stacked avatars, status icons, and an \"N selected\" summary all go straight in.",
            code: `<FilterChip
  subject="Members"
  operator="includes"
  value={
    <>
      <StackedAvatars users={users} />
      <span>2 people selected</span>
    </>
  }
  onRemove={remove}
/>`,
            render: () => (<FilterChip subject="Members" operator="includes" value={<StackedValue />} onRemove={() => { }}/>),
        },
        {
            title: "A clickable body reopens the filter menu",
            description: "With onClick the body turns into a button that reopens the matching filter menu. The remove button is its sibling rather than its descendant, so clicking the X never fires onClick and you never write stopPropagation yourself.",
            code: `<FilterChip
  subject="Status"
  operator="is any of"
  value="2 selected"
  onClick={() => openFilterMenu("status")}
  onRemove={() => remove("status")}
/>`,
            render: () => (<FilterChip subject="Status" operator="is any of" value="2 selected" onClick={() => { }} onRemove={() => { }}/>),
        },
        {
            title: "Row layout and clear all",
            description: "FilterChipGroup owns the wrapping layout, the trailing clear-all button, and the accessible name of the group; the whole row renders nothing once no condition is left.",
            code: `<FilterChipGroup onClearAll={() => setItems([])}>
  {items.map((c) => (
    <FilterChip
      key={c.id}
      subject={c.subject}
      operator={c.operator}
      value={c.value}
      onRemove={() => remove(c.id)}
    />
  ))}
</FilterChipGroup>`,
            render: () => <FilterBar />,
        },
        {
            title: "Size and disabled",
            description: "size changes height, font size, and segment padding only, never the structure; isDisabled turns off the body and the remove button together.",
            code: `<>
  <FilterChip size="sm" subject="Status" value="Ongoing" onRemove={remove} />
  <FilterChip subject="Status" value="Ongoing" onRemove={remove} />
  <FilterChip isDisabled subject="Status" value="Ongoing" onRemove={remove} />
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-2">
          <FilterChip size="sm" subject="Status" value="Ongoing" onRemove={() => { }}/>
          <FilterChip subject="Status" value="Ongoing" onRemove={() => { }}/>
          <FilterChip isDisabled subject="Status" value="Ongoing" onRemove={() => { }}/>
        </div>),
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
        { prop: "operator", type: "text", defaultValue: "is any of" },
    ],
    states: [
        {
            name: "3 segments",
            render: () => (<FilterChip subject="Status" operator="is any of" value="2 selected" onRemove={() => { }}/>),
        },
        {
            name: "2 segments",
            render: () => <FilterChip subject="Person in charge" value="Zhang San" onRemove={() => { }}/>,
        },
        {
            name: "Clickable body",
            render: () => (<FilterChip subject="Status" operator="is" value="Ongoing" onClick={() => { }} onRemove={() => { }}/>),
        },
        {
            name: "No remove button",
            render: () => <FilterChip subject="Status" operator="is" value="Ongoing"/>,
        },
        {
            name: "sm",
            render: () => (<FilterChip size="sm" subject="Status" operator="is" value="Ongoing" onRemove={() => { }}/>),
        },
        {
            name: "Disabled",
            render: () => (<FilterChip isDisabled subject="Status" operator="is" value="Ongoing" onRemove={() => { }}/>),
        },
        {
            name: "Rich value",
            render: () => (<FilterChip subject="Members" operator="includes" value={<StackedValue />} onRemove={() => { }}/>),
        },
        { name: "Grouped", render: () => <FilterBar /> },
    ],
    renderWithProps: (p) => (<FilterChip size={(p.size as "sm" | "md") ?? "md"} subject="Status" operator={(p.operator as string) || undefined} value="2 selected" onRemove={() => { }}/>),
    toCode: (p) => `<FilterChip${p.size && p.size !== "md" ? ` size="${p.size}"` : ""} subject="Status"${p.operator ? ` operator="${p.operator}"` : ""} value="2 selected" onRemove={remove} />`,
};
