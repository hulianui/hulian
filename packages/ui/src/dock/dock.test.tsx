import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Dock, DockIcon } from "./dock";

describe("Dock", () => {
  it("渲染底座 + 各图标", () => {
    const { getByText, container } = render(
      <Dock>
        <DockIcon>A</DockIcon>
        <DockIcon>B</DockIcon>
      </Dock>,
    );
    expect(getByText("A")).toBeTruthy();
    expect(getByText("B")).toBeTruthy();
    expect(container.firstElementChild!.className).toContain("rounded-2xl");
  });

  it("DockIcon 在 Dock 外也能渲染（无 context 降级恒定尺寸）", () => {
    const { getByText } = render(<DockIcon>X</DockIcon>);
    expect(getByText("X")).toBeTruthy();
  });

  it("透传 className 到底座", () => {
    const { container } = render(
      <Dock className="my-dock">
        <DockIcon>A</DockIcon>
      </Dock>,
    );
    expect(container.firstElementChild!.classList.contains("my-dock")).toBe(true);
  });
});
