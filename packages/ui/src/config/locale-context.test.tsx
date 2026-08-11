import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigProvider } from "./config-provider";
import { enUS, useLocale } from "./locale";
import {
  __setMissingLocaleProviderWarningSilenced,
  useComponentLocale,
  useLocaleValue,
} from "./locale-context";

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

// hulianui/hulian#164：回退本身是设计使然，静默才是问题。
describe("missing ConfigProvider warning", () => {
  afterEach(() => {
    __setMissingLocaleProviderWarningSilenced(true);
  });

  // 这条必须排在下面那条前面：warnOnce 是模块级去重，一旦喊过，之后再断言「没喊」就成了空断言。
  it("测试环境默认消音，不污染宿主项目的测试输出", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderHook(() => useComponentLocale());
    renderHook(() => useLocale());

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("缺 Provider 时开发期喊一次，且只喊一次", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    __setMissingLocaleProviderWarningSilenced(false);

    // 挂了 Provider 的照常安静
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ConfigProvider locale={enUS}>{children}</ConfigProvider>
    );
    renderHook(() => useComponentLocale(), { wrapper });
    expect(warn).not.toHaveBeenCalled();

    renderHook(() => useComponentLocale());
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain("ConfigProvider");
    expect(String(warn.mock.calls[0]?.[0])).toContain("zh-CN");

    // 一页几十个组件、每个组件每次重渲染都会走到这里 —— 再喊第二次就等于把控制台刷爆
    renderHook(() => useComponentLocale());
    renderHook(() => useLocaleValue("drawer", { close: "关闭" }));
    renderHook(() => useLocale());
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockRestore();
  });
});
