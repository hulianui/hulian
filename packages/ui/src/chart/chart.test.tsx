import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// jsdom: ResponsiveContainer 测量为 0 → 子图不出。mock 成克隆 child 注入固定尺寸，使 recharts 渲 SVG。
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  const { cloneElement } = await import("react");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: any }) =>
      cloneElement(children, { width: 600, height: 300 }),
  };
});

import { AreaChart, BarChart, LineChart, PieChart, RadarChart, RadialChart } from "./chart";
import { chartColor } from "./chart-theme";

const data = [
  { month: "1月", revenue: 30, orders: 120 },
  { month: "2月", revenue: 45, orders: 200 },
  { month: "3月", revenue: 28, orders: 160 },
];
const series = [
  { key: "revenue", label: "营收" },
  { key: "orders", label: "订单" },
];
const flat = [
  { name: "搜索", value: 420 },
  { name: "直接", value: 280 },
];

describe("chartColor", () => {
  it("索引映射 chart token，越界回绕", () => {
    expect(chartColor(0)).toBe("var(--color-chart-1)");
    expect(chartColor(1)).toBe("var(--color-chart-2)");
    expect(chartColor(4)).toBe("var(--color-chart-1)");
  });
});

describe("AreaChart", () => {
  it("多序列渲染不抛 + 产出 svg", () => {
    const { container } = render(<AreaChart data={data} series={series} xKey="month" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("BarChart", () => {
  it("多序列渲染不抛 + 产出 svg", () => {
    const { container } = render(<BarChart data={data} series={series} xKey="month" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
  it("堆叠 + 横向不抛", () => {
    const { container } = render(
      <BarChart data={data} series={series} xKey="month" stacked horizontal />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("LineChart", () => {
  it("多序列渲染不抛 + 产出 svg", () => {
    const { container } = render(<LineChart data={data} series={series} xKey="month" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("PieChart", () => {
  it("饼图/环形渲染不抛 + 产出 svg", () => {
    const { container } = render(<PieChart data={flat} donut />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("RadarChart", () => {
  it("渲染不抛 + 产出 svg", () => {
    const { container } = render(<RadarChart data={data} series={series} xKey="month" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("RadialChart", () => {
  it("渲染不抛 + 产出 svg", () => {
    const { container } = render(<RadialChart data={flat} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
