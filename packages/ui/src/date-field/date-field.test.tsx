import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { DateField } from "./date-field";

const openPanel = () => fireEvent.click(screen.getByRole("button", { name: "选择日期" }));

describe("DateField", () => {
  it("默认渲染占位文本，不渲染清除按钮", () => {
    render(<DateField aria-label="选择日期" />);
    expect(screen.getByText("选择日期")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "清除" })).toBeNull();
  });

  it("有值时触发器显示 ISO 日期串", () => {
    render(<DateField defaultValue="2026-06-08" aria-label="选择日期" />);
    expect(screen.getByText("2026-06-08")).toBeTruthy();
  });

  it("displayFormat 只改显示，不改对外值", () => {
    const onValueChange = vi.fn();
    render(
      <DateField
        defaultValue="2026-06-08"
        displayFormat="YYYY 年 M 月 D 日"
        onValueChange={onValueChange}
        aria-label="选择日期"
      />,
    );
    expect(screen.getByText("2026 年 6 月 8 日")).toBeTruthy();
    openPanel();
    fireEvent.click(screen.getByRole("button", { name: "2026-06-09" }));
    expect(onValueChange).toHaveBeenCalledWith("2026-06-09");
  });

  it("选一天即提交 ISO 串并关闭面板", () => {
    const onValueChange = vi.fn();
    render(<DateField defaultValue="2026-06-08" onValueChange={onValueChange} aria-label="选择日期" />);
    openPanel();
    fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
    expect(onValueChange).toHaveBeenCalledWith("2026-06-15");
    expect(screen.queryByRole("button", { name: "2026-06-15" })).toBeNull();
  });

  it("清除按钮回传 null", () => {
    const onValueChange = vi.fn();
    render(<DateField defaultValue="2026-06-08" onValueChange={onValueChange} aria-label="选择日期" />);
    fireEvent.click(screen.getByRole("button", { name: "清除" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("clearable={false} 不出清除按钮", () => {
    render(<DateField defaultValue="2026-06-08" clearable={false} aria-label="选择日期" />);
    expect(screen.queryByRole("button", { name: "清除" })).toBeNull();
  });

  describe("min/max 与 disabledDate", () => {
    it("越界的日子被禁用", () => {
      render(
        <DateField defaultValue="2026-06-10" minDate="2026-06-05" maxDate="2026-06-20" aria-label="选择日期" />,
      );
      openPanel();
      expect((screen.getByRole("button", { name: "2026-06-04" }) as HTMLButtonElement).disabled).toBe(true);
      expect((screen.getByRole("button", { name: "2026-06-21" }) as HTMLButtonElement).disabled).toBe(true);
      expect((screen.getByRole("button", { name: "2026-06-10" }) as HTMLButtonElement).disabled).toBe(false);
    });

    it("disabledDate 命中的日子被禁用，且点了不提交", () => {
      const onValueChange = vi.fn();
      render(
        <DateField
          defaultValue="2026-06-10"
          onValueChange={onValueChange}
          aria-label="选择日期"
          disabledDate={(iso) => iso === "2026-06-11"}
        />,
      );
      openPanel();
      const target = screen.getByRole("button", { name: "2026-06-11" }) as HTMLButtonElement;
      expect(target.disabled).toBe(true);
      fireEvent.click(target);
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("picker 粒度", () => {
    it("month：值形状为 YYYY-MM，点月份即提交", () => {
      const onValueChange = vi.fn();
      render(
        <DateField picker="month" defaultValue="2026-06" onValueChange={onValueChange} aria-label="选择日期" />,
      );
      expect(screen.getByText("2026-06")).toBeTruthy();
      openPanel();
      fireEvent.click(screen.getByRole("button", { name: "9 月" }));
      expect(onValueChange).toHaveBeenCalledWith("2026-09");
    });

    it("year：值形状为 YYYY，点年份即提交", () => {
      const onValueChange = vi.fn();
      render(
        <DateField picker="year" defaultValue="2026" onValueChange={onValueChange} aria-label="选择日期" />,
      );
      expect(screen.getByText("2026")).toBeTruthy();
      openPanel();
      fireEvent.click(screen.getByRole("button", { name: "2028" }));
      expect(onValueChange).toHaveBeenCalledWith("2028");
    });

    it("date 粒度下点月份只是下钻，不提交", () => {
      const onValueChange = vi.fn();
      render(<DateField defaultValue="2026-06-08" onValueChange={onValueChange} aria-label="选择日期" />);
      openPanel();
      // 标题按钮上卷到月视图
      fireEvent.click(screen.getByRole("button", { name: "2026 年 6 月" }));
      fireEvent.click(screen.getByRole("button", { name: "9 月" }));
      expect(onValueChange).not.toHaveBeenCalled();
      // 回到日视图，且已切到 9 月
      expect(screen.getByRole("button", { name: "2026-09-15" })).toBeTruthy();
    });
  });

  it("翻页按钮切月", () => {
    render(<DateField defaultValue="2026-06-08" aria-label="选择日期" />);
    openPanel();
    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    expect(screen.getByRole("button", { name: "2026-07-15" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "上一页" }));
    expect(screen.getByRole("button", { name: "2026-06-15" })).toBeTruthy();
  });

  it("readOnly 可以看面板但选不动", () => {
    const onValueChange = vi.fn();
    render(
      <DateField defaultValue="2026-06-08" readOnly onValueChange={onValueChange} aria-label="选择日期" />,
    );
    openPanel();
    fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disabled 打不开面板", () => {
    render(<DateField defaultValue="2026-06-08" disabled aria-label="选择日期" />);
    openPanel();
    expect(screen.queryByRole("button", { name: "2026-06-15" })).toBeNull();
  });

  it("受控：不回填 value 则显示不变（由外部驱动）", () => {
    const onValueChange = vi.fn();
    render(<DateField value="2026-06-08" onValueChange={onValueChange} aria-label="选择日期" />);
    openPanel();
    fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
    expect(onValueChange).toHaveBeenCalledWith("2026-06-15");
    expect(screen.getByText("2026-06-08")).toBeTruthy();
  });
});
