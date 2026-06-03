import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("role=status + 默认 aria-label=加载中", () => {
    const { getByRole } = render(<Spinner />);
    const s = getByRole("status");
    expect(s).toBeTruthy();
    expect(s.getAttribute("aria-label")).toBe("加载中");
  });

  it("自定义 label", () => {
    const { getByRole } = render(<Spinner label="提交中" />);
    expect(getByRole("status").getAttribute("aria-label")).toBe("提交中");
  });

  it("内含 animate-spin 的 svg", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg.animate-spin")).toBeTruthy();
  });

  it("size 皮肤类", () => {
    const { getByRole } = render(<Spinner size="lg" />);
    expect(getByRole("status").className).toContain("size-8");
  });

  it("tone 皮肤类", () => {
    const { getByRole } = render(<Spinner tone="muted" />);
    expect(getByRole("status").className).toContain("text-muted");
  });

  it("透传 className", () => {
    const { getByRole } = render(<Spinner className="my-sp" />);
    expect(getByRole("status").classList.contains("my-sp")).toBe(true);
  });
});
