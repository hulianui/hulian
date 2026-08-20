import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { DateTimePicker } from "./date-time-picker";
import { inputShellVariants } from "../input/input";

const openPanel = () => fireEvent.click(screen.getByRole("combobox", { name: "选择日期时间" }));

describe("DateTimePicker", () => {
  it("enUS localizes the trigger controls and time columns", () => {
    render(
      <ConfigProvider locale={enUS}>
        <DateTimePicker defaultValue="2026-06-08 09:30" aria-label="Select date and time" />
      </ConfigProvider>,
    );
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
    fireEvent.click(screen.getByRole("combobox", { name: "Select date and time" }));
    expect(screen.getByRole("listbox", { name: "Hour" })).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "Minute" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Now" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeTruthy();
  });

  it("a legacy custom locale without dateTimePicker keeps the Chinese controls", () => {
    const locale = {
      ...enUS,
      components: { ...enUS.components!, dateTimePicker: undefined },
    };
    render(
      <ConfigProvider locale={locale}>
        <div>
          <DateTimePicker defaultValue="2026-06-08 09:30" aria-label="Legacy date time" />
          <DateTimePicker aria-label="Empty legacy date time" />
        </div>
      </ConfigProvider>,
    );
    expect(screen.getByText("选择日期时间")).toBeTruthy();
    expect(screen.getByRole("button", { name: "清除" })).toBeTruthy();
    fireEvent.click(screen.getByRole("combobox", { name: "Legacy date time" }));
    expect(screen.getByRole("listbox", { name: "时" })).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "分" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "此刻" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "确定" })).toBeTruthy();
  });

  it("无值时显示占位", () => {
    render(<DateTimePicker aria-label="选择日期时间" />);
    expect(screen.getByText("选择日期时间")).toBeTruthy();
  });

  it("有值时原样显示定宽文本", () => {
    render(<DateTimePicker defaultValue="2026-06-08 09:30" aria-label="选择日期时间" />);
    expect(screen.getByText("2026-06-08 09:30")).toBeTruthy();
  });

  it("displayFormat 只改显示，不改对外值", () => {
    const onValueChange = vi.fn();
    render(
      <DateTimePicker
        defaultValue="2026-06-08 09:30"
        displayFormat="M 月 D 日 HH:mm"
        onValueChange={onValueChange}
        aria-label="选择日期时间"
      />,
    );
    expect(screen.getByText("6 月 8 日 09:30")).toBeTruthy();
    openPanel();
    fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
    expect(onValueChange).toHaveBeenCalledWith("2026-06-15 09:30");
  });

  it("面板同时给出日历与时间列", () => {
    render(<DateTimePicker defaultValue="2026-06-08 09:30" aria-label="选择日期时间" />);
    openPanel();
    expect(screen.getByRole("button", { name: "2026-06-08" })).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "时" })).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "分" })).toBeTruthy();
    expect(screen.queryByRole("listbox", { name: "秒" })).toBeNull();
  });

  it("withSeconds 才有秒列，值形状带秒", () => {
    const onValueChange = vi.fn();
    render(
      <DateTimePicker withSeconds defaultValue="2026-06-08 09:30:15" onValueChange={onValueChange} aria-label="选择日期时间" />,
    );
    openPanel();
    expect(screen.getByRole("listbox", { name: "秒" })).toBeTruthy();
    fireEvent.click(screen.getByRole("option", { name: "秒 45" }));
    expect(onValueChange).toHaveBeenCalledWith("2026-06-08 09:30:45");
  });

  describe("选日期 / 选时间互不干扰", () => {
    it("换日期保留已选时间", () => {
      const onValueChange = vi.fn();
      render(<DateTimePicker defaultValue="2026-06-08 09:30" onValueChange={onValueChange} aria-label="选择日期时间" />);
      openPanel();
      fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
      expect(onValueChange).toHaveBeenCalledWith("2026-06-15 09:30");
    });

    it("换时间保留已选日期", () => {
      const onValueChange = vi.fn();
      render(<DateTimePicker defaultValue="2026-06-08 09:30" onValueChange={onValueChange} aria-label="选择日期时间" />);
      openPanel();
      fireEvent.click(screen.getByRole("option", { name: "时 14" }));
      expect(onValueChange).toHaveBeenCalledWith("2026-06-08 14:30");
    });

    it("选日期不关面板 —— 时间还没选完", () => {
      render(<DateTimePicker defaultValue="2026-06-08 09:30" aria-label="选择日期时间" />);
      openPanel();
      fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
      expect(screen.getByRole("listbox", { name: "时" })).toBeTruthy();
    });

    it("没选日期就先点时间的话，日期落到今天", () => {
      const onValueChange = vi.fn();
      render(<DateTimePicker onValueChange={onValueChange} aria-label="选择日期时间" />);
      openPanel();
      fireEvent.click(screen.getByRole("option", { name: "时 14" }));
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2} 14:00$/);
    });
  });

  describe("min/max 边界", () => {
    it("日期部分限制日历", () => {
      render(
        <DateTimePicker
          defaultValue="2026-06-10 12:00"
          minDateTime="2026-06-08 09:30"
          maxDateTime="2026-06-20 18:00"
          aria-label="选择日期时间"
        />,
      );
      openPanel();
      expect((screen.getByRole("button", { name: "2026-06-07" }) as HTMLButtonElement).disabled).toBe(true);
      expect((screen.getByRole("button", { name: "2026-06-08" }) as HTMLButtonElement).disabled).toBe(false);
      expect((screen.getByRole("button", { name: "2026-06-21" }) as HTMLButtonElement).disabled).toBe(true);
    });

    it("压在下界那天，早于边界的小时被禁", () => {
      render(
        <DateTimePicker defaultValue="2026-06-08 10:00" minDateTime="2026-06-08 09:30" aria-label="选择日期时间" />,
      );
      openPanel();
      expect((screen.getByRole("option", { name: "时 08" }) as HTMLButtonElement).disabled).toBe(true);
      expect((screen.getByRole("option", { name: "时 09" }) as HTMLButtonElement).disabled).toBe(false);
    });

    it("区间内部的日子时间列全开 —— 边界不该跨天外溢", () => {
      render(
        <DateTimePicker
          defaultValue="2026-06-10 12:00"
          minDateTime="2026-06-08 09:30"
          maxDateTime="2026-06-20 18:00"
          aria-label="选择日期时间"
        />,
      );
      openPanel();
      expect((screen.getByRole("option", { name: "时 00" }) as HTMLButtonElement).disabled).toBe(false);
      expect((screen.getByRole("option", { name: "时 23" }) as HTMLButtonElement).disabled).toBe(false);
    });

    it("换到边界那天时，越界的时间被夹回边界", () => {
      const onValueChange = vi.fn();
      render(
        <DateTimePicker
          defaultValue="2026-06-10 08:00"
          minDateTime="2026-06-08 09:30"
          onValueChange={onValueChange}
          aria-label="选择日期时间"
        />,
      );
      openPanel();
      fireEvent.click(screen.getByRole("button", { name: "2026-06-08" }));
      expect(onValueChange).toHaveBeenCalledWith("2026-06-08 09:30");
    });
  });

  it("minuteStep 决定分钟列粒度", () => {
    render(<DateTimePicker defaultValue="2026-06-08 09:30" minuteStep={15} aria-label="选择日期时间" />);
    openPanel();
    expect(screen.getByRole("option", { name: "分 45" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "分 31" })).toBeNull();
  });

  describe("清除 / 此刻 / 确定", () => {
    it("清除回传 null", () => {
      const onValueChange = vi.fn();
      render(<DateTimePicker defaultValue="2026-06-08 09:30" onValueChange={onValueChange} aria-label="选择日期时间" />);
      fireEvent.click(screen.getByRole("button", { name: "清除" }));
      expect(onValueChange).toHaveBeenCalledWith(null);
    });

    it("此刻给出完整形状并关面板", () => {
      const onValueChange = vi.fn();
      render(<DateTimePicker onValueChange={onValueChange} aria-label="选择日期时间" />);
      openPanel();
      fireEvent.click(screen.getByRole("button", { name: "此刻" }));
      expect(onValueChange.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
      expect(screen.queryByRole("listbox", { name: "时" })).toBeNull();
    });

    it("showNow={false} 不渲染此刻，确定仍在", () => {
      render(<DateTimePicker defaultValue="2026-06-08 09:30" showNow={false} aria-label="选择日期时间" />);
      openPanel();
      expect(screen.queryByRole("button", { name: "此刻" })).toBeNull();
      expect(screen.getByRole("button", { name: "确定" })).toBeTruthy();
    });
  });

  describe("disabled / readOnly", () => {
    it("disabled 打不开面板", () => {
      render(<DateTimePicker defaultValue="2026-06-08 09:30" disabled aria-label="选择日期时间" />);
      openPanel();
      expect(screen.queryByRole("listbox", { name: "时" })).toBeNull();
    });

    it("readOnly 能看不能改", () => {
      const onValueChange = vi.fn();
      render(
        <DateTimePicker defaultValue="2026-06-08 09:30" readOnly onValueChange={onValueChange} aria-label="选择日期时间" />,
      );
      openPanel();
      fireEvent.click(screen.getByRole("option", { name: "时 14" }));
      fireEvent.click(screen.getByRole("button", { name: "2026-06-15" }));
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  // #98：触发器此前硬编码 h-9(36px)，与 Input 的 32/40/48 刻度对不上，并排必错位。
  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
  ] as const)("size=%s 触发器高度 %s，与 Input 同刻度", (size, h) => {
    expect(inputShellVariants({ size })).toContain(h);
    const { container } = render(<DateTimePicker size={size} aria-label="选择日期时间" />);
    expect(container.querySelector("button")!.className).toContain(h);
  });

  it("不传 size 时按 md（40px）渲染", () => {
    const { container } = render(<DateTimePicker aria-label="选择日期时间" />);
    expect(container.querySelector("button")!.className).toContain("h-10");
  });
});
