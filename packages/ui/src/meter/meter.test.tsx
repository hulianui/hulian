import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Meter } from "./meter";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Meter", () => {
  it("稳定父更新时跳过度量条子树", async () => {
    await expectMemoSkipsSubtree(() => <Meter value={64} label="磁盘用量" showValue />);
  });

  it("渲染 role=meter + aria-valuenow", () => {
    const { container } = render(<Meter value={40} />);
    const m = container.querySelector('[role="meter"]')!;
    expect(m).toBeTruthy();
    expect(m.getAttribute("aria-valuenow")).toBe("40");
  });

  it("min/max 透传 aria-valuemin/max", () => {
    const { container } = render(<Meter value={5} min={0} max={10} />);
    const m = container.querySelector('[role="meter"]')!;
    expect(m.getAttribute("aria-valuemin")).toBe("0");
    expect(m.getAttribute("aria-valuemax")).toBe("10");
  });

  it("label 渲染", () => {
    const { getByText } = render(<Meter value={40} label="磁盘用量" />);
    expect(getByText("磁盘用量")).toBeTruthy();
  });

  it("showValue 渲染格式化值", () => {
    const { container } = render(<Meter value={40} showValue />);
    expect(container.textContent).toContain("40");
  });

  it("几何禁区：Indicator 不写死字面宽度类（宽度交 Base UI 内联自算）", () => {
    const { container } = render(<Meter value={40} />);
    const indicator = container.querySelector(".h-full.rounded-full")!;
    expect(indicator).toBeTruthy();
    expect(indicator.className).toContain("bg-primary");
    expect(indicator.className).not.toMatch(/\bw-/);
  });
});
