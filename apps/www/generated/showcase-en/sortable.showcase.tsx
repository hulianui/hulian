"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Sortable } from "../../../../packages/ui/src/sortable/sortable";
interface Field {
    id: string;
    label: string;
    hint: string;
}
const initialFields: Field[] = [
    { id: "order-no", label: "Order number", hint: "Unique identifier" },
    { id: "customer", label: "Customer Name", hint: "From customer master data" },
    { id: "amount", label: "Order amount", hint: "Tax included" },
    { id: "status", label: "Order status", hint: "Enumeration" },
    { id: "owner", label: "Person in charge", hint: "Current follower" },
    { id: "created-at", label: "Creation time", hint: "Sortable" },
];
function ColumnSettingDemo({ handle = true }: {
    handle?: boolean;
}) {
    const [fields, setFields] = useState(initialFields);
    return (<div className="w-80">
      <p className="mb-2 text-xs text-muted-foreground">Drag to adjust column order (grab Space after handle dragging/focus on the handle·Move with direction keys·Put down Space)</p>
      <Sortable items={fields} onChange={setFields} handle={handle} renderItem={(f) => (<div className="flex items-center justify-between gap-3">
            <span className="font-medium text-foreground">{f.label}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{f.hint}</span>
          </div>)}/>
      <p className="mt-2 truncate text-xs text-muted-foreground">Current order:{fields.map((f) => f.label).join(" \u2192 ")}</p>
    </div>);
}
interface Question {
    id: string;
    title: string;
    score: number;
}
const initialQuestions: Question[] = [
    { id: "q1", title: "Your overall satisfaction with this service", score: 20 },
    { id: "q2", title: "Is the door-to-door staff on time?", score: 15 },
    { id: "q3", title: "Is the problem solved at once?", score: 25 },
];
function QuestionSortDemo() {
    const [list, setList] = useState(initialQuestions);
    return (<div className="w-96">
      <p className="mb-2 text-xs text-muted-foreground">There are input boxes and buttons in the row: dragging them will not trigger sorting, dragging the blank space will sort it.</p>
      <Sortable items={list} onChange={setList} renderItem={(q, { index }) => (<div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted-foreground">No. {index + 1} Question</span>
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">{q.title}</span>
            <input type="number" value={q.score} aria-label={`No. ${index + 1} Question points`} onChange={(e) => setList((prev) => prev.map((it) => (it.id === q.id ? { ...it, score: Number(e.target.value) } : it)))} className="w-16 shrink-0 rounded-[var(--radius)] border border-border bg-surface px-2 py-1 text-xs"/>
            <button type="button" aria-label={`Delete the ${index + 1} Question`} onClick={() => setList((prev) => prev.filter((it) => it.id !== q.id))} className="shrink-0 rounded px-2 py-1 text-xs text-muted-foreground hover:text-danger">
              Delete
            </button>
          </div>)}/>
    </div>);
}
interface Tag {
    id: string;
    name: string;
}
const initialTags: Tag[] = [
    { id: "t1", name: "Pending" },
    { id: "t2", name: "Ongoing" },
    { id: "t3", name: "Completed" },
    { id: "t4", name: "Archived" },
];
function TagSortDemo() {
    const [tags, setTags] = useState(initialTags);
    return (<div className="max-w-md">
      <p className="mb-2 text-xs text-muted-foreground">Horizontal drag and drop sorting (kanban column/filter label)</p>
      <Sortable items={tags} orientation="horizontal" onChange={setTags} renderItem={(t) => <span className="font-medium text-foreground">{t.name}</span>}/>
    </div>);
}
export const sortableShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Column settings \u00B7 Handle drag (vertical)",
            description: "Controlled items + onChange takes back the new sequence; when handle is used, only the left handle can be dragged and the keyboard can be reached.",
            code: `const [fields, setFields] = useState(initialFields);

<Sortable
  items={fields}
  onChange={setFields}
  handle
  renderItem={(f) => (
    <div className="flex items-center justify-between gap-3">
      <span className="font-medium text-foreground">{f.label}</span>
      <span className="shrink-0 text-xs text-muted-foreground">{f.hint}</span>
    </div>
  )}
/>`,
            render: () => <ColumnSettingDemo handle/>,
        },
        {
            title: "The entire item can be dragged (no handle)",
            description: "When handle={false}, the entire row can be dragged, which is suitable for simple lists with no interactive elements in the row.",
            code: `const [fields, setFields] = useState(initialFields);

<Sortable
  items={fields}
  onChange={setFields}
  renderItem={(f) => <span className="font-medium text-foreground">{f.label}</span>}
/>`,
            render: () => <ColumnSettingDemo handle={false}/>,
        },
        {
            title: "Inline interactive element + serial number (state.index)",
            description: "When the entire item can be dragged, input/button in the line will not be hijacked by dragging (the guard is built in the sensor layer, no need to set handle); state.index directly gives the subscript, which is used for \"Question N\" and the unique aria-label.",
            code: `<Sortable
  items={list}
  onChange={setList}
  renderItem={(q, { index }) => (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-xs text-muted-foreground">Question {index + 1}</span>
      <span className="min-w-0 flex-1 truncate">{q.title}</span>
      {/* The input box can be dragged to select text and the button can be clicked, but it will not trigger sorting */}
      <input type="number" value={q.score} aria-label={\`\${index + 1} question score\`} onChange={...} />
      <button type="button" aria-label={\`Delete question \${index + 1}\`} onClick={...}>Delete</button>
    </div>
  )}
/>`,
            render: () => <QuestionSortDemo />,
        },
        {
            title: "Horizontal sorting (orientation)",
            description: "orientation=\"horizontal\" arranged horizontally, suitable for Kanban columns/filter tags.",
            code: `const [tags, setTags] = useState(initialTags);

<Sortable
  items={tags}
  orientation="horizontal"
  onChange={setTags}
  renderItem={(t) => <span className="font-medium text-foreground">{t.name}</span>}
/>`,
            render: () => <TagSortDemo />,
        },
    ],
    controls: [{ prop: "handle", type: "boolean", defaultValue: true, label: "Only the handle can be dragged" }],
    states: [
        { name: "Column settings \u00B7 Handle drag (vertical \u00B7 Keyboard reachable)", render: () => <ColumnSettingDemo handle/> },
        { name: "The entire item can be dragged (no handle)", render: () => <ColumnSettingDemo handle={false}/> },
        { name: "Inline interactive elements do not hijack drag + sequence number (state.index)", render: () => <QuestionSortDemo /> },
        { name: "Horizontal sorting (kanban column/label)", render: () => <TagSortDemo /> },
    ],
    renderWithProps: (p) => <ColumnSettingDemo handle={Boolean(p.handle)}/>,
    toCode: (p) => [
        "const [items, setItems] = useState(fields);",
        "",
        "<Sortable",
        "  items={items}",
        "  onChange={setItems}",
        `  handle={${Boolean(p.handle)}}`,
        "  renderItem={(f) => <span>{f.label}</span>}",
        "/>",
    ].join("\n"),
};
