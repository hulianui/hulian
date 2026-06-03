import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "./toolbar";

describe("Toolbar", () => {
  it("渲染 role=toolbar", () => {
    const { container } = render(
      <Toolbar aria-label="格式">
        <ToolbarButton aria-label="加粗">B</ToolbarButton>
      </Toolbar>,
    );
    expect(container.querySelector('[role="toolbar"]')).toBeTruthy();
  });

  it("默认 horizontal：data-orientation=horizontal", () => {
    const { container } = render(
      <Toolbar aria-label="格式">
        <ToolbarButton>x</ToolbarButton>
      </Toolbar>,
    );
    expect(container.querySelector('[role="toolbar"]')!.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("ToolbarButton 可点击触发 onClick", () => {
    let clicked = false;
    const { getByLabelText } = render(
      <Toolbar aria-label="格式">
        <ToolbarButton aria-label="加粗" onClick={() => (clicked = true)}>
          B
        </ToolbarButton>
      </Toolbar>,
    );
    fireEvent.click(getByLabelText("加粗"));
    expect(clicked).toBe(true);
  });

  it("ToolbarSeparator 渲染 role=separator", () => {
    const { container } = render(
      <Toolbar aria-label="格式">
        <ToolbarButton>a</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton>b</ToolbarButton>
      </Toolbar>,
    );
    expect(container.querySelector('[role="separator"]')).toBeTruthy();
  });

  it("ToolbarGroup 包裹的按钮仍可访问", () => {
    const { getAllByRole } = render(
      <Toolbar aria-label="格式">
        <ToolbarGroup>
          <ToolbarButton>a</ToolbarButton>
          <ToolbarButton>b</ToolbarButton>
        </ToolbarGroup>
      </Toolbar>,
    );
    expect(getAllByRole("button").length).toBe(2);
  });
});
