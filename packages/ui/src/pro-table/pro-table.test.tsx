import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
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
    await waitFor(
      () =>
        expect(request.mock.calls.at(-1)![0]).toMatchObject({
          sort: { field: "name", order: "asc" },
        }),
      { timeout: 3_000 },
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

describe("ProTable 托管模式 · defaultSorting", () => {
  const cols: ColumnDef<Row, any>[] = [
    { accessorKey: "id", header: "工号" },
    { accessorKey: "name", header: "姓名" },
  ];

  it("首次 request 即带上 defaultSorting（可表达「默认按某列倒序」）", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data, total: 2 }));
    render(
      <ProTable<Row>
        columns={cols}
        request={request}
        defaultSorting={[{ id: "name", desc: true }]}
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request.mock.calls[0][0]).toMatchObject({
      page: 1,
      sort: { field: "name", order: "desc" },
    });
  });

  it("defaultSorting 只是初值：点表头仍可改排序", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data, total: 2 }));
    const { getByText } = render(
      <ProTable<Row>
        columns={cols}
        request={request}
        defaultSorting={[{ id: "name", desc: true }]}
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    // 换列排序（首点方向由 TanStack 按列类型决定，这里只关心「初值没锁死」）
    fireEvent.click(getByText("工号"));
    await waitFor(() =>
      expect(request.mock.calls.at(-1)![0].sort).toMatchObject({ field: "id" }),
    );
  });

  it("不传 defaultSorting 时首次 sort 仍为 null（向后兼容）", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data, total: 2 }));
    render(<ProTable<Row> columns={cols} request={request} getRowId={(r) => String(r.id)} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request.mock.calls[0][0]).toMatchObject({ sort: null });
  });

  it("不破坏受控语义：展示模式下 sorting 受控值胜出，defaultSorting 不生效", () => {
    const { container } = render(
      <ProTable<Row>
        columns={cols}
        data={data}
        sorting={[{ id: "name", desc: true }]}
        onSortingChange={() => {}}
        defaultSorting={[{ id: "id", desc: false }]}
      />,
    );
    const sorted = container.querySelector('th[aria-sort="descending"]');
    expect(sorted).toBeTruthy();
    expect(sorted!.textContent).toContain("姓名");
    // defaultSorting 指向的「工号」列不被标记为已排序
    const ths = Array.from(container.querySelectorAll("th"));
    const idTh = ths.find((th) => th.textContent?.includes("工号"))!;
    expect(idTh.getAttribute("aria-sort")).toBe("none");
  });
});

describe("ProTable 托管模式 · params 固定查询参数", () => {
  const cols: ColumnDef<Row, any>[] = [
    { accessorKey: "id", header: "工号" },
    { accessorKey: "name", header: "姓名" },
  ];

  it("params 透传给 request（与 filters 并列，不混入 filters）", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data, total: 2 }));
    render(
      <ProTable<Row>
        columns={cols}
        request={request}
        params={{ scopeId: 7 }}
        getRowId={(r) => String(r.id)}
      />,
    );
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request.mock.calls[0][0]).toMatchObject({ params: { scopeId: 7 }, filters: {} });
    expect(request.mock.calls[0][0].filters).not.toHaveProperty("scopeId");
  });

  it("不传 params 时为空对象（向后兼容）", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data, total: 2 }));
    render(<ProTable<Row> columns={cols} request={request} getRowId={(r) => String(r.id)} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request.mock.calls[0][0].params).toEqual({});
  });

  it("params 内容变化：重新 request 且回到第 1 页", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data, total: 40 }));
    function Host({ scopeId }: { scopeId: number }) {
      return (
        <ProTable<Row>
          columns={cols}
          request={request}
          params={{ scopeId }}
          getRowId={(r) => String(r.id)}
        />
      );
    }
    const { rerender, getByLabelText } = render(<Host scopeId={1} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    // 先翻到第 2 页
    fireEvent.click(getByLabelText("第 2 页"));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(request.mock.calls.at(-1)![0]).toMatchObject({ page: 2, params: { scopeId: 1 } });

    rerender(<Host scopeId={2} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
    expect(request.mock.calls.at(-1)![0]).toMatchObject({ page: 1, params: { scopeId: 2 } });
    // 回第 1 页是同一次提交完成的：不应先用旧页码发一次废请求
    expect(request.mock.calls.filter((c) => c[0].params?.scopeId === 2)).toHaveLength(1);
  });

  it("浅比较：内联新对象但内容相同不触发重查", async () => {
    const request = vi.fn(async (_p: ProTableRequestParams) => ({ data, total: 2 }));
    function Host() {
      const [tick, setTick] = useState(0);
      return (
        <>
          <button onClick={() => setTick((t) => t + 1)}>{`重渲染 ${tick}`}</button>
          {/* 每次 render 都是新对象字面量，内容不变 */}
          <ProTable<Row>
            columns={cols}
            request={request}
            params={{ scopeId: 1, kind: "a" }}
            getRowId={(r) => String(r.id)}
          />
        </>
      );
    }
    const { getByText } = render(<Host />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    fireEvent.click(getByText("重渲染 0"));
    fireEvent.click(getByText("重渲染 1"));
    await waitFor(() => expect(getByText("重渲染 2")).toBeTruthy());
    expect(request).toHaveBeenCalledTimes(1);
  });
});

describe("ProTable 托管模式 · request 防呆", () => {
  const cols: ColumnDef<Row, any>[] = [
    { accessorKey: "id", header: "工号" },
    { accessorKey: "name", header: "姓名" },
  ];

  it("内联 request（每次 render 新身份）不造成重复请求", async () => {
    const spy = vi.fn();
    function Host() {
      const [tick, setTick] = useState(0);
      return (
        <>
          <button onClick={() => setTick((t) => t + 1)}>{`重渲染 ${tick}`}</button>
          <ProTable<Row>
            columns={cols}
            // 故意不包 useCallback：这正是会打爆服务端的写法
            request={async (_p) => {
              spy(_p);
              return { data, total: 2 };
            }}
            getRowId={(r) => String(r.id)}
          />
        </>
      );
    }
    const { getByText } = render(<Host />);
    // 首次请求 resolve → setState → 重渲染 → 若 request 进依赖数组即自激死循环
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    fireEvent.click(getByText("重渲染 0"));
    fireEvent.click(getByText("重渲染 1"));
    await waitFor(() => expect(getByText("重渲染 2")).toBeTruthy());
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("reload/翻页仍取到最新一版 request 闭包", async () => {
    const seen: string[] = [];
    function Host() {
      const [scope, setScope] = useState("a");
      return (
        <>
          <button onClick={() => setScope("b")}>切 scope</button>
          <ProTable<Row>
            columns={cols}
            request={async () => {
              seen.push(scope);
              return { data, total: 2 };
            }}
            onReload={() => {}}
            getRowId={(r) => String(r.id)}
          />
        </>
      );
    }
    const { getByText, getByLabelText } = render(<Host />);
    await waitFor(() => expect(seen).toEqual(["a"]));
    fireEvent.click(getByText("切 scope"));
    // 换 request 身份本身不重查（防呆的代价）
    expect(seen).toEqual(["a"]);
    fireEvent.click(getByLabelText("刷新"));
    await waitFor(() => expect(seen).toEqual(["a", "b"]));
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

// ProTable 的 virtual 是「继承 + rest 透传」来的（types 里没有显式声明，
// 渲染时随 {...tableProps} 一起下去），整个 pro-table/ 目录没有任何一处写着 "virtual"。
// 这种隐式契约最容易在重构解构列表时被无声掐断 —— 谁把 virtual 显式解构出来
// 忘了往下传，能力就没了，且不报错、类型也照样过。这条测试就是拦这个。
// （断言取滚动容器结构而非行数，理由见 table.test.tsx 里同名 describe 的注释。）
describe("ProTable 虚拟滚动透传", () => {
  const many: Row[] = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, name: `员工${i + 1}` }));

  it("virtual 透传给内部 Table：表体套进定高滚动容器", () => {
    const { container } = render(
      <ProTable
        columns={columns}
        data={many}
        virtual={{ enabled: true, height: 360, rowHeight: 44 }}
      />,
    );
    const scroller = container.querySelector<HTMLElement>('div[style*="overflow"]');
    expect(scroller).not.toBeNull();
    expect(scroller!.style.height).toBe("360px");
  });

  it("不传 virtual 时不套滚动容器", () => {
    const { container } = render(<ProTable columns={columns} data={many} />);
    expect(container.querySelector('div[style*="overflow"]')).toBeNull();
  });
});

describe("托管模式下的受控行选择（#202）", () => {
  const cols: ColumnDef<Row, any>[] = [
    { accessorKey: "id", header: "工号" },
    { accessorKey: "name", header: "姓名" },
  ];
  const makeRequest = () =>
    vi.fn(async (_p: ProTableRequestParams) => ({ data: [{ id: 1, name: "甲" }], total: 1 }));

  it("勾选会触发消费方的 onRowSelectionChange（旧口径下它从不触发，state 恒为 {}）", async () => {
    const onChange = vi.fn();
    const { getByLabelText, getByText } = render(
      <ProTable<Row>
        columns={cols}
        request={makeRequest()}
        enableRowSelection
        getRowId={(r) => String(r.id)}
        rowSelection={{}}
        onRowSelectionChange={onChange}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    fireEvent.click(getByLabelText("选择行"));
    expect(onChange).toHaveBeenCalled();
  });

  it("传进来的 rowSelection 会回灌到表格（选中态由消费方说了算）", async () => {
    const { getByLabelText, getByText } = render(
      <ProTable<Row>
        columns={cols}
        request={makeRequest()}
        enableRowSelection
        getRowId={(r) => String(r.id)}
        rowSelection={{ "1": true }}
        onRowSelectionChange={vi.fn()}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    expect(getByLabelText("选择行").hasAttribute("data-checked")).toBe(true);
  });

  it("受控选择集合同样喂给 batchActions（批量条读的是统一出口，不必由本层持有）", async () => {
    const onBatch = vi.fn();
    const { getByText } = render(
      <ProTable<Row>
        columns={cols}
        request={makeRequest()}
        enableRowSelection
        getRowId={(r) => String(r.id)}
        rowSelection={{ "1": true }}
        onRowSelectionChange={vi.fn()}
        batchActions={({ selectedRowKeys }) => (
          <button onClick={() => onBatch(selectedRowKeys)}>批量删除</button>
        )}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    fireEvent.click(getByText("批量删除"));
    expect(onBatch).toHaveBeenCalledWith(["1"]);
  });

  it("不传 rowSelection 时仍内部自持（托管 + 批量条的既有用法不变）", async () => {
    const onBatch = vi.fn();
    const { getByLabelText, getByText } = render(
      <ProTable<Row>
        columns={cols}
        request={makeRequest()}
        enableRowSelection
        getRowId={(r) => String(r.id)}
        batchActions={({ selectedRowKeys }) => (
          <button onClick={() => onBatch(selectedRowKeys)}>批量删除</button>
        )}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    fireEvent.click(getByLabelText("选择行"));
    await waitFor(() => expect(getByText("已选 1 项")).toBeTruthy());
    fireEvent.click(getByText("批量删除"));
    expect(onBatch).toHaveBeenCalledWith(["1"]);
  });

  it("受控却没给 onRowSelectionChange 时 dev 告警（勾不动和「组件坏了」长得一样）", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getByText } = render(
      <ProTable<Row>
        columns={cols}
        request={makeRequest()}
        enableRowSelection
        getRowId={(r) => String(r.id)}
        rowSelection={{}}
      />,
    );
    await waitFor(() => expect(getByText("甲")).toBeTruthy());
    expect(warn.mock.calls.some((c) => String(c[0]).includes("onRowSelectionChange"))).toBe(true);
    warn.mockRestore();
  });
});

// —— 列显隐受控出口 + 锁定列（#236）——
describe("ProTable 列显隐（columnVisibility / meta.lockVisible）", () => {
  const openColumnSetting = (getByLabelText: (t: string) => HTMLElement) => {
    fireEvent.click(getByLabelText("列设置"));
  };
  const boxes = () =>
    Array.from(document.querySelectorAll("[role='checkbox']")) as HTMLElement[];

  it("不传 columnVisibility：内部自持，表头列数与此前一致", () => {
    const { container } = render(<ProTable columns={columns} data={data} />);
    expect(container.querySelectorAll("thead th").length).toBe(2);
  });

  it("不传时点列设置仍可切换（非受控路径不回归）", async () => {
    const { getByLabelText, container } = render(<ProTable columns={columns} data={data} />);
    openColumnSetting(getByLabelText);
    await waitFor(() => expect(boxes().length).toBe(2));
    fireEvent.click(boxes()[0]);
    await waitFor(() => expect(container.querySelectorAll("thead th").length).toBe(1));
  });

  it("受控 columnVisibility：false 的列不渲染，缺省的键视为可见", () => {
    const { container } = render(
      <ProTable
        columns={columns}
        data={data}
        columnVisibility={{ id: false }}
        onColumnVisibilityChange={() => {}}
      />,
    );
    const heads = Array.from(container.querySelectorAll("thead th")).map((th) => th.textContent);
    expect(heads).toEqual(["姓名"]);
  });

  it("受控时点勾选框回调完整的下一份映射，组件自身不改状态", async () => {
    const onChange = vi.fn();
    const { getByLabelText, container } = render(
      <ProTable
        columns={columns}
        data={data}
        columnVisibility={{}}
        onColumnVisibilityChange={onChange}
      />,
    );
    openColumnSetting(getByLabelText);
    await waitFor(() => expect(boxes().length).toBe(2));
    fireEvent.click(boxes()[0]);
    expect(onChange).toHaveBeenCalledWith({ id: false });
    // 受控：没有回灌就不动
    expect(container.querySelectorAll("thead th").length).toBe(2);
  });

  it("受控但没传 onColumnVisibilityChange：dev 告警（勾不动与组件坏了长得一样）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<ProTable columns={columns} data={data} columnVisibility={{}} />);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("meta.lockVisible：勾选框置灰、点不动，且受控写 false 也关不掉", async () => {
    const onChange = vi.fn();
    const locked: ColumnDef<Row, any>[] = [
      { accessorKey: "id", header: "工号", meta: { lockVisible: true } },
      { accessorKey: "name", header: "姓名" },
    ];
    const { getByLabelText, container } = render(
      <ProTable
        columns={locked}
        data={data}
        columnVisibility={{ id: false }}
        onColumnVisibilityChange={onChange}
      />,
    );
    // 锁定列恒可见
    expect(container.querySelectorAll("thead th").length).toBe(2);
    openColumnSetting(getByLabelText);
    await waitFor(() => expect(boxes().length).toBe(2));
    expect(boxes()[0].getAttribute("data-disabled")).not.toBeNull();
    fireEvent.click(boxes()[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("保底：不允许把最后一列可见列也关掉", async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <ProTable
        columns={columns}
        data={data}
        columnVisibility={{ id: false }}
        onColumnVisibilityChange={onChange}
      />,
    );
    openColumnSetting(getByLabelText);
    await waitFor(() => expect(boxes().length).toBe(2));
    fireEvent.click(boxes()[1]); // 关掉仅剩的「姓名」
    expect(onChange).not.toHaveBeenCalled();
  });
});
