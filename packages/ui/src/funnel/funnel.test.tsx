import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Funnel } from "./funnel";
import type { FunnelStage } from "./funnel.types";

afterEach(cleanup);

const stages: FunnelStage[] = [
  { id: "in", label: "涌入", value: 1000 },
  { id: "route", label: "路由", value: 800 },
  { id: "done", label: "完成", value: 600 },
];

describe("Funnel 渲染", () => {
  it("渲染各级 label 与 value", () => {
    const { getByText } = render(<Funnel stages={stages} />);
    expect(getByText("涌入")).toBeTruthy();
    expect(getByText("路由")).toBeTruthy();
    expect(getByText("完成")).toBeTruthy();
    expect(getByText("1000")).toBeTruthy();
    expect(getByText("800")).toBeTruthy();
    expect(getByText("600")).toBeTruthy();
  });

  it("showConversion 时显示级间转化率文本", () => {
    const { getByText, queryByText } = render(<Funnel stages={stages} />);
    // 800/1000 = 80.0%，600/800 = 75.0%
    expect(getByText(/80\.0%/)).toBeTruthy();
    expect(getByText(/75\.0%/)).toBeTruthy();
    // 首级无转化率
    expect(queryByText(/100\.0%/)).toBeNull();
  });

  it("showConversion=false 时不显示转化率", () => {
    const { queryByText } = render(<Funnel stages={stages} showConversion={false} />);
    expect(queryByText(/80\.0%/)).toBeNull();
  });

  it("点击某一级触发 onStageClick 回调（传入该级数据）", () => {
    const onStageClick = vi.fn();
    const { getByText } = render(<Funnel stages={stages} onStageClick={onStageClick} />);
    fireEvent.click(getByText("路由"));
    expect(onStageClick).toHaveBeenCalledTimes(1);
    expect(onStageClick.mock.calls[0][0].id).toBe("route");
  });

  it("horizontal 方向同样渲染各级 label", () => {
    const { getByText } = render(<Funnel stages={stages} orientation="horizontal" />);
    expect(getByText("涌入")).toBeTruthy();
    expect(getByText("完成")).toBeTruthy();
  });

  it("renderStage 自定义内容生效", () => {
    const { getByText } = render(
      <Funnel stages={stages} renderStage={(s) => <span>自定-{s.id}</span>} />,
    );
    expect(getByText("自定-in")).toBeTruthy();
  });
});
