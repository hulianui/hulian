import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import type { ColumnDef } from "../table/table.types";
import { ProTable } from "./pro-table";

interface Row {
  id: number;
  name: string;
}
const columns: ColumnDef<Row, any>[] = [
  { accessorKey: "id", header: "工号" },
  { accessorKey: "name", header: "姓名" },
];
const data: Row[] = [
  { id: 1, name: "甲" },
  { id: 2, name: "乙" },
];

describe("ProTable", () => {
  it("渲染标题与表格数据", () => {
    const { getByText } = render(<ProTable title="员工列表" columns={columns} data={data} />);
    expect(getByText("员工列表")).toBeTruthy();
    expect(getByText("甲")).toBeTruthy();
    expect(getByText("乙")).toBeTruthy();
  });

  it("默认渲染内置工具栏四件（刷新/密度/列设置/全屏）", () => {
    // 刷新键仅在传 onReload 时渲染（避免无 handler 的死按钮）。
    const { getByLabelText } = render(<ProTable columns={columns} data={data} onReload={() => {}} />);
    expect(getByLabelText("刷新")).toBeTruthy();
    expect(getByLabelText(/密度/)).toBeTruthy();
    expect(getByLabelText("列设置")).toBeTruthy();
    expect(getByLabelText("全屏")).toBeTruthy();
  });

  it("未传 onReload 时不渲染刷新键（避免死按钮）", () => {
    const { queryByLabelText } = render(<ProTable columns={columns} data={data} />);
    expect(queryByLabelText("刷新")).toBeNull();
    expect(queryByLabelText("列设置")).toBeTruthy();
  });

  it("toolbar=false 不渲染内置工具栏", () => {
    const { queryByLabelText } = render(<ProTable columns={columns} data={data} toolbar={false} />);
    expect(queryByLabelText("刷新")).toBeNull();
    expect(queryByLabelText("列设置")).toBeNull();
  });

  it("toolbar 对象逐项关闭（关全屏）", () => {
    const { queryByLabelText, getByLabelText } = render(
      <ProTable columns={columns} data={data} toolbar={{ fullscreen: false }} onReload={() => {}} />,
    );
    expect(getByLabelText("刷新")).toBeTruthy();
    expect(queryByLabelText("全屏")).toBeNull();
  });

  it("点击刷新触发 onReload", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(<ProTable columns={columns} data={data} onReload={fn} />);
    fireEvent.click(getByLabelText("刷新"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("loading 时刷新图标旋转", () => {
    const { getByLabelText } = render(<ProTable columns={columns} data={data} loading onReload={() => {}} />);
    expect(getByLabelText("刷新").querySelector(".animate-spin")).toBeTruthy();
  });

  it("密度切换改变单元格内边距（py-2 → py-1.5）", () => {
    const { container, getByLabelText } = render(<ProTable columns={columns} data={data} />);
    expect(container.querySelector("td.py-2")).toBeTruthy();
    fireEvent.click(getByLabelText(/密度/));
    expect(container.querySelector("td.py-1\\.5")).toBeTruthy();
  });

  it("全屏切换给根容器加 fixed", () => {
    const { container, getByLabelText } = render(<ProTable columns={columns} data={data} />);
    expect(container.firstElementChild!.className).not.toContain("fixed");
    fireEvent.click(getByLabelText("全屏"));
    expect(container.firstElementChild!.className).toContain("fixed");
  });

  it("分页：渲染总条数文案", () => {
    const { getByText } = render(
      <ProTable
        columns={columns}
        data={data}
        pagination={{ page: 1, pageSize: 10, total: 47, onPageChange: () => {} }}
      />,
    );
    expect(getByText("共 47 条")).toBeTruthy();
  });

  it("透传 rootClassName 到根容器", () => {
    const { container } = render(
      <ProTable columns={columns} data={data} rootClassName="my-pro" />,
    );
    expect(container.firstElementChild!.classList.contains("my-pro")).toBe(true);
  });

  it("透传 enableRowSelection 给 Table（前插全选列）", () => {
    const { getByLabelText } = render(
      <ProTable columns={columns} data={data} enableRowSelection getRowId={(r) => String(r.id)} />,
    );
    expect(getByLabelText("全选")).toBeTruthy();
  });
});
