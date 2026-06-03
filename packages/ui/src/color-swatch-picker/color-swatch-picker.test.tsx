import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ColorSwatchPicker } from "./color-swatch-picker";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e"];

describe("ColorSwatchPicker", () => {
  it("按 colors 渲染对应数量的色块（aria-label=颜色串）", () => {
    const { getByLabelText } = render(<ColorSwatchPicker colors={COLORS} />);
    COLORS.forEach((c) => expect(getByLabelText(c)).toBeTruthy());
  });

  it("色块内联背景色 = 颜色值", () => {
    const { getByLabelText } = render(<ColorSwatchPicker colors={COLORS} />);
    const swatch = getByLabelText("#3b82f6") as HTMLElement;
    // jsdom 把 hex 规范成 rgb
    expect(swatch.style.backgroundColor).toBe("rgb(59, 130, 246)");
  });

  it("点击色块触发 onValueChange", () => {
    const onValueChange = vi.fn();
    const { getByLabelText } = render(<ColorSwatchPicker colors={COLORS} onValueChange={onValueChange} />);
    fireEvent.click(getByLabelText("#22c55e"));
    expect(onValueChange).toHaveBeenCalledWith("#22c55e");
  });

  it("defaultValue 选中态打到对应色块", () => {
    const { getByLabelText } = render(<ColorSwatchPicker colors={COLORS} defaultValue="#3b82f6" />);
    expect(getByLabelText("#3b82f6").getAttribute("data-checked")).not.toBeNull();
  });

  it("受控 value 变化反映到选中态", () => {
    const { getByLabelText, rerender } = render(<ColorSwatchPicker colors={COLORS} value="#ef4444" />);
    expect(getByLabelText("#ef4444").getAttribute("data-checked")).not.toBeNull();
    rerender(<ColorSwatchPicker colors={COLORS} value="#22c55e" />);
    expect(getByLabelText("#22c55e").getAttribute("data-checked")).not.toBeNull();
    expect(getByLabelText("#ef4444").getAttribute("data-checked")).toBeNull();
  });

  it("disabled 加 opacity-50 到容器", () => {
    const { container } = render(<ColorSwatchPicker colors={COLORS} disabled />);
    expect(container.firstElementChild!.className).toContain("opacity-50");
  });

  it("透传 className 到容器 + 默认 aria-label", () => {
    const { container, getByRole } = render(<ColorSwatchPicker colors={COLORS} className="my-swatches" />);
    expect(container.firstElementChild!.classList.contains("my-swatches")).toBe(true);
    expect(getByRole("radiogroup", { name: "颜色色板" })).toBeTruthy();
  });
});
