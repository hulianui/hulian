import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { useRef } from "react";
import { AnimatedBeam } from "./animated-beam";

// jsdom 无 ResizeObserver（组件内 typeof 守卫）+ getBoundingClientRect 返回 0 → 渲染不抛即可。
function Harness() {
  const c = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  return (
    <div ref={c} className="relative">
      <div ref={a} />
      <div ref={b} />
      <AnimatedBeam containerRef={c} fromRef={a} toRef={b} />
    </div>
  );
}


describe("AnimatedBeam", () => {
  it("渲染 svg（含两条 path：底线 + 流光）不抛", () => {
    const { container } = render(<Harness />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg!.querySelectorAll("path")).toHaveLength(2);
  });

  it("含 linearGradient defs", () => {
    const { container } = render(<Harness />);
    expect(container.querySelector("linearGradient")).toBeTruthy();
  });
});
