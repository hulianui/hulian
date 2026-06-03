import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MuiBridgeProvider } from "./provider";
import { DatePicker } from "./date-picker";

describe("DatePicker（MUI 桥）", () => {
  it("渲染输入框（role=group 的可编辑日期字段）且不抛", () => {
    const { container } = render(
      <MuiBridgeProvider>
        <DatePicker label="选择日期" value="2026-06-03" />
      </MuiBridgeProvider>,
    );
    // MUI X v9 PickersTextField 是分段输入，整体是 role=group；用 DOM 兜底断言关键元素存在
    const field = container.querySelector('[role="group"], input');
    expect(field).toBeTruthy();
  });

  it("带 defaultValue 渲染不抛，存在输入容器", () => {
    const { container } = render(
      <MuiBridgeProvider>
        <DatePicker label="到期日" defaultValue="2026-06-15" />
      </MuiBridgeProvider>,
    );
    expect(container.querySelector(".MuiInputBase-root, [role='group']")).toBeTruthy();
  });

  it("label 文本被渲染", () => {
    const { getAllByText } = render(
      <MuiBridgeProvider>
        <DatePicker label="选择日期" value="2026-06-03" />
      </MuiBridgeProvider>,
    );
    expect(getAllByText("选择日期").length).toBeGreaterThan(0);
  });
});
