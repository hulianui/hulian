import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { ConfigProvider } from "./config-provider";
import { enUS } from "./locale";
import { useComponentLocale, useLocaleValue } from "./locale-context";

describe("lightweight locale context hooks", () => {
  it("leaves component fallback ownership to the consuming component", () => {
    const { result } = renderHook(() => useComponentLocale());

    expect(result.current).toEqual({});
  });

  it("reads component copy from ConfigProvider", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ConfigProvider locale={enUS}>{children}</ConfigProvider>
    );
    const { result } = renderHook(() => useComponentLocale(), { wrapper });

    expect(result.current.tag?.remove).toBe("Remove");
  });

  it("uses a local fallback when no ConfigProvider exists", () => {
    const fallback = { close: "关闭" };
    const { result } = renderHook(() => useLocaleValue("drawer", fallback));

    expect(result.current).toBe(fallback);
  });

  it("uses ConfigProvider values instead of the local fallback", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ConfigProvider locale={enUS}>{children}</ConfigProvider>
    );
    const { result } = renderHook(() => useLocaleValue("drawer", { close: "关闭" }), {
      wrapper,
    });

    expect(result.current.close).toBe("Close");
  });
});
