import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { Table, resolveRowDragEnd } from "./table";
import {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "./table-primitives";
import type { ColumnDef } from "./table.types";

interface Row {
  name: string;
  age: number;
}
const data: Row[] = [
  { name: "Charlie", age: 30 },
  { name: "Alice", age: 25 },
  { name: "Bob", age: 35 },
];
const columns: ColumnDef<Row, any>[] = [
  { accessorKey: "name", header: "姓名" },
  { accessorKey: "age", header: "年龄" },
];

function nameOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("tbody tr td:first-child")).map(
    (td) => td.textContent ?? "",
  );
}

describe("Table 基础渲染", () => {
  it("渲染 table + 2 列表头 + 3 数据行", () => {
    const { getByRole, getAllByRole, container } = render(<Table columns={columns} data={data} />);
    expect(getByRole("table")).toBeTruthy();
    expect(getAllByRole("columnheader").length).toBe(2);
    expect(container.querySelectorAll("tbody tr").length).toBe(3);
  });

  it("默认顺序 = 数据顺序", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    expect(nameOrder(container)).toEqual(["Charlie", "Alice", "Bob"]);
  });
});

describe("排序（点表头切换 + aria-sort）", () => {
  it("点姓名表头 → 升序；再点 → 降序；aria-sort 反映状态", () => {
    const { getByRole, container } = render(<Table columns={columns} data={data} />);
    const th = getByRole("columnheader", { name: /姓名/ });
    expect(th.getAttribute("aria-sort")).toBe("none");

    fireEvent.click(getByRole("button", { name: /姓名/ }));
    expect(nameOrder(container)).toEqual(["Alice", "Bob", "Charlie"]);
    expect(getByRole("columnheader", { name: /姓名/ }).getAttribute("aria-sort")).toBe("ascending");

    fireEvent.click(getByRole("button", { name: /姓名/ }));
    expect(nameOrder(container)).toEqual(["Charlie", "Bob", "Alice"]);
    expect(getByRole("columnheader", { name: /姓名/ }).getAttribute("aria-sort")).toBe("descending");
  });

  it("enableSorting=false：表头非 button、无 aria-sort、点击不改序", () => {
    const { queryByRole, getByRole, getByText, container } = render(
      <Table columns={columns} data={data} enableSorting={false} />,
    );
    expect(queryByRole("button")).toBeNull();
    expect(getByRole("columnheader", { name: /姓名/ }).getAttribute("aria-sort")).toBeNull();
    fireEvent.click(getByText("姓名"));
    expect(nameOrder(container)).toEqual(["Charlie", "Alice", "Bob"]);
  });
});

describe("空态", () => {
  it("data=[] → 渲染「暂无数据」，无数据行", () => {
    const { getByText, container } = render(<Table columns={columns} data={[]} />);
    expect(getByText("暂无数据")).toBeTruthy();
    expect(container.querySelectorAll("tbody tr td:first-child")[0]?.getAttribute("colspan")).toBe("2");
  });

  it("emptyText 自定义空态文案", () => {
    const { getByText, queryByText } = render(
      <Table columns={columns} data={[]} emptyText="没有匹配的结果" />,
    );
    expect(getByText("没有匹配的结果")).toBeTruthy();
    expect(queryByText("暂无数据")).toBeNull();
  });

  it("renderEmpty 完全自定义空态（优先于 emptyText）", () => {
    const { getByText, queryByText } = render(
      <Table columns={columns} data={[]} emptyText="忽略我" renderEmpty={() => <div>自定义空态</div>} />,
    );
    expect(getByText("自定义空态")).toBeTruthy();
    expect(queryByText("忽略我")).toBeNull();
  });
});

describe("皮肤钩子（防漂移）", () => {
  it("外壳含 overflow-x-auto + rounded + border-border；行含 hover/斑马纹", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    const shell = container.firstChild as HTMLElement;
    expect(shell.className).toContain("overflow-x-auto");
    expect(shell.className).toContain("rounded-[var(--radius)]");
    expect(shell.className).toContain("border-border");
    const row = container.querySelector("tbody tr") as HTMLElement;
    expect(row.className).toContain("hover:bg-surface-hover");
    expect(row.className).toContain("even:bg-surface-hover/40");
  });

  it("striped=false：行无斑马纹类", () => {
    const { container } = render(<Table columns={columns} data={data} striped={false} />);
    const row = container.querySelector("tbody tr") as HTMLElement;
    expect(row.className).not.toContain("even:bg-surface-hover/40");
  });
});

describe("特性默认全关（不传 props 不渲染任何企业件）", () => {
  it("无选择列、无展开器、无筛选框", () => {
    const { queryByRole, container } = render(<Table columns={columns} data={data} />);
    expect(queryByRole("checkbox")).toBeNull();
    expect(queryByRole("button", { name: /展开|收起/ })).toBeNull();
    expect(container.querySelector('input[type="text"]')).toBeNull();
    expect(container.querySelectorAll("thead th").length).toBe(2); // 仅用户两列
  });
});

describe("行选择（enableRowSelection·自动前插复选框列）", () => {
  it("前插全选列：表头 +1 列、全选 checkbox + 每行 checkbox", () => {
    const { getAllByRole, getByRole } = render(
      <Table columns={columns} data={data} enableRowSelection />,
    );
    expect(getAllByRole("columnheader").length).toBe(3); // 选择列 + 2 用户列
    expect(getByRole("checkbox", { name: "全选" })).toBeTruthy();
    expect(getAllByRole("checkbox", { name: "选择行" }).length).toBe(3);
  });

  it("受控 rowSelection：被选行得 data-selected + 高亮类", () => {
    const { container } = render(
      <Table columns={columns} data={data} enableRowSelection rowSelection={{ "0": true }} />,
    );
    const firstRow = container.querySelector("tbody tr") as HTMLElement;
    expect(firstRow.getAttribute("data-selected")).toBe("true");
    expect(firstRow.className).toContain("bg-primary/10");
  });

  it("点行复选框 → 该行被选中（非受控）", () => {
    const { getAllByRole, container } = render(
      <Table columns={columns} data={data} enableRowSelection />,
    );
    fireEvent.click(getAllByRole("checkbox", { name: "选择行" })[0]);
    const firstRow = container.querySelector("tbody tr") as HTMLElement;
    expect(firstRow.getAttribute("data-selected")).toBe("true");
  });
});

describe("可展开明细（renderExpandedRow·整宽面板行）", () => {
  it("前插展开器列；点展开 → 渲染明细面板；再点 → 收起", () => {
    const { getAllByRole, queryByText, container } = render(
      <Table
        columns={columns}
        data={data}
        renderExpandedRow={(row) => <div>明细：{row.original.name}</div>}
      />,
    );
    // 展开器列 + 2 用户列
    expect(container.querySelectorAll("thead th").length).toBe(3);
    const toggles = getAllByRole("button", { name: "展开" });
    expect(toggles.length).toBe(3);
    expect(queryByText("明细：Charlie")).toBeNull();

    fireEvent.click(toggles[0]);
    expect(queryByText("明细：Charlie")).toBeTruthy();
    expect(getAllByRole("button", { name: "收起" }).length).toBe(1);

    fireEvent.click(getAllByRole("button", { name: "收起" })[0]);
    expect(queryByText("明细：Charlie")).toBeNull();
  });
});

interface TreeRow {
  name: string;
  age: number;
  children?: TreeRow[];
}
const treeData: TreeRow[] = [
  { name: "父A", age: 40, children: [{ name: "子A1", age: 10 }, { name: "子A2", age: 12 }] },
  { name: "父B", age: 50 },
];
const treeColumns: ColumnDef<TreeRow, any>[] = [
  { accessorKey: "name", header: "姓名" },
  { accessorKey: "age", header: "年龄" },
];

describe("树形（getSubRows·嵌套真行 + 展开器缩进）", () => {
  it("默认只渲顶层行；展开父行 → 子行出现；叶子无展开器", () => {
    const { getAllByRole, container } = render(
      <Table columns={treeColumns} data={treeData} getSubRows={(r) => r.children} />,
    );
    // 顶层 2 行
    expect(container.querySelectorAll("tbody tr").length).toBe(2);
    // 只有有子行的父A 才有展开器（父B 是叶子）
    const toggles = getAllByRole("button", { name: "展开" });
    expect(toggles.length).toBe(1);

    fireEvent.click(toggles[0]);
    // 展开后 2 + 2 子 = 4 行
    expect(container.querySelectorAll("tbody tr").length).toBe(4);
  });
});

describe("筛选（meta.filterable·列内置文本筛选框）", () => {
  const filterColumns: ColumnDef<Row, any>[] = [
    { accessorKey: "name", header: "姓名", meta: { filterable: true } },
    { accessorKey: "age", header: "年龄" },
  ];

  it("filterable 列出筛选框；非 filterable 列无；输入 → 行被过滤", () => {
    const { container } = render(<Table columns={filterColumns} data={data} />);
    const inputs = container.querySelectorAll('thead input[type="text"]');
    expect(inputs.length).toBe(1); // 仅 name 列

    const input = inputs[0] as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Ali" } });
    expect(nameOrder(container)).toEqual(["Alice"]);

    fireEvent.change(input, { target: { value: "" } });
    expect(nameOrder(container)).toEqual(["Charlie", "Alice", "Bob"]);
  });
});

describe("固定列（meta.sticky·position:sticky 几何）", () => {
  const stickyColumns: ColumnDef<Row, any>[] = [
    { accessorKey: "name", header: "姓名", meta: { sticky: "left" } },
    { accessorKey: "age", header: "年龄" },
  ];

  it("sticky:left 列 th/td 得 position:sticky；非固定列不得", () => {
    const { container } = render(<Table columns={stickyColumns} data={data} />);
    const headers = container.querySelectorAll("thead th") as NodeListOf<HTMLElement>;
    expect(headers[0].style.position).toBe("sticky"); // 姓名固定
    expect(headers[1].style.position).toBe(""); // 年龄不固定
    const firstCell = container.querySelector("tbody td") as HTMLElement;
    expect(firstCell.style.position).toBe("sticky");
    expect(firstCell.className).toContain("bg-bg");
  });

  it("无 sticky 列时无任何 sticky 定位", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    const header = container.querySelector("thead th") as HTMLElement;
    expect(header.style.position).toBe("");
  });
});

describe("rowClassName（行级状态着色）", () => {
  it("按行数据派生 class：命中行含、未命中行不含，且不破坏既有行类", () => {
    const { container } = render(
      <Table
        columns={columns}
        data={data}
        rowClassName={(row) => (row.name === "Alice" ? "row-bad" : undefined)}
      />,
    );
    const trs = Array.from(container.querySelectorAll("tbody tr"));
    const alice = trs.find((tr) => tr.textContent?.includes("Alice")) as HTMLElement;
    const bob = trs.find((tr) => tr.textContent?.includes("Bob")) as HTMLElement;
    expect(alice.className).toContain("row-bad");
    expect(bob.className).not.toContain("row-bad");
    // 既有斑马纹/分隔线类保留
    expect(alice.className).toContain("border-b");
    expect(alice.className).toContain("even:bg-surface-hover/40");
  });

  it("回调收到行号（渲染序）", () => {
    const seen: number[] = [];
    render(
      <Table
        columns={columns}
        data={data}
        rowClassName={(_row, index) => {
          seen.push(index);
          return undefined;
        }}
      />,
    );
    expect(seen).toEqual([0, 1, 2]);
  });
});

describe("行双击（onRowDoubleClick）", () => {
  it("默认不传：行上没有 dblclick 处理", () => {
    const onRowDoubleClick = vi.fn();
    const { container } = render(<Table columns={columns} data={data} />);
    fireEvent.doubleClick(container.querySelectorAll("tbody tr")[0]);
    expect(onRowDoubleClick).not.toHaveBeenCalled();
  });

  it("双击行 → 回调收到 (row, index)", () => {
    const onRowDoubleClick = vi.fn();
    const { container } = render(
      <Table columns={columns} data={data} onRowDoubleClick={onRowDoubleClick} />,
    );
    fireEvent.doubleClick(container.querySelectorAll("tbody tr")[1].querySelectorAll("td")[0]);
    expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
    expect(onRowDoubleClick).toHaveBeenCalledWith({ name: "Alice", age: 25 }, 1);
  });

  it("冒泡隔离：双击行内复选框不触发", () => {
    const onRowDoubleClick = vi.fn();
    const { getAllByRole } = render(
      <Table
        columns={columns}
        data={data}
        enableRowSelection
        onRowDoubleClick={onRowDoubleClick}
      />,
    );
    fireEvent.doubleClick(getAllByRole("checkbox", { name: "选择行" })[0]);
    expect(onRowDoubleClick).not.toHaveBeenCalled();
  });

  it("与 onRowClick 相互独立，可同传", () => {
    const onRowClick = vi.fn();
    const onRowDoubleClick = vi.fn();
    const { container } = render(
      <Table
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
      />,
    );
    const row = container.querySelectorAll("tbody tr")[0];
    fireEvent.doubleClick(row);
    expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
    // fireEvent.doubleClick 只派 dblclick，不模拟浏览器前置的两次 click
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe("行点击（onRowClick）", () => {
  it("默认（不传）：行无 cursor-pointer、无 tabIndex、无点击响应", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    const row = container.querySelector("tbody tr") as HTMLElement;
    expect(row.className).not.toContain("cursor-pointer");
    expect(row.getAttribute("tabindex")).toBeNull();
  });

  it("点行任意单元格 → 回调收到 (row, index)；行有 cursor-pointer + tabIndex=0", () => {
    const onRowClick = vi.fn();
    const { container } = render(<Table columns={columns} data={data} onRowClick={onRowClick} />);
    const rows = container.querySelectorAll("tbody tr");
    const secondRowLastCell = rows[1].querySelectorAll("td")[1];
    fireEvent.click(secondRowLastCell);
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith({ name: "Alice", age: 25 }, 1);
    const row = rows[0] as HTMLElement;
    expect(row.className).toContain("cursor-pointer");
    expect(row.getAttribute("tabindex")).toBe("0");
  });

  it("冒泡隔离：点行内复选框/按钮不触发 onRowClick", () => {
    const onRowClick = vi.fn();
    const { getAllByRole, container } = render(
      <Table
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        enableRowSelection
        renderExpandedRow={(row) => <div>明细：{row.original.name}</div>}
      />,
    );
    fireEvent.click(getAllByRole("checkbox", { name: "选择行" })[0]);
    fireEvent.click(getAllByRole("button", { name: "展开" })[0]);
    expect(onRowClick).not.toHaveBeenCalled();
    // 复选框/展开器各自功能照常
    expect((container.querySelector("tbody tr") as HTMLElement).getAttribute("data-selected")).toBe(
      "true",
    );
  });

  it("键盘：焦点落 <tr> 自身按 Enter/Space 触发；行内元素按键不劫持", () => {
    const onRowClick = vi.fn();
    const { container } = render(<Table columns={columns} data={data} onRowClick={onRowClick} />);
    const row = container.querySelector("tbody tr") as HTMLElement;
    fireEvent.keyDown(row, { key: "Enter" });
    fireEvent.keyDown(row, { key: " " });
    expect(onRowClick).toHaveBeenCalledTimes(2);
    // target ≠ currentTarget（模拟按键来自行内单元格内容）不触发
    fireEvent.keyDown(row.querySelector("td") as HTMLElement, { key: "Enter" });
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });
});

describe("整行导航（rowHref）", () => {
  it("返回 undefined 的行不可点：无 cursor-pointer/tabIndex；返回 href 的行可点", () => {
    const { container } = render(
      <Table
        columns={columns}
        data={data}
        rowHref={(row) => (row.name === "Alice" ? `/detail/${row.name}` : undefined)}
      />,
    );
    const rows = Array.from(container.querySelectorAll("tbody tr")) as HTMLElement[];
    const alice = rows.find((tr) => tr.textContent?.includes("Alice"))!;
    const bob = rows.find((tr) => tr.textContent?.includes("Bob"))!;
    expect(alice.className).toContain("cursor-pointer");
    expect(alice.getAttribute("tabindex")).toBe("0");
    expect(bob.className).not.toContain("cursor-pointer");
    expect(bob.getAttribute("tabindex")).toBeNull();
  });

  it("cmd/ctrl+点击 → window.open 新开 tab", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { container } = render(
      <Table columns={columns} data={data} rowHref={(row) => `/detail/${row.name}`} />,
    );
    fireEvent.click(container.querySelector("tbody tr td") as HTMLElement, { metaKey: true });
    expect(open).toHaveBeenCalledWith("/detail/Charlie", "_blank", "noopener");
    open.mockRestore();
  });

  it("与 onRowClick 同传：onRowClick 优先，不执行导航", () => {
    const onRowClick = vi.fn();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { container } = render(
      <Table
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        rowHref={(row) => `/detail/${row.name}`}
      />,
    );
    fireEvent.click(container.querySelector("tbody tr td") as HTMLElement, { metaKey: true });
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });
});

// ── 行拖拽排序 ──────────────────────────────────────────────────────────────
// 落点语义（activeId/overId/position）走纯函数 resolveRowDragEnd 直测：真实指针拖拽依赖
// 元素几何，jsdom 里所有 rect 恒为 0，模拟出来的「拖成功」是假象，不足以当断言依据。
describe("行拖拽排序 · resolveRowDragEnd（落点相对语义）", () => {
  // data = [Charlie, Alice, Bob]；未传 getRowId 时行 id 即 data 下标字符串
  const dragRows = data.map((d, i) => ({ id: String(i), index: i, original: d }));

  it("向下拖 → position=after（对标 baTable.dragSort 的 direction=down）", () => {
    const e = resolveRowDragEnd("0", "2", dragRows, data)!;
    expect(e).toMatchObject({
      activeId: "0",
      overId: "2",
      activeIndex: 0,
      overIndex: 2,
      position: "after",
    });
    expect(e.activeRow).toEqual(data[0]);
    expect(e.overRow).toEqual(data[2]);
    expect(e.nextData.map((r) => r.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("向上拖 → position=before（direction=up）", () => {
    const e = resolveRowDragEnd("2", "0", dragRows, data)!;
    expect(e).toMatchObject({
      activeId: "2",
      overId: "0",
      activeIndex: 2,
      overIndex: 0,
      position: "before",
    });
    expect(e.nextData.map((r) => r.name)).toEqual(["Bob", "Charlie", "Alice"]);
  });

  it("相邻行也按方向定 position（1→2=after，1→0=before）", () => {
    expect(resolveRowDragEnd("1", "2", dragRows, data)!.position).toBe("after");
    expect(resolveRowDragEnd("1", "0", dragRows, data)!.position).toBe("before");
  });

  it("落点未变 / 行 id 不存在 → 返回 null（调用方不触发回调）", () => {
    expect(resolveRowDragEnd("1", "1", dragRows, data)).toBeNull();
    expect(resolveRowDragEnd("1", "404", dragRows, data)).toBeNull();
    expect(resolveRowDragEnd("404", "1", dragRows, data)).toBeNull();
  });

  it("getRowId 自定义时原样回传业务主键（后端要的是 id 不是下标）", () => {
    const keyed = data.map((d, i) => ({ id: `u-${d.name}`, index: i, original: d }));
    const e = resolveRowDragEnd("u-Charlie", "u-Bob", keyed, data)!;
    expect(e.activeId).toBe("u-Charlie");
    expect(e.overId).toBe("u-Bob");
    expect(e.position).toBe("after");
  });

  it("表格已排序时：index 取可见行序，nextData 仍按 row.index 落回原 data", () => {
    // 可见顺序（按姓名升序）= Alice(data#1) / Bob(data#2) / Charlie(data#0)
    const sorted = [
      { id: "1", index: 1, original: data[1] },
      { id: "2", index: 2, original: data[2] },
      { id: "0", index: 0, original: data[0] },
    ];
    const e = resolveRowDragEnd("1", "0", sorted, data)!;
    expect(e.activeIndex).toBe(0); // Alice 在可见行序里是第 0 行
    expect(e.overIndex).toBe(2); // Charlie 是第 2 行
    expect(e.position).toBe("after");
    // arrayMove(data, 1, 0)：把 data#1(Alice) 挪到 data#0
    expect(e.nextData.map((r) => r.name)).toEqual(["Alice", "Charlie", "Bob"]);
  });
});

describe("行拖拽排序 · 手柄与禁用态（rowDraggable / dragHandle / getRowCanDrag）", () => {
  it("默认关：无手柄列、无拖拽按钮、行不带 sortable 语义", () => {
    const { queryByLabelText, container } = render(<Table columns={columns} data={data} />);
    expect(queryByLabelText("拖拽排序")).toBeNull();
    expect(container.querySelectorAll("thead th").length).toBe(2);
    expect(
      (container.querySelector("tbody tr") as HTMLElement).getAttribute("aria-roledescription"),
    ).toBeNull();
  });

  it("rowDraggable：前插手柄列（表头 +1），每行一个手柄按钮且排在首列", () => {
    const { getAllByLabelText, container } = render(
      <Table columns={columns} data={data} rowDraggable />,
    );
    expect(container.querySelectorAll("thead th").length).toBe(3);
    expect(getAllByLabelText("拖拽排序").length).toBe(3);
    const firstCell = container.querySelector("tbody tr td") as HTMLElement;
    expect(firstCell.querySelector('[aria-label="拖拽排序"]')).toBeTruthy();
  });

  it("dragHandle 默认 cell：activator 落在手柄按钮上，<tr> 不接管手势", () => {
    const { getAllByLabelText, container } = render(
      <Table columns={columns} data={data} rowDraggable />,
    );
    expect(getAllByLabelText("拖拽排序")[0].getAttribute("aria-roledescription")).toBe("sortable");
    const tr = container.querySelector("tbody tr") as HTMLElement;
    expect(tr.getAttribute("aria-roledescription")).toBeNull();
    expect(tr.className).not.toContain("cursor-grab");
  });

  it("dragHandle=row：不前插手柄列，activator 落在 <tr> 且保住 role=row", () => {
    const { queryByLabelText, container } = render(
      <Table columns={columns} data={data} rowDraggable dragHandle="row" />,
    );
    expect(queryByLabelText("拖拽排序")).toBeNull();
    expect(container.querySelectorAll("thead th").length).toBe(2); // 仅用户两列
    const tr = container.querySelector("tbody tr") as HTMLElement;
    expect(tr.getAttribute("role")).toBe("row"); // 不被 dnd-kit 改成 button
    expect(tr.getAttribute("aria-roledescription")).toBe("sortable");
    expect(tr.className).toContain("cursor-grab");
    expect(tr.className).toContain("touch-none");
  });

  it("禁用态（cell）：getRowCanDrag=false 的行手柄 disabled + 非抓手光标，其余行照常", () => {
    const { getAllByLabelText } = render(
      <Table
        columns={columns}
        data={data}
        rowDraggable
        getRowCanDrag={(row) => row.name !== "Alice"}
      />,
    );
    const handles = getAllByLabelText("拖拽排序") as HTMLButtonElement[];
    expect(handles.map((h) => h.disabled)).toEqual([false, true, false]); // Alice 是第 2 行
    expect(handles[1].className).toContain("cursor-not-allowed");
    expect(handles[0].className).toContain("cursor-grab");
  });

  it("禁用态（row）：不可拖的行 <tr> 不接 activator，无 sortable 语义/抓手光标", () => {
    const { container } = render(
      <Table
        columns={columns}
        data={data}
        rowDraggable
        dragHandle="row"
        getRowCanDrag={(row) => row.name !== "Alice"}
      />,
    );
    const trs = Array.from(container.querySelectorAll("tbody tr")) as HTMLElement[];
    const alice = trs.find((tr) => tr.textContent?.includes("Alice"))!;
    const bob = trs.find((tr) => tr.textContent?.includes("Bob"))!;
    expect(alice.getAttribute("aria-roledescription")).toBeNull();
    expect(alice.className).not.toContain("cursor-grab");
    expect(bob.getAttribute("aria-roledescription")).toBe("sortable");
  });

  it("树形子行恒不可拖（depth>0 手柄 disabled）", () => {
    const { getAllByRole, getAllByLabelText } = render(
      <Table columns={treeColumns} data={treeData} rowDraggable getSubRows={(r) => r.children} />,
    );
    fireEvent.click(getAllByRole("button", { name: "展开" })[0]);
    // 展开后可见行：父A / 子A1 / 子A2 / 父B
    const handles = getAllByLabelText("拖拽排序") as HTMLButtonElement[];
    expect(handles.map((h) => h.disabled)).toEqual([false, true, true, false]);
  });

  it("与行选择 / 展开明细共存：手柄列在最前，复选框与展开器功能不受影响", () => {
    const { getAllByRole, getAllByLabelText, getByText, container } = render(
      <Table
        columns={columns}
        data={data}
        rowDraggable
        enableRowSelection
        renderExpandedRow={(row) => <div>明细：{row.original.name}</div>}
      />,
    );
    // 手柄 + 选择 + 展开器 + 2 用户列
    expect(container.querySelectorAll("thead th").length).toBe(5);
    const cells = container.querySelectorAll("tbody tr:first-child td");
    expect(cells[0].querySelector('[aria-label="拖拽排序"]')).toBeTruthy();
    expect(cells[1].querySelector('[role="checkbox"]')).toBeTruthy();

    fireEvent.click(getAllByRole("checkbox", { name: "选择行" })[0]);
    expect((container.querySelector("tbody tr") as HTMLElement).getAttribute("data-selected")).toBe(
      "true",
    );
    fireEvent.click(getAllByRole("button", { name: "展开" })[0]);
    expect(getByText("明细：Charlie")).toBeTruthy();
    // 明细面板行不是数据行 → 不产手柄
    expect(getAllByLabelText("拖拽排序").length).toBe(3);
  });

  it("固定列共存：有 sticky 列时手柄列跟随固定到左侧", () => {
    const stickyColumns: ColumnDef<Row, any>[] = [
      { accessorKey: "name", header: "姓名", meta: { sticky: "left" } },
      { accessorKey: "age", header: "年龄" },
    ];
    const { container } = render(<Table columns={stickyColumns} data={data} rowDraggable />);
    const firstCell = container.querySelector("tbody td") as HTMLElement;
    expect(firstCell.style.position).toBe("sticky"); // 手柄列
    expect(firstCell.querySelector('[aria-label="拖拽排序"]')).toBeTruthy();
  });

  it("挂载 / 点手柄都不触发 onRowDragEnd（只有真正落点变化才触发）", () => {
    const onRowDragEnd = vi.fn();
    const { getAllByLabelText } = render(
      <Table columns={columns} data={data} rowDraggable onRowDragEnd={onRowDragEnd} />,
    );
    expect(onRowDragEnd).not.toHaveBeenCalled();
    fireEvent.click(getAllByLabelText("拖拽排序")[0]);
    expect(onRowDragEnd).not.toHaveBeenCalled();
  });

  it("行点击与拖拽同开（cell 模式）：点手柄不触发行点击", () => {
    const onRowClick = vi.fn();
    const { getAllByLabelText } = render(
      <Table columns={columns} data={data} rowDraggable onRowClick={onRowClick} />,
    );
    fireEvent.click(getAllByLabelText("拖拽排序")[0]);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("行点击与整行拖拽同开：Enter 仍触发行点击，Space 让位给 dnd-kit 抓起", () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <Table columns={columns} data={data} rowDraggable dragHandle="row" onRowClick={onRowClick} />,
    );
    const tr = container.querySelector("tbody tr") as HTMLElement;
    fireEvent.keyDown(tr, { key: "Enter" });
    expect(onRowClick).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(tr, { key: " " });
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });
});

describe("空态文案接 locale", () => {
  it("ConfigProvider locale=enUS 时默认空态为 No data", () => {
    const { getByText } = render(
      <ConfigProvider locale={enUS}>
        <Table columns={columns} data={[]} />
      </ConfigProvider>,
    );
    expect(getByText("No data")).toBeTruthy();
  });
});

// ── 列几何：列宽 / 对齐 / 溢出省略 / 拖拽调宽 ────────────────────────────────

function headers(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll("thead th"));
}
function firstRowCells(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll("tbody tr:first-child td"));
}

describe("列宽（ColumnDef.size / minSize / maxSize 落到渲染）", () => {
  it("显式 size 生效：th 与 td 同宽（宽度口径 th/td 一致，不分家）", () => {
    const sized: ColumnDef<Row, any>[] = [
      { accessorKey: "name", header: "姓名", size: 240 },
      { accessorKey: "age", header: "年龄", size: 80 },
    ];
    const { container } = render(<Table columns={sized} data={data} />);
    expect(headers(container).map((th) => th.style.width)).toEqual(["240px", "80px"]);
    expect(firstRowCells(container).map((td) => td.style.width)).toEqual(["240px", "80px"]);
  });

  it("没写 size 的列不落宽度（防塌成 TanStack 默认 150px 等宽）", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    expect(headers(container).map((th) => th.style.width)).toEqual(["", ""]);
    expect(firstRowCells(container).map((td) => td.style.width)).toEqual(["", ""]);
  });

  it("minSize / maxSize → min-width / max-width", () => {
    const sized: ColumnDef<Row, any>[] = [
      { accessorKey: "name", header: "姓名", minSize: 120 },
      { accessorKey: "age", header: "年龄", size: 200, maxSize: 160 },
    ];
    const { container } = render(<Table columns={sized} data={data} />);
    const th = headers(container);
    expect(th[0].style.minWidth).toBe("120px");
    expect(th[0].style.width).toBe("");
    // size 被 maxSize 夹住 → getSize() 出 160
    expect(th[1].style.width).toBe("160px");
    expect(th[1].style.maxWidth).toBe("160px");
  });

  it("默认 auto 布局：table 用 w-full 且不写 table-layout", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    const t = container.querySelector("table") as HTMLElement;
    expect(t.className).toContain("w-full");
    expect(t.style.tableLayout).toBe("");
  });

  it("layout=fixed：table-layout:fixed + 表宽 = 各列 getSize() 之和（未写 size 走默认 150）", () => {
    const sized: ColumnDef<Row, any>[] = [
      { accessorKey: "name", header: "姓名", size: 240 },
      { accessorKey: "age", header: "年龄" },
    ];
    const { container } = render(<Table columns={sized} data={data} layout="fixed" />);
    const t = container.querySelector("table") as HTMLElement;
    expect(t.style.tableLayout).toBe("fixed");
    expect(t.style.width).toBe(`${240 + 150}px`);
    expect(t.className).toContain("min-w-full");
    // fixed 下每列都出实宽
    expect(headers(container).map((th) => th.style.width)).toEqual(["240px", "150px"]);
  });
});

describe("对齐（meta.align / meta.headerAlign）", () => {
  const alignColumns: ColumnDef<Row, any>[] = [
    { accessorKey: "name", header: "姓名", meta: { align: "center" } },
    { accessorKey: "age", header: "年龄", meta: { align: "right", headerAlign: "center" } },
  ];

  it("align 落到 td；headerAlign 缺省时表头跟随 align", () => {
    const { container } = render(<Table columns={alignColumns} data={data} />);
    const td = firstRowCells(container);
    expect(td[0].className).toContain("text-center");
    expect(td[1].className).toContain("text-right");
    // 姓名列没写 headerAlign → 跟随 align=center
    expect(headers(container)[0].className).toContain("text-center");
  });

  it("headerAlign 覆盖 align（表头 center / 单元格 right）", () => {
    const { container } = render(<Table columns={alignColumns} data={data} />);
    const th = headers(container)[1];
    expect(th.className).toContain("text-center");
    expect(th.className).not.toContain("text-right");
    // 排序按钮所在的 flex 列须收成 items-center，否则按钮被拉伸、居中失效
    expect((th.querySelector("div") as HTMLElement).className).toContain("items-center");
  });

  it("不写 align：td 无对齐类、th 维持历史默认 text-left + 不加 items-*", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    const td = firstRowCells(container)[0];
    expect(td.className).not.toContain("text-center");
    expect(td.className).not.toContain("text-right");
    const th = headers(container)[0];
    expect(th.className).toContain("text-left");
    expect((th.querySelector("div") as HTMLElement).className).not.toContain("items-");
  });
});

describe("溢出省略（meta.ellipsis · 截断 + Tooltip）", () => {
  const longData: Row[] = [{ name: "一个非常非常长的名字需要被截断显示", age: 30 }];
  const ellipsisColumns: ColumnDef<Row, any>[] = [
    { accessorKey: "name", header: "姓名", size: 120, meta: { ellipsis: true } },
    { accessorKey: "age", header: "年龄" },
  ];

  it("td 加 overflow-hidden，内容包一层 truncate；并用 size 兜出 max-width 让截断生效", () => {
    const { container } = render(<Table columns={ellipsisColumns} data={longData} />);
    const td = firstRowCells(container)[0];
    expect(td.className).toContain("overflow-hidden");
    expect(td.style.maxWidth).toBe("120px");
    const clip = td.querySelector("span.truncate") as HTMLElement;
    expect(clip).not.toBeNull();
    expect(clip.textContent).toBe("一个非常非常长的名字需要被截断显示");
  });

  it("Tooltip 触发器渲成 <span> 而非 <button>：不被行点击的冒泡隔离选择器命中", () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <Table columns={ellipsisColumns} data={longData} onRowClick={onRowClick} />,
    );
    const td = firstRowCells(container)[0];
    expect(td.querySelector("button")).toBeNull();
    fireEvent.click(td);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("非 ellipsis 列不包 truncate、不加 overflow-hidden", () => {
    const { container } = render(<Table columns={ellipsisColumns} data={longData} />);
    const td = firstRowCells(container)[1];
    expect(td.className).not.toContain("overflow-hidden");
    expect(td.querySelector("span.truncate")).toBeNull();
  });
});

describe("列宽拖拽（resizable）", () => {
  const sized: ColumnDef<Row, any>[] = [
    { accessorKey: "name", header: "姓名", size: 200 },
    { accessorKey: "age", header: "年龄", size: 100 },
  ];

  it("默认不出手柄；resizable 开启后每列表头一个手柄 + 强制 fixed 布局", () => {
    const { container, rerender } = render(<Table columns={sized} data={data} />);
    expect(container.querySelectorAll('[role="separator"]').length).toBe(0);

    rerender(<Table columns={sized} data={data} resizable />);
    expect(container.querySelectorAll('thead [role="separator"]').length).toBe(2);
    expect((container.querySelector("table") as HTMLElement).style.tableLayout).toBe("fixed");
  });

  it("拖拽手柄改列宽：th/td 同步变宽，表格总宽同步变大", () => {
    const { container } = render(<Table columns={sized} data={data} resizable />);
    const handle = container.querySelectorAll('thead [role="separator"]')[0] as HTMLElement;
    fireEvent.mouseDown(handle, { clientX: 0 });
    fireEvent.mouseMove(document, { clientX: 60 });
    fireEvent.mouseUp(document, { clientX: 60 });

    expect(headers(container)[0].style.width).toBe("260px");
    expect(firstRowCells(container)[0].style.width).toBe("260px");
    expect((container.querySelector("table") as HTMLElement).style.width).toBe("360px");
  });

  it("内建前插列（选择列）不出拖拽手柄", () => {
    const { container } = render(
      <Table columns={sized} data={data} resizable enableRowSelection />,
    );
    const ths = headers(container);
    expect(ths.length).toBe(3);
    expect(ths[0].querySelector('[role="separator"]')).toBeNull(); // 选择列
    expect(ths[1].querySelector('[role="separator"]')).not.toBeNull();
  });

  it("受控 columnSizing：外部态直接决定列宽", () => {
    const onColumnSizingChange = vi.fn();
    const { container } = render(
      <Table
        columns={sized}
        data={data}
        resizable
        columnSizing={{ name: 320 }}
        onColumnSizingChange={onColumnSizingChange}
      />,
    );
    expect(headers(container)[0].style.width).toBe("320px");
  });
});

describe("固定列 offset 随列宽变化重算", () => {
  const stickyOf = (nameSize: number): ColumnDef<Row, any>[] => [
    { accessorKey: "name", header: "姓名", size: nameSize, meta: { sticky: "left" } },
    { accessorKey: "age", header: "年龄", size: 80, meta: { sticky: "left" } },
  ];

  it("第二个左固定列的 left = 前一个固定列的实宽；改 size → offset 跟着变", () => {
    const { container, rerender } = render(<Table columns={stickyOf(200)} data={data} />);
    let th = headers(container);
    expect(th[0].style.left).toBe("0px");
    expect(th[0].style.width).toBe("200px");
    expect(th[1].style.left).toBe("200px");

    rerender(<Table columns={stickyOf(120)} data={data} />);
    th = headers(container);
    expect(th[0].style.width).toBe("120px");
    expect(th[1].style.left).toBe("120px");
    // td 与 th 同口径
    expect(firstRowCells(container)[1].style.left).toBe("120px");
  });

  it("固定列没写 size 也钉死 getSize()：渲染宽与 offset 口径一致（默认 150）", () => {
    const noSize: ColumnDef<Row, any>[] = [
      { accessorKey: "name", header: "姓名", meta: { sticky: "left" } },
      { accessorKey: "age", header: "年龄", meta: { sticky: "left" } },
    ];
    const { container } = render(<Table columns={noSize} data={data} />);
    const th = headers(container);
    expect(th[0].style.width).toBe("150px");
    expect(th[1].style.left).toBe("150px");
  });

  it("前插的选择列跟随左固定，其 44px 计入后续固定列 offset", () => {
    const { container } = render(
      <Table columns={stickyOf(200)} data={data} enableRowSelection />,
    );
    const th = headers(container);
    expect(th[0].style.left).toBe("0px"); // 选择列
    expect(th[0].style.width).toBe("44px");
    expect(th[1].style.left).toBe("44px"); // 姓名
    expect(th[2].style.left).toBe("244px"); // 年龄 = 44 + 200
  });

  it("拖拽调宽后固定列 offset 同帧重算", () => {
    const { container } = render(<Table columns={stickyOf(200)} data={data} resizable />);
    expect(headers(container)[1].style.left).toBe("200px");

    const handle = container.querySelectorAll('thead [role="separator"]')[0] as HTMLElement;
    fireEvent.mouseDown(handle, { clientX: 0 });
    fireEvent.mouseMove(document, { clientX: 50 });
    fireEvent.mouseUp(document, { clientX: 50 });

    expect(headers(container)[0].style.width).toBe("250px");
    expect(headers(container)[1].style.left).toBe("250px");
  });
});

describe("表头换行", () => {
  it("表头恒 nowrap —— 否则 auto 布局会把中文表头挤成一列一个字", () => {
    const { container } = render(
      <Table
        columns={[
          { accessorKey: "a", header: "拆出条目" },
          { accessorKey: "b", header: "待复核" },
        ]}
        data={[{ a: 1, b: 2 }]}
      />,
    );
    for (const th of Array.from(container.querySelectorAll("th"))) {
      expect(th.className).toContain("whitespace-nowrap");
    }
  });
});

// 虚拟滚动此前完全没有测试保护 —— 它的失效方式还特别安静：
// 出问题时表格照样渲染、数据照样在，只是把 N 万行全铺进 DOM，页面卡死而没有任何报错。
//
// 注意断言的是**滚动容器的结构**，不是「渲染了几行」：jsdom 里元素尺寸恒为 0，
// @tanstack/react-virtual 量不到视口就返回空窗口（实测一行数据都不渲染），
// 按行数写的断言在这里只会测出 0，既证明不了虚拟化生效、也拦不住回归。
// 窗口内的行数是否正确属于真机验证的范畴，这里守住「virtual 确实被消费了」这条线。
describe("Table 虚拟滚动", () => {
  const many: Row[] = Array.from({ length: 200 }, (_, i) => ({
    name: `员工${i + 1}`,
    age: 20 + (i % 40),
  }));

  it("开启后把表体套进定高滚动容器", () => {
    const { container } = render(
      <Table columns={columns} data={many} virtual={{ enabled: true, height: 360, rowHeight: 44 }} />,
    );
    const scroller = container.querySelector<HTMLElement>('div[style*="overflow"]');
    expect(scroller).not.toBeNull();
    expect(scroller!.style.height).toBe("360px");
    expect(scroller!.style.overflow).toBe("auto");
  });

  it("不开启时全量渲染、且不套滚动容器（默认行为不受影响）", () => {
    const { container } = render(<Table columns={columns} data={many} />);
    expect(container.querySelectorAll("tbody tr").length).toBe(many.length);
    expect(container.querySelector('div[style*="overflow"]')).toBeNull();
  });
});

// jsdom 没有布局引擎：scrollWidth / clientWidth / getBoundingClientRect 恒为 0，
// 所以「什么时候该出现」这条判据只能靠桩来驱动。这里桩的是**输入**（几何量），
// 断言的是组件自己的判定与同步逻辑 —— 那才是会回归的部分。
// 真实的滚动条外观与拖拽手感属于实机验证范畴，不在这里断言。
describe("Table 底部悬浮横向滚动条", () => {
  const stubGeometry = (
    el: HTMLElement,
    { scrollWidth, clientWidth, bottom }: { scrollWidth: number; clientWidth: number; bottom: number },
  ) => {
    Object.defineProperty(el, "scrollWidth", { value: scrollWidth, configurable: true });
    Object.defineProperty(el, "clientWidth", { value: clientWidth, configurable: true });
    el.getBoundingClientRect = () => ({ bottom }) as DOMRect;
  };
  const barOf = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('div[aria-hidden="true"].sticky');

  it("不开启时不多出任何节点（DOM 与加这个 prop 之前一致）", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    expect(barOf(container)).toBeNull();
    // 根节点仍是滚动容器本身，没有被多包一层
    expect(container.firstElementChild!.className).toContain("overflow-x-auto");
  });

  it("开启后渲染代理条；内容不溢出时收起", () => {
    const { container } = render(<Table columns={columns} data={data} stickyScrollbar />);
    const bar = barOf(container);
    expect(bar).not.toBeNull();
    expect(bar!.classList.contains("hidden")).toBe(true);
  });

  it("溢出且表格底边在视口之下 → 显示，占位宽度等于 scrollWidth", () => {
    const { container } = render(<Table columns={columns} data={data} stickyScrollbar />);
    const scroller = container.querySelector<HTMLElement>(".overflow-x-auto")!;
    stubGeometry(scroller, { scrollWidth: 1600, clientWidth: 800, bottom: 5000 });
    fireEvent.scroll(window);
    const bar = barOf(container)!;
    expect(bar.classList.contains("hidden")).toBe(false);
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("1600px");
  });

  it("滚到表底（真滚动条自己看得见了）就收起，不并排出两条", () => {
    const { container } = render(<Table columns={columns} data={data} stickyScrollbar />);
    const scroller = container.querySelector<HTMLElement>(".overflow-x-auto")!;
    stubGeometry(scroller, { scrollWidth: 1600, clientWidth: 800, bottom: 5000 });
    fireEvent.scroll(window);
    expect(barOf(container)!.classList.contains("hidden")).toBe(false);
    stubGeometry(scroller, { scrollWidth: 1600, clientWidth: 800, bottom: 100 });
    fireEvent.scroll(window);
    expect(barOf(container)!.classList.contains("hidden")).toBe(true);
  });

  it("拖代理条 → 真容器跟着横向滚动", () => {
    const { container } = render(<Table columns={columns} data={data} stickyScrollbar />);
    const scroller = container.querySelector<HTMLElement>(".overflow-x-auto")!;
    stubGeometry(scroller, { scrollWidth: 1600, clientWidth: 800, bottom: 5000 });
    fireEvent.scroll(window);
    const bar = barOf(container)!;
    // jsdom 里元素不可滚动，scrollLeft 的赋值是 no-op、读回恒 0 —— 不接一个真属性
    // 这条测的就只是「0 等于 0」，永远绿、什么都拦不住。
    let barLeft = 0;
    let scrollerLeft = 0;
    Object.defineProperty(bar, "scrollLeft", {
      get: () => barLeft,
      set: (v: number) => (barLeft = v),
      configurable: true,
    });
    Object.defineProperty(scroller, "scrollLeft", {
      get: () => scrollerLeft,
      set: (v: number) => (scrollerLeft = v),
      configurable: true,
    });
    bar.scrollLeft = 320;
    fireEvent.scroll(bar);
    expect(scrollerLeft).toBe(320);
  });

  it("virtual 开启时不启用（容器定高，真滚动条一直看得见）", () => {
    const { container } = render(
      <Table columns={columns} data={data} stickyScrollbar virtual={{ enabled: true }} />,
    );
    expect(barOf(container)).toBeNull();
  });
});

// #176：单元格合并（el-table :span-method 的等价能力）
describe("Table 单元格合并（#176）", () => {
  interface StoreRow {
    store: string;
    guide: string;
    amount: number;
  }
  const storeData: StoreRow[] = [
    { store: "天河店", guide: "张三", amount: 12 },
    { store: "天河店", guide: "李四", amount: 8 },
    { store: "越秀店", guide: "王五", amount: 5 },
  ];
  const storeColumns: ColumnDef<StoreRow, any>[] = [
    { accessorKey: "store", header: "门店" },
    { accessorKey: "guide", header: "导购" },
    { accessorKey: "amount", header: "单量" },
  ];

  // 「与上一行同门店就并成一格」——按数据判断，不依赖原始下标，故排序后依旧成立。
  const mergeStore: NonNullable<React.ComponentProps<typeof Table<StoreRow>>["cellSpan"]> = ({
    rows,
    rowIndex,
    columnId,
  }) => {
    if (columnId !== "store") return;
    let span = 1;
    while (rows[rowIndex + span]?.store === rows[rowIndex]?.store) span += 1;
    return { rowSpan: span };
  };

  it("首行写 rowSpan，被合掉的行整格不渲染（不是留空格）", () => {
    const { container } = render(
      <Table columns={storeColumns} data={storeData} cellSpan={mergeStore} />,
    );
    const trs = container.querySelectorAll("tbody tr");
    const firstRowCells = trs[0].querySelectorAll("td");
    expect(firstRowCells[0].getAttribute("rowspan")).toBe("2");
    expect(firstRowCells.length).toBe(3);
    // 第二行少一格：门店那格被合掉了，剩下的两格不该被挤位
    const secondRowCells = trs[1].querySelectorAll("td");
    expect(secondRowCells.length).toBe(2);
    expect(secondRowCells[0].textContent).toBe("李四");
    // 第三行是新门店，自成一格（rowSpan=1 不写属性）
    const thirdRowCells = trs[2].querySelectorAll("td");
    expect(thirdRowCells.length).toBe(3);
    expect(thirdRowCells[0].getAttribute("rowspan")).toBeNull();
  });

  it("回调按渲染顺序推进：同门店不相邻时一格都不合并（排序打乱后不会错位）", () => {
    const interleaved: StoreRow[] = [
      { store: "天河店", guide: "张三", amount: 12 },
      { store: "越秀店", guide: "王五", amount: 5 },
      { store: "天河店", guide: "李四", amount: 8 },
    ];
    const { container } = render(
      <Table columns={storeColumns} data={interleaved} cellSpan={mergeStore} />,
    );
    const rowspans = Array.from(container.querySelectorAll("tbody td")).map((td) =>
      td.getAttribute("rowspan"),
    );
    expect(rowspans.every((v) => v === null)).toBe(true);
    expect(container.querySelectorAll("tbody tr td").length).toBe(9);
  });

  it("colSpan 横跨：右侧格子不渲染", () => {
    const { container } = render(
      <Table
        columns={storeColumns}
        data={storeData}
        cellSpan={({ rowIndex, columnIndex }) =>
          rowIndex === 0 && columnIndex === 1 ? { colSpan: 2 } : undefined
        }
      />,
    );
    const firstRowCells = container.querySelectorAll("tbody tr")[0].querySelectorAll("td");
    expect(firstRowCells.length).toBe(2);
    expect(firstRowCells[1].getAttribute("colspan")).toBe("2");
  });

  it("不传 cellSpan 时 DOM 与此前一致（无 rowspan/colspan 属性）", () => {
    const { container } = render(<Table columns={storeColumns} data={storeData} />);
    expect(container.querySelector("tbody td[rowspan]")).toBeNull();
    expect(container.querySelector("tbody td[colspan]")).toBeNull();
  });

  it("与虚拟滚动同开时静默不合并并告警（跨窗口的合并无解）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <Table
        columns={storeColumns}
        data={storeData}
        cellSpan={mergeStore}
        virtual={{ enabled: true, height: 200 }}
      />,
    );
    expect(container.querySelector("tbody td[rowspan]")).toBeNull();
    warn.mockRestore();
  });

  it("与明细展开同开时同样不合并（面板行会插在数据行之间）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <Table
        columns={storeColumns}
        data={storeData}
        cellSpan={mergeStore}
        renderExpandedRow={() => <div>明细</div>}
      />,
    );
    expect(container.querySelector("tbody td[rowspan]")).toBeNull();
    warn.mockRestore();
  });
});


// #191 / #192 / #193 / #194：宽表与长表的一批排版能力
describe("Table 排版与滚动（#191–#194）", () => {
  it("空态贴滚动视口而不是表宽居中（宽表下否则跑到视口外）", () => {
    const { container } = render(<Table columns={columns} data={[]} />);
    const cell = container.querySelector("tbody td")!;
    // 空态包在 sticky left-0 的盒子里：横滚时它始终钉在视口左缘
    const box = cell.firstElementChild as HTMLElement;
    expect(box.className).toContain("sticky");
    expect(box.className).toContain("left-0");
    expect(box.textContent).toContain("暂无数据");
  });

  it("minWidth 落在 <table> 本体（写进 className 的 min-w-* 钉的是滚动外壳）", () => {
    const { container } = render(<Table columns={columns} data={data} minWidth={940} />);
    const shell = container.firstElementChild as HTMLElement;
    const tableEl = container.querySelector("table") as HTMLElement;
    expect(tableEl.style.minWidth).toBe("940px");
    expect(shell.style.minWidth).toBe("");
    expect(shell.className).toContain("overflow-x-auto");
  });

  it("stickyHeader + maxHeight：表头吸顶，外壳成为定高滚动容器", () => {
    const { container } = render(
      <Table columns={columns} data={data} stickyHeader maxHeight={320} />,
    );
    const shell = container.firstElementChild as HTMLElement;
    expect(shell.style.maxHeight).toBe("320px");
    expect(shell.style.overflow).toBe("auto");
    expect(container.querySelector("thead")!.className).toContain("sticky");
  });

  it("只给 stickyHeader 不给 maxHeight：dev 告警且不假装生效", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Table columns={columns} data={data} stickyHeader />);
    const shell = document.body.querySelector("div")!;
    expect(shell.style.maxHeight).toBe("");
    warn.mockRestore();
  });

  it("不传新 prop 时 DOM 与此前一致（表头不 sticky、表无 min-width）", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    expect(container.querySelector("thead")!.className).not.toContain("sticky");
    expect((container.querySelector("table") as HTMLElement).style.minWidth).toBe("");
  });

  it("列 meta 控制垂直对齐与换行；表级默认可被列覆盖", () => {
    const cols: ColumnDef<Row, any>[] = [
      { accessorKey: "name", header: "姓名", meta: { whitespace: "normal" } },
      { accessorKey: "age", header: "年龄" },
    ];
    const { container } = render(
      <Table columns={cols} data={data} cellVerticalAlign="top" cellWhitespace="nowrap" />,
    );
    const [nameCell, ageCell] = Array.from(container.querySelectorAll("tbody tr:first-child td"));
    expect(nameCell.className).toContain("align-top"); // 表级默认
    expect(nameCell.className).toContain("whitespace-normal"); // 列覆盖表级
    expect(nameCell.className).toContain("break-words"); // 长串不撑破列宽
    expect(ageCell.className).toContain("whitespace-nowrap"); // 未覆盖的列跟随表级
  });

  it("pre-wrap 保留原文换行，且默认仍是 align-middle", () => {
    const cols: ColumnDef<Row, any>[] = [
      { accessorKey: "name", header: "姓名", meta: { whitespace: "pre-wrap", verticalAlign: "top" } },
      { accessorKey: "age", header: "年龄" },
    ];
    const { container } = render(<Table columns={cols} data={data} />);
    const [nameCell, ageCell] = Array.from(container.querySelectorAll("tbody tr:first-child td"));
    expect(nameCell.className).toContain("whitespace-pre-wrap");
    expect(nameCell.className).toContain("align-top");
    expect(ageCell.className).toContain("align-middle");
  });
});

// —— 常驻整宽附属行 + 表尾（#237）——
describe("Table renderRowExtra / footer", () => {
  it("不传时不渲染任何附属行与 tfoot（与加这两个 prop 之前逐字一致）", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    expect(container.querySelectorAll("tbody tr").length).toBe(3);
    expect(container.querySelector("tfoot")).toBeNull();
  });

  it("renderRowExtra 每行可挂 0..N 条整宽行，不前插展开器列、不需要展开态", () => {
    const { container } = render(
      <Table
        columns={columns}
        data={data}
        renderRowExtra={(row, ctx) =>
          row.original.name === "Alice"
            ? [0, 1].map((i) => (
                <tr key={i} data-extra="1">
                  <td colSpan={ctx.colSpan}>证书 {i}</td>
                </tr>
              ))
            : null
        }
      />,
    );
    // 展开器列没有被前插：仍是 2 列表头
    expect(container.querySelectorAll("thead th").length).toBe(2);
    const extras = container.querySelectorAll("tbody tr[data-extra]");
    expect(extras.length).toBe(2);
    // 紧跟在 Alice 那一行之后
    const rows = Array.from(container.querySelectorAll("tbody tr"));
    expect(rows[1].textContent).toContain("Alice");
    expect(rows[2].getAttribute("data-extra")).toBe("1");
    expect(rows[3].getAttribute("data-extra")).toBe("1");
  });

  it("ctx.colSpan = 当前可见列数，含自动前插的选择列", () => {
    const seen: number[] = [];
    render(
      <Table
        columns={columns}
        data={data}
        enableRowSelection
        renderRowExtra={(_row, ctx) => {
          seen.push(ctx.colSpan);
          return null;
        }}
      />,
    );
    expect(seen).toEqual([3, 3, 3]); // 2 列用户列 + 1 列复选框
  });

  it("ctx.rowIndex 是渲染顺序下标（排序之后）", () => {
    const seen: string[] = [];
    render(
      <Table
        columns={columns}
        data={data}
        sorting={[{ id: "name", desc: false }]}
        renderRowExtra={(row, ctx) => {
          seen.push(`${ctx.rowIndex}:${row.original.name}`);
          return null;
        }}
      />,
    );
    expect(seen).toEqual(["0:Alice", "1:Bob", "2:Charlie"]);
  });

  it("renderRowExtra 与 cellSpan 同开：静默不合并 + dev 告警", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <Table
        columns={columns}
        data={data}
        renderRowExtra={() => null}
        cellSpan={({ columnIndex, rowIndex }) =>
          columnIndex === 0 && rowIndex === 0 ? { rowSpan: 2 } : undefined
        }
      />,
    );
    expect(container.querySelector("tbody td[rowspan]")).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("footer 渲染进 tfoot；函数形态拿到可见行与 colSpan", () => {
    const { container } = render(
      <Table
        columns={columns}
        data={data}
        footer={(ctx) => (
          <tr>
            <td colSpan={ctx.colSpan}>合计 {ctx.rows.reduce((s, r) => s + r.age, 0)}</td>
          </tr>
        )}
      />,
    );
    const cell = container.querySelector("tfoot td")!;
    expect(cell.textContent).toBe("合计 90");
    expect(cell.getAttribute("colspan")).toBe("2");
  });

  it("footer 的 rows 是筛选后的可见行，不是原始 data", () => {
    const { container } = render(
      <Table
        columns={[{ accessorKey: "name", header: "姓名", meta: { filterable: true } }, columns[1]]}
        data={data}
        columnFilters={[{ id: "name", value: "li" }]}
        footer={(ctx) => (
          <tr>
            <td>{ctx.rows.map((r) => r.name).join(",")}</td>
          </tr>
        )}
      />,
    );
    expect(container.querySelector("tfoot td")!.textContent).toBe("Charlie,Alice");
  });

  it("footer 在空表下照常渲染（与 EditableTable.summary 的区别）", () => {
    const { container } = render(
      <Table
        columns={columns}
        data={[]}
        footer={
          <tr>
            <td>+ 手动添加</td>
          </tr>
        }
      />,
    );
    expect(container.querySelector("tfoot")!.textContent).toContain("+ 手动添加");
  });
});

// —— 表头吸顶两档（#238）——
describe("Table stickyHeader 档位", () => {
  it("不传 stickyHeader：thead 不 sticky，外壳仍有 overflow-x-auto", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    expect(container.querySelector("thead")!.className).not.toContain("sticky");
    expect(container.firstElementChild!.className).toContain("overflow-x-auto");
  });

  it('stickyHeader="scrollParent"：thead sticky，且外壳去掉 overflow-x-auto（否则表头被锚死在外壳上）', () => {
    const { container } = render(
      <Table columns={columns} data={data} stickyHeader="scrollParent" />,
    );
    expect(container.querySelector("thead")!.className).toContain("sticky");
    expect(container.firstElementChild!.className).not.toContain("overflow-x-auto");
    // 不产生表内滚动区
    expect((container.firstElementChild as HTMLElement).style.overflow).toBe("");
  });

  it('stickyHeader="scrollParent" 不要求 maxHeight（不告警）', () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Table columns={columns} data={data} stickyHeader="scrollParent" />);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('stickyHeader="self" 与 true 逐字等价（缺 maxHeight 时都保持原样）', () => {
    // 告警走 warnOnce，同一 key 在本文件更早的用例里已经烧掉，这里只比 DOM
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const self = render(<Table columns={columns} data={data} stickyHeader="self" />);
    const bool = render(<Table columns={columns} data={data} stickyHeader />);
    expect(self.container.innerHTML).toBe(bool.container.innerHTML);
    expect(self.container.firstElementChild!.className).toContain("overflow-x-auto");
    warn.mockRestore();
  });

  it("stickyHeaderOffset 落成 thead 的 top（不传则不写内联 style）", () => {
    const { container } = render(
      <Table columns={columns} data={data} stickyHeader="scrollParent" stickyHeaderOffset={56} />,
    );
    expect((container.querySelector("thead") as HTMLElement).style.top).toBe("56px");
    const plain = render(<Table columns={columns} data={data} stickyHeader="scrollParent" />);
    expect((plain.container.querySelector("thead") as HTMLElement).style.top).toBe("");
  });

  it('stickyHeader="scrollParent" + stickyScrollbar：忽略代理条并告警', () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <Table columns={columns} data={data} stickyHeader="scrollParent" stickyScrollbar />,
    );
    // 代理条那层外壳不出现：根节点直接就是滚动外壳（带 border）
    expect(container.firstElementChild!.className).toContain("border-border");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

// —— 组合原语（#241）——
describe("Table 组合原语", () => {
  const primitive = (props?: Partial<React.ComponentProps<typeof TableRoot>>) =>
    render(
      <TableRoot {...props}>
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead align="right">年龄</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell align="right">25</TableCell>
          </TableRow>
          <TableRow selected>
            <TableCell colSpan={2}>Bob</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>合计 2 人</TableCell>
          </TableRow>
        </TableFooter>
      </TableRoot>,
    );

  it("渲染出真实的 table 结构（thead/tbody/tfoot + th/td）", () => {
    const { container, getByRole, getAllByRole } = primitive();
    expect(getByRole("table")).toBeTruthy();
    expect(getAllByRole("columnheader").length).toBe(2);
    expect(container.querySelectorAll("tbody tr").length).toBe(2);
    expect(container.querySelector("tfoot td")!.textContent).toBe("合计 2 人");
    expect(container.querySelector("td[colspan='2']")).toBeTruthy();
  });

  it("皮肤与高层 Table 同源：外壳描边 + 表头半粗不换行 + 单元格默认内边距", () => {
    const { container } = primitive();
    expect(container.firstElementChild!.className).toContain("border-border");
    expect(container.firstElementChild!.className).toContain("overflow-x-auto");
    const th = container.querySelector("th")!;
    expect(th.className).toContain("font-semibold");
    expect(th.className).toContain("whitespace-nowrap");
    expect(th.className).toContain("px-3 py-2");
    expect(container.querySelector("tbody td")!.className).toContain("px-3 py-2");
  });

  it("density 经 TableRoot 下发到 th/td", () => {
    const { container } = primitive({ density: "compact" });
    expect(container.querySelector("th")!.className).toContain("px-2 py-1");
    expect(container.querySelector("tbody td")!.className).toContain("px-2 py-1");
  });

  it("表头行不吃 last:border-0（单行表头的底边线不能被抹掉），表体行才有 hover", () => {
    const { container } = primitive();
    const headRow = container.querySelector("thead tr")!;
    const bodyRow = container.querySelector("tbody tr")!;
    expect(headRow.className).toContain("border-b");
    expect(headRow.className).not.toContain("last:border-0");
    expect(headRow.className).not.toContain("hover:bg-surface-hover");
    expect(bodyRow.className).toContain("hover:bg-surface-hover");
    expect(bodyRow.className).toContain("last:border-0");
  });

  it("striped 默认关；开了只作用于表体行", () => {
    const off = primitive();
    expect(off.container.querySelector("tbody tr")!.className).not.toContain("even:");
    const on = primitive({ striped: true });
    expect(on.container.querySelector("tbody tr")!.className).toContain("even:bg-surface-hover/40");
    expect(on.container.querySelector("thead tr")!.className).not.toContain("even:");
  });

  it("selected 落 data-selected + 主色底", () => {
    const { container } = primitive();
    const rows = Array.from(container.querySelectorAll("tbody tr"));
    expect(rows[0].getAttribute("data-selected")).toBeNull();
    expect(rows[1].getAttribute("data-selected")).toBe("true");
    expect(rows[1].className).toContain("bg-primary/10");
  });

  it("align 走 class 而不是 HTML 的废弃 align 属性", () => {
    const { container } = primitive();
    const th = container.querySelectorAll("th")[1];
    expect(th.className).toContain("text-right");
    expect(th.getAttribute("align")).toBeNull();
    expect(container.querySelectorAll("tbody td")[1].className).toContain("text-right");
  });

  it("bordered=false 去外框；minWidth / layout 落在 <table> 本体", () => {
    const { container } = primitive({ bordered: false, minWidth: 960, layout: "fixed" });
    expect(container.firstElementChild!.className).not.toContain("border-border");
    const table = container.querySelector("table") as HTMLElement;
    expect(table.style.minWidth).toBe("960px");
    expect(table.style.tableLayout).toBe("fixed");
  });

  it("className 落外壳、tableClassName 落 <table>；原生属性照常透传", () => {
    const { container } = render(
      <TableRoot className="shell-x" tableClassName="table-x" data-testid="root">
        <TableBody>
          <TableRow>
            <TableCell title="t">x</TableCell>
          </TableRow>
        </TableBody>
      </TableRoot>,
    );
    expect(container.firstElementChild!.className).toContain("shell-x");
    expect(container.firstElementChild!.getAttribute("data-testid")).toBe("root");
    expect(container.querySelector("table")!.className).toContain("table-x");
    expect(container.querySelector("td")!.getAttribute("title")).toBe("t");
  });

  it("原语与高层 Table 互不影响：高层 Table 渲染结果不因原语存在而变", () => {
    const { container } = render(<Table columns={columns} data={data} />);
    expect(container.querySelectorAll("tbody tr").length).toBe(3);
    expect(container.querySelector("tbody td")!.className).toContain("px-3 py-2");
  });
});
