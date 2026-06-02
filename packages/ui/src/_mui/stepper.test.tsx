import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MuiBridgeProvider } from "./provider";
import { Stepper } from "./stepper";

const steps = [{ label: "下单" }, { label: "付款" }, { label: "发货" }];

describe("Stepper（MUI 桥）", () => {
  it("渲染所有步文字", () => {
    const { getByText } = render(
      <MuiBridgeProvider>
        <Stepper steps={steps} activeStep={1} />
      </MuiBridgeProvider>,
    );
    expect(getByText("下单")).toBeTruthy();
    expect(getByText("付款")).toBeTruthy();
    expect(getByText("发货")).toBeTruthy();
  });

  it("activeStep 标记当前步（Mui-active）", () => {
    const { container } = render(
      <MuiBridgeProvider>
        <Stepper steps={steps} activeStep={1} />
      </MuiBridgeProvider>,
    );
    expect(container.querySelector(".Mui-active")).toBeTruthy();
  });
});
