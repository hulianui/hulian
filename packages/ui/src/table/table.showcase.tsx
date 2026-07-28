"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Table } from "./table";
import type { ColumnDef } from "./table.types";

// 内联确定性样例数据（按 index 派生，防 SSR/CSR hydration mismatch）——
// 刻意不依赖 @hulianui/mocks/faker：demo 数据不该把 dev-only 依赖带进组件库导出图。
export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}
const SURNAME = ["王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "马", "朱", "胡", "郭", "何", "高", "林", "郑"];
const GIVEN = ["伟", "敏", "静", "丽", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "霞", "平", "刚", "桂英", "秀兰"];
const ROLES = ["管理员", "编辑", "访客"];
function makeUsers(count: number): DemoUser[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `u${(i + 1).toString().padStart(4, "0")}`,
    name: SURNAME[i % SURNAME.length] + GIVEN[(i * 7 + 3) % GIVEN.length],
    email: `user${i + 1}@hulian.dev`,
    role: ROLES[i % ROLES.length],
    avatar: `https://i.pravatar.cc/64?img=${(i % 70) + 1}`,
  }));
}
const users = makeUsers(8);
const manyUsers = makeUsers(200);

const columns: ColumnDef<DemoUser, any>[] = [
  {
    accessorKey: "name",
    header: "姓名",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={row.original.avatar} alt="" className="size-6 rounded-full bg-surface-hover" />
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "邮箱",
    cell: ({ getValue }) => <span className="text-muted">{getValue() as string}</span>,
  },
  { accessorKey: "role", header: "角色" },
];

// 行选择列定义复用基础列（自动前插复选框列）
function SelectionDemo() {
  return <Table columns={columns} data={users} enableRowSelection />;
}

// 筛选：name/email 列开 meta.filterable → 表头出筛选框
const filterColumns: ColumnDef<DemoUser, any>[] = [
  { ...columns[0], meta: { filterable: true } },
  { ...columns[1], meta: { filterable: true } },
  columns[2],
];
function FilterDemo() {
  return <Table columns={filterColumns} data={users} />;
}

// 固定列：首列贴左、操作列贴右；列给 size 让 sticky offset 精确，并加宽内容触发横滚
const stickyColumns: ColumnDef<DemoUser, any>[] = [
  { ...columns[0], size: 200, meta: { sticky: "left" } },
  { accessorKey: "email", header: "邮箱", size: 280, cell: columns[1].cell },
  { accessorKey: "role", header: "角色", size: 160 },
  { accessorKey: "id", header: "ID", size: 320, cell: ({ getValue }) => <span className="text-muted">{getValue() as string}</span> },
  {
    id: "actions",
    header: "操作",
    size: 120,
    meta: { sticky: "right" },
    cell: () => <button type="button" className="text-primary hover:underline">编辑</button>,
  },
];
function StickyDemo() {
  return <Table columns={stickyColumns} data={users} />;
}

// 列几何：size 定宽 + minSize 保底 + align/headerAlign 对齐 + ellipsis 溢出省略（悬停看全文）
const geometryColumns: ColumnDef<DemoUser, any>[] = [
  { accessorKey: "name", header: "姓名", size: 120 },
  {
    accessorKey: "email",
    header: "邮箱",
    size: 180,
    meta: { ellipsis: true },
    cell: ({ getValue }) => <span className="text-muted">{getValue() as string}</span>,
  },
  { accessorKey: "role", header: "角色", size: 100, meta: { align: "center" } },
  {
    accessorKey: "id",
    header: "编号",
    size: 120,
    meta: { align: "right", headerAlign: "right" },
    cell: ({ getValue }) => <span className="tabular-nums text-muted">{getValue() as string}</span>,
  },
];
function GeometryDemo() {
  return <Table columns={geometryColumns} data={users.slice(0, 5)} />;
}

// 列宽拖拽：表头右缘拖动改宽（自动切 fixed 布局），双击手柄复位
function ResizableDemo() {
  return <Table columns={geometryColumns} data={users.slice(0, 5)} resizable />;
}

// 拖拽调宽 + 固定列：拖第一列，右侧固定列的贴边 offset 跟着实时重算
const resizableStickyColumns: ColumnDef<DemoUser, any>[] = [
  { ...columns[0], size: 180, meta: { sticky: "left" } },
  { accessorKey: "email", header: "邮箱", size: 260, meta: { ellipsis: true }, cell: columns[1].cell },
  { accessorKey: "role", header: "角色", size: 140, meta: { align: "center" } },
  { accessorKey: "id", header: "编号", size: 260 },
  {
    id: "actions",
    header: "操作",
    size: 100,
    meta: { sticky: "right", align: "center", headerAlign: "center" },
    cell: () => <button type="button" className="text-primary hover:underline">编辑</button>,
  },
];
function ResizableStickyDemo() {
  return <Table columns={resizableStickyColumns} data={users.slice(0, 5)} resizable />;
}

// 可展开明细：行下渲染整宽面板
function ExpandableDemo() {
  return (
    <Table
      columns={columns}
      data={users}
      renderExpandedRow={(row) => (
        <div className="text-sm text-muted">
          <div>用户 ID：{row.original.id}</div>
          <div>邮箱：{row.original.email}</div>
        </div>
      )}
    />
  );
}

// 树形：从行取子行，展开器按 depth 缩进
interface OrgNode {
  name: string;
  title: string;
  reports?: OrgNode[];
}
const org: OrgNode[] = [
  {
    name: "林总",
    title: "CEO",
    reports: [
      { name: "王经理", title: "工程总监", reports: [{ name: "小李", title: "前端工程师" }, { name: "小张", title: "后端工程师" }] },
      { name: "陈经理", title: "设计总监", reports: [{ name: "小赵", title: "产品设计师" }] },
    ],
  },
];
const orgColumns: ColumnDef<OrgNode, any>[] = [
  { accessorKey: "name", header: "姓名" },
  { accessorKey: "title", header: "职位", cell: ({ getValue }) => <span className="text-muted">{getValue() as string}</span> },
];
function TreeDemo() {
  return <Table columns={orgColumns} data={org} getSubRows={(r) => r.reports} />;
}

// 行点击：整行可点进详情（toast 示意），行内按钮冒泡隔离不误触
function RowClickDemo() {
  const [last, setLast] = useState<string | null>(null);
  const actionColumns: ColumnDef<DemoUser, any>[] = [
    ...columns,
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => setLast(`点了「${row.original.name}」的编辑按钮（未触发行点击）`)}
        >
          编辑
        </button>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-2">
      <Table
        columns={actionColumns}
        data={users.slice(0, 4)}
        onRowClick={(row) => setLast(`行点击 → 进入 ${row.name} 的详情`)}
      />
      <p className="text-sm text-muted">{last ?? "点整行任意空白处，或点行内「编辑」按钮试试"}</p>
    </div>
  );
}

// 行拖拽排序：手柄列拖动改序；回调回传相对位置语义（activeId/overId/position）
// 刻意关掉列排序——列排序开着时可见顺序不等于存储顺序，拖出来的相对位置对后端没意义
function DragSortDemo({ handle = "cell" }: { handle?: "row" | "cell" }) {
  const [rows, setRows] = useState(() => users.slice(0, 5));
  const [last, setLast] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <Table
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        enableSorting={false}
        rowDraggable
        dragHandle={handle}
        onRowDragEnd={(e) => {
          setRows(e.nextData); // 本地乐观更新
          setLast(
            `move=${e.activeId} · target=${e.overId} · direction=${e.position === "after" ? "down" : "up"}`,
          );
        }}
      />
      <p className="text-sm text-muted">
        {last ?? (handle === "row" ? "整行任意位置按住拖动试试" : "拖动最左侧手柄改序试试")}
      </p>
    </div>
  );
}

// 部分行不可拖：getRowCanDrag 返回 false 的行手柄禁用（既抓不起也不能当落点）
function DragSortLockedDemo() {
  const [rows, setRows] = useState(() => users.slice(0, 5));
  return (
    <Table
      columns={columns}
      data={rows}
      getRowId={(r) => r.id}
      enableSorting={false}
      rowDraggable
      getRowCanDrag={(row) => row.role !== "管理员"}
      onRowDragEnd={(e) => setRows(e.nextData)}
    />
  );
}

// 虚拟滚动：200 行只渲染视口窗口（固定高度容器）
function VirtualDemo() {
  return <Table columns={columns} data={manyUsers} virtual={{ enabled: true, height: 360, rowHeight: 44 }} />;
}

function Demo({ enableSorting = true, striped = true }: { enableSorting?: boolean; striped?: boolean }) {
  return <Table columns={columns} data={users} enableSorting={enableSorting} striped={striped} />;
}

export const tableShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传 columns + data 即可；表头默认可点排序，偶数行斑马纹。",
      code: `const columns: ColumnDef<DemoUser, any>[] = [
  { accessorKey: "name", header: "姓名" },
  { accessorKey: "email", header: "邮箱" },
  { accessorKey: "role", header: "角色" },
];

<Table columns={columns} data={users} />`,
      render: () => <Demo />,
    },
    {
      title: "行选择",
      description: "enableRowSelection 自动前插复选框列（含表头全选 / 半选态）。",
      code: `<Table columns={columns} data={users} enableRowSelection />`,
      render: () => <SelectionDemo />,
    },
    {
      title: "列筛选",
      description: "给列加 meta.filterable，表头出内置文本筛选框。",
      code: `const filterColumns = [
  { ...columns[0], meta: { filterable: true } },
  { ...columns[1], meta: { filterable: true } },
  columns[2],
];

<Table columns={filterColumns} data={users} />`,
      render: () => <FilterDemo />,
    },
    {
      title: "列几何（列宽 / 对齐 / 溢出省略）",
      description:
        "ColumnDef 的 size / minSize / maxSize 直接落成真实宽度；meta.align / meta.headerAlign 控对齐；meta.ellipsis 溢出截断并悬停出 Tooltip 看全文。没写 size 的列仍按内容自适应，不会被钉成等宽。",
      code: `const columns: ColumnDef<DemoUser, any>[] = [
  { accessorKey: "name", header: "姓名", size: 120 },
  { accessorKey: "email", header: "邮箱", size: 180, meta: { ellipsis: true } },
  { accessorKey: "role", header: "角色", size: 100, meta: { align: "center" } },
  { accessorKey: "id", header: "编号", size: 120, meta: { align: "right", headerAlign: "right" } },
];

<Table columns={columns} data={users} />`,
      render: () => <GeometryDemo />,
    },
    {
      title: "列宽拖拽",
      description:
        "resizable 开启后表头右缘出拖拽手柄，拖动实时改宽、双击复位。开启即切 fixed 布局（拖拽必须有确定列宽）；固定列的贴边 offset 会跟着列宽同帧重算。",
      code: `<Table columns={columns} data={users} resizable />

// 受控列宽（列 id → 像素宽），可持久化到用户偏好
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
      title: "可展开明细",
      description: "renderExpandedRow 在行下渲染整宽明细面板。",
      code: `<Table
  columns={columns}
  data={users}
  renderExpandedRow={(row) => (
    <div className="text-sm text-muted">
      <div>用户 ID：{row.original.id}</div>
      <div>邮箱：{row.original.email}</div>
    </div>
  )}
/>`,
      render: () => <ExpandableDemo />,
    },
    {
      title: "行点击",
      description:
        "onRowClick 让整行可点（hover 高亮 + cursor-pointer + 键盘可达）；行内按钮/链接冒泡隔离不误触。整页跳转可改用 rowHref。",
      code: `<Table
  columns={columns}
  data={users}
  onRowClick={(row) => router.push(\`/users/\${row.id}\`)}
/>

// 或声明式整行导航（整页跳转，cmd/ctrl+点击新开 tab）
<Table columns={columns} data={users} rowHref={(row) => \`/users/\${row.id}\`} />`,
      render: () => <RowClickDemo />,
    },
    {
      title: "行拖拽排序",
      description:
        "rowDraggable 前插拖拽手柄列；onRowDragEnd 回传相对位置语义（activeId / overId / position），可直接映射后端 { move, target, direction } 排序接口。组件不改 data，顺序由你掌控。",
      code: `<Table
  columns={columns}
  data={rows}
  getRowId={(r) => r.id}
  enableSorting={false}
  rowDraggable
  onRowDragEnd={(e) => {
    setRows(e.nextData);            // 本地乐观更新
    api.sortable({                  // 落库：相对位置语义
      move: e.activeId,
      target: e.overId,
      direction: e.position === "after" ? "down" : "up",
    });
  }}
/>

// 整行可拖（行内按钮/复选框已做手势隔离）
<Table columns={columns} data={rows} rowDraggable dragHandle="row" ... />`,
      render: () => <DragSortDemo />,
    },
    {
      title: "虚拟滚动",
      description: "大数据平铺表开 virtual，200 行只渲染视口窗口（固定高容器）。",
      code: `<Table
  columns={columns}
  data={manyUsers}
  virtual={{ enabled: true, height: 360, rowHeight: 44 }}
/>`,
      render: () => <VirtualDemo />,
    },
  ],
  controls: [
    { prop: "enableSorting", type: "boolean", defaultValue: true, label: "可排序" },
    { prop: "striped", type: "boolean", defaultValue: true, label: "斑马纹" },
  ],
  states: [
    { name: "可排序（点表头切换）", render: () => <Demo /> },
    { name: "行选择（全选 + 单选）", render: () => <SelectionDemo /> },
    { name: "列筛选（meta.filterable）", render: () => <FilterDemo /> },
    { name: "固定列（左首列 / 右操作列·横滚试试）", render: () => <StickyDemo /> },
    { name: "列几何（size 定宽 + align 对齐 + ellipsis 省略）", render: () => <GeometryDemo /> },
    { name: "列宽拖拽（表头右缘拖动·双击复位）", render: () => <ResizableDemo /> },
    { name: "拖拽调宽 + 固定列（offset 实时重算）", render: () => <ResizableStickyDemo /> },
    { name: "行点击（整行进详情·行内按钮隔离）", render: () => <RowClickDemo /> },
    { name: "可展开明细", render: () => <ExpandableDemo /> },
    { name: "树形（getSubRows）", render: () => <TreeDemo /> },
    { name: "行拖拽排序（手柄列·拖完看回调语义）", render: () => <DragSortDemo /> },
    { name: "行拖拽排序（整行可拖 dragHandle=\"row\"）", render: () => <DragSortDemo handle="row" /> },
    { name: "行拖拽排序（管理员行锁定不可拖）", render: () => <DragSortLockedDemo /> },
    { name: "虚拟滚动（200 行·固定高容器）", render: () => <VirtualDemo /> },
    { name: "不可排序", render: () => <Demo enableSorting={false} /> },
    { name: "空数据", render: () => <Table columns={columns} data={[]} /> },
  ],
  renderWithProps: (p) => (
    <Demo enableSorting={p.enableSorting !== false} striped={p.striped !== false} />
  ),
  toCode: (p) =>
    `<Table\n  columns={columns}\n  data={users}\n  enableSorting={${p.enableSorting !== false}}\n  striped={${p.striped !== false}}\n/>`,
};
