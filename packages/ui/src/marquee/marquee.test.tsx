import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Marquee } from "./marquee";

// container > [Marquee 根 div] > [N 个轨道 div]；":scope > div > div" 精确选中轨道（子项 span 是第 3 层不被选中）
const tracksOf = (container: HTMLElement) => container.querySelectorAll(":scope > div > div");

describe("Marquee", () => {
  it("默认复制 4 份动画轨道（无缝循环所需）", () => {
    const { container } = render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(container).length).toBe(4);
  });
  it("repeat 可配置份数", () => {
    const { container } = render(
      <Marquee repeat={2}>
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(container).length).toBe(2);
  });
  it("复制份（index>0）带 aria-hidden，首份不带（AT 只读一次）", () => {
    const { container } = render(
      <Marquee repeat={3}>
        <span>x</span>
      </Marquee>,
    );
    const tracks = tracksOf(container);
    expect(tracks[0].getAttribute("aria-hidden")).toBe(null);
    expect(tracks[1].getAttribute("aria-hidden")).toBe("true");
    expect(tracks[2].getAttribute("aria-hidden")).toBe("true");
  });
  it("外层 overflow-hidden + group", () => {
    const { container } = render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain("overflow-hidden");
    expect(root.className).toContain("group");
  });
  it("pauseOnHover 为真 → 轨道带 group-hover 暂停类；默认假则无", () => {
    const on = render(
      <Marquee pauseOnHover>
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(on.container)[0].className).toContain("group-hover:[animation-play-state:paused]");
    const off = render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(off.container)[0].className).not.toContain("group-hover:[animation-play-state:paused]");
  });
  it("direction=right → 轨道带 reverse 类", () => {
    const { container } = render(
      <Marquee direction="right">
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(container)[0].className).toContain("[animation-direction:reverse]");
  });
  it("motion-reduce 停用类恒在（尊重 prefers-reduced-motion）", () => {
    const { container } = render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    );
    expect(tracksOf(container)[0].className).toContain("motion-reduce:[animation:none]");
  });
  it("duration/gap 落 CSS 变量", () => {
    const { container } = render(
      <Marquee duration={20} gap="2rem">
        <span>x</span>
      </Marquee>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hulian-marquee-duration")).toBe("20s");
    expect(root.style.getPropertyValue("--hulian-marquee-gap")).toBe("2rem");
  });
  it("className 与 props 透传", () => {
    const { container } = render(
      <Marquee className="my-4" data-testid="m">
        <span>x</span>
      </Marquee>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain("my-4");
    expect(root.getAttribute("data-testid")).toBe("m");
  });
});
