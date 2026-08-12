import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { RippleButton } from "./ripple-button";
import { BUTTON_SIZE_CLASS, EFFECT_BUTTON_BASE_CLASS } from "../button/button-base";
import { cn } from "../lib/cn";

describe("RippleButton", () => {
  it("渲染 button + children", () => {
    const { container } = render(<RippleButton>点击</RippleButton>);
    expect(container.querySelector("button")!.textContent).toContain("点击");
  });
  it("overflow-hidden（裁切波纹）+ duration 变量", () => {
    const { container } = render(<RippleButton duration="800ms">x</RippleButton>);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.getAttribute("class")).toContain("overflow-hidden");
    expect(btn.style.getPropertyValue("--hulian-ripple-duration")).toBe("800ms");
  });
  it("点击后生成一个波纹 span（带 button-ripple 动画类）", () => {
    const { container } = render(<RippleButton>x</RippleButton>);
    const btn = container.querySelector("button")!;
    expect(container.querySelector('[class*="hulian-button-ripple"]')).toBeNull();
    fireEvent.click(btn);
    const ripple = container.querySelector('[class*="hulian-button-ripple"]');
    expect(ripple).not.toBeNull();
    expect(ripple!.getAttribute("class")).toContain("motion-reduce:hidden");
  });
  it("波纹基础样式 transform: scale(0)（隐式 from 起点，缺它=出生即满钮白罩无扩散感）", () => {
    const { container } = render(<RippleButton>x</RippleButton>);
    fireEvent.click(container.querySelector("button")!);
    const ripple = container.querySelector('[class*="hulian-button-ripple"]') as HTMLElement;
    expect(ripple.style.transform).toBe("scale(0)");
    // 不许用 Tailwind scale-0 类（独立 scale 属性与关键帧 transform 相乘 → 全程不可见）
    expect(ripple.getAttribute("class")).not.toMatch(/\bscale-0\b/);
  });
  it("动画结束后波纹 span 自移除", () => {
    const { container } = render(<RippleButton>x</RippleButton>);
    const btn = container.querySelector("button")!;
    fireEvent.click(btn);
    const ripple = container.querySelector('[class*="hulian-button-ripple"]')!;
    fireEvent.animationEnd(ripple);
    expect(container.querySelector('[class*="hulian-button-ripple"]')).toBeNull();
  });
  // ── #233：variant / tone ────────────────────────────────────────────────
  // 补这两档前底色写死主色实心，消费方 12 处调用无一例外都在从外面注入 buttonVariants()。

  // 最要紧的一条：不传新 prop 的调用点，类串必须与 0.39.0 **逐字相同**。
  // 期望值在这里重算一遍（而不是抄一份字面量），钉的是「默认档 = solid/brand，且它不多带
  // 阴影 / 颜色 hover」——一旦有人把配色改成直接调 buttonVariants，这条会立刻红。
  it("不传 variant/tone 时类串与补档前逐字相同", () => {
    const { container } = render(<RippleButton>x</RippleButton>);
    const expected = cn(
      EFFECT_BUTTON_BASE_CLASS,
      BUTTON_SIZE_CLASS.md,
      "relative cursor-pointer overflow-hidden rounded-[var(--radius)] bg-primary text-primary-foreground",
      "transition-transform duration-200 active:translate-y-px",
    );
    expect(container.querySelector("button")!.getAttribute("class")).toBe(expected);
  });

  // 显式写默认值与不写必须渲染成同一个东西（#218 那条 cva 陷阱的反向：这里两者本来就该一样）。
  it("显式 variant=solid tone=brand 与不传等价", () => {
    const { container: a } = render(<RippleButton>x</RippleButton>);
    const { container: b } = render(
      <RippleButton variant="solid" tone="brand">
        x
      </RippleButton>,
    );
    expect(b.querySelector("button")!.getAttribute("class")).toBe(
      a.querySelector("button")!.getAttribute("class"),
    );
  });

  it("variant × tone 落在与 Button 同名档一致的色号上", () => {
    for (const [props, expected, absent] of [
      [{ variant: "outline" } as const, ["border-hairline", "bg-surface", "text-foreground"], "bg-primary"],
      [{ variant: "ghost" } as const, ["text-foreground"], "bg-primary"],
      [{ variant: "soft" } as const, ["bg-primary/12", "text-primary"], "text-primary-foreground"],
      [{ tone: "danger" } as const, ["bg-danger", "text-danger-foreground"], "bg-primary"],
      [{ tone: "neutral" } as const, ["bg-foreground", "text-bg"], "bg-primary"],
      [
        { variant: "outline", tone: "danger" } as const,
        ["border-danger", "text-danger"],
        "text-foreground",
      ],
    ] as const) {
      const { container, unmount } = render(<RippleButton {...props}>x</RippleButton>);
      const cls = container.querySelector("button")!.getAttribute("class")!;
      for (const token of expected) expect(cls).toContain(token);
      expect(cls).not.toContain(absent);
      unmount();
    }
  });

  // 特效底座刻意不含 transition-colors，挂颜色 hover 会是无过渡跳变；阴影四个特效件都没有。
  // 这条钉住「配色档不是照抄 buttonVariants」——照抄会把 shadow-sm 与 hover:bg-* 一起带进来。
  it("配色档不带阴影与颜色 hover", () => {
    for (const variant of ["solid", "outline", "ghost", "soft"] as const) {
      const { container, unmount } = render(<RippleButton variant={variant}>x</RippleButton>);
      const cls = container.querySelector("button")!.getAttribute("class")!;
      expect(cls).not.toMatch(/(^|\s)shadow/);
      expect(cls).not.toMatch(/hover:(bg|text|border)-/);
      unmount();
    }
  });

  it("波纹默认色按档推导：实心取前景色、其余取本色；rippleColor 覆盖推导", () => {
    for (const [props, expected] of [
      [{} as const, "var(--color-primary-foreground)"],
      [{ tone: "danger" } as const, "var(--color-danger-foreground)"],
      [{ tone: "neutral" } as const, "var(--color-bg)"],
      [{ variant: "outline" } as const, "var(--color-primary)"],
      [{ variant: "ghost", tone: "danger" } as const, "var(--color-danger)"],
      [{ variant: "soft", tone: "neutral" } as const, "var(--color-foreground)"],
      // jsdom 会把 CSS 关键字小写化（var() 原样保留），故这里比小写形态
      [{ variant: "outline", rippleColor: "currentColor" } as const, "currentcolor"],
    ] as const) {
      const { container, unmount } = render(<RippleButton {...props}>x</RippleButton>);
      fireEvent.click(container.querySelector("button")!);
      const ripple = container.querySelector(
        '[class*="hulian-button-ripple"]',
      ) as HTMLElement;
      expect(ripple.style.background).toBe(expected);
      unmount();
    }
  });

  it("link / current 不在取值集里（编译期锁）", () => {
    // @ts-expect-error RippleButtonVariant 没有 link：波纹要有盒子
    const noLink = <RippleButton variant="link">x</RippleButton>;
    // @ts-expect-error RippleButtonTone 没有 current：波纹默认色要从 tone 推导
    const noCurrent = <RippleButton tone="current">x</RippleButton>;
    void noLink;
    void noCurrent;
  });

  it("透传原 onClick + className", () => {
    const onClick = vi.fn();
    const { container } = render(<RippleButton onClick={onClick} className="w-40">x</RippleButton>);
    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("class")).toContain("w-40");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
