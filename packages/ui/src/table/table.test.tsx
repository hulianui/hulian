import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Table } from "./table";
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
