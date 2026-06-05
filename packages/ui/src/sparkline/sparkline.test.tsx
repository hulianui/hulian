import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "./sparkline";

const data = [3, 7, 2, 9, 5, 8];

describe("Sparkline", () => {
  it("渲染含 svg", () => {
    const { container } = render(<Sparkline data={data} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it('variant="line" 渲染折线 path（以 M 开头）', () => {
    const { container } = render(<Sparkline data={data} variant="line" />);
    const path = container.querySelector("path");
    expect(path).toBeTruthy();
    expect(path?.getAttribute("d")?.startsWith("M")).toBe(true);
  });

  it('variant="bar" 渲染 N 个 rect', () => {
    const { container } = render(<Sparkline data={data} variant="bar" />);
    expect(container.querySelectorAll("rect").length).toBe(data.length);
  });

  it("highlightLast 渲染末点 circle", () => {
    const { container } = render(<Sparkline data={data} highlightLast />);
    expect(container.querySelector("circle")).toBeTruthy();
  });

  it("默认不画末点（无 circle）", () => {
    const { container } = render(<Sparkline data={data} />);
    expect(container.querySelector("circle")).toBeNull();
  });

  it("renderTooltip 注入 SVG <title>", () => {
    const { container } = render(
      <Sparkline data={data} renderTooltip={(v) => `值 ${v}`} />,
    );
    expect(container.querySelector("title")).toBeTruthy();
  });
});
