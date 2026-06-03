import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MuiBridgeProvider } from "./provider";
import { Calendar } from "./calendar";

describe("Calendar（MUI 桥）", () => {
  it("渲染日历网格（含日期 gridcell）", () => {
    const { getAllByRole } = render(
      <MuiBridgeProvider>
        <Calendar value="2026-06-03" />
      </MuiBridgeProvider>,
    );
    // MUI X 日历每个可选日是 role=gridcell
    expect(getAllByRole("gridcell").length).toBeGreaterThan(0);
  });

  it("点击某一天触发 onValueChange，回传当日 ISO", () => {
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <MuiBridgeProvider>
        <Calendar value="2026-06-03" onValueChange={onValueChange} />
      </MuiBridgeProvider>,
    );
    // 按日期文本（“15”）找当月那一天的按钮
    const day15 = getByRole("gridcell", { name: "15" });
    fireEvent.click(day15);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const iso = onValueChange.mock.calls[0][0] as string;
    expect(iso).toBeTruthy();
    // 注：toISOString() 输出 UTC，本地时区(如 UTC+8)下点 6/15 当地 0 点 = UTC 6/14 16:00，
    // 故不按字符串断言具体日期，改为校验回传的是「点击日所在那次选择」的合法 ISO，
    // 且解析回本地后日期为 15（用 Date 本地化还原，避免时区误判）。
    const d = new Date(iso);
    expect(Number.isNaN(d.getTime())).toBe(false);
    expect(d.getDate()).toBe(15);
  });

  it("readOnly 时点击不触发 onValueChange", () => {
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <MuiBridgeProvider>
        <Calendar value="2026-06-03" readOnly onValueChange={onValueChange} />
      </MuiBridgeProvider>,
    );
    fireEvent.click(getByRole("gridcell", { name: "15" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
