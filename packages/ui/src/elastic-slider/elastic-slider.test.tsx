import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ElasticSlider } from "./elastic-slider";

describe("ElasticSlider", () => {
  it("渲染根容器 + 默认值数字指示", () => {
    const { container, getByText } = render(<ElasticSlider defaultValue={42} />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("flex");
    // showValue 默认 true → 显示 round(42)
    expect(getByText("42")).toBeTruthy();
  });

  it("token 类就位：轨道 bg-surface-hover + 进度 bg-primary", () => {
    const { container } = render(<ElasticSlider />);
    const html = container.innerHTML;
    expect(html).toContain("bg-surface-hover");
    expect(html).toContain("bg-primary");
  });

  it("showValue=false 时不渲染数字", () => {
    const { queryByText } = render(
      <ElasticSlider defaultValue={77} showValue={false} />,
    );
    expect(queryByText("77")).toBeNull();
  });

  it("className / style 透传到根容器", () => {
    const { container } = render(
      <ElasticSlider className="custom-cls" style={{ marginTop: 8 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("custom-cls");
    expect(root.style.marginTop).toBe("8px");
  });

  it("自定义左右图标渲染进 DOM", () => {
    const { getByTestId } = render(
      <ElasticSlider
        leftIcon={<span data-testid="lft">L</span>}
        rightIcon={<span data-testid="rgt">R</span>}
      />,
    );
    expect(getByTestId("lft").textContent).toBe("L");
    expect(getByTestId("rgt").textContent).toBe("R");
  });
});
