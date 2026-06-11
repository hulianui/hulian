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

  it("展示模式透传 rowClassName 给内部 Table（行级错误高亮承载）", () => {
    const { container } = render(
      <ProTable
        columns={columns}
        data={data}
        rowClassName={(row) => (row.name === "乙" ? "row-bad" : undefined)}
      />,
    );
    const trs = Array.from(container.querySelectorAll("tbody tr"));
    const hit = trs.find((tr) => tr.textContent?.includes("乙")) as HTMLElement;
    const miss = trs.find((tr) => tr.textContent?.includes("甲")) as HTMLElement;
    expect(hit.className).toContain("row-bad");
    expect(miss.className).not.toContain("row-bad");
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

  it("pageSizeOptions：渲染每页条数切换器，request 带当前 pageSize", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data, total: 40 }));
    const { getByRole } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        defaultPageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request.mock.calls[0][0]).toMatchObject({ page: 1, pageSize: 20 });
    // 切换器 Trigger 显示当前每页条数
    expect(getByRole("combobox").textContent).toContain("20 条/页");
  });

  it("不传 pageSizeOptions 时不渲染切换器（向后兼容）", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data, total: 40 }));
    const { queryByRole } = render(
      <ProTable<Row> columns={cols} request={request} getRowId={(r) => String(r.id)} />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(queryByRole("combobox")).toBeNull();
  });

  it("request 失败：onRequestError 收到错误，loading 复位且保留上次成功数据", async () => {
    const boom = new Error("network down");
    const onRequestError = vi.fn();
    let fail = false;
    const request = vi.fn(async (_p: ProTableRequestParams) => {
      if (fail) throw boom;
      return { data, total: 2 };
    });
    const { container, getByText, getByLabelText } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        onRequestError={onRequestError}
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    fail = true;
    fireEvent.click(getByLabelText("刷新"));
    await waitFor(() => expect(onRequestError).toHaveBeenCalledWith(boom));
    // loading 复位（无遮罩 spinner / 刷新图标不再旋转）+ 上次数据仍在
    await waitFor(() => expect(container.querySelector(".animate-spin")).toBeNull());
    expect(getByText("甲")).toBeTruthy();
  });

  it("request 失败且未传 onRequestError：默认 console.error 兜底（不抛 unhandled）", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const boom = new Error("default path");
    const request = vi.fn(async (_p: ProTableRequestParams) => {
      throw boom;
    });
    const { container } = render(
      <ProTable<Row> columns={cols} request={request} getRowId={(r) => String(r.id)} />,
    );
    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith("[ProTable] request failed:", boom),
    );
    await waitFor(() => expect(container.querySelector(".animate-spin")).toBeNull());
    spy.mockRestore();
  });

  it("cursor 模式 request 失败同样走 onRequestError 且 loading 复位", async () => {
    const boom = new Error("cursor fail");
    const onRequestError = vi.fn();
    const request = vi.fn(async (_p: ProTableRequestParams) => {
      throw boom;
    });
    const { container } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        paginationMode="cursor"
        onRequestError={onRequestError}
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(onRequestError).toHaveBeenCalledWith(boom));
    await waitFor(() => expect(container.querySelector(".animate-spin")).toBeNull());
  });
});

describe("ProTable 托管模式 · cursor 分页", () => {
  const cols: ColumnDef<Row, any>[] = [
    { accessorKey: "id", header: "工号" },
    { accessorKey: "name", header: "姓名" },
  ];
  // 两页数据：第 1 页（cursor=null）→ nextCursor "c1"；第 2 页（cursor="c1"）→ 末页。
  const twoPages = (p: ProTableRequestParams) =>
    p.cursor === "c1"
      ? Promise.resolve({ data: [{ id: 2, name: "乙" }], nextCursor: null, hasMore: false })
      : Promise.resolve({ data: [{ id: 1, name: "甲" }], nextCursor: "c1", hasMore: true });

  it("首次请求 cursor=null；渲染上一页/下一页按钮对，不渲染 total 文案与数字分页", async () => {
    const request = vi.fn(twoPages);
    const { getByText, queryByText, queryByLabelText } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        paginationMode="cursor"
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    expect(request.mock.calls[0][0]).toMatchObject({ page: 1, cursor: null });
    expect(getByText("上一页")).toBeTruthy();
    expect(getByText("下一页")).toBeTruthy();
    expect(queryByText(/共 \d+ 条/)).toBeNull();
    expect(queryByLabelText("第 1 页")).toBeNull(); // 数字 Pagination 不渲染
    // 第 1 页上一页禁用，有下一页可点
    expect((getByText("上一页") as HTMLButtonElement).closest("button")!.disabled).toBe(true);
    expect((getByText("下一页") as HTMLButtonElement).closest("button")!.disabled).toBe(false);
  });

  it("下一页推进游标、上一页弹栈回退", async () => {
    const request = vi.fn(twoPages);
    const { getByText } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        paginationMode="cursor"
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    fireEvent.click(getByText("下一页"));
    await waitFor(() => expect(getByText("乙")).toBeTruthy());
    expect(request.mock.calls.at(-1)![0]).toMatchObject({ page: 2, cursor: "c1" });
    // 末页：下一页禁用、上一页可用
    expect(getByText("下一页").closest("button")!.disabled).toBe(true);
    expect(getByText("上一页").closest("button")!.disabled).toBe(false);
    fireEvent.click(getByText("上一页"));
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    expect(request.mock.calls.at(-1)![0]).toMatchObject({ page: 1, cursor: null });
  });

  it("hasMore 缺省时按 nextCursor != null 推断", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({
      data: [{ id: 1, name: "甲" }],
      nextCursor: null,
    }));
    const { getByText } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        paginationMode="cursor"
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    expect(getByText("下一页").closest("button")!.disabled).toBe(true);
  });

  it("查询条件变化重置游标栈回第 1 页", async () => {
    const request = vi.fn(twoPages);
    const { getByText, getByLabelText } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        paginationMode="cursor"
        getRowId={(r) => String(r.id)}
        search={{ fields: [{ name: "name", label: "姓名" }], collapsible: false }}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    fireEvent.click(getByText("下一页"));
    await waitFor(() => expect(getByText("乙")).toBeTruthy());
    fireEvent.change(getByLabelText("姓名"), { target: { value: "甲" } });
    fireEvent.click(getByText("查询"));
    await waitFor(() =>
      expect(request.mock.calls.at(-1)![0]).toMatchObject({
        page: 1,
        cursor: null,
        filters: { name: "甲" },
      }),
    );
  });

  it("表头排序变化重置游标栈回第 1 页", async () => {
    const request = vi.fn(twoPages);
    const { getByText } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        paginationMode="cursor"
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    fireEvent.click(getByText("下一页"));
    await waitFor(() => expect(getByText("乙")).toBeTruthy());
    fireEvent.click(getByText("姓名"));
    await waitFor(() =>
      expect(request.mock.calls.at(-1)![0]).toMatchObject({
        page: 1,
        cursor: null,
        sort: { field: "name", order: "asc" },
      }),
    );
  });

  it("cursor 模式渲染 pageSizeOptions 切换器（显示当前每页条数）", async () => {
    // 交互级（选项点选→重置栈）在 jsdom 不可靠（Base UI Select 先例皆用受控 open），
    // 重置语义已由 filter/sort 两条覆盖，此处验切换器在 cursor footer 可用。
    const request = vi.fn(twoPages);
    const { getByText, getByRole } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        paginationMode="cursor"
        defaultPageSize={10}
        pageSizeOptions={[10, 20]}
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    expect(request.mock.calls[0][0]).toMatchObject({ pageSize: 10, cursor: null });
    expect(getByRole("combobox").textContent).toContain("10 条/页");
  });
});
