import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMockData, usePending } from "./async";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useMockData", () => {
  it("初始 loading=true,延迟后翻 false 并给出 data", async () => {
    const { result } = renderHook(() => useMockData({ n: 1 }, { delay: 100 }));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual({ n: 1 });
    expect(result.current.error).toBeNull();
  });

  it("failOnce:首次出 error,reload 后成功", async () => {
    const { result } = renderHook(() => useMockData("ok", { delay: 50, failOnce: true }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
    await act(async () => {
      result.current.reload();
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe("ok");
  });
});

describe("usePending", () => {
  it("run 期间 pending=true,结束后 false 并执行 fn", async () => {
    const fn = vi.fn();
    const { result } = renderHook(() => usePending());
    let p: Promise<void>;
    act(() => {
      p = result.current[1](fn);
    });
    expect(result.current[0]).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
      await p;
    });
    expect(result.current[0]).toBe(false);
    expect(fn).toHaveBeenCalledOnce();
  });
});
