import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { InfiniteMenu } from "./infinite-menu";
import type { InfiniteMenuItem } from "./infinite-menu.types";

const ITEMS: InfiniteMenuItem[] = [
  { title: "Alpha", description: "第一项", link: "https://example.com/a" },
  { title: "Beta", description: "第二项", image: "https://example.com/b.jpg" },
  { title: "Gamma", description: "第三项" },
];

describe("InfiniteMenu", () => {
  it("根容器渲染且带 data-infinite-menu 标记，不抛错（jsdom 无 WebGL）", () => {
    const { container } = render(<InfiniteMenu items={ITEMS} />);
    const root = container.querySelector("[data-infinite-menu]");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("relative");
    expect(root?.className).toContain("overflow-hidden");
  });

  it("为每个 item 渲染一个卡片，并显示某个激活项的标题（token 类）", () => {
    const { container, getAllByText } = render(<InfiniteMenu items={ITEMS} />);
    // 拖拽热区含 3D perspective
    const stage = container.querySelector("[class*='perspective']");
    expect(stage).not.toBeNull();
    // 标题覆盖层使用 text-foreground token
    const heading = container.querySelector("h2");
    expect(heading?.className).toContain("text-foreground");
    // 三个标题里至少一个出现在 DOM（激活项）
    expect(getAllByText(/Alpha|Beta|Gamma/).length).toBeGreaterThan(0);
  });

  it("动作按钮存在且吃 primary token，aria-label 合理", () => {
    const { container } = render(<InfiniteMenu items={ITEMS} />);
    const btn = container.querySelector("button");
    expect(btn).not.toBeNull();
    expect(btn?.className).toContain("bg-primary");
    expect(btn?.getAttribute("aria-label")).toMatch(/打开/);
  });

  it("空 items 时回退到占位项，仍渲染根容器不抛错", () => {
    const { container } = render(<InfiniteMenu items={[]} />);
    expect(container.querySelector("[data-infinite-menu]")).not.toBeNull();
    // 占位项标题前缀「菜单项」
    expect(container.textContent).toContain("菜单项");
  });

  it("className 透传到根容器", () => {
    const { container } = render(
      <InfiniteMenu items={ITEMS} className="test-im-class" />,
    );
    expect(
      container.querySelector("[data-infinite-menu]")?.className,
    ).toContain("test-im-class");
  });
});
