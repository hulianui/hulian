import { describe, it, expect, afterEach } from "vitest";
import { createRef } from "react";
import { cleanup, render } from "@testing-library/react";
import { BUTTON_SIZE_CLASS, EFFECT_BUTTON_BASE_CLASS } from "./button-base";
import { buttonVariants } from "./button";
import { ShimmerButton } from "../shimmer-button";
import { RainbowButton } from "../rainbow-button";
import { PulsatingButton } from "../pulsating-button";
import { RippleButton } from "../ripple-button";

afterEach(cleanup);

// #126：四个特效按钮各自独立渲染 <button>，把 Button 已经解决过的问题又各漏了一遍
// （焦点环 / 禁用态视觉 / size 档 / forwardRef 全缺，render 逻辑还抄了一份）。
// 这组测试盯的是「它们和 Button 共用同一份底座」，而不是各自的特效——特效各件自己测。

const CASES = [
  ["ShimmerButton", ShimmerButton],
  ["RainbowButton", RainbowButton],
  ["PulsatingButton", PulsatingButton],
  ["RippleButton", RippleButton],
] as const;

describe("特效按钮共享 Button 底座", () => {
  it.each(CASES)("%s：焦点环与禁用态与 Button 同源", (_name, Comp) => {
    const { container } = render(<Comp>按钮</Comp>);
    const cls = container.querySelector("button")!.className;
    for (const token of EFFECT_BUTTON_BASE_CLASS.split(" ")) {
      expect(cls).toContain(token);
    }
  });

  it.each(CASES)("%s：默认 md 档与 Button 等高（h-10）", (_name, Comp) => {
    const { container } = render(<Comp>按钮</Comp>);
    expect(container.querySelector("button")!.className).toContain("h-10");
    // 与 Button 的同名档取同一个刻度，混排才不会参差
    expect(buttonVariants({ size: "md" })).toContain("h-10");
  });

  it.each(CASES)("%s：size 三档跟随 Button 的刻度", (_name, Comp) => {
    for (const [size, step] of [
      ["sm", "h-8"],
      ["md", "h-10"],
      ["lg", "h-12"],
    ] as const) {
      const { container, unmount } = render(<Comp size={size}>按钮</Comp>);
      expect(container.querySelector("button")!.className).toContain(step);
      expect(BUTTON_SIZE_CLASS[size]).toContain(step);
      unmount();
    }
  });

  it.each(CASES)("%s：forwardRef 转发到真实 button", (_name, Comp) => {
    const ref = createRef<HTMLButtonElement>();
    render(<Comp ref={ref}>按钮</Comp>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it.each(CASES)("%s：disabled 既点不动也看得出来", (_name, Comp) => {
    const { container } = render(<Comp disabled>按钮</Comp>);
    const btn = container.querySelector("button")!;
    expect(btn.disabled).toBe(true);
    expect(btn.className).toContain("disabled:opacity-50");
    expect(btn.className).toContain("disabled:pointer-events-none");
  });

  it("底座刻意不含圆角与配色：特效件各自的自定义圆角不会被抢", () => {
    expect(EFFECT_BUTTON_BASE_CLASS).not.toContain("rounded");
    expect(EFFECT_BUTTON_BASE_CLASS).not.toContain("bg-");
    // ShimmerButton 的圆角走自己的 CSS 变量，底座不能塞一条同属性规则进来打架
    const { container } = render(<ShimmerButton>按钮</ShimmerButton>);
    expect(container.querySelector("button")!.className).toContain(
      "[border-radius:var(--hulian-shimmer-radius)]",
    );
  });

  it("ShimmerButton 的 render 走公共 helper，渲染成 <a> 且保留底座", () => {
    const { container } = render(
      <ShimmerButton render={<a href="#cta" className="custom" />}>去看看</ShimmerButton>,
    );
    const anchor = container.querySelector("a")!;
    expect(anchor.getAttribute("href")).toBe("#cta");
    expect(anchor.className).toContain("custom");
    expect(anchor.className).toContain("h-10");
    expect(container.querySelector("button")).toBeNull();
  });
});
