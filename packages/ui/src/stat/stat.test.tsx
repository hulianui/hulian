import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Stat } from "./stat";

describe("Stat", () => {
  it("渲染 label + value", () => {
    const { getByText } = render(<Stat label="月活" value="12,034" />);
    expect(getByText("月活")).toBeTruthy();
    expect(getByText("12,034")).toBeTruthy();
  });

  it("delta>=0 → text-primary + 上箭头 + 正号", () => {
    const { getByText, container } = render(<Stat label="GMV" value="¥88k" delta={12} />);
    const trend = getByText(/\+12%/).closest("div") as HTMLElement;
    expect(trend.className).toContain("text-primary");
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("delta<0 → text-danger + 负号", () => {
    const { getByText } = render(<Stat label="退款" value="3" delta={-5} />);
    const trend = getByText(/-5%/).closest("div") as HTMLElement;
    expect(trend.className).toContain("text-danger");
  });

  it("无 delta → 不渲染趋势行（无 svg）", () => {
    const { container } = render(<Stat label="x" value="1" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("传 chart → 渲染图表插槽", () => {
    const { getByTestId } = render(
      <Stat label="条目" value={12} chart={<div data-testid="spark">spark</div>} />,
    );
    expect(getByTestId("spark")).toBeTruthy();
  });
});
