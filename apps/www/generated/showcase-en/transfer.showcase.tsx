"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Transfer } from "../../../../packages/ui/src/transfer/transfer";
import type { TransferItem } from "../../../../packages/ui/src/transfer/transfer.types";
const modules: TransferItem[] = [
    { key: "dashboard", label: "Data dashboard", description: "Overview of real-time operating indicators" },
    { key: "orders", label: "Order Management", description: "Order / Refund / After-sales" },
    { key: "goods", label: "Product Center", description: "Shelves and inventory" },
    { key: "members", label: "Member Management", description: "Level/Points/Tag" },
    { key: "coupon", label: "Marketing Campaign", description: "Coupons and discounts" },
    { key: "finance", label: "Financial Reconciliation", description: "Logistics and Settlement Statement" },
    { key: "logistics", label: "Logistics and distribution", description: "Waybill and delivery area" },
    { key: "review", label: "Evaluation Management", description: "Buyer comments and replies" },
    { key: "report", label: "Operating Statement", description: "Sales / Repeat Purchase / Funnel" },
    { key: "staff", label: "Employees and Permissions", description: "Roles and sub-accounts" },
    { key: "message", label: "Message notification", description: "Site letter and SMS template" },
    { key: "legacy", label: "Old version of the ticket (discontinued)", description: "Freeze after migrating to new work order", disabled: true },
];
function Demo({ searchable = false, disabled = false }: {
    searchable?: boolean;
    disabled?: boolean;
}) {
    const [target, setTarget] = useState<string[]>(["dashboard", "orders", "goods"]);
    return (<Transfer dataSource={modules} targetKeys={target} onChange={setTarget} searchable={searchable} searchPlaceholder="Search module name" disabled={disabled} titles={["All functional modules", "Authorized"]}/>);
}
export const transferShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "After checking the left item, use the middle arrow to move in/out (\u203A/\u2039 to move selected, \u00BB/\u00AB all). When not controlled, use defaultTargetKeys to set the initial selection.",
            code: `<Transfer
  dataSource={modules}
  defaultTargetKeys={["dashboard", "orders", "goods"]}
  titles={["All function modules", "Authorized"]}
  onChange={(target) => save(target)}
/>`,
            render: () => (<Transfer dataSource={modules} defaultTargetKeys={["dashboard", "orders", "goods"]} titles={["All functional modules", "Authorized"]}/>),
        },
        {
            title: "Searchable",
            description: "searchable Place a search box at the top of each side panel. Enter and filter by label.",
            code: `<Transfer
  dataSource={modules}
  defaultTargetKeys={["dashboard"]}
  searchable
  searchPlaceholder="Search module name"
  titles={["All function modules", "Authorized"]}
/>`,
            render: () => (<Transfer dataSource={modules} defaultTargetKeys={["dashboard"]} searchable searchPlaceholder="Search module name" titles={["All functional modules", "Authorized"]}/>),
        },
        {
            title: "Disabled overall",
            description: "disabled makes the list and move buttons on both sides invalid.",
            code: `<Transfer dataSource={modules} defaultTargetKeys={["dashboard", "orders"]} disabled />`,
            render: () => (<Transfer dataSource={modules} defaultTargetKeys={["dashboard", "orders"]} disabled titles={["All functional modules", "Authorized"]}/>),
        },
    ],
    controls: [
        { prop: "searchable", type: "boolean", defaultValue: false },
        { prop: "disabled", type: "boolean", defaultValue: false },
    ],
    states: [
        { name: "Permission allocation (check and use the middle arrow to move in/out, \u203A/\u2039 to move selected, \u00BB/\u00AB all)", render: () => <Demo /> },
        { name: "Searchable (with search boxes on both sides, enter \"Management\" to filter out multiple modules)", render: () => <Demo searchable/> },
        { name: "Overall disabled (lists and buttons are all disabled)", render: () => <Demo disabled/> },
    ],
    renderWithProps: (p) => <Demo searchable={Boolean(p.searchable)} disabled={Boolean(p.disabled)}/>,
    toCode: (p) => `<Transfer
  dataSource={modules}
  targetKeys={target}
  onChange={setTarget}
  titles={["All function modules", "Authorized"]}${p.searchable ? "\n  searchable" : ""}${p.disabled ? "\n  disabled" : ""}
/>`,
};
