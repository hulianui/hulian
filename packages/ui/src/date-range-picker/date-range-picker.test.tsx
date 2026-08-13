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

// ── 月 / 年粒度（#262）─────────────────────────────────────────────────────
// 对标 el-date-picker 的 type="monthrange"。此前只有天粒度，「选一段月份」只能拿两个
// picker="month" 的 DatePicker 拼——拼出来没有区间高亮、用不上 presets、两端还得自己夹。
describe("DateRangePicker 粒度", () => {
  const openPanel = () => fireEvent.click(screen.getAllByRole("button")[0]!);

  it('picker="month"：值形状是 YYYY-MM，面板是两个年份页', () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker picker="month" defaultValue={["2026-03", "2026-05"]} onValueChange={onChange} />,
    );
    openPanel();
    expect(screen.getByText("2026 年")).toBeTruthy();
    expect(screen.getByText("2027 年")).toBeTruthy();
    // 触发器按月粒度显示，而不是补出一个不存在的「日」
    expect(screen.getByText("2026-03")).toBeTruthy();
    expect(screen.getByText("2026-05")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("2026-08"));
    fireEvent.click(screen.getByLabelText("2026-06"));
    expect(onChange).toHaveBeenCalledWith(["2026-06", "2026-08"]);
  });

  it('picker="year"：值形状是 YYYY，两页各 12 年且不重叠', () => {
    const onChange = vi.fn();
    render(<DateRangePicker picker="year" defaultValue={["2026", "2027"]} onValueChange={onChange} />);
    openPanel();
    // 2026 落在 2016–2027 这一页，下一页从 2028 起（12 年整段，两页不重复同一年）
    expect(screen.getByText("2016 - 2027")).toBeTruthy();
    expect(screen.getByText("2028 - 2039")).toBeTruthy();
    expect(screen.getAllByLabelText("2028")).toHaveLength(1);

    fireEvent.click(screen.getByLabelText("2030"));
    fireEvent.click(screen.getByLabelText("2020"));
    expect(onChange).toHaveBeenCalledWith(["2020", "2030"]);
  });

  it("默认预设随粒度换档（月档给的是本月/近 N 个月/今年，不是最近 7 天）", () => {
    render(<DateRangePicker picker="month" defaultValue={["2026-03", "2026-05"]} />);
    openPanel();
    expect(screen.getByText("本月")).toBeTruthy();
    expect(screen.getByText("最近 3 个月")).toBeTruthy();
    expect(screen.getByText("最近 6 个月")).toBeTruthy();
    expect(screen.getByText("今年")).toBeTruthy();
    expect(screen.queryByText("最近 7 天")).toBeNull();
  });

  it("月档预设落的是月粒度的值（近 3 个月含本月）", () => {
    const onChange = vi.fn();
    render(<DateRangePicker picker="month" onValueChange={onChange} />);
    openPanel();
    fireEvent.click(screen.getByText("最近 3 个月"));
    const [range] = onChange.mock.calls[0]!;
    expect(range).toHaveLength(2);
    for (const v of range) expect(v).toMatch(/^\d{4}-\d{2}$/);
    // 含当前这一段：起点比终点早两个月
    const months = (v: string) => Number(v.slice(0, 4)) * 12 + Number(v.slice(5));
    expect(months(range[1]) - months(range[0])).toBe(2);
  });

  it("占位随粒度（月档说的是月份，不是日期）", () => {
    render(<DateRangePicker picker="month" />);
    expect(screen.getByText("开始月份")).toBeTruthy();
    expect(screen.getByText("结束月份")).toBeTruthy();
    cleanup();
    render(<DateRangePicker picker="year" />);
    expect(screen.getByText("开始年份")).toBeTruthy();
    expect(screen.getByText("结束年份")).toBeTruthy();
  });

  // issue 里踩过的那个坑：运营在右面板点「7 月」拿到的是明年 7 月，后端只校验 yyyy-MM
  // 格式、没有未来月上界，于是静默按合法区间统计、那一列全 0。判据沿用 Calendar 那份：
  // 整段都超界才禁，所以 maxDate 落在月中时，当月仍可选、只有之后的月份灰掉。
  it("maxDate 落在月中：当月仍可选，之后的月份禁用", () => {
    render(<DateRangePicker picker="month" defaultValue={["2026-01", "2026-02"]} maxDate="2026-06-15" />);
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect((screen.getByLabelText("2026-06") as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByLabelText("2026-07") as HTMLButtonElement).disabled).toBe(true);
  });

  it("年档同理：maxDate 落在年中时当年仍可选", () => {
    render(<DateRangePicker picker="year" defaultValue={["2020", "2021"]} maxDate="2026-06-15" />);
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect((screen.getByLabelText("2026") as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByLabelText("2027") as HTMLButtonElement).disabled).toBe(true);
  });

  it("disabledDate 在月档按该月首日问一次（入参恒为 ISO 日期）", () => {
    const seen: string[] = [];
    render(
      <DateRangePicker
        picker="month"
        defaultValue={["2026-01", "2026-02"]}
        disabledDate={(iso) => {
          seen.push(iso);
          return iso === "2026-09-01";
        }}
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect((screen.getByLabelText("2026-09") as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText("2026-08") as HTMLButtonElement).disabled).toBe(false);
    expect(seen.every((iso) => /^\d{4}-\d{2}-01$/.test(iso))).toBe(true);
  });

  it("区间高亮跨页连续：中间月带底带，端点不带（单选那格除外）", () => {
    const { container } = render(<DateRangePicker picker="month" defaultValue={["2026-03", "2026-06"]} />);
    fireEvent.click(screen.getAllByRole("button")[0]!);
    const band = (label: string) =>
      (container.ownerDocument.querySelector(`[aria-label="${label}"]`)!.parentElement as HTMLElement)
        .className;
    expect(band("2026-04")).toContain("bg-primary/10");
    expect(band("2026-03")).toContain("rounded-l-md");
    expect(band("2026-06")).toContain("rounded-r-md");
    expect(band("2026-08")).not.toContain("bg-primary/10");
  });

  it("翻页按 picker 的步长走（月档一页一年，年档一页 12 年）", () => {
    render(<DateRangePicker picker="month" defaultValue={["2026-03", "2026-05"]} />);
    fireEvent.click(screen.getAllByRole("button")[0]!);
    fireEvent.click(screen.getByLabelText("下一页"));
    expect(screen.getByText("2027 年")).toBeTruthy();
    expect(screen.getByText("2028 年")).toBeTruthy();
    expect(screen.queryByText("2026 年")).toBeNull();
  });

  it("日档不受影响：仍是双月历、翻页按月、预设仍是那四项", () => {
    render(<DateRangePicker defaultValue={["2026-06-08", "2026-06-20"]} />);
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect(screen.getByText("2026 年 6 月")).toBeTruthy();
    expect(screen.getByText("最近 7 天")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("下个月"));
    expect(screen.getByText("2026 年 7 月")).toBeTruthy();
  });
});
