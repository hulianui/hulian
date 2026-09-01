import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// 独立文件：vi.mock 是文件级的，且 warnOnce 的 key 只能在一个文件里触发。
vi.mock("mathlive", () => {
  throw new Error("Cannot find package 'mathlive'");
});

afterEach(cleanup);

describe("MathField 缺依赖", () => {
  it("不抛错：渲染安装提示、状态 unavailable、warnOnce 一次", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { MathField } = await import("./math-field");
    const { MATH_FIELD_LOCALE_ZH } = await import("./math-field.locale");
    render(<MathField value="" onChange={() => {}} />);
    await waitFor(() =>
      expect(document.querySelector("[data-slot='math-field']")?.getAttribute("data-status")).toBe("unavailable"),
    );
    expect(screen.getByText(MATH_FIELD_LOCALE_ZH.missing)).toBeTruthy();
    expect(screen.getByText("pnpm add mathlive")).toBeTruthy();
    expect(document.querySelector("math-field")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("pnpm add mathlive");
    warn.mockRestore();
  });
});
