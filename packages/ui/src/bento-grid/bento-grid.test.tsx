import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BentoGrid, BentoCard } from "./bento-grid";

describe("BentoGrid", () => {
  it("渲染栅格容器 + 卡片", () => {
    const { getByText, container } = render(
      <BentoGrid>
        <BentoCard title="卡片一" />
      </BentoGrid>,
    );
    expect(container.firstElementChild!.className).toContain("grid");
    expect(getByText("卡片一")).toBeTruthy();
  });

  it("BentoCard 渲染 title/description", () => {
    const { getByText } = render(<BentoCard title="标题" description="描述" />);
    expect(getByText("标题")).toBeTruthy();
    expect(getByText("描述")).toBeTruthy();
  });

  it("无 cta 不渲染行动区", () => {
    const { queryByText } = render(<BentoCard title="x" />);
    expect(queryByText("了解更多")).toBeNull();
  });

  it("透传 className（跨列）到卡片", () => {
    const { container } = render(<BentoCard className="sm:col-span-2" title="x" />);
    expect(container.firstElementChild!.classList.contains("sm:col-span-2")).toBe(true);
  });
});
