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
