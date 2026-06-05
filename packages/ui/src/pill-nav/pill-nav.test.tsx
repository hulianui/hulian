import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PillNav } from "./pill-nav";

const items = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "https://x.com", label: "X" },
];

describe("PillNav", () => {
  it("渲染 nav + 每个导航项一个 <a> 链接", () => {
    const { container } = render(<PillNav items={items} />);
    const nav = container.querySelector("nav");
    expect(nav).not.toBeNull();
    expect(nav!.getAttribute("aria-label")).toBe("Primary");
    const links = nav!.querySelectorAll('a[role="menuitem"]');
    expect(links).toHaveLength(3);
    expect(links[0].getAttribute("href")).toBe("/");
    expect(links[2].getAttribute("href")).toBe("https://x.com");
  });

  it("activeHref 命中项进入反相态（bg-primary）并标 data-active", () => {
    const { container } = render(<PillNav items={items} activeHref="/docs" />);
    const links = container.querySelectorAll('a[role="menuitem"]');
    expect(links[1].getAttribute("class")).toContain("bg-primary");
    expect(links[1].hasAttribute("data-active")).toBe(true);
    expect(links[0].hasAttribute("data-active")).toBe(false);
  });

  it("token 类与 reduced-motion 守卫存在（涨满圆 group-hover scale + motion-reduce 停）", () => {
    const { container } = render(<PillNav items={items} />);
    const html = container.innerHTML;
    expect(html).toContain("group-hover/pill:scale-100");
    expect(html).toContain("motion-reduce:transition-none");
    const list = container.querySelector('ul[role="menubar"]')!;
    expect(list.getAttribute("class")).toContain("bg-surface");
  });

  it("传 logo 时渲染圆形 logo 区，logoHref/aria 生效；不传则无 logo", () => {
    const { container, rerender } = render(<PillNav items={items} />);
    // logo 链接是 nav 的直接子级（非 menuitem）；不传 logo 时该 logo 链接不存在
    expect(container.querySelector('nav > a')).toBeNull();
    rerender(
      <PillNav items={items} logo={<img src="/l.png" alt="L" />} logoHref="/brand" logoAriaLabel="品牌" />,
    );
    const logoLink = container.querySelector('a[aria-label="品牌"]');
    expect(logoLink).not.toBeNull();
    expect(logoLink!.getAttribute("href")).toBe("/brand");
  });

  it("initialLoadAnimation=false 时去掉入场关键帧 + className/props 透传", () => {
    const { container } = render(
      <PillNav items={items} initialLoadAnimation={false} className="mt-4" data-testid="pn" />,
    );
    const nav = container.querySelector("nav")!;
    expect(nav.getAttribute("class")).toContain("mt-4");
    expect(nav.getAttribute("data-testid")).toBe("pn");
    expect(container.innerHTML).not.toContain("hulian-pill-nav-grow");
  });
});
