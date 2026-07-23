import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Callout } from "./callout";

describe("Callout", () => {
  it("渲染标题与正文", () => {
    const { getByText } = render(
      <Callout title="Tip" tone="tip">
        正文内容
      </Callout>,
    );
    expect(getByText("Tip")).toBeTruthy();
    expect(getByText("正文内容")).toBeTruthy();
  });

  it("默认 tone=tip 走 primary 皮肤", () => {
    const { container } = render(<Callout title="T">x</Callout>);
    expect((container.firstChild as HTMLElement).className).toContain("border-primary");
  });

  it("tone=danger 换 danger accent，标题着色而非整块", () => {
    const { container, getByText } = render(
      <Callout tone="danger" title="危险">
        正文
      </Callout>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("border-danger");
    expect(getByText("危险").className).toContain("text-danger");
    // 正文保持 foreground，不染 tone 色
    expect(getByText("正文").className).toContain("text-foreground");
  });

  it("无 title 无 icon 时不渲染头部行", () => {
    const { container } = render(<Callout>只有正文</Callout>);
    expect(container.querySelectorAll(".font-semibold").length).toBe(0);
  });

  it("icon 槽渲染", () => {
    const { getByText } = render(
      <Callout title="T" icon={<span>★</span>}>
        x
      </Callout>,
    );
    expect(getByText("★")).toBeTruthy();
  });
});
