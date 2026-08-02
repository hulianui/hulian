import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { Calendar } from "./calendar";

// 面板一律用 defaultValue / defaultMonth 定位光标，不依赖「今天」——
// 否则测试会在月初/月末与跨年时随真实日期漂移。

describe("Calendar", () => {
  it("标题、星期、导航与快捷按钮跟随 ConfigProvider", () => {
    render(
      <ConfigProvider locale={enUS}>
        <Calendar defaultValue="2026-06-08" />
      </ConfigProvider>,
    );

    expect(screen.getByText("June 2026")).toBeTruthy();
    expect(screen.getByText("Sun")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next page" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Today" })).toBeTruthy();
  });

  it("渲染星期头与当月网格，标题跟随光标月份", () => {
    render(<Calendar defaultValue="2026-06-08" />);
    expect(screen.getByText("2026 年 6 月")).toBeTruthy();
    expect(screen.getByText("日")).toBeTruthy();
    expect(screen.getByRole("button", { name: "2026-06-08" })).toBeTruthy();
  });

  it("defaultMonth 决定初始停留月份，与选中值无关", () => {
    render(<Calendar defaultMonth="2026-09-01" />);
    expect(screen.getByText("2026 年 9 月")).toBeTruthy();
  });

  it("点某天提交 YYYY-MM-DD", () => {
    const onValueChange = vi.fn();
    render(<Calendar defaultValue="2026-06-08" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
    expect(onValueChange).toHaveBeenCalledWith("2026-06-15");
  });

  it("非受控下选中态跟着走", () => {
    render(<Calendar defaultValue="2026-06-08" />);
    fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
    expect(screen.getByRole("button", { name: "2026-06-15" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "2026-06-08" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("受控下不自行改选中态，只回调", () => {
    const onValueChange = vi.fn();
    render(<Calendar value="2026-06-08" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
    expect(onValueChange).toHaveBeenCalledWith("2026-06-15");
    expect(screen.getByRole("button", { name: "2026-06-08" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("翻页按钮在 date 层翻月", () => {
    render(<Calendar defaultValue="2026-06-08" />);
    fireEvent.click(screen.getByRole("button", { name: "下一页" }));
    expect(screen.getByText("2026 年 7 月")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "上一页" }));
    fireEvent.click(screen.getByRole("button", { name: "上一页" }));
    expect(screen.getByText("2026 年 5 月")).toBeTruthy();
  });

  describe("三层下钻 / 上卷", () => {
    it("date 粒度下点标题上卷到月，选月只下钻不提交", () => {
      const onValueChange = vi.fn();
      render(<Calendar defaultValue="2026-06-08" onValueChange={onValueChange} />);
      fireEvent.click(screen.getByRole("button", { name: "2026 年 6 月" }));
      fireEvent.click(screen.getByRole("button", { name: "9 月" }));
      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByText("2026 年 9 月")).toBeTruthy();
    });

    it("month 粒度点月份即提交 YYYY-MM", () => {
      const onValueChange = vi.fn();
      render(<Calendar picker="month" defaultValue="2026-06" onValueChange={onValueChange} />);
      fireEvent.click(screen.getByRole("button", { name: "9 月" }));
      expect(onValueChange).toHaveBeenCalledWith("2026-09");
    });

    it("year 粒度点年份即提交 YYYY", () => {
      const onValueChange = vi.fn();
      render(<Calendar picker="year" defaultValue="2026" onValueChange={onValueChange} />);
      fireEvent.click(screen.getByRole("button", { name: "2028" }));
      expect(onValueChange).toHaveBeenCalledWith("2028");
    });

    it("year 层是顶，标题不再可点", () => {
      render(<Calendar picker="year" defaultValue="2026" />);
      const title = screen.getByRole("button", { name: "2020 - 2029" });
      expect((title as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe("禁用规则", () => {
    it("min/max 之外的日子被禁用", () => {
      render(<Calendar defaultValue="2026-06-10" minDate="2026-06-05" maxDate="2026-06-20" />);
      expect(
        (screen.getByRole("button", { name: "2026-06-04" }) as HTMLButtonElement).disabled,
      ).toBe(true);
      expect(
        (screen.getByRole("button", { name: "2026-06-05" }) as HTMLButtonElement).disabled,
      ).toBe(false);
      expect(
        (screen.getByRole("button", { name: "2026-06-20" }) as HTMLButtonElement).disabled,
      ).toBe(false);
      expect(
        (screen.getByRole("button", { name: "2026-06-21" }) as HTMLButtonElement).disabled,
      ).toBe(true);
    });

    it("disabledDate 命中的日子不可点也不回调", () => {
      const onValueChange = vi.fn();
      render(
        <Calendar
          defaultValue="2026-06-10"
          disabledDate={(iso) => iso === "2026-06-15"}
          onValueChange={onValueChange}
        />,
      );
      const cell = screen.getByRole("button", { name: "2026-06-15" }) as HTMLButtonElement;
      expect(cell.disabled).toBe(true);
      fireEvent.click(cell);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("month 粒度下 disabledDate 按该月首日判定", () => {
      render(
        <Calendar
          picker="month"
          defaultValue="2026-06"
          disabledDate={(iso) => iso === "2026-09-01"}
        />,
      );
      expect((screen.getByRole("button", { name: "9 月" }) as HTMLButtonElement).disabled).toBe(
        true,
      );
      expect((screen.getByRole("button", { name: "8 月" }) as HTMLButtonElement).disabled).toBe(
        false,
      );
    });
  });

  describe("readOnly / disabled", () => {
    it("readOnly 选不动但翻得动", () => {
      const onValueChange = vi.fn();
      render(<Calendar defaultValue="2026-06-08" readOnly onValueChange={onValueChange} />);
      fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
      expect(onValueChange).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "下一页" }));
      expect(screen.getByText("2026 年 7 月")).toBeTruthy();
    });

    it("disabled 连翻页也停掉", () => {
      render(<Calendar defaultValue="2026-06-08" disabled />);
      expect((screen.getByRole("button", { name: "下一页" }) as HTMLButtonElement).disabled).toBe(
        true,
      );
      expect(
        (screen.getByRole("button", { name: "2026-06-15" }) as HTMLButtonElement).disabled,
      ).toBe(true);
    });
  });

  describe("今天快捷", () => {
    it("默认渲染，点了跳到今天并提交", () => {
      const onValueChange = vi.fn();
      render(<Calendar defaultValue="2020-01-01" onValueChange={onValueChange} />);
      fireEvent.click(screen.getByRole("button", { name: "今天" }));
      expect(onValueChange).toHaveBeenCalledTimes(1);
      // 断言形状而非具体日期，避免跟随系统时钟漂移
      expect(onValueChange.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("showToday={false} 不渲染", () => {
      render(<Calendar defaultValue="2026-06-08" showToday={false} />);
      expect(screen.queryByRole("button", { name: "今天" })).toBeNull();
    });

    it("粒度不同文案不同", () => {
      render(<Calendar picker="month" defaultValue="2026-06" />);
      expect(screen.getByRole("button", { name: "本月" })).toBeTruthy();
    });
  });
});
