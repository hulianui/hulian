"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CellEditor } from "../../../../packages/ui/src/cell-editor/cell-editor";
interface Field {
    key: string;
    label: string;
    value: string;
    multiline?: boolean;
}
const INITIAL_FIELDS: Field[] = [
    { key: "name", label: "Customer Name", value: "Hangzhou Yunshu Technology Co., Ltd." },
    { key: "contact", label: "Contact", value: "" },
    { key: "phone", label: "Phone", value: "0571-8888 6120" },
    { key: "address", label: "Billing address", value: "", multiline: true },
    {
        key: "remark",
        label: "Remarks",
        value: "Quarterly reconciliation confirmed\nThe invoice title follows the business license",
        multiline: true,
    },
];
const isBlank = (value: string) => value.trim().length === 0;
function CommitLog({ entries }: {
    entries: string[];
}) {
    return (<div className="rounded-[var(--radius)] border border-border bg-subtle p-3 text-xs">
      <p className="mb-1 font-medium text-foreground">Commit log</p>
      {entries.length === 0 ? (<p className="text-muted-foreground">
          Nothing committed yet. Clicking in, looking, and clicking away sends no request; only a value that really changed does.
        </p>) : (<ul className="space-y-0.5 text-muted-foreground">
          {entries.map((entry, index) => (<li key={`${entry}-${String(index)}`}>{entry}</li>))}
        </ul>)}
    </div>);
}
function BasicDemo() {
    const [value, setValue] = useState("Hangzhou Yunshu Technology Co., Ltd.");
    const [log, setLog] = useState<string[]>([]);
    return (<div className="w-full max-w-md space-y-3">
      <div className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
        <CellEditor aria-label="Customer Name" value={value} placeholder="Not filled in" onCommit={(next) => {
            setValue(next);
            setLog((prev) => [...prev, `Committed: ${next}`]);
        }}/>
      </div>
      <CommitLog entries={log}/>
    </div>);
}
function TableDemo() {
    const [fields, setFields] = useState(INITIAL_FIELDS);
    const [log, setLog] = useState<string[]>([]);
    return (<div className="w-full max-w-2xl space-y-3">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="w-32 px-3 py-2 font-medium">Field</th>
            <th className="px-3 py-2 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (<tr key={field.key} className="border-b border-border align-top">
              <th scope="row" className="px-3 py-2 text-left font-normal text-muted-foreground">
                {field.label}
              </th>
              <td className="px-3 py-2">
                <CellEditor aria-label={field.label} value={field.value} multiline={field.multiline} missing={isBlank(field.value)} placeholder="Not filled in" onCommit={(next) => {
                setFields((prev) => prev.map((item) => item.key === field.key ? { ...item, value: next } : item));
                setLog((prev) => [...prev, `${field.label} \u2192 ${next.trim() || "(cleared)"}`]);
            }}/>
              </td>
            </tr>))}
        </tbody>
      </table>
      <CommitLog entries={log}/>
    </div>);
}
function AsyncDemo() {
    const [value, setValue] = useState("0571-8888 6120");
    const [saved, setSaved] = useState<string | null>(null);
    return (<div className="w-full max-w-md space-y-2">
      <div className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
        <CellEditor aria-label="Phone" value={value} placeholder="Not filled in" onCommit={async (next) => {
            await new Promise((resolve) => setTimeout(resolve, 900));
            setValue(next);
            setSaved(next);
        }}/>
      </div>
      <p className="text-xs text-muted-foreground">
        {saved === null ? "Change one character and blur: this cell disables itself for the 0.9 seconds the request is in flight." : `Saved: ${saved}`}
      </p>
    </div>);
}
function PlaygroundCell({ initial, missing, multiline, disabled, placeholder, }: {
    initial: string;
    missing: boolean;
    multiline: boolean;
    disabled: boolean;
    placeholder: string;
}) {
    const [value, setValue] = useState(initial);
    return (<div className="w-72 rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
      <CellEditor aria-label="Cell" value={value} missing={missing} multiline={multiline} disabled={disabled} placeholder={placeholder} onCommit={setValue}/>
    </div>);
}
export const cellEditorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "At rest it is just a run of text in the table; the tinted background and underline only appear on focus. Blur or Enter commits, Esc rolls back to the value from before the edit, and an unchanged value never reaches onCommit.",
            code: `const [value, setValue] = useState("Hangzhou Yunshu Technology Co., Ltd.");

<CellEditor
  value={value}
  placeholder="Not filled in"
  onCommit={(next) => setValue(next)}
/>`,
            render: () => <BasicDemo />,
        },
        {
            title: "Review table \u00B7 missing and multiline",
            description: "The home ground of review workflows: missing dims an empty field to muted italics so the gaps are obvious at a glance, and multiline lets long text grow through CSS field-sizing instead of measuring in JS.",
            code: `<CellEditor
  value={field.value}
  multiline={field.multiline}
  missing={field.value.trim() === ""}
  placeholder="Not filled in"
  onCommit={(next) => save(field.key, next)}
/>`,
            render: () => <TableDemo />,
        },
        {
            title: "Async commit",
            description: "When onCommit returns a Promise the cell enters its own pending state and disables itself, so the consumer does not have to pass a saving flag.",
            code: `<CellEditor
  value={value}
  onCommit={async (next) => {
    await api.patch(id, { phone: next });
    setValue(next);
  }}
/>`,
            render: () => <AsyncDemo />,
        },
    ],
    controls: [
        { prop: "value", type: "text", defaultValue: "Hangzhou Yunshu Technology Co., Ltd.", label: "Value" },
        { prop: "placeholder", type: "text", defaultValue: "Not filled in", label: "Placeholder copywriting" },
        { prop: "missing", type: "boolean", defaultValue: false, label: "Missing" },
        { prop: "multiline", type: "boolean", defaultValue: false, label: "Multiline" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
    ],
    states: [
        { name: "Default", render: () => <BasicDemo /> },
        { name: "Review table \u00B7 missing and multiline", render: () => <TableDemo /> },
        { name: "Async commit", render: () => <AsyncDemo /> },
    ],
    renderWithProps: (props) => {
        const initial = String(props.value ?? "Hangzhou Yunshu Technology Co., Ltd.");
        const placeholder = String(props.placeholder ?? "Not filled in");
        return (<PlaygroundCell key={`${initial}-${placeholder}`} initial={initial} placeholder={placeholder} missing={Boolean(props.missing)} multiline={Boolean(props.multiline)} disabled={Boolean(props.disabled)}/>);
    },
    toCode: (props) => `<CellEditor
  value={value}
  placeholder="${String(props.placeholder ?? "Not filled in")}"${props.missing ? "\n  missing" : ""}${props.multiline ? "\n  multiline" : ""}${props.disabled ? "\n  disabled" : ""}
  onCommit={(next) => setValue(next)}
/>`,
};
