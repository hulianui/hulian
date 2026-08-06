import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DateRangePicker } from "./date-range-picker";
import { inputShellVariants } from "../input/input";

afterEach(cleanup);

describe("DateRangePicker", () => {
  it("闭合态: 显示占位, 日历不在 DOM", () => {
    render(<DateRangePicker placeholder={["起始", "结束"]} />);
    expect(screen.getByText("起始")).toBeTruthy();
    expect(screen.getByText("结束")).toBeTruthy();
    // 弹层未开 → 没有周几表头
    expect(screen.queryByText("日")).toBeNull();
  });

  it("受控 value: 触发器按 displayFormat 渲染起止文本", () => {
    render(<DateRangePicker value={["2026-06-08", "2026-06-20"]} displayFormat="MM/DD" />);
    expect(screen.getByText("06/08")).toBeTruthy();
    expect(screen.getByText("06/20")).toBeTruthy();
  });

  it("点击触发器打开: 渲染双月 + 默认四项预设", () => {
    render(<DateRangePicker value={["2026-06-08", "2026-06-20"]} />);
    fireEvent.click(screen.getAllByRole("button")[0]); // 首个 button = 触发器
    expect(screen.getByText("2026 年 6 月")).toBeTruthy();
    expect(screen.getByText("2026 年 7 月")).toBeTruthy();
    expect(screen.getByText("今天")).toBeTruthy();
    expect(screen.getByText("最近 7 天")).toBeTruthy();
    expect(screen.getByText("最近 30 天")).toBeTruthy();
    expect(screen.getByText("本月")).toBeTruthy();
  });

  it("presets={false}: 打开后不渲染预设", () => {
    render(<DateRangePicker value={["2026-06-08", "2026-06-20"]} presets={false} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.getByText("2026 年 6 月")).toBeTruthy();
    expect(screen.queryByText("今天")).toBeNull();
  });

  it("disabled: 触发器禁用且点击不打开日历", () => {
    render(<DateRangePicker disabled value={["2026-06-08", "2026-06-20"]} />);
    const trigger = screen.getAllByRole("button")[0] as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
    fireEvent.click(trigger);
    expect(screen.queryByText("今天")).toBeNull();
  });

  it("两次点击选区: onValueChange 收到排序后的 [start,end]", () => {
    const onChange = vi.fn();
    render(<DateRangePicker defaultValue={["2026-06-10", "2026-06-12"]} onValueChange={onChange} />);
    fireEvent.click(screen.getAllByRole("button")[0]); // 打开（视图对齐到 2026-06）
    // 先点较晚日作起点，再点较早日 → 应自动排序
    fireEvent.click(screen.getByLabelText("2026-06-20"));
    fireEvent.click(screen.getByLabelText("2026-06-05"));
    expect(onChange).toHaveBeenCalledWith(["2026-06-05", "2026-06-20"]);
  });

  it("minDate: 早于下限的当月日被禁用", () => {
    render(<DateRangePicker defaultValue={["2026-06-15", "2026-06-18"]} minDate="2026-06-10" />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    const early = screen.getByLabelText("2026-06-05") as HTMLButtonElement;
    expect(early.disabled).toBe(true);
  });

  it("清除按钮: 有值且非禁用时点击 → onValueChange(null)", () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={["2026-06-08", "2026-06-20"]} onValueChange={onChange} />);
    fireEvent.click(screen.getByLabelText("清除"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  // #98：触发器此前硬编码 h-9(36px)，与 Input 的 32/40/48 刻度对不上，并排必错位。
  // 面板里日期格的 h-9 是网格几何（配 size-9 日按钮），不跟档位，故只断言触发器。
  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
  ] as const)("size=%s 触发器高度 %s，与 Input 同刻度", (size, h) => {
    expect(inputShellVariants({ size })).toContain(h);
    const { container } = render(<DateRangePicker size={size} />);
    expect(container.querySelector("button")!.className).toContain(h);
  });

  it("不传 size 时按 md（40px）渲染", () => {
    const { container } = render(<DateRangePicker />);
    expect(container.querySelector("button")!.className).toContain("h-10");
  });
});
