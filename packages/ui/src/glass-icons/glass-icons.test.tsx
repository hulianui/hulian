import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GlassIcons } from "./glass-icons";

const items = [
  { icon: <svg data-testid="i-heart" />, label: "收藏", color: "primary" },
  { icon: <svg data-testid="i-star" />, label: "星标", color: "blue" },
];

describe("GlassIcons", () => {
  it("按 items 渲染语义 button + aria-label", () => {
    const { getAllByRole } = render(<GlassIcons items={items} />);
    const btns = getAllByRole("button");
    expect(btns).toHaveLength(2);
    expect(btns[0]!.getAttribute("aria-label")).toBe("收藏");
    expect(btns[1]!.getAttribute("aria-label")).toBe("星标");
  });

  it("玻璃前层用 token（hairline inset + backdrop-blur），非硬编码色", () => {
    const { container } = render(<GlassIcons items={[items[0]!]} />);
    const html = container.innerHTML;
    expect(html).toContain("var(--color-hairline)");
    expect(html).toContain("backdrop-filter:blur");
    expect(html).toContain("text-foreground");
  });

  it("预设语义色映射到 chart token 渐变", () => {
    const { container } = render(<GlassIcons items={[{ icon: null, label: "x", color: "blue" }]} />);
    const back = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(back.style.background).toContain("var(--color-chart-1)");
  });

  it("columns 落 --hulian-glass-cols + className/style 透传", () => {
    const { container } = render(
      <GlassIcons items={items} columns={4} className="my-grid" data-testid="g" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hulian-glass-cols")).toBe("4");
    expect(root.getAttribute("class")).toContain("my-grid");
    expect(root.getAttribute("data-testid")).toBe("g");
  });

  it("reduced-motion 停 transition（DOM 不变）", () => {
    const { container } = render(<GlassIcons items={[items[0]!]} />);
    const html = container.innerHTML;
    expect(html).toContain("motion-reduce:transition-none");
    // 内容仍在，不因 reduced-motion 卸载
    expect(html).toContain("收藏");
  });
});
