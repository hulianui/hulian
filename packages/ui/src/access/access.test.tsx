import { describe, it, expect, vi } from "vitest";
import { render, renderHook } from "@testing-library/react";
import { AccessProvider } from "./access-provider";
import { Access } from "./access";
import { useAccess } from "./use-access";

function wrap(perms: string[]) {
  return ({ children }: { children: React.ReactNode }) => (
    <AccessProvider permissions={perms}>{children}</AccessProvider>
  );
}

describe("AccessProvider / useAccess", () => {
  it("has 命中已授予权限", () => {
    const { result } = renderHook(() => useAccess(), { wrapper: wrap(["a", "b"]) });
    expect(result.current.has("a")).toBe(true);
    expect(result.current.has("c")).toBe(false);
  });

  it("hasAny / hasAll 语义", () => {
    const { result } = renderHook(() => useAccess(), { wrapper: wrap(["a", "b"]) });
    expect(result.current.hasAny(["c", "b"])).toBe(true);
    expect(result.current.hasAny(["c", "d"])).toBe(false);
    expect(result.current.hasAll(["a", "b"])).toBe(true);
    expect(result.current.hasAll(["a", "c"])).toBe(false);
    // 空数组：any=false 视图惯例为 true(无要求即放行)，all=true
    expect(result.current.hasAny([])).toBe(true);
    expect(result.current.hasAll([])).toBe(true);
  });

  it("接受 Set 作为 permissions", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AccessProvider permissions={new Set(["x"])}>{children}</AccessProvider>
    );
    const { result } = renderHook(() => useAccess(), { wrapper });
    expect(result.current.has("x")).toBe(true);
  });

  it("缺 Provider 时 useAccess 抛错", () => {
    // 抑制 React 错误边界噪声
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAccess())).toThrow(/AccessProvider/);
    spy.mockRestore();
  });
});

describe("<Access>", () => {
  it("permission 字符串：有则渲染 children", () => {
    const { getByText } = render(
      <AccessProvider permissions={["user:delete"]}>
        <Access permission="user:delete">
          <span>删除</span>
        </Access>
      </AccessProvider>,
    );
    expect(getByText("删除")).toBeTruthy();
  });

  it("permission 字符串：无则渲染 fallback", () => {
    const { getByText, queryByText } = render(
      <AccessProvider permissions={["user:read"]}>
        <Access permission="user:delete" fallback={<span>无权限</span>}>
          <span>删除</span>
        </Access>
      </AccessProvider>,
    );
    expect(queryByText("删除")).toBeNull();
    expect(getByText("无权限")).toBeTruthy();
  });

  it("无 fallback 时无权限渲染为空", () => {
    const { queryByText } = render(
      <AccessProvider permissions={[]}>
        <Access permission="x">
          <span>内容</span>
        </Access>
      </AccessProvider>,
    );
    expect(queryByText("内容")).toBeNull();
  });

  it("数组 + mode=all（默认）：全有才放行", () => {
    const { queryByText, rerender } = render(
      <AccessProvider permissions={["a"]}>
        <Access permission={["a", "b"]}>
          <span>内容</span>
        </Access>
      </AccessProvider>,
    );
    expect(queryByText("内容")).toBeNull();
    rerender(
      <AccessProvider permissions={["a", "b"]}>
        <Access permission={["a", "b"]}>
          <span>内容</span>
        </Access>
      </AccessProvider>,
    );
    expect(queryByText("内容")).toBeTruthy();
  });

  it("数组 + mode=any：任一即放行", () => {
    const { getByText } = render(
      <AccessProvider permissions={["b"]}>
        <Access permission={["a", "b"]} mode="any">
          <span>内容</span>
        </Access>
      </AccessProvider>,
    );
    expect(getByText("内容")).toBeTruthy();
  });

  it("accessible 函数判定优先于 permission", () => {
    const { getByText } = render(
      <AccessProvider permissions={[]}>
        <Access permission="x" accessible={(a) => !a.has("x")}>
          <span>自定义放行</span>
        </Access>
      </AccessProvider>,
    );
    expect(getByText("自定义放行")).toBeTruthy();
  });

  it("无约束（既无 permission 也无 accessible）恒放行", () => {
    const { getByText } = render(
      <AccessProvider permissions={[]}>
        <Access>
          <span>内容</span>
        </Access>
      </AccessProvider>,
    );
    expect(getByText("内容")).toBeTruthy();
  });
});
