import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
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
});
