"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { demoImage } from "../../../../packages/ui/src/lib/demo-image";
import { Table } from "../../../../packages/ui/src/table/table";
import type { ColumnDef } from "../../../../packages/ui/src/table/table.types";
export interface DemoUser {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
}
const SURNAME = ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Zhao", "Yellow", "Week", "Wu", "Xu", "Sun", "Horse", "Zhu", "Hu", "Guo", "Ho", "High", "Lin", "Zheng"];
const GIVEN = ["Wei", "Min", "Jing", "Li", "Strong", "Lei", "Military", "Foreign", "Yong", "Yan", "Jay", "Juan", "Tao", "Ming", "Super", "Xia", "Flat", "Just", "Guiying", "Xiulan"];
const ROLES = ["Administrator", "Edit", "Guest"];
function makeUsers(count: number): DemoUser[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `u${(i + 1).toString().padStart(4, "0")}`,
        name: SURNAME[i % SURNAME.length] + GIVEN[(i * 7 + 3) % GIVEN.length],
        email: `user${i + 1}@hulian.dev`,
        role: ROLES[i % ROLES.length],
        avatar: demoImage(`user-${i}`, 64, 64),
    }));
}
const users = makeUsers(8);
const manyUsers = makeUsers(200);
const columns: ColumnDef<DemoUser, any>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (<span className="flex items-center gap-2">

        <img src={row.original.avatar} alt="" className="size-6 rounded-full bg-surface-hover"/>
        {row.original.name}
      </span>),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>,
    },
    { accessorKey: "role", header: "Role" },
];
function SelectionDemo() {
    return <Table columns={columns} data={users} enableRowSelection/>;
}
const filterColumns: ColumnDef<DemoUser, any>[] = [
    { ...columns[0], meta: { filterable: true } },
    { ...columns[1], meta: { filterable: true } },
    columns[2],
];
function FilterDemo() {
    return <Table columns={filterColumns} data={users}/>;
}
const stickyColumns: ColumnDef<DemoUser, any>[] = [
    { ...columns[0], size: 200, meta: { sticky: "left" } },
    { accessorKey: "email", header: "Email", size: 280, cell: columns[1].cell },
    { accessorKey: "role", header: "Role", size: 160 },
    { accessorKey: "id", header: "ID", size: 320, cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span> },
    {
        id: "actions",
        header: "Actions",
        size: 120,
        meta: { sticky: "right" },
        cell: () => <button type="button" className="text-primary hover:underline">Edit</button>,
    },
];
function StickyDemo() {
    return <Table columns={stickyColumns} data={users}/>;
}
const geometryColumns: ColumnDef<DemoUser, any>[] = [
    { accessorKey: "name", header: "Name", size: 120 },
    {
        accessorKey: "email",
        header: "Email",
        size: 180,
        meta: { ellipsis: true },
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span>,
    },
    { accessorKey: "role", header: "Role", size: 100, meta: { align: "center" } },
    {
        accessorKey: "id",
        header: "No.",
        size: 120,
        meta: { align: "right", headerAlign: "right" },
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{getValue() as string}</span>,
    },
];
function GeometryDemo() {
    return <Table columns={geometryColumns} data={users.slice(0, 5)}/>;
}
function ResizableDemo() {
    return <Table columns={geometryColumns} data={users.slice(0, 5)} resizable/>;
}
const resizableStickyColumns: ColumnDef<DemoUser, any>[] = [
    { ...columns[0], size: 180, meta: { sticky: "left" } },
    { accessorKey: "email", header: "Email", size: 260, meta: { ellipsis: true }, cell: columns[1].cell },
    { accessorKey: "role", header: "Role", size: 140, meta: { align: "center" } },
    { accessorKey: "id", header: "No.", size: 260 },
    {
        id: "actions",
        header: "Actions",
        size: 100,
        meta: { sticky: "right", align: "center", headerAlign: "center" },
        cell: () => <button type="button" className="text-primary hover:underline">Edit</button>,
    },
];
function ResizableStickyDemo() {
    return <Table columns={resizableStickyColumns} data={users.slice(0, 5)} resizable/>;
}
function ExpandableDemo() {
    return (<Table columns={columns} data={users} renderExpandedRow={(row) => (<div className="text-sm text-muted-foreground">
          <div>User ID:{row.original.id}</div>
          <div>Email:{row.original.email}</div>
        </div>)}/>);
}
interface OrgNode {
    name: string;
    title: string;
    reports?: OrgNode[];
}
const org: OrgNode[] = [
    {
        name: "Mr. Lin",
        title: "CEO",
        reports: [
            { name: "Manager Wang", title: "Engineering Director", reports: [{ name: "Xiao Li", title: "Front-end Engineer" }, { name: "Xiao Zhang", title: "Backend Engineer" }] },
            { name: "Manager Chen", title: "Design Director", reports: [{ name: "Xiao Zhao", title: "Product Designer" }] },
        ],
    },
];
const orgColumns: ColumnDef<OrgNode, any>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "title", header: "Position", cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span> },
];
function TreeDemo() {
    return <Table columns={orgColumns} data={org} getSubRows={(r) => r.reports}/>;
}
function RowClickDemo() {
    const [last, setLast] = useState<string | null>(null);
    const actionColumns: ColumnDef<DemoUser, any>[] = [
        ...columns,
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (<button type="button" className="text-primary hover:underline" onClick={() => setLast(`Clicked "${row.original.name}(row click is not triggered)`)}>
          Edit
        </button>),
        },
    ];
    return (<div className="flex flex-col gap-2">
      <Table columns={actionColumns} data={users.slice(0, 4)} onRowClick={(row) => setLast(`Click on the line \u2192 Enter ${row.name} Component library for`)}/>
      <p className="text-sm text-muted-foreground">{last ?? "Click any blank space in the entire line, or click the \"Edit\" button within the line to try"}</p>
    </div>);
}
function DragSortDemo({ handle = "cell" }: {
    handle?: "row" | "cell";
}) {
    const [rows, setRows] = useState(() => users.slice(0, 5));
    const [last, setLast] = useState<string | null>(null);
    return (<div className="flex flex-col gap-2">
      <Table columns={columns} data={rows} getRowId={(r) => r.id} enableSorting={false} rowDraggable dragHandle={handle} onRowDragEnd={(e) => {
            setRows(e.nextData);
            setLast(`move=${e.activeId} \u00B7 target=${e.overId} \u00B7 direction=${e.position === "after" ? "down" : "up"}`);
        }}/>
      <p className="text-sm text-muted-foreground">
        {last ?? (handle === "row" ? "Try pressing and dragging anywhere in the entire row" : "Try dragging the leftmost handle to change the order.")}
      </p>
    </div>);
}
function DragSortLockedDemo() {
    const [rows, setRows] = useState(() => users.slice(0, 5));
    return (<Table columns={columns} data={rows} getRowId={(r) => r.id} enableSorting={false} rowDraggable getRowCanDrag={(row) => row.role !== "Administrator"} onRowDragEnd={(e) => setRows(e.nextData)}/>);
}
function VirtualDemo() {
    return <Table columns={columns} data={manyUsers} virtual={{ enabled: true, height: 360, rowHeight: 44 }}/>;
}
function Demo({ enableSorting = true, striped = true }: {
    enableSorting?: boolean;
    striped?: boolean;
}) {
    return <Table columns={columns} data={users} enableSorting={enableSorting} striped={striped}/>;
}
export const tableShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Just pass columns + data; the table header can be sorted by clicking, and even-numbered rows are zebra pattern by default.",
            code: `const columns: ColumnDef<DemoUser, any>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
];

<Table columns={columns} data={users} />`,
            render: () => <Demo />,
        },
        {
            title: "Row selection",
            description: "enableRowSelection Automatically insert the check box column (including header full selection/half selection state).",
            code: `<Table columns={columns} data={users} enableRowSelection />`,
            render: () => <SelectionDemo />,
        },
        {
            title: "Column filter",
            description: "Add meta.filterable to the column, and a built-in text filter box will appear in the header.",
            code: `const filterColumns = [
  { ...columns[0], meta: { filterable: true } },
  { ...columns[1], meta: { filterable: true } },
  columns[2],
];

<Table columns={filterColumns} data={users} />`,
            render: () => <FilterDemo />,
        },
        {
            title: "Column geometry (column width/alignment/overflow omitted)",
            description: "size / minSize / maxSize of ColumnDef directly implement the real width; meta.align / meta.headerAlign control alignment; meta.ellipsis overflows and truncates and hovers out Tooltip Read the full text. Columns that do not write size are still adaptive according to the content and will not be nailed to the same width.",
            code: `const columns: ColumnDef<DemoUser, any>[] = [
  { accessorKey: "name", header: "Name", size: 120 },
  { accessorKey: "email", header: "Email", size: 180, meta: { ellipsis: true } },
  { accessorKey: "role", header: "Role", size: 100, meta: { align: "center" } },
  { accessorKey: "id", header: "Number", size: 120, meta: { align: "right", headerAlign: "right" } },
];

<Table columns={columns} data={users} />`,
            render: () => <GeometryDemo />,
        },
        {
            title: "Column width drag",
            description: "resizable After turning it on, a drag handle will appear on the right edge of the meter header. Drag to change the width in real time and double-click to reset. Turn on the fixed layout (drag and drop must have a certain column width); the fixed column welt offset will be recalculated in the same frame as the column width.",
            code: `<Table columns={columns} data={users} resizable />

// Controlled column width (column id \u2192 pixel width), persistable to user preferences
<Table
  columns={columns}
  data={users}
  resizable
  columnSizing={sizing}
  onColumnSizingChange={setSizing}
/>`,
            render: () => <ResizableDemo />,
        },
        {
            title: "Expandable details",
            description: "renderExpandedRow Renders full-width detail panels below rows.",
            code: `<Table
  columns={columns}
  data={users}
  renderExpandedRow={(row) => (
    <div className="text-sm text-muted-foreground">
      <div>User ID: {row.original.id}</div>
      <div>Email: {row.original.email}</div>
    </div>
  )}
/>`,
            render: () => <ExpandableDemo />,
        },
        {
            title: "Row click",
            description: "onRowClick makes the entire row clickable (hover highlighted + cursor-pointer + keyboard accessible); buttons/links in the row are bubbled and isolated to prevent accidental touches. For full page jump, use rowHref instead.",
            code: `<Table
  columns={columns}
  data={users}
  onRowClick={(row) => router.push(\`/users/\${row.id}\`)}
/>

// Or declarative whole-row navigation (whole page jump, cmd/ctrl + click to open new tab)
<Table columns={columns} data={users} rowHref={(row) => \`/users/\${row.id}\`} />`,
            render: () => <RowClickDemo />,
        },
        {
            title: "Row drag and drop sorting",
            description: "rowDraggable inserts the drag handle column forward; onRowDragEnd returns relative position semantics (activeId / overId / position), which can directly map the backend { move, target, direction } Sorting interface. The components do not change data, the order is under your control.",
            code: `<Table
  columns={columns}
  data={rows}
  getRowId={(r) => r.id}
  enableSorting={false}
  rowDraggable
  onRowDragEnd={(e) => {
    setRows(e.nextData); // Local optimistic update
    api.sortable({ // Drop library: relative position semantics
      move: e.activeId,
      target: e.overId,
      direction: e.position === "after" ? "down" : "up",
    });
  }}
/>

// The entire row can be dragged (buttons/checkboxes within the row have been gesture-isolated)
<Table columns={columns} data={rows} rowDraggable dragHandle="row" ... />`,
            render: () => <DragSortDemo />,
        },
        {
            title: "Virtual scrolling",
            description: "Big data tile table open virtual, 200 rows only render viewport window (fixed height container).",
            code: `<Table
  columns={columns}
  data={manyUsers}
  virtual={{ enabled: true, height: 360, rowHeight: 44 }}
/>`,
            render: () => <VirtualDemo />,
        },
    ],
    controls: [
        { prop: "enableSorting", type: "boolean", defaultValue: true, label: "Sortable" },
        { prop: "striped", type: "boolean", defaultValue: true, label: "Zebra print" },
    ],
    states: [
        { name: "Sortable (click header to switch)", render: () => <Demo /> },
        { name: "Row selection (select all + single selection)", render: () => <SelectionDemo /> },
        { name: "Column filter (meta.filterable)", render: () => <FilterDemo /> },
        { name: "Fixed columns (first left column/right operating column\u00B7try scrolling)", render: () => <StickyDemo /> },
        { name: "Column geometry (size fixed width + align aligned + ellipsis omitted)", render: () => <GeometryDemo /> },
        { name: "Column width drag (drag the right edge of the table header\u00B7double-click to reset)", render: () => <ResizableDemo /> },
        { name: "Drag and drop width adjustment + fixed column (offset real-time recalculation)", render: () => <ResizableStickyDemo /> },
        { name: "Row click (whole row details\u00B7button isolation within the row)", render: () => <RowClickDemo /> },
        { name: "Expandable details", render: () => <ExpandableDemo /> },
        { name: "Tree (getSubRows)", render: () => <TreeDemo /> },
        { name: "Row drag and drop sorting (handle column\u00B7see callback semantics after dragging)", render: () => <DragSortDemo /> },
        { name: "Drag and drop rows to sort (the entire row can be dragged dragHandle=\"row\")", render: () => <DragSortDemo handle="row"/> },
        { name: "Drag and drop rows (rows locked by the administrator cannot be dragged)", render: () => <DragSortLockedDemo /> },
        { name: "Virtual scrolling (200 lines \u00B7 fixed height container)", render: () => <VirtualDemo /> },
        { name: "Not sortable", render: () => <Demo enableSorting={false}/> },
        { name: "Empty data", render: () => <Table columns={columns} data={[]}/> },
    ],
    renderWithProps: (p) => (<Demo enableSorting={p.enableSorting !== false} striped={p.striped !== false}/>),
    toCode: (p) => `<Table
  columns={columns}
  data={users}
  enableSorting={${p.enableSorting !== false}}
  striped={${p.striped !== false}}
/>`,
};
