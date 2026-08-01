import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ContributionGraph } from "./contribution-graph";
import { buildContributionCalendar } from "./contribution-matrix";

// 固定结束日，免得测试跟着「今天」漂。2026-08-01 是周六（weekday 6）。
const END = "2026-08-01";

describe("buildContributionCalendar", () => {
  it("补齐区间内每一天（含无上报日）", () => {
    const cal = buildContributionCalendar([{ date: "2026-07-30", count: 3 }], {
      days: 7,
      endDate: END,
    });
    expect(cal.days).toHaveLength(7);
    expect(cal.days[0].date).toBe("2026-07-26");
    expect(cal.days.at(-1)!.date).toBe(END);
    const hit = cal.days.find((d) => d.date === "2026-07-30")!;
    expect(hit.count).toBe(3);
    expect(hit.present).toBe(true);
    expect(cal.days.find((d) => d.date === "2026-07-29")!.present).toBe(false);
  });

  it("同日多条累加，count 缺省按 1 计", () => {
    const cal = buildContributionCalendar(
      [{ date: END, count: 2 }, { date: END }, { date: END, count: 5 }],
      { days: 1, endDate: END },
    );
    expect(cal.days[0].count).toBe(8);
    expect(cal.total).toBe(8);
    expect(cal.max).toBe(8);
  });

  it("脏日期跳过而不是混进键里", () => {
    const cal = buildContributionCalendar([{ date: "不是日期", count: 9 }], {
      days: 3,
      endDate: END,
    });
    expect(cal.total).toBe(0);
  });

  it("每列都是 7 格，首周按真实星期补空", () => {
    const cal = buildContributionCalendar([], { days: 10, endDate: END });
    for (const week of cal.weeks) expect(week).toHaveLength(7);
    // 2026-07-23 是周四 → 周日起算前面补 4 个空
    const lead = cal.weeks[0].findIndex((c) => c !== null);
    expect(lead).toBe(4);
    expect(cal.weeks[0][lead]!.date).toBe("2026-07-23");
  });

  it("weekStart=1 时行位按周一起算", () => {
    const cal = buildContributionCalendar([], { days: 10, endDate: END, weekStart: 1 });
    expect(cal.weeks[0].findIndex((c) => c !== null)).toBe(3); // 周四距周一 3 格
  });

  it("月份标签跨月才打一个，且带该列首日", () => {
    const cal = buildContributionCalendar([], { days: 70, endDate: END });
    const months = cal.monthLabels.map((m) => m.date.slice(0, 7));
    expect(new Set(months).size).toBe(months.length);
    expect(months).toContain("2026-07");
  });

  it("days 至少为 1（传 0/负数不炸）", () => {
    expect(buildContributionCalendar([], { days: 0, endDate: END }).days).toHaveLength(1);
  });
});

describe("ContributionGraph", () => {
  it("calendar 布局渲染整区间格子 + 月份标签", () => {
    const { container, getByText } = render(
      <ContributionGraph data={[{ date: END, count: 4 }]} days={40} endDate={END} />,
    );
    // 有 title 的才是真实日期格（补空格与月份标签不算）
    expect(container.querySelectorAll("span[title]")).toHaveLength(40);
    // 网格按周分列，补空后格子总数必是 7 的整数倍
    const grid = container.querySelector("[style*='grid-auto-flow']") as HTMLElement;
    expect(grid.children.length % 7).toBe(0);
    expect(getByText("7月")).toBeTruthy();
  });

  it("strip 布局只出一行、天数与 days 一致", () => {
    const { container } = render(
      <ContributionGraph layout="strip" days={30} endDate={END} data={[]} />,
    );
    expect(container.querySelectorAll("span[title]")).toHaveLength(30);
  });

  it("无点击时整块当一张图播报总数", () => {
    const { container } = render(
      <ContributionGraph days={7} endDate={END} data={[{ date: END, count: 2 }]} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("role")).toBe("img");
    expect(root.getAttribute("aria-label")).toContain("2 次");
  });

  it("onDayClick 时格子变按钮并回传当天数据", () => {
    const onDayClick = vi.fn();
    const { container } = render(
      <ContributionGraph
        layout="strip"
        days={3}
        endDate={END}
        data={[{ date: END, count: 7 }]}
        onDayClick={onDayClick}
      />,
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(3);
    expect(container.firstElementChild!.getAttribute("role")).toBeNull();
    (buttons[2] as HTMLButtonElement).click();
    expect(onDayClick).toHaveBeenCalledWith(expect.objectContaining({ date: END, count: 7 }));
  });

  it("有贡献的格子按档位着色，无贡献走中性底", () => {
    const { container } = render(
      <ContributionGraph layout="strip" days={2} endDate={END} data={[{ date: END, count: 5 }]} />,
    );
    const cells = Array.from(container.querySelectorAll("span[title]")) as HTMLElement[];
    expect(cells[0].style.backgroundColor).toContain("surface-hover");
    expect(cells[1].style.backgroundColor).toContain("color-mix");
  });

  it("tone 换色系（GitHub 绿走 success）", () => {
    const { container } = render(
      <ContributionGraph layout="strip" days={1} endDate={END} tone="success" data={[{ date: END }]} />,
    );
    const cell = container.querySelector("span[title]") as HTMLElement;
    expect(cell.style.backgroundColor).toContain("--color-success");
  });

  it("formatTooltip 自定义提示文案", () => {
    const { container } = render(
      <ContributionGraph
        layout="strip"
        days={1}
        endDate={END}
        data={[{ date: END, count: 3 }]}
        formatTooltip={(c) => `${c.count} commits on ${c.date}`}
      />,
    );
    expect(container.querySelector("span[title]")?.getAttribute("title")).toBe(
      `3 commits on ${END}`,
    );
  });

  it("showLegend 出「少→多」色阶", () => {
    const { getByText } = render(
      <ContributionGraph layout="strip" days={5} endDate={END} data={[]} showLegend />,
    );
    expect(getByText("少")).toBeTruthy();
    expect(getByText("多")).toBeTruthy();
  });
});
