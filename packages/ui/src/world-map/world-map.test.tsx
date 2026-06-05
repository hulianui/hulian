import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { WorldMap } from "./world-map";
import { WORLD_DOTS } from "./world-map.dots";

// 几何全在固定 viewBox 内由纯函数算出，jsdom 下无需 getBoundingClientRect → 渲染不抛即可。
describe("WorldMap", () => {
  it("纯底图：渲染点阵 circle，不画弧线", () => {
    const { container } = render(<WorldMap />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    // 底图圆点 == 预烘点数；无弧线 path
    expect(svg!.querySelectorAll("circle").length).toBe(WORLD_DOTS.length);
    expect(svg!.querySelectorAll("path").length).toBe(0);
  });

  it("传 N 条 dots：弧线 path 数 == N", () => {
    const dots = [
      { start: { lat: 39.9, lng: 116.4 }, end: { lat: 40.7, lng: -74 } },
      { start: { lat: 51.5, lng: -0.1 }, end: { lat: -33.9, lng: 151.2 } },
    ];
    const { container } = render(<WorldMap dots={dots} />);
    expect(container.querySelectorAll("svg path").length).toBe(dots.length);
  });

  it("端点去重：共用城市只画一个端点组", () => {
    // 两条弧共享起点(上海) → 端点应为 3 个(1 起点 + 2 终点)，而非 4
    const sh = { lat: 31.2, lng: 121.5 };
    const dots = [
      { start: sh, end: { lat: 51.5, lng: -0.1 } },
      { start: sh, end: { lat: -33.9, lng: 151.2 } },
    ];
    const { container } = render(<WorldMap dots={dots} />);
    // 实心端点 fill=lineColor(默认 chart-1)；点阵 fill=dotColor；脉冲环 fill=none → 按 fill 语义区分
    const endpointDots = [...container.querySelectorAll("circle")].filter(
      (c) => c.getAttribute("fill") === "var(--color-chart-1)",
    );
    expect(endpointDots.length).toBe(3);
  });

  it("含弧线渐变 defs", () => {
    const dots = [{ start: { lat: 0, lng: 0 }, end: { lat: 10, lng: 10 } }];
    const { container } = render(<WorldMap dots={dots} />);
    expect(container.querySelector("linearGradient")).toBeTruthy();
  });

  it("逐条 color：不同色各生成一条渐变，端点吃各自色", () => {
    const sh = { lat: 31.2, lng: 121.5 };
    const dots = [
      { start: sh, end: { lat: 51.5, lng: -0.1 }, color: "var(--color-chart-1)" },
      { start: sh, end: { lat: -33.9, lng: 151.2 }, color: "var(--color-chart-2)" },
    ];
    const { container } = render(<WorldMap dots={dots} />);
    // 两种不同颜色 → 两条渐变
    expect(container.querySelectorAll("linearGradient").length).toBe(2);
    // 终点端点用各自连线色（伦敦=chart-1，悉尼=chart-2）
    const byFill = (c: string) =>
      [...container.querySelectorAll("circle")].filter((el) => el.getAttribute("fill") === c).length;
    expect(byFill("var(--color-chart-2)")).toBeGreaterThan(0);
  });

  it("同色复用一条渐变（去重）", () => {
    const sh = { lat: 31.2, lng: 121.5 };
    const dots = [
      { start: sh, end: { lat: 51.5, lng: -0.1 }, color: "var(--color-chart-1)" },
      { start: sh, end: { lat: -33.9, lng: 151.2 }, color: "var(--color-chart-1)" },
    ];
    const { container } = render(<WorldMap dots={dots} />);
    expect(container.querySelectorAll("linearGradient").length).toBe(1);
  });

  // ── 独立节点 points（反哺：全球节点分布 + 下钻）──────────────────
  const NODES = [
    { id: "a", lat: 31.2, lng: 121.5, label: "上海", value: 80 },
    { id: "b", lat: 51.5, lng: -0.1, label: "伦敦", value: 40 },
    { id: "c", lat: 40.7, lng: -74, label: "纽约", value: 60 },
  ];

  it("无 points 时不多画 circle（保持纯底图计数）", () => {
    const { container } = render(<WorldMap />);
    expect(container.querySelectorAll("[data-wm-node]").length).toBe(0);
    expect(container.querySelectorAll("svg circle").length).toBe(WORLD_DOTS.length);
  });

  it("传 N 个 points：渲染 N 个独立节点", () => {
    const { container } = render(<WorldMap points={NODES} />);
    expect(container.querySelectorAll("[data-wm-node]").length).toBe(NODES.length);
  });

  it("showLabels：渲染节点标签文字", () => {
    const { getByText, container } = render(<WorldMap points={NODES} showLabels />);
    expect(getByText("上海")).toBeTruthy();
    expect(container.querySelectorAll("svg text").length).toBe(NODES.length);
  });

  it("默认不渲染标签", () => {
    const { container } = render(<WorldMap points={NODES} />);
    expect(container.querySelectorAll("svg text").length).toBe(0);
  });

  it("onPointClick：点击节点触发回调 (node, index)", () => {
    const onPointClick = vi.fn();
    const { container } = render(<WorldMap points={NODES} onPointClick={onPointClick} />);
    const nodes = container.querySelectorAll('[role="button"]');
    expect(nodes.length).toBe(NODES.length);
    fireEvent.click(nodes[1]);
    expect(onPointClick).toHaveBeenCalledTimes(1);
    expect(onPointClick.mock.calls[0][0]).toMatchObject({ id: "b" });
    expect(onPointClick.mock.calls[0][1]).toBe(1);
  });

  it("onPointClick：键盘 Enter 触发", () => {
    const onPointClick = vi.fn();
    const { container } = render(<WorldMap points={NODES} onPointClick={onPointClick} />);
    const node = container.querySelectorAll('[role="button"]')[0];
    fireEvent.keyDown(node, { key: "Enter" });
    expect(onPointClick).toHaveBeenCalledTimes(1);
  });

  it("可交互时 svg 放开 aria-hidden；纯展示时保持", () => {
    const { container: plain } = render(<WorldMap points={NODES} />);
    expect(plain.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
    const { container: interactive } = render(<WorldMap points={NODES} onPointClick={() => {}} />);
    expect(interactive.querySelector("svg")!.getAttribute("aria-hidden")).toBeNull();
  });
});
