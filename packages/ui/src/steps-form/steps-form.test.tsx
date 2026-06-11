import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { StepsForm } from "./steps-form";
import type { StepsFormStep } from "./steps-form.types";

const steps: StepsFormStep[] = [
  { title: "步骤一", content: <div>内容一</div> },
  { title: "步骤二", content: <div>内容二</div> },
  { title: "步骤三", content: <div>内容三</div> },
];

describe("StepsForm", () => {
  it("初始渲染第一步内容 + 下一步按钮（无上一步/提交）", () => {
    const { getByText, queryByText } = render(<StepsForm steps={steps} />);
    expect(getByText("内容一")).toBeTruthy();
    expect(getByText("下一步")).toBeTruthy();
    expect(queryByText("上一步")).toBeNull();
    expect(queryByText("提交")).toBeNull();
  });

  it("下一步推进到第二步", () => {
    const { getByText, queryByText } = render(<StepsForm steps={steps} />);
    fireEvent.click(getByText("下一步"));
    expect(getByText("内容二")).toBeTruthy();
    expect(getByText("上一步")).toBeTruthy();
    expect(queryByText("内容一")).toBeNull();
  });

  it("最后一步显示提交（无下一步）", () => {
    const { getByText, queryByText } = render(<StepsForm steps={steps} />);
    fireEvent.click(getByText("下一步"));
    fireEvent.click(getByText("下一步"));
    expect(getByText("内容三")).toBeTruthy();
    expect(getByText("提交")).toBeTruthy();
    expect(queryByText("下一步")).toBeNull();
  });

  it("上一步回退", () => {
    const { getByText } = render(<StepsForm steps={steps} />);
    fireEvent.click(getByText("下一步"));
    fireEvent.click(getByText("上一步"));
    expect(getByText("内容一")).toBeTruthy();
  });

  it("onStepValidate 返回 false 阻止前进", async () => {
    const validate = vi.fn().mockResolvedValue(false);
    const { getByText, queryByText } = render(<StepsForm steps={steps} onStepValidate={validate} />);
    fireEvent.click(getByText("下一步"));
    await waitFor(() => expect(validate).toHaveBeenCalledWith(0));
    expect(getByText("内容一")).toBeTruthy(); // 未前进
    expect(queryByText("内容二")).toBeNull();
  });

  it("最后一步提交触发 onFinish（校验通过）", async () => {
    const onFinish = vi.fn();
    const { getByText } = render(<StepsForm steps={steps} onFinish={onFinish} />);
    fireEvent.click(getByText("下一步"));
    fireEvent.click(getByText("下一步"));
    fireEvent.click(getByText("提交"));
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
  });

  it("nextDisabled：本步前进按钮禁用，点击不前进", () => {
    const withDisabled: StepsFormStep[] = [
      { title: "一", content: <div>内容一</div>, nextDisabled: true },
      { title: "二", content: <div>内容二</div> },
    ];
    const { getByText } = render(<StepsForm steps={withDisabled} />);
    const next = getByText("下一步").closest("button")!;
    expect(next.disabled).toBe(true);
    fireEvent.click(next);
    expect(getByText("内容一")).toBeTruthy();
  });

  it("nextText：替换本步前进按钮文案（其余步仍走 locale）", () => {
    const withText: StepsFormStep[] = [
      { title: "一", content: <div>内容一</div>, nextText: "开始导入" },
      { title: "二", content: <div>内容二</div> },
    ];
    const { getByText, queryByText } = render(<StepsForm steps={withText} />);
    expect(getByText("开始导入")).toBeTruthy();
    expect(queryByText("下一步")).toBeNull();
    fireEvent.click(getByText("开始导入"));
    // 第二步（末步）回到默认 locale 提交文案
    expect(getByText("提交")).toBeTruthy();
  });

  it("nextText 作用于末步提交按钮", () => {
    const withText: StepsFormStep[] = [
      { title: "一", content: <div>内容一</div> },
      { title: "二", content: <div>内容二</div>, nextText: "完成" },
    ];
    const { getByText, queryByText } = render(<StepsForm steps={withText} defaultCurrent={1} />);
    expect(getByText("完成")).toBeTruthy();
    expect(queryByText("提交")).toBeNull();
  });

  it("showNav=false：本步不渲染底部导航", () => {
    const withHidden: StepsFormStep[] = [
      { title: "一", content: <div>内容一</div> },
      { title: "二", content: <div>结果页</div>, showNav: false },
    ];
    const { getByText, queryByText } = render(<StepsForm steps={withHidden} defaultCurrent={1} />);
    expect(getByText("结果页")).toBeTruthy();
    expect(queryByText("上一步")).toBeNull();
    expect(queryByText("提交")).toBeNull();
    expect(queryByText("下一步")).toBeNull();
  });

  it("onStepValidate pending 期间前进按钮 loading；resolve true 后推进", async () => {
    let resolve!: (ok: boolean) => void;
    const validate = vi.fn(() => new Promise<boolean>((r) => (resolve = r)));
    const { getByText, queryByText } = render(<StepsForm steps={steps} onStepValidate={validate} />);
    const next = getByText("下一步").closest("button")!;
    fireEvent.click(next);
    await waitFor(() => expect(next.disabled).toBe(true)); // Button loading → disabled + spinner
    expect(next.querySelector("svg.animate-spin")).toBeTruthy();
    expect(queryByText("内容二")).toBeNull(); // 尚未推进
    resolve(true);
    await waitFor(() => expect(getByText("内容二")).toBeTruthy());
    const next2 = getByText("下一步").closest("button")!;
    expect(next2.disabled).toBe(false); // loading 已复位
  });

  it("onStepValidate reject 视同 false：不推进且 loading 复位", async () => {
    const validate = vi.fn().mockRejectedValue(new Error("boom"));
    const { getByText, queryByText } = render(<StepsForm steps={steps} onStepValidate={validate} />);
    const next = getByText("下一步").closest("button")!;
    fireEvent.click(next);
    await waitFor(() => expect(validate).toHaveBeenCalledWith(0));
    await waitFor(() => expect(next.disabled).toBe(false));
    expect(queryByText("内容二")).toBeNull();
  });

  it("受控 current + onCurrentChange", () => {
    const onChange = vi.fn();
    const { getByText, queryByText } = render(
      <StepsForm steps={steps} current={1} onCurrentChange={onChange} />,
    );
    expect(getByText("内容二")).toBeTruthy();
    fireEvent.click(getByText("下一步"));
    expect(onChange).toHaveBeenCalledWith(2);
    // 受控：未更新 prop 仍停在第二步
    expect(getByText("内容二")).toBeTruthy();
    expect(queryByText("内容三")).toBeNull();
  });
});
