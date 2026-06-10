import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Artifact } from "./artifact";

describe("Artifact", () => {
  it("渲染标题/版本/内容", () => {
    const { container } = render(
      <Artifact title="简历草稿" version="v2">
        <p>正文内容</p>
      </Artifact>,
    );
    expect(container.textContent).toContain("简历草稿");
    expect(container.textContent).toContain("v2");
    expect(container.textContent).toContain("正文内容");
  });
  it("折叠态内容区有 max-height 内联样式，点展开后撤销", () => {
    const { container, getByText } = render(
      <Artifact title="t">
        <p>c</p>
      </Artifact>,
    );
    const body = container.querySelector("[data-artifact-body]") as HTMLElement;
    expect(body.style.maxHeight).toBe("240px");
    fireEvent.click(getByText("展开全文"));
    expect(body.style.maxHeight).toBe("");
    expect(container.textContent).toContain("收起");
  });
  it("受控 expanded 由外部驱动", () => {
    const { container } = render(
      <Artifact title="t" expanded onExpandedChange={() => {}}>
        <p>c</p>
      </Artifact>,
    );
    const body = container.querySelector("[data-artifact-body]") as HTMLElement;
    expect(body.style.maxHeight).toBe("");
  });
  it("collapsedHeight<=0 不渲染展开按钮", () => {
    const { container } = render(
      <Artifact title="t" collapsedHeight={0}>
        <p>c</p>
      </Artifact>,
    );
    expect(container.textContent).not.toContain("展开全文");
  });
});
