import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { createRef } from "react";
import { FloatingReactions } from "./floating-reactions";
import type { FloatingReactionsHandle } from "./floating-reactions.types";

afterEach(cleanup);

describe("FloatingReactions", () => {
  it("emit 后出现飘心节点", () => {
    const ref = createRef<FloatingReactionsHandle>();
    const { container } = render(<FloatingReactions ref={ref} />);
    expect(container.querySelectorAll("span").length).toBe(0);
    act(() => ref.current?.emit("❤️"));
    expect(container.querySelectorAll("span").length).toBe(1);
  });

  it("emit count 一次喷射多个", () => {
    const ref = createRef<FloatingReactionsHandle>();
    const { container } = render(<FloatingReactions ref={ref} />);
    act(() => ref.current?.emit("💖", { count: 5 }));
    expect(container.querySelectorAll("span").length).toBe(5);
  });

  it("不传 content 时从 palette 取，仍渲染节点", () => {
    const ref = createRef<FloatingReactionsHandle>();
    const { container } = render(<FloatingReactions ref={ref} palette={["A"]} />);
    act(() => ref.current?.emit());
    expect(container.textContent).toContain("A");
  });

  it("animationend 后移除节点", () => {
    const ref = createRef<FloatingReactionsHandle>();
    const { container } = render(<FloatingReactions ref={ref} />);
    act(() => ref.current?.emit("❤️"));
    const span = container.querySelector("span")!;
    act(() => span.dispatchEvent(new Event("animationend", { bubbles: true })));
    expect(container.querySelectorAll("span").length).toBe(0);
  });

  it("容器 pointer-events-none", () => {
    const ref = createRef<FloatingReactionsHandle>();
    const { container } = render(<FloatingReactions ref={ref} />);
    expect(container.firstElementChild?.className).toContain("pointer-events-none");
  });
});
