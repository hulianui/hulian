import { describe, it, expect } from "vitest";
import { render, renderHook } from "@testing-library/react";
import { ConfigProvider } from "./config-provider";
import { useLocale, zhCN, enUS } from "./locale";
import { ProTable } from "../pro-table/pro-table";
import type { ColumnDef } from "../table/table.types";

describe("ConfigProvider / useLocale", () => {
  it("缺 Provider 时回退默认 zhCN（不抛）", () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current.proTable.reload).toBe("刷新");
    expect(result.current.proTable.total(5)).toBe("共 5 条");
  });

  it("Provider 注入 enUS 后取到英文", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ConfigProvider locale={enUS}>{children}</ConfigProvider>
    );
    const { result } = renderHook(() => useLocale(), { wrapper });
    expect(result.current.proTable.reload).toBe("Refresh");
    expect(result.current.adminLayout.closeTab).toBe("Close tab");
  });

  it("支持 spread 自定义 locale", () => {
    const custom = { ...zhCN, proTable: { ...zhCN.proTable, reload: "重新加载" } };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ConfigProvider locale={custom}>{children}</ConfigProvider>
    );
    const { result } = renderHook(() => useLocale(), { wrapper });
    expect(result.current.proTable.reload).toBe("重新加载");
  });
});

describe("ProTable × ConfigProvider 文案切换（端到端）", () => {
  const columns: ColumnDef<{ id: number }, any>[] = [{ accessorKey: "id", header: "ID" }];
  const data = [{ id: 1 }];

  it("默认 zh-CN：刷新 / 共 N 条", () => {
    const { getByLabelText, getByText } = render(
      <ProTable
        columns={columns}
        data={data}
        pagination={{ page: 1, pageSize: 10, total: 3, onPageChange: () => {} }}
      />,
    );
    expect(getByLabelText("刷新")).toBeTruthy();
    expect(getByText("共 3 条")).toBeTruthy();
  });

  it("包 enUS Provider：Refresh / N items", () => {
    const { getByLabelText, getByText } = render(
      <ConfigProvider locale={enUS}>
        <ProTable
          columns={columns}
          data={data}
          pagination={{ page: 1, pageSize: 10, total: 3, onPageChange: () => {} }}
        />
      </ConfigProvider>,
    );
    expect(getByLabelText("Refresh")).toBeTruthy();
    expect(getByText("3 items")).toBeTruthy();
  });
});
