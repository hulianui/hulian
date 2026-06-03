import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { InputOTP } from "./input-otp";

const inputs = (c: HTMLElement) => Array.from(c.querySelectorAll("input"));

describe("InputOTP", () => {
  it("按 length 渲染对应数量的格子", () => {
    const { container } = render(<InputOTP length={4} />);
    expect(inputs(container)).toHaveLength(4);
  });

  it("输入数字后值进入对应格 + onChange", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} onChange={onChange} />);
    fireEvent.change(inputs(container)[0], { target: { value: "1" } });
    expect(onChange).toHaveBeenLastCalledWith("1");
  });

  it("numeric 模式过滤非数字", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} onChange={onChange} />);
    fireEvent.change(inputs(container)[0], { target: { value: "a" } });
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("text 模式允许字母", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} type="text" onChange={onChange} />);
    fireEvent.change(inputs(container)[0], { target: { value: "a" } });
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("中间清空保留位置（不左移）", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} value="1234" onChange={onChange} />);
    fireEvent.change(inputs(container)[1], { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith("1 34");
  });

  it("Backspace 清空当前格", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} value="12" onChange={onChange} />);
    fireEvent.keyDown(inputs(container)[1], { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith("1");
  });

  it("Backspace 在空格回退并清前一格", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} value="12" onChange={onChange} />);
    fireEvent.keyDown(inputs(container)[2], { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith("1");
  });

  it("粘贴整段分发到各格", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={6} onChange={onChange} />);
    fireEvent.paste(inputs(container)[0], { clipboardData: { getData: () => "123456" } });
    expect(onChange).toHaveBeenLastCalledWith("123456");
  });

  it("填满触发 onComplete", () => {
    const onComplete = vi.fn();
    const { container } = render(<InputOTP length={4} value="123" onComplete={onComplete} />);
    fireEvent.change(inputs(container)[3], { target: { value: "4" } });
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("invalid 加 danger 边框 + aria-invalid", () => {
    const { container } = render(<InputOTP length={2} invalid />);
    const first = inputs(container)[0];
    expect(first.getAttribute("aria-invalid")).toBe("true");
    expect(first.className).toContain("border-danger");
  });
});
