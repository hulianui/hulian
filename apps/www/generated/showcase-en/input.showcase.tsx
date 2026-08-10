"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Table } from "../../../../packages/ui/src/table";
import type { ColumnDef } from "../../../../packages/ui/src/table/table.types";
import { Input } from "../../../../packages/ui/src/input/input";
interface SeedRow {
    id: string;
    field: string;
    value: string;
}
const seedRows: SeedRow[] = [
    { id: "r1", field: "customer_name", value: "Guangyunjia Home Services" },
    { id: "r2", field: "contact_phone", value: "13800000000" },
    { id: "r3", field: "service_city", value: "Guangzhou" },
];
const cellColumns: ColumnDef<SeedRow, any>[] = [
    { accessorKey: "field", header: "Field name", size: 160 },
    {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => (<Input variant="cell" defaultValue={row.original.value} aria-label={row.original.field} placeholder="Empty"/>),
    },
];
export const inputShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "A minimal input; use placeholder for empty-state guidance.",
            code: `<Input placeholder="Please enter..." className="w-64" />`,
            render: () => <Input placeholder="Please enter..." className="w-64"/>,
        },
        {
            title: "Prefix and suffix",
            description: "prefix / suffix slots embed units, currency symbols, etc.",
            code: `<Input prefix="\u00A5" suffix=".00" placeholder="0" className="w-64" />`,
            render: () => <Input prefix="¥" suffix=".00" placeholder="0" className="w-64"/>,
        },
        {
            title: "Size",
            description: "size provides three levels of sm / md (default) / lg.",
            code: `<>
  <Input size="sm" placeholder="sm" className="w-64" />
  <Input size="md" placeholder="md" className="w-64" />
  <Input size="lg" placeholder="lg" className="w-64" />
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <Input size="sm" placeholder="sm" className="w-64"/>
          <Input size="md" placeholder="md" className="w-64"/>
          <Input size="lg" placeholder="lg" className="w-64"/>
        </div>),
        },
        {
            title: "Inline cell editing",
            description: "variant=\"cell\" strips the shell (no border, transparent background, zero padding, no fixed row height) and swaps the focus ring for a tinted background plus an inset underline, because a ring spills over into the neighbouring cell. The call site needs no className at all.",
            code: `const columns: ColumnDef<SeedRow, any>[] = [
  { accessorKey: "field", header: "Field name", size: 160 },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => (
      <Input variant="cell" defaultValue={row.original.value} aria-label={row.original.field} placeholder="Empty" />
    ),
  },
];

<Table columns={columns} data={rows} density="compact" />`,
            render: () => <Table columns={cellColumns} data={seedRows} density="compact"/>,
        },
        {
            title: "Invalid state",
            description: "invalid marked with red border and focus ring (manual transmission when used independently).",
            code: `<Input invalid defaultValue="Wrong value" className="w-64" />`,
            render: () => <Input invalid defaultValue="Wrong value" className="w-64"/>,
        },
        {
            title: "Disabled",
            description: "disabled Reduce transparency and block interaction.",
            code: `<Input disabled defaultValue="Disabled" className="w-64" />`,
            render: () => <Input disabled defaultValue="Disabled" className="w-64"/>,
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "placeholder", type: "text", defaultValue: "Please enter...", label: "Placeholder" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
    ],
    states: [
        { name: "default", render: () => <Input placeholder="Please enter..." className="w-64"/> },
        { name: "Prefix and suffix", render: () => <Input prefix="¥" suffix=".00" placeholder="0" className="w-64"/> },
        { name: "invalid", render: () => <Input invalid defaultValue="Wrong value" className="w-64"/> },
        { name: "disabled", render: () => <Input disabled defaultValue="Disabled" className="w-64"/> },
        { name: "sm", render: () => <Input size="sm" placeholder="sm" className="w-64"/> },
        { name: "lg", render: () => <Input size="lg" placeholder="lg" className="w-64"/> },
        {
            name: "cell",
            render: () => <Input variant="cell" defaultValue="Edit in place" className="w-40"/>,
        },
    ],
    renderWithProps: (p) => (<Input size={p.size as "sm" | "md" | "lg"} placeholder={p.placeholder as string} invalid={p.invalid as boolean} disabled={p.disabled as boolean} className="w-64"/>),
    toCode: (p) => `<Input size="${p.size}" placeholder="${p.placeholder}"${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""} />`,
};
