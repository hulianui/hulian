"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Tag } from "../tag";
import { EditableTable } from "./editable-table";
import type { EditableColumn } from "./editable-table.types";

interface Row {
  id: number;
  name: string;
  role: "admin" | "editor" | "viewer";
  salary: number;
}

const ROLE_LABEL: Record<Row["role"], string> = { admin: "管理员", editor: "编辑", viewer: "访客" };

function Demo() {
  const [data, setData] = useState<Row[]>([
    { id: 1, name: "张三", role: "admin", salary: 24000 },
    { id: 2, name: "李四", role: "editor", salary: 16000 },
    { id: 3, name: "王五", role: "viewer", salary: 12000 },
  ]);
  let seq = data.length;

  const columns: EditableColumn<Row>[] = [
    { key: "name", title: "姓名", editable: true, width: 160 },
    {
      key: "role",
      title: "角色",
      editable: true,
      render: (v) => <Tag tone="brand">{ROLE_LABEL[v as Row["role"]]}</Tag>,
      editor: (value, onChange) => (
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          aria-label="role"
          className="h-9 w-full rounded-[var(--radius)] border border-border bg-surface px-2 text-sm text-foreground outline-none focus:border-primary"
        >
          {Object.entries(ROLE_LABEL).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "salary",
      title: "月薪",
      editable: true,
      align: "right",
      render: (v) => `¥${Number(v).toLocaleString()}`,
      editor: (value, onChange) => (
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="salary"
          className="h-9 w-28 rounded-[var(--radius)] border border-border bg-surface px-2 text-sm text-foreground outline-none focus:border-primary"
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-2xl">
      <EditableTable<Row>
        columns={columns}
        data={data}
        rowKey={(r) => String(r.id)}
        onChange={setData}
        deletable
        addable
        newRow={() => ({ id: ++seq + Date.now(), name: "", role: "viewer", salary: 0 })}
      />
    </div>
  );
}

export const editableTableShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "行内编辑 · 增删行",
      description:
        "editable 列点击进入编辑态，editor 自定义单元格编辑器（下拉/数字）；addable + newRow 增行、deletable 删行；onChange 回传完整新数据。",
      code: `const [data, setData] = useState(rows);
const columns: EditableColumn<Row>[] = [
  { key: "name", title: "姓名", editable: true, width: 160 },
  {
    key: "role", title: "角色", editable: true,
    render: (v) => <Tag tone="brand">{ROLE_LABEL[v]}</Tag>,
    editor: (value, onChange) => (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {/* options… */}
      </select>
    ),
  },
  {
    key: "salary", title: "月薪", editable: true, align: "right",
    render: (v) => \`¥\${Number(v).toLocaleString()}\`,
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
  states: [{ name: "行内编辑 · 自定义编辑器 · 增删行", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `const [data, setData] = useState(rows);
const columns: EditableColumn<Row>[] = [
  { key: "name", title: "姓名", editable: true },
  { key: "salary", title: "月薪", editable: true, align: "right",
    render: (v) => \`¥\${v}\`, editor: (v, onChange) => <input ... /> },
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
