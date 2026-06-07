import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { useRef } from "react";
import type { ColumnDef } from "../table/table.types";
import { ProTable } from "./pro-table";
import type { ProTableActions, ProTableRequestParams } from "./pro-table.types";

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

describe("ProTable 托管模式", () => {
  const cols: ColumnDef<Row, any>[] = [
    { accessorKey: "id", header: "工号" },
    { accessorKey: "name", header: "姓名" },
  ];

  it("挂载即调 request 并渲染返回数据 + 总条数", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({
      data: [{ id: 1, name: "甲" }],
      total: 1,
    }));
    const { getByText } = render(
      <ProTable<Row> columns={cols} request={request} getRowId={(r) => String(r.id)} />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatchObject({ page: 1, pageSize: 10, sort: null });
    expect(getByText("共 1 条")).toBeTruthy();
  });

  it("查询区 onSearch 把 filters 传入 request 并复位到第 1 页", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data: [], total: 0 }));
    const { getByText, getByLabelText } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        getRowId={(r) => String(r.id)}
        search={{
          fields: [{ name: "name", label: "姓名" }],
          collapsible: false,
          onSearch: () => {},
        }}
      />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    fireEvent.change(getByLabelText("姓名"), { target: { value: "甲" } });
    fireEvent.click(getByText("查询"));
    await waitFor(() =>
      expect(request.mock.calls.at(-1)![0]).toMatchObject({ page: 1, filters: { name: "甲" } }),
    );
  });

  it("点表头排序把 sort 传入 request", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({
      data: [{ id: 1, name: "甲" }],
      total: 1,
    }));
    const { getByText } = render(
      <ProTable<Row> columns={cols} request={request} getRowId={(r) => String(r.id)} />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    fireEvent.click(getByText("姓名"));
    await waitFor(() =>
      expect(request.mock.calls.at(-1)![0]).toMatchObject({
        sort: { field: "name", order: "asc" },
      }),
    );
  });

  it("actionRef.reload() 触发重新请求", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data: [], total: 0 }));
    function Host() {
      const ref = useRef<ProTableActions>(null);
      return (
        <>
          <button onClick={() => ref.current?.reload()}>外部刷新</button>
          <ProTable<Row>
            columns={cols}
            request={request}
            actionRef={ref}
            getRowId={(r) => String(r.id)}
          />
        </>
      );
    }
    const { getByText } = render(<Host />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    fireEvent.click(getByText("外部刷新"));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it("选中行时渲染批量操作区（含已选计数与自定义动作）", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({
      data: [{ id: 1, name: "甲" }],
      total: 1,
    }));
    const onBatch = vi.fn();
    const { getByLabelText, getByText, queryByText } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        enableRowSelection
        getRowId={(r) => String(r.id)}
        batchActions={({ selectedRowKeys }) => (
          <button onClick={() => onBatch(selectedRowKeys)}>批量删除</button>
        )}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    expect(queryByText("批量删除")).toBeNull();
    fireEvent.click(getByLabelText("选择行"));
    await waitFor(() => expect(getByText("已选 1 项")).toBeTruthy());
    fireEvent.click(getByText("批量删除"));
    expect(onBatch).toHaveBeenCalledWith(["1"]);
  });

  it("竞态守卫：后发先至时只采纳最新一次 request 结果", async () => {
    const resolvers: Array<(v: { data: Row[]; total: number }) => void> = [];
    const request = vi.fn(
      (_p: ProTableRequestParams) =>
        new Promise<{ data: Row[]; total: number }>((res) => resolvers.push(res)),
    );
    const { getByLabelText, getByText, queryByText } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        onReload={() => {}}
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    fireEvent.click(getByLabelText("刷新"));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    resolvers[1]({ data: [{ id: 2, name: "新" }], total: 1 });
    resolvers[0]({ data: [{ id: 1, name: "旧" }], total: 1 });
    await waitFor(() => expect(getByText("新")).toBeTruthy());
    expect(queryByText("旧")).toBeNull();
  });
});
