import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { BubbleMenu } from "./bubble-menu";

describe("BubbleMenu", () => {
  it("渲染 logo 气泡 + 切换钮，初始未展开（token 类）", () => {
    const { getByLabelText, container } = render(<BubbleMenu logo={<span>瑚琏</span>} />);
    const toggle = getByLabelText("切换菜单");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    // 气泡走 surface token，不是硬编码白
    expect(container.querySelector(".bg-surface")).toBeTruthy();
  });

  it("点击切换钮展开菜单并回调 onMenuClick(true)", () => {
    const calls: boolean[] = [];
    const { getByLabelText, queryByRole } = render(
      <BubbleMenu onMenuClick={(v) => calls.push(v)} />,
    );
    expect(queryByRole("menu")).toBeNull();
    fireEvent.click(getByLabelText("切换菜单"));
    expect(calls).toEqual([true]);
    expect(queryByRole("menu")).not.toBeNull();
  });

  it("自定义 items 透传 label 与 aria-label", () => {
    const { getByLabelText, getByText } = render(
      <BubbleMenu items={[{ label: "文档", href: "/docs", ariaLabel: "文档中心" }]} />,
    );
    fireEvent.click(getByLabelText("切换菜单"));
    expect(getByText("文档")).toBeTruthy();
    expect(getByLabelText("文档中心")).toBeTruthy();
  });

  it("useFixedPosition 切换根 nav 定位类 + className 透传", () => {
    const { container } = render(
      <BubbleMenu useFixedPosition className="my-nav" />,
    );
    const nav = container.querySelector("nav")!;
    expect(nav.getAttribute("class")).toContain("fixed");
    expect(nav.getAttribute("class")).toContain("my-nav");
  });

  it("展开后渲染默认 5 项，悬停反色变量落到 style", () => {
    const { getByLabelText, getAllByRole } = render(<BubbleMenu />);
    fireEvent.click(getByLabelText("切换菜单"));
    const links = getAllByRole("menuitem") as HTMLAnchorElement[];
    expect(links).toHaveLength(5);
    expect(links[0].style.getPropertyValue("--hover-bg")).toContain("var(--color-chart-1)");
  });
});
