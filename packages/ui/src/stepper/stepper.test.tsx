import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Stepper } from "./stepper";

const steps = [{ label: "下单" }, { label: "付款" }, { label: "发货" }];

describe("Stepper（零依赖）", () => {
  it("渲染所有步文字", () => {
    const { getByText } = render(<Stepper steps={steps} activeStep={1} />);
    expect(getByText("下单")).toBeTruthy();
    expect(getByText("付款")).toBeTruthy();
    expect(getByText("发货")).toBeTruthy();
  });

  // 原实现断言的是 MUI 私有类名 .Mui-active —— 那本来就不该是公开契约。
  // 自研后改用语义化的 aria-current / data-state，消费方也能据此做样式钩子。
  it("activeStep 标记当前步（aria-current=step + data-state=active）", () => {
    const { container } = render(<Stepper steps={steps} activeStep={1} />);
    const active = container.querySelector('[aria-current="step"]');
    expect(active).toBeTruthy();
    expect(active?.getAttribute("data-state")).toBe("active");
    expect(active?.textContent).toContain("付款");
  });

  it("已完成步标 completed，未达成步标 pending", () => {
    const { container } = render(<Stepper steps={steps} activeStep={1} />);
    const states = [...container.querySelectorAll("[data-state]")].map((el) =>
      el.getAttribute("data-state"),
    );
    expect(states).toEqual(["completed", "active", "pending"]);
  });
})
