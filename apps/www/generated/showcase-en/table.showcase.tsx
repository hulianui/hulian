"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { demoImage } from "../../../../packages/ui/src/lib/demo-image";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../../../packages/ui/src/select/select";
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
const ROLE_ITEMS = [{ value: "", label: "All roles" }, ...ROLES.map((r) => ({ value: r, label: r }))];
const filterRowColumns: ColumnDef<DemoUser, any>[] = [
    { ...columns[0], meta: { filterable: true } },
    { ...columns[1], meta: { filterable: true } },
    {
        ...columns[2],
        meta: {
            filterRender: ({ value, setValue }) => (<Select items={ROLE_ITEMS} value={(value as string) ?? ""} onValueChange={(next) => setValue((next as string) || undefined)}>
          <SelectTrigger size="xs" className="w-full font-normal"/>
          <SelectContent>
            {ROLE_ITEMS.map((r) => (<SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>))}
          </SelectContent>
        </Select>),
        },
    },
];
function FilterRowDemo() {
    return <Table columns={filterRowColumns} data={users} filterPlacement="row"/>;
}
function CellClassNameDemo() {
    return (<Table columns={columns} data={users} cellClassName={({ columnId, value }) => columnId !== "role"
            ? undefined
            : value === "Administrator"
                ? "bg-danger/10 text-danger" : value === "Edit"
                ? "bg-warning/10 text-warning" : undefined}/>);
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
function ScrollbarAlwaysDemo() {
    return <Table columns={stickyColumns} data={users.slice(0, 3)} scrollbar="always"/>;
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
const tableAlignColumns: ColumnDef<DemoUser, any>[] = [
    { accessorKey: "name", header: "Name", size: 120 },
    { accessorKey: "role", header: "Role", size: 100 },
    { accessorKey: "id", header: "No.", size: 140, meta: { align: "right" } },
];
function TableAlignDemo() {
    return <Table columns={tableAlignColumns} data={users.slice(0, 5)} cellAlign="center"/>;
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
interface FunnelRow {
    store: string;
    guide: string;
    visits: number;
    orders: number;
}
const funnelRows: FunnelRow[] = [
    { store: "Teemall store", guide: "Zhang Min", visits: 128, orders: 21 },
    { store: "Teemall store", guide: "Li Wei", visits: 96, orders: 14 },
    { store: "Teemall store", guide: "Wang Fang", visits: 74, orders: 9 },
    { store: "Grandview store", guide: "Liu Yang", visits: 152, orders: 33 },
    { store: "Grandview store", guide: "Chen Jing", visits: 88, orders: 12 },
];
const funnelColumns: ColumnDef<FunnelRow, any>[] = [
    { accessorKey: "store", header: "Store", size: 140 },
    { accessorKey: "guide", header: "Sales associate", size: 100 },
    { accessorKey: "visits", header: "Visits", size: 90, meta: { align: "right" } },
    { accessorKey: "orders", header: "Orders", size: 90, meta: { align: "right" } },
];
function CellSpanDemo() {
    return (<Table columns={funnelColumns} data={funnelRows} enableSorting={false} cellSpan={({ rows, rowIndex, columnId }) => {
            if (columnId !== "store")
                return;
            let span = 1;
            while (rows[rowIndex + span]?.store === rows[rowIndex]?.store)
                span += 1;
            return { rowSpan: span };
        }}/>);
}
interface JoinRow {
    zone: string;
    dept: string;
    members: number;
    store: string;
    pos: string;
}
const joinRows: JoinRow[] = [
    { zone: "South China", dept: "South China Team 1", members: 12, store: "Teemall store", pos: "P-0417" },
    { zone: "South China", dept: "South China Team 2", members: 9, store: "Grandview store", pos: "P-0418" },
    { zone: "East China", dept: "East China Team 1", members: 15, store: "West Nanjing Road store", pos: "P-1102" },
];
const groupedColumns: ColumnDef<JoinRow, any>[] = [
    { accessorKey: "zone", header: "Region", size: 90 },
    {
        id: "wecom",
        header: "WeCom",
        columns: [
            { accessorKey: "dept", header: "Department", size: 140 },
            { accessorKey: "members", header: "Members", size: 110, meta: { align: "right" } },
        ],
    },
    {
        id: "mini",
        header: "Mini Program",
        columns: [
            { accessorKey: "store", header: "Store", size: 140 },
            { accessorKey: "pos", header: "POS code", size: 110 },
        ],
    },
];
function GroupedHeaderDemo() {
    return <Table columns={groupedColumns} data={joinRows} enableSorting={false}/>;
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
            title: "Swappable filter controls and a dedicated filter row",
            description: "An enum column such as Role needs a select, not a substring text box. meta.filterRender replaces the control for that column, and setting it already makes the column filterable. filterPlacement=\"row\" then moves the controls to a dedicated row below the header, so the header keeps its single-row height and the sort button no longer shares a cell with an input.",
            code: `const filterRowColumns: ColumnDef<DemoUser, any>[] = [
  // Text columns keep the built-in input
  { ...columns[0], meta: { filterable: true } },
  { ...columns[1], meta: { filterable: true } },
  {
    ...columns[2],
    meta: {
      // The enum column swaps in a select; filterRender alone makes the column filterable
      filterRender: ({ value, setValue }) => (
        <Select
          items={ROLE_ITEMS}
          value={(value as string) ?? ""}
          onValueChange={(next) => setValue(next || undefined)}
        >
          <SelectTrigger size="xs" className="w-full font-normal" />
          <SelectContent>
            {ROLE_ITEMS.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  },
];

<Table columns={filterRowColumns} data={users} filterPlacement="row" />`,
            render: () => <FilterRowDemo />,
        },
        {
            title: "Colouring cells by value (cellClassName)",
            description: "Derives a class per (row, column) that lands on the <td> itself and merges with the stripe and selection classes. One column painting a different background per row is beyond both rowClassName (row state) and meta (column state), and wrapping a coloured box inside ColumnDef.cell does not work either: the cell padding still shows the td's own background.",
            code: `<Table
  columns={columns}
  data={users}
  cellClassName={({ columnId, value }) =>
    columnId === "role" && value === "Administrator" ? "bg-danger/10 text-danger" : undefined
  }
/>`,
            render: () => <CellClassNameDemo />,
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
            title: "Table-level alignment (cellAlign / headerAlign)",
            description: "Alignment is a whole-table decision: when an admin list has some columns centered and others left-aligned, that is almost never a design call. It is dozens of column definitions each written on their own. Set it once at the table level; a column's meta.align still wins, and the usual shape is a centered table with amount columns right-aligned (digits only line up by place value that way). headerAlign exists separately for the \"centered headers, left-aligned content\" layout.",
            code: `<Table columns={columns} data={users} cellAlign="center" />

// Set headerAlign alone when only the header should move
<Table columns={columns} data={users} headerAlign="center" />

// A column can still override it as before:
{ accessorKey: "id", header: "No.", meta: { align: "right" } }`,
            render: () => <TableAlignDemo />,
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
        {
            title: "Cell merging",
            description: "cellSpan returns a span per cell, and cells covered by an earlier span are never asked again. The callback sees render order, so merging stays aligned after sorting or filtering.",
            code: `<Table
  columns={columns}
  data={rows}
  cellSpan={({ rows, rowIndex, columnId }) => {
    if (columnId !== "store") return;
    // Return the whole run length at the start of the run; the rows below are merged away and never asked
    let span = 1;
    while (rows[rowIndex + span]?.store === rows[rowIndex]?.store) span += 1;
    return { rowSpan: span };
  }}
/>`,
            render: () => <CellSpanDemo />,
        },
        {
            title: "Grouped headers (column groups)",
            description: "Wrapping columns in a `columns` array makes a group. The group name spans its leaf columns and is centred; a column outside any group spans both header rows instead of leaving a blank cell above it. Sorting and column widths belong on the leaf columns.",
            code: `const groupedColumns: ColumnDef<JoinRow, any>[] = [
  { accessorKey: "zone", header: "Region", size: 90 },
  {
    id: "wecom",
    header: "WeCom",
    columns: [
      { accessorKey: "dept", header: "Department", size: 140 },
      { accessorKey: "members", header: "Members", size: 110, meta: { align: "right" } },
    ],
  },
  { id: "mini", header: "Mini Program", columns: [
      { accessorKey: "store", header: "Store", size: 140 },
      { accessorKey: "pos", header: "POS code", size: 110 }] },
];

<Table columns={groupedColumns} data={rows} />`,
            render: () => <GroupedHeaderDemo />,
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
        { name: "Always-visible horizontal scrollbar (scrollbar=\"always\" \u00B7 even a short table shows there are more columns to the right)", render: () => <ScrollbarAlwaysDemo /> },
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
        { name: "Cell merging (the store column merges by store)", render: () => <CellSpanDemo /> },
        { name: "Grouped headers (two groups plus one standalone column)", render: () => <GroupedHeaderDemo /> },
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
