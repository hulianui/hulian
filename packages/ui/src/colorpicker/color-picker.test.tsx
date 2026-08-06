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

// 色板容器：外壳的第一个子节点（包住 react-colorful 的 200x200 div）
const panelOf = (container: HTMLElement) =>
  container.firstElementChild!.firstElementChild as HTMLElement;

describe("ColorPicker onValueCommitted", () => {
  it("色板松手（pointerup）触发一次 commit，值为当前格式串", () => {
    const onValueCommitted = vi.fn();
    const { container } = render(
      <ColorPicker defaultValue="#ff0000" onValueCommitted={onValueCommitted} />,
    );
    fireEvent.pointerUp(panelOf(container));
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
    expect(onValueCommitted).toHaveBeenCalledWith("#ff0000");
  });

  it("commit 的格式跟随当前 format，与 onValueChange 输出一致", () => {
    const onValueCommitted = vi.fn();
    const { container } = render(
      <ColorPicker defaultValue="#ff0000" defaultFormat="rgb" onValueCommitted={onValueCommitted} />,
    );
    fireEvent.pointerUp(panelOf(container));
    expect(onValueCommitted).toHaveBeenLastCalledWith("rgb(255, 0, 0)");
  });

  it("松手吐的是拖动后的最新值，不是初值", () => {
    const onValueCommitted = vi.fn();
    const { container, getByLabelText } = render(
      <ColorPicker defaultValue="#ff0000" onValueCommitted={onValueCommitted} />,
    );
    // jsdom 里无法真的拖 react-colorful（没有布局），用文本输入推进内部 hex 来代表「拖动中的高频变更」
    fireEvent.change(getByLabelText("十六进制颜色值"), { target: { value: "#00ff00" } });
    fireEvent.pointerUp(panelOf(container));
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
    expect(onValueCommitted).toHaveBeenCalledWith("#00ff00");
  });

  it("pointercancel 不触发 commit（被打断的手势不算一次提交）", () => {
    const onValueCommitted = vi.fn();
    const { container } = render(
      <ColorPicker defaultValue="#ff0000" onValueCommitted={onValueCommitted} />,
    );
    fireEvent.pointerDown(panelOf(container));
    fireEvent.pointerCancel(panelOf(container));
    expect(onValueCommitted).not.toHaveBeenCalled();
  });

  it("点一下没拖（颜色没变）松手仍触发一次 —— 语义是「一次编辑结束」", () => {
    const onValueCommitted = vi.fn();
    const { container } = render(
      <ColorPicker defaultValue="#ff0000" onValueCommitted={onValueCommitted} />,
    );
    fireEvent.pointerDown(panelOf(container));
    fireEvent.pointerUp(panelOf(container));
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
    expect(onValueCommitted).toHaveBeenCalledWith("#ff0000");
  });

  it("文本框失焦触发 commit", () => {
    const onValueCommitted = vi.fn();
    const { getByLabelText } = render(
      <ColorPicker defaultValue="#ff0000" onValueCommitted={onValueCommitted} />,
    );
    const input = getByLabelText("十六进制颜色值");
    fireEvent.change(input, { target: { value: "#0000ff" } });
    expect(onValueCommitted).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
    expect(onValueCommitted).toHaveBeenCalledWith("#0000ff");
  });

  it("文本框回车触发 commit", () => {
    const onValueCommitted = vi.fn();
    const { getByLabelText } = render(
      <ColorPicker defaultValue="#ff0000" onValueCommitted={onValueCommitted} />,
    );
    const input = getByLabelText("十六进制颜色值");
    fireEvent.change(input, { target: { value: "#0000ff" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueCommitted).toHaveBeenCalledWith("#0000ff");
    // 其它按键不触发
    fireEvent.keyDown(input, { key: "a" });
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
  });

  it("半成品输入（解析失败）失焦时吐的是当前规范值而不是草稿串", () => {
    const onValueCommitted = vi.fn();
    const { getByLabelText } = render(
      <ColorPicker defaultValue="#ff0000" onValueCommitted={onValueCommitted} />,
    );
    const input = getByLabelText("十六进制颜色值");
    fireEvent.change(input, { target: { value: "#ab" } });
    fireEvent.blur(input);
    expect(onValueCommitted).toHaveBeenCalledWith("#ff0000");
  });

  it("切换格式触发 commit，且用新格式吐值", () => {
    const onValueCommitted = vi.fn();
    const { getByText } = render(
      <ColorPicker defaultValue="#ff0000" onValueCommitted={onValueCommitted} />,
    );
    fireEvent.click(getByText("rgb"));
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
    expect(onValueCommitted).toHaveBeenCalledWith("rgb(255, 0, 0)");
    // 点当前格式（无变化）不触发
    fireEvent.click(getByText("rgb"));
    expect(onValueCommitted).toHaveBeenCalledTimes(1);
  });

  it("onValueChange 与 onValueCommitted 可同时使用，互不吞噬", () => {
    const onValueChange = vi.fn();
    const onValueCommitted = vi.fn();
    const { container, getByLabelText } = render(
      <ColorPicker
        defaultValue="#ff0000"
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
      />,
    );
    fireEvent.change(getByLabelText("十六进制颜色值"), { target: { value: "#00ff00" } });
    expect(onValueChange).toHaveBeenCalledWith("#00ff00");
    expect(onValueCommitted).not.toHaveBeenCalled();
    fireEvent.pointerUp(panelOf(container));
    expect(onValueCommitted).toHaveBeenCalledWith("#00ff00");
  });

  it("不传 onValueCommitted 时各触发点均不抛", () => {
    const { container, getByLabelText, getByText } = render(<ColorPicker defaultValue="#ff0000" />);
    expect(() => {
      fireEvent.pointerUp(panelOf(container));
      fireEvent.blur(getByLabelText("十六进制颜色值"));
      fireEvent.click(getByText("hsl"));
    }).not.toThrow();
  });
});

