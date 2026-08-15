import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

// 同 chart.test.tsx：jsdom 下 ResponsiveContainer 测量为 0，子图整个不渲染。
// 克隆 child 注入固定尺寸，让 recharts 真的跑一遍 squarify 布局并出 SVG。
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  const { cloneElement } = await import("react");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: any }) =>
      cloneElement(children, { width: 600, height: 300 }),
  };
});

import { Treemap } from "./treemap";

afterEach(cleanup);

const data = [
  { name: "杭州湖滨店", value: 3820 },
  { name: "上海南京西路店", value: 3140 },
  { name: "苏州观前街店", value: 2470 },
];

describe("Treemap 渲染", () => {
  it("每项一个矩形，格子色按序取 chart token", () => {
    const { container } = render(<Treemap data={data} />);
    const rects = container.querySelectorAll("rect[fill^='var(--color-chart-']");
    expect(rects.length).toBe(3);
    expect(rects[0].getAttribute("fill")).toBe("var(--color-chart-1)");
    expect(rects[1].getAttribute("fill")).toBe("var(--color-chart-2)");
  });

  it("datum.color 覆盖默认色（语义色名走 resolveTone）", () => {
    const { container } = render(<Treemap data={[{ name: "自定义", value: 10, color: "danger" }]} />);
    expect(container.querySelector("rect[fill='var(--color-danger)']")).not.toBeNull();
  });

  it("大格子画出名字；showValue 再加一行数值", () => {
    const plain = render(<Treemap data={data} />);
    expect(plain.container.textContent).toContain("杭州湖滨店");
    expect(plain.container.textContent).not.toContain("3820");
    cleanup();
    const withValue = render(<Treemap data={data} showValue />);
    expect(withValue.container.textContent).toContain("3820");
  });

  it("valueFormat 同时管格内文字与 tooltip（不必两处各写一套）", () => {
    const { container } = render(
      <Treemap data={data} showValue valueFormat={(v) => `${(v / 10000).toFixed(2)} 万`} />,
    );
    expect(container.textContent).toContain("0.38 万");
    expect(container.textContent).not.toContain("3820");
  });

  it("height 落到容器上（宽走 ResponsiveContainer）", () => {
    const { container } = render(<Treemap data={data} height={160} />);
    expect((container.firstElementChild as HTMLElement).style.height).toBe("160px");
  });
});

describe("Treemap 点击钻取（#276）", () => {
  it("点某一格 → onItemClick 带回该项与下标", () => {
    const onItemClick = vi.fn();
    const { container } = render(<Treemap data={data} onItemClick={onItemClick} />);
    const cells = container.querySelectorAll("g.cursor-pointer");
    expect(cells.length).toBe(3);
    fireEvent.click(cells[1]);
    expect(onItemClick).toHaveBeenCalledWith({ datum: data[1], index: 1 });
  });

  it("不传 onItemClick 时不给指针手型（免得看着能点其实不能）", () => {
    const { container } = render(<Treemap data={data} />);
    expect(container.querySelectorAll("g.cursor-pointer").length).toBe(0);
  });
});
