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

  // hulianui/hulian#86：半径轴刻度沿一条水平半径排列，正好穿过数据区，序列一多就压在
  // 多边形上；而它此前无条件渲染，className 够不到，消费方关不掉。
  it("默认渲染半径轴刻度（不动存量版式）", () => {
    const { container } = render(<RadarChart data={data} series={series} xKey="month" />);
    expect(container.querySelector(".recharts-polar-radius-axis")).toBeTruthy();
  });

  it("radiusAxis={false} 关掉刻度，环线与角轴名照留", () => {
    const { container } = render(
      <RadarChart data={data} series={series} xKey="month" radiusAxis={false} />,
    );
    expect(container.querySelector(".recharts-polar-radius-axis")).toBeNull();
    // 关的只是半径轴：网格环线与角轴（维度名）都还在，否则雷达盘就没了
    expect(container.querySelector(".recharts-polar-grid")).toBeTruthy();
    expect(container.querySelector(".recharts-polar-angle-axis")).toBeTruthy();
  });
});

describe("RadialChart", () => {
  it("渲染不抛 + 产出 svg", () => {
    const { container } = render(<RadialChart data={flat} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

// hulianui/hulian#73：多序列图不给图例，读者无从知道哪条线是哪条序列。
describe("Chart legend", () => {
  it("默认不出图例（兼容既有版式）", () => {
    const { queryByText } = render(<AreaChart data={data} series={series} xKey="month" />);
    expect(queryByText("营收")).toBeNull();
  });

  it("legend 开启后逐序列出 label", () => {
    const { getByText } = render(<AreaChart data={data} series={series} xKey="month" legend />);
    expect(getByText("营收")).toBeTruthy();
    expect(getByText("订单")).toBeTruthy();
  });

  it("色点与序列色同源：缺省按 index 走 chart-N", () => {
    const { container } = render(<LineChart data={data} series={series} xKey="month" legend />);
    const dots = [...container.querySelectorAll("[aria-hidden].rounded-full")] as HTMLElement[];
    expect(dots[0].style.backgroundColor).toBe(chartColor(0));
    expect(dots[1].style.backgroundColor).toBe(chartColor(1));
  });

  it("序列显式 color 覆盖色点", () => {
    const { container } = render(
      <BarChart data={data} series={[{ key: "revenue", label: "营收", color: "success" }]} xKey="month" legend />,
    );
    const dot = container.querySelector("[aria-hidden].rounded-full") as HTMLElement;
    expect(dot.style.backgroundColor).toBe("var(--color-success)");
  });

  it("无 label 的序列回落到 key", () => {
    const { getByText } = render(
      <LineChart data={data} series={[{ key: "revenue" }]} xKey="month" legend />,
    );
    expect(getByText("revenue")).toBeTruthy();
  });

  it("legend=\"top\" 排在画布之前，\"bottom\" 排在之后", () => {
    const top = render(<AreaChart data={data} series={series} xKey="month" legend="top" />).container
      .firstElementChild!;
    expect(top.firstElementChild!.textContent).toContain("营收");
    const bottom = render(<AreaChart data={data} series={series} xKey="month" legend="bottom" />)
      .container.firstElementChild!;
    expect(bottom.lastElementChild!.textContent).toContain("营收");
  });

  it("height 仍是组件总高：开图例时画布变矮，而不是把总高撑高", () => {
    const withLegend = render(<AreaChart data={data} series={series} xKey="month" height={300} legend />)
      .container.firstElementChild as HTMLElement;
    expect(withLegend.style.height).toBe("300px");
    const canvas = withLegend.querySelector("div[style*='height']") as HTMLElement;
    expect(parseInt(canvas.style.height, 10)).toBeLessThan(300);
  });

  it("三个直角坐标图都吃 legend", () => {
    for (const Chart of [AreaChart, BarChart, LineChart]) {
      const { getByText, unmount } = render(
        <Chart data={data} series={series} xKey="month" legend />,
      );
      expect(getByText("营收")).toBeTruthy();
      unmount();
    }
  });
});

// hulianui/hulian#80：极坐标三件的 <Legend> 写死，消费方关不掉也挪不动 ——
// 28 序列时图例铺满 5 行吃掉过半画布，签名还与笛卡尔三件不对称。
describe("Chart legend · 极坐标三件", () => {
  // 自绘图例的色点（Dot）是唯一标识：recharts 自带图例走 .recharts-default-legend，不长这样
  const legendDots = (c: HTMLElement) =>
    [...c.querySelectorAll("[aria-hidden].rounded-full")] as HTMLElement[];

  it("默认带图例：既有调用零改动（Radar/Pie/Radial 三件）", () => {
    const radar = render(<RadarChart data={data} series={series} xKey="month" />).container;
    expect(radar.textContent).toContain("营收");
    expect(legendDots(radar)).toHaveLength(2);

    for (const Chart of [PieChart, RadialChart]) {
      const { container, unmount } = render(<Chart data={flat} />);
      expect(container.textContent).toContain("搜索");
      expect(legendDots(container)).toHaveLength(2);
      unmount();
    }
  });

  it("legend={false} 关掉自带图例（三件都有出口）", () => {
    const radar = render(
      <RadarChart data={data} series={series} xKey="month" legend={false} />,
    ).container;
    expect(radar.textContent).not.toContain("营收");
    expect(legendDots(radar)).toHaveLength(0);

    for (const Chart of [PieChart, RadialChart]) {
      const { container, unmount } = render(<Chart data={flat} legend={false} />);
      expect(legendDots(container)).toHaveLength(0);
      unmount();
    }
  });

  it("legend={false} 时画布吃满 height（不再为图例让出一行）", () => {
    const off = render(<RadarChart data={data} series={series} xKey="month" height={320} legend={false} />)
      .container.firstElementChild as HTMLElement;
    expect(off.style.height).toBe("320px");
    expect(parseInt((off.querySelector("div[style*='height']") as HTMLElement).style.height, 10)).toBe(320);

    const on = render(<RadarChart data={data} series={series} xKey="month" height={320} />).container
      .firstElementChild as HTMLElement;
    expect(parseInt((on.querySelector("div[style*='height']") as HTMLElement).style.height, 10)).toBeLessThan(320);
  });

  it('legend="top" 把图例排到画布之前（与笛卡尔三件同一套语义）', () => {
    const top = render(<PieChart data={flat} legend="top" />).container.firstElementChild!;
    expect(top.firstElementChild!.textContent).toContain("搜索");
    const bottom = render(<PieChart data={flat} legend="bottom" />).container.firstElementChild!;
    expect(bottom.lastElementChild!.textContent).toContain("搜索");
  });

  it("扁平数据类的图例色点与扇区同源：缺省按 index 走 chart-N，显式 color 覆盖", () => {
    const { container } = render(
      <PieChart data={[{ name: "搜索", value: 1 }, { name: "直接", value: 2, color: "success" }]} />,
    );
    const dots = legendDots(container);
    expect(dots[0].style.backgroundColor).toBe(chartColor(0));
    expect(dots[1].style.backgroundColor).toBe("var(--color-success)");
  });

  it("legendScroll：图例恒为单行 + 横向滚动，序列再多也不换行挤画布", () => {
    const many = Array.from({ length: 28 }, (_, i) => ({ key: `s${i}`, label: `20${String(i).padStart(2, "0")}` }));
    const { container } = render(
      <RadarChart data={data} series={many} xKey="month" height={320} legendScroll />,
    );
    const row = container.querySelector("[class*='overflow-x-auto']") as HTMLElement;
    expect(row).toBeTruthy();
    expect(row.className).toContain("flex-nowrap");
    expect(row.className).not.toContain("flex-wrap");
    expect(legendDots(container)).toHaveLength(28);
  });

  it("legendScroll 对笛卡尔三件同样生效（签名对称）", () => {
    const { container } = render(
      <AreaChart data={data} series={series} xKey="month" legend legendScroll />,
    );
    expect(container.querySelector("[class*='overflow-x-auto']")).toBeTruthy();
  });

  it("不开 legendScroll 时保持换行居中（既有版式不变）", () => {
    const { container } = render(<AreaChart data={data} series={series} xKey="month" legend />);
    expect(container.querySelector("[class*='overflow-x-auto']")).toBeNull();
    expect(container.innerHTML).toContain("flex-wrap");
  });
});
