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

  // 基准线：给序列一个「对比参照」，此前 Sparkline 只能表达形状本身
  describe("baseline", () => {
    it("不传时不画基准线", () => {
      const { container } = render(<Sparkline data={data} />);
      expect(container.querySelector("line")).toBeNull();
    });

    it("传了就画一条横向虚线", () => {
      const { container } = render(<Sparkline data={data} baseline={5} />);
      const line = container.querySelector("line")!;
      expect(line).toBeTruthy();
      expect(line.getAttribute("stroke-dasharray")).toBeTruthy();
      // 横线：两端 y 相同
      expect(line.getAttribute("y1")).toBe(line.getAttribute("y2"));
    });

    it("高于全部数据的基准值仍落在视口内（会被纳入归一化域）", () => {
      const { container } = render(<Sparkline data={[1, 2, 3]} baseline={100} height={24} />);
      const y = Number(container.querySelector("line")!.getAttribute("y1"));
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(24);
    });

    it("baselineLabel 渲染成 <title>", () => {
      const { container } = render(<Sparkline data={data} baseline={5} baselineLabel="上期均值" />);
      expect(container.querySelector("line > title")?.textContent).toBe("上期均值");
    });
  });
});
