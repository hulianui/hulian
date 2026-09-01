import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Stat } from "./stat";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Stat", () => {
  // 回归护栏：Stat 若被改回普通函数组件（去掉 memo），这条立刻红。
  it("稳定父更新时跳过指标卡子树", async () => {
    await expectMemoSkipsSubtree(() => <Stat label="月活" value="12,034" delta={12} />);
  });

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

  it("hint 独立于 delta 渲染（无 delta 也出现）", () => {
    const { getByText, container } = render(
      <Stat label="题篮题数" value="12" hint="上限 200 题" />,
    );
    expect(getByText("上限 200 题")).toBeTruthy();
    // 只有注脚、没有趋势：趋势图标不该被带出来
    expect(container.querySelector("svg")).toBeNull();
  });

  it("hint 与 delta 同时存在：趋势行在上、注脚在下", () => {
    const { getByText } = render(
      <Stat label="参考人数" value="38" delta={6.4} deltaLabel="较上场" hint="2 人未交卷" />,
    );
    const trend = getByText(/\+6\.4%/).closest("div") as HTMLElement;
    const hint = getByText("2 人未交卷");
    expect(getByText("较上场")).toBeTruthy();
    // DOCUMENT_POSITION_FOLLOWING：hint 在趋势行之后
    expect(trend.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("传 deltaLabel 却没有 delta → 开发期告警且不静默吞掉", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { queryByText } = render(<Stat label="题篮题数" value="12" deltaLabel="较上月" />);
    expect(queryByText("较上月")).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("deltaLabel"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("hint"));
    warn.mockRestore();
  });
  // #339：0.58.0 给 icon 加了 size-8 底座，标题行有无 icon 高度差 12px，同一排混用时数值错位。
  it("标题行有无 icon 都预留 32px（min-h-8），混用时数值行对齐", () => {
    const header = (ui: React.ReactElement) =>
      render(ui).container.firstElementChild!.firstElementChild as HTMLElement;
    const withIcon = header(<Stat label="a" value="1" icon={<span>i</span>} />);
    const without = header(<Stat label="b" value="2" />);
    expect(withIcon.className).toContain("min-h-8");
    expect(without.className).toContain("min-h-8");
    expect(withIcon.querySelector(".size-8")).toBeTruthy();
    expect(without.querySelector(".size-8")).toBeNull();
  });
});
