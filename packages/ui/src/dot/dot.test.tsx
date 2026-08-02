import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Dot, dotVariants } from "./dot";

describe("dotVariants", () => {
  it("默认 = md（size-2）", () => {
    expect(dotVariants({})).toContain("size-2");
  });
  it("sm / lg 切换尺寸", () => {
    expect(dotVariants({ size: "sm" })).toContain("size-1.5");
    expect(dotVariants({ size: "lg" })).toContain("size-2.5");
  });
  it("恒为圆形 + 不收缩", () => {
    const c = dotVariants({});
    expect(c).toContain("rounded-full");
    expect(c).toContain("shrink-0");
  });
});

// hulianui/hulian#73：五档 tone 接不住图表序列色（chart-1..6 / 任意 CSS 色）。
describe("Dot color", () => {
  const dot = (ui: React.ReactElement) =>
    render(ui).container.firstElementChild as HTMLElement;

  it("语义色名解析为 var(--color-*)（与 Brand.color / ChartSeries.color 同路）", () => {
    expect(dot(<Dot color="chart-2" />).style.backgroundColor).toBe("var(--color-chart-2)");
  });

  it("接任意 CSS 色", () => {
    expect(dot(<Dot color="#ff8800" />).style.backgroundColor).toBe("rgb(255, 136, 0)");
  });

  it("漏 --color- 前缀的变量被容错补全", () => {
    expect(dot(<Dot color="var(--chart-3)" />).style.backgroundColor).toBe("var(--color-chart-3)");
  });

  it("color 命中时让开 tone 的 bg-* 工具类，避免两者打架", () => {
    const el = dot(<Dot tone="danger" color="chart-1" />);
    expect(el.className).not.toContain("bg-danger");
    expect(el.style.backgroundColor).toBe("var(--color-chart-1)");
  });

  it("不传 color 时仍走 tone 工具类（旧行为不变）", () => {
    const el = dot(<Dot tone="success" />);
    expect(el.className).toContain("bg-success");
    expect(el.style.backgroundColor).toBe("");
  });

  it("pulse 的扩散圈跟随同色", () => {
    const el = dot(<Dot color="chart-4" pulse />);
    const ping = el.querySelector(".animate-ping") as HTMLElement;
    expect(ping.style.backgroundColor).toBe("var(--color-chart-4)");
  });

  it("显式 style 仍可覆盖（逃生口）", () => {
    const el = dot(<Dot color="chart-2" style={{ backgroundColor: "red" }} />);
    expect(el.style.backgroundColor).toBe("red");
  });
});
