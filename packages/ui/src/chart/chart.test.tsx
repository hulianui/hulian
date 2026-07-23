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

import { AreaChart, BarChart, LineChart, PieChart, RadarChart, RadialChart, categoryAxisWidth } from "./chart";
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
    expect(chartColor(5)).toBe("var(--color-chart-6)");
    // 6 色板越界回绕：index 6 → chart-1
    expect(chartColor(6)).toBe("var(--color-chart-1)");
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
  it("horizontal + CJK 类目（issue #6 复现数据）渲染不抛", () => {
    const stages = [
      { stage: "音频解码", p50: 105 },
      { stage: "ASR识别", p50: 620 },
      { stage: "LLM首句", p50: 890 },
      { stage: "TTS首音", p50: 760 },
    ];
    const { container } = render(
      <BarChart data={stages} series={[{ key: "p50" }]} xKey="stage" horizontal />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("categoryAxisWidth（horizontal 类目轴自适应宽）", () => {
  it("短标签维持下限 48", () => {
    expect(categoryAxisWidth(["一", "二"])).toBe(48);
    expect(categoryAxisWidth([])).toBe(48);
  });
  it("4 个 CJK 字（issue #6 场景）> 48，不再截断", () => {
    // 音频解码 = 4×12 + 16 = 64
    expect(categoryAxisWidth(["音频解码", "ASR识别", "TTS首音"])).toBe(64);
  });
  it("CJK 按全角、ASCII 按 0.62 半角估宽", () => {
    // "ASR识别" = 3×12×0.62 + 2×12 = 46.32 → 与纯 4 字全角比更窄
    expect(categoryAxisWidth(["ASR识别"])).toBe(Math.ceil(3 * 12 * 0.62 + 2 * 12) + 16);
  });
  it("超长标签夹在上限 160", () => {
    expect(categoryAxisWidth(["这是一个非常非常非常长的类目标签超过上限"])).toBe(160);
  });
  it("显式 override 直接生效（逃生舱）", () => {
    expect(categoryAxisWidth(["音频解码"], 90)).toBe(90);
  });
  it("null/undefined 标签按空串处理", () => {
    expect(categoryAxisWidth([null, undefined])).toBe(48);
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
