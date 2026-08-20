import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BorderBeam } from "./border-beam";

// container(div) > root(BorderBeam 外层) > beam(motion.div)
const beamOf = (container: HTMLElement) =>
  container.firstElementChild!.firstElementChild as HTMLElement;


describe("BorderBeam", () => {
  it("渲染绝对定位容器（inset-0 rounded-[inherit]）+ 内层光束", () => {
    const { container } = render(<BorderBeam />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("absolute");
    expect(root.getAttribute("class")).toContain("inset-0");
    expect(root.children.length).toBe(1);
  });
  it("光束 size 落 width + offsetPath rect", () => {
    const { container } = render(<BorderBeam size={80} />);
    const beam = beamOf(container);
    expect(beam.style.width).toBe("80px");
    expect(beam.style.offsetPath).toContain("rect(0 auto auto 0 round 80px)");
  });
  it("默认光束色 primary→chart-2 token 落 CSS 变量", () => {
    const { container } = render(<BorderBeam />);
    const beam = beamOf(container);
    expect(beam.style.getPropertyValue("--hulian-beam-from")).toBe("var(--color-primary)");
    expect(beam.style.getPropertyValue("--hulian-beam-to")).toBe("var(--color-chart-2)");
  });
  it("borderWidth 落容器 border + className 透传到光束", () => {
    const { container } = render(<BorderBeam borderWidth={2} className="opacity-80" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.border).toContain("2px");
    expect(beamOf(container).getAttribute("class")).toContain("opacity-80");
  });
});
