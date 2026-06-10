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

  // hover 翻正链路：根 .group 标记 → 书体同时挂「静止 -25deg」与「group-hover 翻正」
  // transform 类 + transition-transform。真浏览器已实证 hover 后 computed transform
  // 由 rotateY(-25deg) matrix3d 变为单位矩阵；此处锁住类链路防回归。
  it("hover 翻正类链路完整（group → group-hover transform + transition）", () => {
    const { container } = render(<Book3D title="x" />);
    const root = container.firstElementChild!;
    expect(root.className).toContain("group");
    const inner = root.firstElementChild!;
    expect(inner.className).toContain("[transform:rotateY(-25deg)]");
    expect(inner.className).toContain("group-hover:[transform:rotateY(0deg)]");
    expect(inner.className).toContain("transition-transform");
    expect(inner.className).toContain("motion-reduce:transition-none");
  });

  it("翻开模式（inside）：书体微转正 -16deg、前封挂绕脊翻开 -150deg，内页 opacity 门控", () => {
    const { container, getByText } = render(<Book3D title="x" inside="理念" />);
    const inner = container.querySelector(".group")!.firstElementChild!;
    expect(inner.className).toContain("group-hover:[transform:rotateY(-16deg)]");
    expect(inner.className).not.toContain("group-hover:[transform:rotateY(0deg)]");
    const html = container.innerHTML;
    expect(html).toContain("group-hover:[transform:translateZ(calc(var(--book-thk)/2))_rotateY(-150deg)]");
    const insidePage = getByText("理念");
    expect(insidePage.className).toContain("opacity-0");
    expect(insidePage.className).toContain("group-hover:opacity-100");
  });
});
