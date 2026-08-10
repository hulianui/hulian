import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render } from "@testing-library/react";
import { InteractiveHoverButton } from "./interactive-hover-button";

describe("InteractiveHoverButton", () => {
  it("渲染成 button，可访问名只有一份（悬停层是副本，已 aria-hidden）", () => {
    const { getByRole } = render(<InteractiveHoverButton>开始使用</InteractiveHoverButton>);
    const button = getByRole("button");
    expect(button.tagName).toBe("BUTTON");
    expect(button.textContent).toContain("开始使用");
    // 两层各有一份文案：静息层承载可访问名，悬停层必须整层藏起来，否则读屏念两遍。
    // 数直接子节点而不是全树 querySelectorAll —— 尾随箭头图标自身也带 aria-hidden。
    const layers = Array.from(button.children);
    expect(layers.length).toBe(2);
    expect(layers[0].getAttribute("aria-hidden")).toBe(null);
    expect(layers[1].getAttribute("aria-hidden")).toBe("true");
  });

  // 上游用 scale(100.8) 放大一颗 2px 圆点——那是按某个按钮宽度反推的魔数，按钮再宽就盖不满，
  // 且是静默失败。改用 circle(150%)：百分比按参照框对角线解析，任何宽度都必然盖满。
  it("展开用 clip-path 的 150% 圆，不用魔数 scale", () => {
    const { container } = render(<InteractiveHoverButton>去下载</InteractiveHoverButton>);
    const overlay = container.querySelector("[aria-hidden]")!;
    expect(overlay.className).toContain("group-hover:[clip-path:circle(150%");
    expect(overlay.className).not.toMatch(/scale-\[\d/);
  });

  // 圆心 = 该档水平内距 + 圆点半径。写死一个值只有 md 对得上，另两档的展开会从圆点旁边冒出来
  // ——与上游那个 scale 魔数同一类的错，只是更隐蔽（三档都得实机看才发现）。
  it("展开圆心随 size 走，不是写死的一个值", () => {
    // 按 container 取而不是 getByRole：同一用例里渲染三次，getByRole 查的是整个 document.body，
    // 三个按钮都在，会报 "Found multiple elements"。
    const origin = (size: "sm" | "md" | "lg") => {
      const { container } = render(
        <InteractiveHoverButton size={size}>x</InteractiveHoverButton>,
      );
      return container.querySelector("button")!.style.getPropertyValue("--hulian-ihb-origin");
    };
    expect(origin("sm")).toBe("1rem");
    expect(origin("md")).toBe("1.25rem");
    expect(origin("lg")).toBe("1.75rem");
  });

  // 键盘用户看不到 hover。少了这条，Tab 过来就只剩一个焦点环，按钮读不出「这是主 CTA」。
  it("焦点态与悬停态同步展开", () => {
    const { container } = render(<InteractiveHoverButton>去下载</InteractiveHoverButton>);
    const overlay = container.querySelector("[aria-hidden]")!;
    expect(overlay.className).toContain("group-focus-visible:[clip-path:circle(150%");
  });

  it("默认带尾随箭头，icon={null} 可去掉，也可换成自定义节点", () => {
    const a = render(<InteractiveHoverButton>去下载</InteractiveHoverButton>);
    expect(a.container.querySelector("[aria-hidden] svg")).toBeTruthy();
    const b = render(<InteractiveHoverButton icon={null}>去下载</InteractiveHoverButton>);
    expect(b.container.querySelector("[aria-hidden] svg")).toBeFalsy();
    const c = render(
      <InteractiveHoverButton icon={<span data-testid="mine" />}>去下载</InteractiveHoverButton>,
    );
    expect(c.getByTestId("mine")).toBeTruthy();
  });

  it("size 走 Button 同款档位（与普通按钮混排等高）", () => {
    const { getByRole } = render(
      <InteractiveHoverButton size="lg">去下载</InteractiveHoverButton>,
    );
    expect(getByRole("button").className).toContain("h-12");
  });

  it("配色 prop 落到 CSS 变量；dotColor 缺省跟随 background", () => {
    const { getByRole } = render(
      <InteractiveHoverButton background="var(--color-chart-2)">去下载</InteractiveHoverButton>,
    );
    const button = getByRole("button");
    expect(button.style.getPropertyValue("--hulian-ihb-bg")).toBe("var(--color-chart-2)");
    expect(button.style.getPropertyValue("--hulian-ihb-dot")).toBe("var(--color-chart-2)");
  });

  it("自定义 prop 不裸传到 DOM", () => {
    const { getByRole } = render(
      <InteractiveHoverButton background="red" duration="1s" size="sm">
        去下载
      </InteractiveHoverButton>,
    );
    const button = getByRole("button");
    expect(button.hasAttribute("background")).toBe(false);
    expect(button.hasAttribute("duration")).toBe(false);
    expect(button.hasAttribute("size")).toBe(false);
  });

  it("render 接管元素：落地页 CTA 常常是链接而不是按钮", () => {
    const { container } = render(
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <InteractiveHoverButton render={<a href="/download" />}>去下载</InteractiveHoverButton>,
    );
    const anchor = container.querySelector("a")!;
    expect(anchor.getAttribute("href")).toBe("/download");
    expect(anchor.textContent).toContain("去下载");
    expect(container.querySelector("button")).toBeFalsy();
  });

  it("转发 ref 到原生 button", () => {
    const ref = createRef<HTMLButtonElement>();
    const { getByRole } = render(
      <InteractiveHoverButton ref={ref}>去下载</InteractiveHoverButton>,
    );
    expect(ref.current).toBe(getByRole("button"));
  });

  it("disabled 走 Button 底座的禁用态", () => {
    const { getByRole } = render(
      <InteractiveHoverButton disabled>去下载</InteractiveHoverButton>,
    );
    const button = getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.className).toContain("disabled:pointer-events-none");
  });
});
