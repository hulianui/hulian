import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { GooeyNav } from "./gooey-nav";

const items = [
  { label: "首页", href: "#" },
  { label: "产品", href: "#" },
  { label: "关于", href: "#" },
];

describe("GooeyNav", () => {
  it("渲染全部导航项 + 根 data-slot", () => {
    const { container, getByText } = render(<GooeyNav items={items} />);
    const root = container.querySelector('[data-slot="gooey-nav"]')!;
    expect(root).toBeTruthy();
    expect(getByText("首页")).toBeTruthy();
    expect(getByText("产品")).toBeTruthy();
    expect(getByText("关于")).toBeTruthy();
  });

  it("默认 initialActiveIndex=0 项标记 aria-current=page", () => {
    const { getByText } = render(<GooeyNav items={items} initialActiveIndex={1} />);
    expect(getByText("产品").getAttribute("aria-current")).toBe("page");
    expect(getByText("首页").getAttribute("aria-current")).toBeNull();
  });

  it("点击切换触发 onChange 并迁移高亮", () => {
    const onChange = vi.fn();
    const { getByText } = render(<GooeyNav items={items} onChange={onChange} />);
    fireEvent.click(getByText("关于"));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(getByText("关于").getAttribute("aria-current")).toBe("page");
  });

  it("受控模式下不自行改变高亮，只回调", () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <GooeyNav items={items} activeIndex={0} onChange={onChange} />,
    );
    fireEvent.click(getByText("产品"));
    expect(onChange).toHaveBeenCalledWith(1);
    // 受控：activeIndex 仍为 0，高亮不移动
    expect(getByText("首页").getAttribute("aria-current")).toBe("page");
    expect(getByText("产品").getAttribute("aria-current")).toBeNull();
  });

  it("胶质层带 token 颜色药丸 + className 透传（jsdom 无 ResizeObserver 不崩）", () => {
    const { container } = render(
      <GooeyNav items={items} className="my-nav" particleCount={0} />,
    );
    const root = container.querySelector('[data-slot="gooey-nav"]')!;
    expect(root.getAttribute("class")).toContain("my-nav");
    expect(container.querySelector('[data-slot="gooey-nav-goo"]')).toBeTruthy();
  });
});
