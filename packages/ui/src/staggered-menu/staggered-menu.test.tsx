import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { StaggeredMenu } from "./staggered-menu";

const items = [
  { label: "首页", link: "#home" },
  { label: "产品", link: "#product" },
];

describe("StaggeredMenu", () => {
  it("渲染根容器 + 触发按钮 + 品牌槽（默认收起）", () => {
    const { container, getByRole, getByText } = render(<StaggeredMenu items={items} brand="瑚琏库" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("data-position")).toBe("right");
    expect(root.hasAttribute("data-open")).toBe(false);
    expect(getByText("瑚琏库")).toBeTruthy();
    expect(getByRole("button").getAttribute("aria-expanded")).toBe("false");
  });

  it("accentColor 落 --sm-accent，className/props 透传", () => {
    const { container } = render(
      <StaggeredMenu items={items} accentColor="var(--color-chart-2)" className="my-menu" data-testid="sm" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--sm-accent")).toBe("var(--color-chart-2)");
    expect(root.getAttribute("class")).toContain("my-menu");
    expect(root.getAttribute("data-testid")).toBe("sm");
  });

  it("点击触发按钮打开面板并回调 onMenuOpen", () => {
    const onMenuOpen = vi.fn();
    const { container, getByRole } = render(<StaggeredMenu items={items} onMenuOpen={onMenuOpen} />);
    fireEvent.click(getByRole("button"));
    expect(onMenuOpen).toHaveBeenCalledTimes(1);
    expect(container.firstElementChild!.hasAttribute("data-open")).toBe(true);
    expect(getByRole("button").getAttribute("aria-expanded")).toBe("true");
  });

  it("打开后渲染条目文案与序号（displayItemNumbering）", () => {
    const { getByRole, getByText } = render(<StaggeredMenu items={items} />);
    fireEvent.click(getByRole("button"));
    expect(getByText("首页")).toBeTruthy();
    expect(getByText("产品")).toBeTruthy();
    expect(getByText("01")).toBeTruthy();
    expect(getByText("02")).toBeTruthy();
  });

  it("isFixed 走 fixed/h-dvh，左侧 position 切 data-position", () => {
    const { container } = render(<StaggeredMenu items={items} isFixed position="left" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("fixed");
    expect(root.getAttribute("class")).toContain("h-dvh");
    expect(root.getAttribute("data-position")).toBe("left");
  });
});
