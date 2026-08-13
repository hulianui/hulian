"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RowActions } from "../../../../packages/ui/src/row-actions/row-actions";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { RowActionItem } from "../../../../packages/ui/src/row-actions/row-actions.types";
const ROWS = [
    { id: "IV-2026-0431", customer: "Yan'an Department Store", amount: "\u00A5 128,400", status: "Invoiced" },
    { id: "IV-2026-0432", customer: "Guangyun Home Services", amount: "\u00A5 32,000", status: "Pending invoice" },
];
const basic: RowActionItem[] = [
    { key: "view", label: "View", tone: "brand" },
    { key: "edit", label: "Edit" },
    { key: "del", label: "Delete", tone: "danger", confirm: { title: "Delete this record?" } },
];
function Table({ actionsOf }: {
    actionsOf: (row: (typeof ROWS)[number]) => RowActionItem[];
}) {
    return (<table className="w-full text-sm">
      <thead className="text-muted-foreground">
        <tr className="border-b border-border">
          <th className="py-2 text-left font-medium">Invoice no.</th>
          <th className="py-2 text-left font-medium">Customers</th>
          <th className="py-2 text-right font-medium">Amount</th>
          <th className="py-2 text-left font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (<tr key={row.id} className="border-b border-hairline">
            <td className="py-2">{row.id}</td>
            <td className="py-2">{row.customer}</td>
            <td className="py-2 text-right tabular-nums">{row.amount}</td>
            <td className="py-2">
              <RowActions actions={actionsOf(row)}/>
            </td>
          </tr>))}
      </tbody>
    </table>);
}
const PLAYGROUND: RowActionItem[] = [
    { key: "view", label: "View", tone: "brand" },
    { key: "edit", label: "Edit" },
    { key: "copy", label: "Copy invoice no." },
    { key: "export", label: "Export PDF" },
    { key: "void", label: "Void", tone: "danger", confirm: { title: "Void this invoice?" } },
];
export const rowActionsShowcase: ShowcaseSpec = {
    controls: [
        { prop: "variant", type: "select", options: ["text", "icon"], defaultValue: "text", label: "Form" },
        { prop: "max", type: "number", defaultValue: 3, label: "Max visible" },
    ],
    states: [
        {
            name: "Text form (default)",
            render: () => (<div className="w-full max-w-2xl">
          <Table actionsOf={() => basic}/>
        </div>),
        },
        {
            name: "Overflow menu (more actions than max)",
            render: () => (<div className="w-full max-w-2xl">
          <Table actionsOf={() => PLAYGROUND}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-full max-w-2xl">
      <RowActions actions={p.variant === "icon"
            ? PLAYGROUND.map((a, i) => ({
                ...a,
                icon: [<Eye key="a" className="size-4" aria-hidden/>, <Pencil key="b" className="size-4" aria-hidden/>, <Trash2 key="c" className="size-4" aria-hidden/>][i % 3],
            }))
            : PLAYGROUND} variant={p.variant === "icon" ? "icon" : "text"} max={typeof p.max === "number" ? p.max : 3}/>
    </div>),
    toCode: (p) => [
        "<RowActions",
        p.variant === "icon" ? "  variant=\"icon\"" : null,
        `  max={${typeof p.max === "number" ? p.max : 3}}`,
        "  actions={actions}",
        "/>",
    ]
        .filter(Boolean)
        .join("\n"),
    examples: [
        {
            title: "Basics: primary, regular, destructive",
            description: "Hierarchy comes from tone: brand for the primary action, danger for destructive ones, neutral for the rest. Destructive actions get a confirm step.",
            code: `<RowActions
  actions={[
    { key: "view", label: "View", tone: "brand", onSelect: () => {} },
    { key: "edit", label: "Edit", onSelect: () => {} },
    { key: "del", label: "Delete", tone: "danger", confirm: { title: "Delete this record?" }, onSelect: () => {} },
  ]}
/>`,
            render: () => (<div className="w-full max-w-2xl">
          <Table actionsOf={() => basic}/>
        </div>),
        },
        {
            title: "Overflow collapses into a menu past max",
            description: "The first max - 1 actions stay visible and the rest move into the overflow menu; destructive actions sit last behind a separator so a slipped click cannot land on them.",
            code: `<RowActions
  max={3}
  actions={[
    { key: "view", label: "View" },
    { key: "edit", label: "Edit" },
    { key: "copy", label: "Copy invoice no." },
    { key: "export", label: "Export PDF" },
    { key: "void", label: "Void", tone: "danger", confirm: { title: "Void this invoice?" } },
  ]}
/>`,
            render: () => (<div className="w-full max-w-2xl">
          <Table actionsOf={() => [
                    { key: "view", label: "View" },
                    { key: "edit", label: "Edit" },
                    { key: "copy", label: "Copy invoice no." },
                    { key: "export", label: "Export PDF" },
                    {
                        key: "void",
                        label: "Void",
                        tone: "danger",
                        confirm: { title: "Void this invoice?", description: "Voiding cannot be undone; a new invoice has to be issued." },
                    },
                ]}/>
        </div>),
        },
        {
            title: "Icon form (dense tables)",
            description: "variant=icon saves horizontal space; label becomes the accessible name and the tooltip, and the button carries no visible text.",
            code: `<RowActions
  variant="icon"
  actions={[
    { key: "view", label: "View", icon: <Eye className="size-4" /> },
    { key: "edit", label: "Edit", icon: <Pencil className="size-4" /> },
    { key: "del", label: "Delete", tone: "danger", icon: <Trash2 className="size-4" />, confirm: { title: "Confirm deletion?" } },
  ]}
/>`,
            render: () => (<div className="w-full max-w-2xl">
          <Table actionsOf={() => [
                    { key: "view", label: "View", icon: <Eye className="size-4" aria-hidden/> },
                    { key: "edit", label: "Edit", icon: <Pencil className="size-4" aria-hidden/> },
                    {
                        key: "del",
                        label: "Delete",
                        tone: "danger",
                        icon: <Trash2 className="size-4" aria-hidden/>,
                        confirm: { title: "Delete this record?" },
                    },
                ]}/>
        </div>),
        },
        {
            title: "A disabled action has to say why",
            description: "A greyed-out button cannot explain itself. disabledReason shows on hover or focus, and sits right after the name once the action collapses into the menu.",
            code: `<RowActions
  actions={[
    { key: "view", label: "View" },
    { key: "del", label: "Delete", tone: "danger", disabled: true, disabledReason: "Invoiced rows cannot be deleted" },
  ]}
/>`,
            render: () => (<div className="w-full max-w-2xl">
          <Table actionsOf={(row) => [
                    { key: "view", label: "View" },
                    {
                        key: "del",
                        label: "Delete",
                        tone: "danger",
                        disabled: row.status === "Invoiced",
                        disabledReason: "Invoiced rows cannot be deleted",
                        confirm: { title: "Delete this record?" },
                    },
                ]}/>
        </div>),
        },
    ],
};
