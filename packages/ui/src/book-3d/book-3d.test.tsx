import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Book3D } from "./book-3d";

describe("Book3D", () => {
  it("渲染标题与副标题", () => {
    const { getByText } = render(<Book3D title="CSS" subtitle="转换" />);
    expect(getByText("CSS")).toBeTruthy();
    expect(getByText("转换")).toBeTruthy();
  });

  it("ribbon 渲染缎带文字", () => {
    const { getByText } = render(<Book3D title="x" ribbon="NEW" />);
    expect(getByText("NEW")).toBeTruthy();
  });

  it("有 href 渲染为链接", () => {
    const { container } = render(<Book3D title="x" href="https://example.com" />);
    expect(container.querySelector("a")!.getAttribute("href")).toBe("https://example.com");
  });

  it("无 href 有 onClick 渲染 button 并触发", () => {
    const fn = vi.fn();
    const { container } = render(<Book3D title="x" onClick={fn} />);
    fireEvent.click(container.querySelector("button")!);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("target=_blank 时补 rel=noreferrer", () => {
    const { container } = render(<Book3D title="x" href="https://e.com" target="_blank" />);
    const a = container.querySelector("a")!;
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noreferrer");
  });
});
