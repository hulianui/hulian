import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Slider } from "./slider";

const ranges = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLInputElement>('input[type="range"]'));

describe("Slider", () => {
  it("标量 value → 渲 1 个 range input(单 thumb)", () => {
    const { container } = render(<Slider defaultValue={40} />);
    expect(ranges(container)).toHaveLength(1);
  });

  it("数组 value → 渲 2 个 range input(range 双 thumb)", () => {
    const { container } = render(<Slider defaultValue={[25, 75]} />);
    expect(ranges(container)).toHaveLength(2);
  });

  it("min/max/step 透传到内层 input", () => {
    const { container } = render(<Slider defaultValue={5} min={0} max={50} step={5} />);
    const input = ranges(container)[0];
    expect(input.getAttribute("min")).toBe("0");
    expect(input.getAttribute("max")).toBe("50");
    expect(input.getAttribute("step")).toBe("5");
  });

  it("disabled 透传 → 内层 input 禁用", () => {
    const { container } = render(<Slider defaultValue={40} disabled />);
    expect(ranges(container)[0].disabled).toBe(true);
  });

  it("showValue 渲出数值读出 output", () => {
    const { container } = render(<Slider defaultValue={40} showValue />);
    expect(container.querySelector("output")).not.toBeNull();
  });

  it("无 showValue 时不渲 output", () => {
    const { container } = render(<Slider defaultValue={40} />);
    expect(container.querySelector("output")).toBeNull();
  });

  it("className 落在 Root wrapper", () => {
    const { container } = render(<Slider defaultValue={40} className="mt-4" />);
    expect((container.firstChild as HTMLElement).className).toContain("mt-4");
  });
});
