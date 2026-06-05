import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { FlowingMenu } from "./flowing-menu";

const items = [
  { link: "#a", text: "Discover", image: "https://example.com/a.jpg" },
  { link: "#b", text: "Build" },
];

describe("FlowingMenu", () => {
  it("渲染 nav + 每项链接（含文案与 href）", () => {
    const { container } = render(<FlowingMenu items={items} />);
    const nav = container.querySelector("nav")!;
    expect(nav).toBeTruthy();
    expect(nav.className).toContain("bg-surface");
    const links = container.querySelectorAll("a");
    expect(links.length).toBe(2);
    expect(links[0].getAttribute("href")).toBe("#a");
    expect(links[0].textContent).toBe("Discover");
  });

  it("揭幕轨道带跑马灯关键帧 + reduced-motion 停（token 类齐全）", () => {
    const { container } = render(<FlowingMenu items={items} />);
    const track = container.querySelector("[class*='hulian-flowing-menu']")!;
    expect(track).toBeTruthy();
    const cls = track.getAttribute("class")!;
    expect(cls).toContain("[animation:hulian-flowing-menu");
    expect(cls).toContain("motion-reduce:[animation:none]");
    expect(cls).toContain("text-primary-foreground");
    // 揭幕外层走 token bg-primary
    const outer = container.querySelector("[data-fm-outer]")!;
    expect(outer.getAttribute("class")).toContain("bg-primary");
  });

  it("speed 落 --hl-fm-speed 变量", () => {
    const { container } = render(<FlowingMenu items={items} speed={30} />);
    const track = container.querySelector(
      "[class*='hulian-flowing-menu']",
    ) as HTMLElement;
    expect(track.style.getPropertyValue("--hl-fm-speed")).toBe("30s");
  });

  it("指针进入/离开切换揭幕 transform（不依赖真实布局，jsdom 安全）", () => {
    const { container } = render(<FlowingMenu items={items} />);
    const link = container.querySelector("a")!;
    const outer = container.querySelector("[data-fm-outer]") as HTMLElement;
    // 初始藏在下边缘外
    expect(outer.style.transform).toContain("101%");
    fireEvent.pointerEnter(link, { clientX: 10, clientY: 0 });
    expect(outer.style.transform).toBe("translate3d(0,0,0)");
    fireEvent.pointerLeave(link, { clientX: 10, clientY: 0 });
    expect(outer.style.transform).toContain("%");
  });

  it("className / props 透传到根 nav", () => {
    const { container } = render(
      <FlowingMenu items={items} className="rounded-xl" data-testid="fm" />,
    );
    const nav = container.querySelector("nav")!;
    expect(nav.getAttribute("class")).toContain("rounded-xl");
    expect(nav.getAttribute("data-testid")).toBe("fm");
  });
});
