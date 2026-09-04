import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RadarChart } from "./chart";

afterEach(cleanup);

// hulianui/hulian#80 的第二半：序列一多，换行图例会把画布挤扁（28 条 = 5 行，
// 吃掉 height=320 的一半有余）。「图例恒为单行」是布局主张 —— jsdom 没有布局引擎，
// 只能在真实浏览器里量。
const HEIGHT = 320;
const data = [
  { indicator: "图片", "2001": 12, "2002": 30 },
  { indicator: "文档", "2001": 22, "2002": 18 },
];
const many = Array.from({ length: 28 }, (_, i) => ({
  key: String(2001 + i),
  label: String(2001 + i),
}));

function renderChart(props: { legendScroll?: boolean; legend?: boolean }) {
  const { container } = render(
    <div style={{ width: 640 }}>
      <RadarChart data={data} series={many} xKey="indicator" height={HEIGHT} {...props} />
    </div>,
  );
  const frame = container.firstElementChild!.firstElementChild as HTMLElement;
  // ChartFrame 结构：[图例?] + 画布 div + [图例?]
  const legend = frame.lastElementChild as HTMLElement;
  const canvas = frame.children[0] as HTMLElement;
  return { frame, legend, canvas };
}

describe("Chart 图例几何（真实浏览器）", () => {
  it("28 序列 + legendScroll：图例恒为单行，画布拿走绝大部分总高", () => {
    const { frame, legend, canvas } = renderChart({ legendScroll: true });
    expect(frame.getBoundingClientRect().height).toBe(HEIGHT);
    // 单行：图例高度不超过让给它的那一档（32px）
    expect(legend.getBoundingClientRect().height).toBeLessThanOrEqual(32);
    // 且内容确实溢出 → 是「可横滚」而不是「被挤成一团」
    expect(legend.scrollWidth).toBeGreaterThan(legend.clientWidth);
    expect(canvas.getBoundingClientRect().height).toBeGreaterThan(HEIGHT * 0.85);
  });

  it("同样 28 序列不开 legendScroll：图例换行堆高，正是 #80 的现场", () => {
    const { legend } = renderChart({});
    expect(legend.getBoundingClientRect().height).toBeGreaterThan(32);
  });

  it("legend={false}：整段图例不进 DOM，画布吃满总高", () => {
    const { frame, canvas } = renderChart({ legend: false });
    expect(frame.children).toHaveLength(1);
    expect(canvas.getBoundingClientRect().height).toBe(HEIGHT);
  });
});

// #347：图例横向滚动条得真的画出来。皮肤里 scrollbar-width / scrollbar-color 一旦裸写，
// Chromium 121+ 会整体忽略 ::-webkit-scrollbar*，macOS 上一条都不画 —— 类名对不对 jsdom 看得见，
// 「画没画」只有真实浏览器量 offsetHeight-clientHeight 才知道（vitest.config 已去掉
// headless 默认的 --hide-scrollbars，否则这里永远是 0）。
describe("Chart 图例滚动条（真实浏览器）", () => {
  it("legendScroll：横向滚动条占据真实高度，标准属性在 Chromium 下保持 auto", () => {
    const { legend } = renderChart({ legendScroll: true });
    expect(legend.scrollWidth).toBeGreaterThan(legend.clientWidth);
    expect(legend.offsetHeight - legend.clientHeight).toBeGreaterThan(0);
    expect(getComputedStyle(legend).scrollbarWidth).toBe("auto");
  });
});
