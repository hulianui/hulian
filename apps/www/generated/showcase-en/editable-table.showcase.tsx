"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Tag } from "../../../../packages/ui/src/tag";
import { EditableTable } from "../../../../packages/ui/src/editable-table/editable-table";
import type { EditableColumn } from "../../../../packages/ui/src/editable-table/editable-table.types";
interface Row {
    id: number;
    name: string;
    role: "admin" | "editor" | "viewer";
    salary: number;
}
const ROLE_LABEL: Record<Row["role"], string> = { admin: "Administrator", editor: "Edit", viewer: "Guest" };
function Demo() {
    const [data, setData] = useState<Row[]>([
        { id: 1, name: "Zhang San", role: "admin", salary: 24000 },
        { id: 2, name: "Li Si", role: "editor", salary: 16000 },
        { id: 3, name: "Wang Wu", role: "viewer", salary: 12000 },
    ]);
    let seq = data.length;
    const columns: EditableColumn<Row>[] = [
        { key: "name", title: "Name", editable: true, width: 160 },
        {
            key: "role",
            title: "Role",
            editable: true,
            render: (v) => <Tag tone="brand">{ROLE_LABEL[v as Row["role"]]}</Tag>,
            editor: (value, onChange) => (<select value={value as string} onChange={(e) => onChange(e.target.value)} aria-label="role" className="h-9 w-full rounded-[var(--radius)] border border-border bg-surface px-2 text-sm text-foreground outline-none focus:border-primary">
          {Object.entries(ROLE_LABEL).map(([k, label]) => (<option key={k} value={k}>
              {label}
            </option>))}
        </select>),
        },
        {
            key: "salary",
            title: "Monthly salary",
            editable: true,
            align: "right",
            render: (v) => `\u00A5${Number(v).toLocaleString()}`,
            editor: (value, onChange) => (<input type="number" value={value as number} onChange={(e) => onChange(Number(e.target.value))} aria-label="salary" className="h-9 w-28 rounded-[var(--radius)] border border-border bg-surface px-2 text-sm text-foreground outline-none focus:border-primary"/>),
        },
    ];
    return (<div className="w-full max-w-2xl">
      <EditableTable<Row> columns={columns} data={data} rowKey={(r) => String(r.id)} onChange={setData} deletable addable newRow={() => ({ id: ++seq + Date.now(), name: "", role: "viewer", salary: 0 })}/>
    </div>);
}
export const editableTableShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Inline editing \u00B7 Add and delete lines",
            description: "Click the editable column to enter the editing state, editor customizes the cell editor (drop-down/number); addable + newRow adds rows, deletable deletes rows; onChange returns complete new data.",
            code: `const [data, setData] = useState(rows);
const columns: EditableColumn<Row>[] = [
  { key: "name", title: "Name", editable: true, width: 160 },
  {
    key: "role", title: "Character", editable: true,
    render: (v) => <Tag tone="brand">{ROLE_LABEL[v]}</Tag>,
    editor: (value, onChange) => (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {/* options\u2026 */}
      </select>
    ),
  },
  {
    key: "salary", title: "Monthly salary", editable: true, align: "right",
    render: (v) => \`\u00A5\${Number(v).toLocaleString()}\`,
    editor: (value, onChange) => (
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    ),
  },
];

<EditableTable
  columns={columns}
  data={data}
  rowKey={(r) => String(r.id)}
  onChange={setData}
  deletable
  addable
  newRow={() => ({ id: nextId(), name: "", role: "viewer", salary: 0 })}
/>`,
            render: () => <Demo />,
        },
    ],
    controls: [],
    states: [{ name: "Inline editing \u00B7 Custom editor \u00B7 Add and delete lines", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `const [data, setData] = useState(rows);
const columns: EditableColumn<Row>[] = [
  { key: "name", title: "Name", editable: true },
  { key: "salary", title: "Monthly salary", editable: true, align: "right",
    render: (v) => \`\u00A5\${v}\`, editor: (v, onChange) => <input ... /> },
];

<EditableTable
  columns={columns}
  data={data}
  rowKey={(r) => String(r.id)}
  onChange={setData}
  deletable addable
  newRow={() => ({ id: nextId(), name: "", salary: 0 })}
/>`,
};
