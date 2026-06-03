import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ColorPicker } from "./color-picker";

describe("ColorPicker", () => {
  it("渲染不抛 + 外壳含 token 类", () => {
    const { container } = render(<ColorPicker />);
    const shell = container.firstElementChild!;
    expect(shell).toBeTruthy();
    expect(shell.className).toContain("border-border");
    expect(shell.className).toContain("bg-surface");
  });

  it("defaultValue 显示在 hex 输入中", () => {
    const { getByLabelText } = render(<ColorPicker defaultValue="#ff0000" />);
    const input = getByLabelText("十六进制颜色值") as HTMLInputElement;
    // HexColorInput prefixed 模式下值带 # 前缀
    expect(input.value.toLowerCase()).toContain("ff0000");
  });

  it("showInput={false} 不渲染输入框", () => {
    const { queryByLabelText } = render(<ColorPicker showInput={false} />);
    expect(queryByLabelText("十六进制颜色值")).toBeNull();
  });

  it("受控 value 变化反映到输入框", () => {
    const { getByLabelText, rerender } = render(<ColorPicker value="#3b82f6" />);
    const input = getByLabelText("十六进制颜色值") as HTMLInputElement;
    expect(input.value.toLowerCase()).toContain("3b82f6");
    rerender(<ColorPicker value="#00ff00" />);
    expect(input.value.toLowerCase()).toContain("00ff00");
  });

  it("hex 输入触发 onValueChange", () => {
    const onValueChange = vi.fn();
    const { getByLabelText } = render(<ColorPicker onValueChange={onValueChange} />);
    const input = getByLabelText("十六进制颜色值");
    fireEvent.change(input, { target: { value: "abcdef" } });
    expect(onValueChange).toHaveBeenCalled();
  });

  it("disabled 加 opacity-50 + pointer-events-none", () => {
    const { container } = render(<ColorPicker disabled />);
    const shell = container.firstElementChild!;
    expect(shell.className).toContain("opacity-50");
    expect(shell.className).toContain("pointer-events-none");
  });

  it("透传 className 到外壳", () => {
    const { container } = render(<ColorPicker className="my-picker" />);
    expect(container.firstElementChild!.classList.contains("my-picker")).toBe(true);
  });

  it("defaultFormat=rgb 时输入框显示 rgb 串", () => {
    const { getByLabelText } = render(<ColorPicker defaultValue="#ff0000" defaultFormat="rgb" />);
    const input = getByLabelText("RGB 颜色值") as HTMLInputElement;
    expect(input.value).toBe("rgb(255, 0, 0)");
  });

  it("defaultFormat=hsl 时输入框显示 hsl 串", () => {
    const { getByLabelText } = render(<ColorPicker defaultValue="#ff0000" defaultFormat="hsl" />);
    const input = getByLabelText("HSL 颜色值") as HTMLInputElement;
    expect(input.value).toBe("hsl(0, 100%, 50%)");
  });

  it("rgb 文本输入触发 onValueChange 并回传 rgb 串", () => {
    const onValueChange = vi.fn();
    const { getByLabelText } = render(<ColorPicker defaultFormat="rgb" onValueChange={onValueChange} />);
    fireEvent.change(getByLabelText("RGB 颜色值"), { target: { value: "rgb(0, 128, 255)" } });
    expect(onValueChange).toHaveBeenLastCalledWith("rgb(0, 128, 255)");
  });

  it("点击格式切换器切到 rgb：换 label + 用新格式回吐当前颜色", () => {
    const onValueChange = vi.fn();
    const onFormatChange = vi.fn();
    const { getByText, getByLabelText, queryByLabelText } = render(
      <ColorPicker defaultValue="#ff0000" onValueChange={onValueChange} onFormatChange={onFormatChange} />,
    );
    expect(getByLabelText("十六进制颜色值")).toBeTruthy();
    fireEvent.click(getByText("rgb"));
    expect(onFormatChange).toHaveBeenCalledWith("rgb");
    expect(onValueChange).toHaveBeenLastCalledWith("rgb(255, 0, 0)");
    expect(queryByLabelText("十六进制颜色值")).toBeNull();
    expect((getByLabelText("RGB 颜色值") as HTMLInputElement).value).toBe("rgb(255, 0, 0)");
  });

  it("showFormatSwitcher={false} 不渲染格式切换器", () => {
    const { queryByRole } = render(<ColorPicker showFormatSwitcher={false} />);
    expect(queryByRole("group", { name: "颜色格式" })).toBeNull();
  });

  it("受控 format 不被内部点击改写（仅回调）", () => {
    const onFormatChange = vi.fn();
    const { getByText, getByLabelText } = render(
      <ColorPicker defaultValue="#ff0000" format="hex" onFormatChange={onFormatChange} />,
    );
    fireEvent.click(getByText("rgb"));
    expect(onFormatChange).toHaveBeenCalledWith("rgb");
    // 受控未回写 format → 仍是 hex label
    expect(getByLabelText("十六进制颜色值")).toBeTruthy();
  });
});
