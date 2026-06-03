import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MuiBridgeProvider } from "./provider";
import { DateTimePicker } from "./date-time-picker";

describe("DateTimePicker（MUI 桥）", () => {
  it("渲染输入框（分段日期时间字段）且不抛", () => {
    const { container } = render(
      <MuiBridgeProvider>
        <DateTimePicker label="选择日期时间" value="2026-06-03T14:30:00" />
      </MuiBridgeProvider>,
    );
    const field = container.querySelector('[role="group"], input');
    expect(field).toBeTruthy();
  });

  it("带 defaultValue 渲染不抛，存在输入容器", () => {
    const { container } = render(
      <MuiBridgeProvider>
        <DateTimePicker label="开始时间" defaultValue="2026-06-15T09:00:00" />
      </MuiBridgeProvider>,
    );
    expect(container.querySelector(".MuiInputBase-root, [role='group']")).toBeTruthy();
  });

  it("withSeconds 渲染不抛（多出秒段）", () => {
    const { container } = render(
      <MuiBridgeProvider>
        <DateTimePicker label="时间戳" defaultValue="2026-06-15T09:00:30" withSeconds />
      </MuiBridgeProvider>,
    );
    expect(container.querySelector(".MuiInputBase-root, [role='group']")).toBeTruthy();
  });

  it("label 文本被渲染", () => {
    const { getAllByText } = render(
      <MuiBridgeProvider>
        <DateTimePicker label="选择日期时间" value="2026-06-03T14:30:00" />
      </MuiBridgeProvider>,
    );
    expect(getAllByText("选择日期时间").length).toBeGreaterThan(0);
  });
});
