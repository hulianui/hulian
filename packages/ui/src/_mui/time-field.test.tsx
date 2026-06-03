import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MuiBridgeProvider } from "./provider";
import { TimeField } from "./time-field";

describe("TimeField（MUI 桥）", () => {
  it("渲染时间输入字段且不抛", () => {
    const { container } = render(
      <MuiBridgeProvider>
        <TimeField label="选择时间" value="2026-06-03T09:30:00" />
      </MuiBridgeProvider>,
    );
    // MUI X v9 PickersTextField 整体 role=group；DOM 兜底
    const field = container.querySelector('[role="group"], input');
    expect(field).toBeTruthy();
  });

  it("label 文本被渲染", () => {
    const { getAllByText } = render(
      <MuiBridgeProvider>
        <TimeField label="选择时间" value="2026-06-03T09:30:00" />
      </MuiBridgeProvider>,
    );
    expect(getAllByText("选择时间").length).toBeGreaterThan(0);
  });

  it("带 defaultValue 渲染不抛，存在输入容器", () => {
    const { container } = render(
      <MuiBridgeProvider>
        <TimeField label="起始时间" defaultValue="2026-06-03T08:00:00" />
      </MuiBridgeProvider>,
    );
    expect(container.querySelector(".MuiInputBase-root, [role='group']")).toBeTruthy();
  });
});
