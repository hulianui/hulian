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
